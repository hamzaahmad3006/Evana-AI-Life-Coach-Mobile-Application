from fastapi import APIRouter, HTTPException, Depends
from app.schemas.habits import HabitCreate, HabitUpdate, HabitResponse, HabitLogCreate, HabitLogResponse, HabitDashboardResponse
from app.core.supabase import get_supabase_admin
from app.services.notification_service import send_streak_celebration
from typing import List
from datetime import date, timedelta, datetime

router = APIRouter()

async def calculate_global_streak(supabase, user_id: str, current_habits_count: int):
    """
    Calculates the streak of 'Perfect Days' where 100% of habits were completed.
    """
    try:
        if current_habits_count == 0:
            return 0

        # Get logs for the last 60 days
        logs_res = supabase.table("habit_logs")\
            .select("logged_at, habit_id")\
            .eq("user_id", user_id)\
            .eq("status", True)\
            .order("logged_at", desc=True)\
            .execute()
        
        logs = logs_res.data if logs_res.data else []
        if not logs:
            return 0

        # Group habit completions by date
        daily_completions = {}
        for log in logs:
            d = log["logged_at"]
            if d not in daily_completions:
                daily_completions[d] = set()
            daily_completions[d].add(log["habit_id"])

        today = date.today()
        yesterday = today - timedelta(days=1)
        
        # A day is "Perfect" if all current habits were completed
        def is_perfect(d_str):
            if d_str not in daily_completions:
                return False
            return len(daily_completions[d_str]) >= current_habits_count

        if not is_perfect(today.isoformat()) and not is_perfect(yesterday.isoformat()):
            return 0

        streak = 0
        check_date = today if is_perfect(today.isoformat()) else yesterday
        
        while is_perfect(check_date.isoformat()):
            streak += 1
            check_date -= timedelta(days=1)
            
        return streak
    except Exception as e:
        print(f"Global Streak Error: {e}")
        return 0

@router.get("/{user_id}", response_model=HabitDashboardResponse)
async def get_user_habits(user_id: str):
    """
    Retrieves all habits and calculates the 'Perfect Day' global streak.
    """
    supabase = get_supabase_admin()
    try:
        # 1. Get all habits
        habits_res = supabase.table("habits").select("*").eq("user_id", user_id).execute()
        habits = habits_res.data
        
        # 2. Get today's logs
        today = date.today().isoformat()
        logs_res = supabase.table("habit_logs").select("habit_id").eq("user_id", user_id).eq("logged_at", today).eq("status", True).execute()
        completed_today_ids = [log["habit_id"] for log in logs_res.data]
        
        # 3. Live Sync individual streaks
        for habit in habits:
            habit["is_completed_today"] = habit["id"] in completed_today_ids
            true_streak = await recalculate_streak(supabase, habit["id"], user_id)
            if habit["streak_count"] != true_streak:
                habit["streak_count"] = true_streak
                supabase.table("habits").update({"streak_count": true_streak}).eq("id", habit["id"]).execute()
        
        # 4. Calculate Global Perfect Day Streak
        global_streak = await calculate_global_streak(supabase, user_id, len(habits))
            
        return {
            "habits": habits,
            "global_streak": global_streak
        }
    except Exception as e:
        print(f"Fetch Habits Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def recalculate_streak(supabase, habit_id: str, user_id: str):
    """
    Derives the true streak from historical logs with defensive error handling.
    """
    try:
        logs_res = supabase.table("habit_logs")\
            .select("logged_at")\
            .eq("habit_id", habit_id)\
            .eq("user_id", user_id)\
            .eq("status", True)\
            .order("logged_at", desc=True)\
            .limit(60)\
            .execute()
        
        logs = logs_res.data if logs_res.data else []
        if not logs:
            return 0
        
        completed_dates = {log["logged_at"] for log in logs}
        today = date.today()
        yesterday = today - timedelta(days=1)
        
        if today.isoformat() not in completed_dates and yesterday.isoformat() not in completed_dates:
            return 0
            
        streak = 0
        check_date = today if today.isoformat() in completed_dates else yesterday
        
        while check_date.isoformat() in completed_dates:
            streak += 1
            check_date -= timedelta(days=1)
            
        return streak
    except Exception as e:
        print(f"Recalculate Streak Error: {e}")
        return 0

@router.post("/log", response_model=HabitLogResponse)
async def log_habit_activity(log: HabitLogCreate):
    """
    Logs habit activity and triggers a true streak recalculation.
    Supports 'unmarking' by correctly updating status to False.
    """
    supabase = get_supabase_admin()
    try:
        logged_at_str = log.logged_at.isoformat()
        
        # 1. Lookup existing log for THIS specific user, habit, and date
        existing = supabase.table("habit_logs")\
            .select("id")\
            .eq("habit_id", log.habit_id)\
            .eq("user_id", log.user_id)\
            .eq("logged_at", logged_at_str)\
            .execute()
        
        if existing.data and len(existing.data) > 0:
            # Atomic update of status (True -> False or False -> True)
            supabase.table("habit_logs").update({"status": log.status}).eq("id", existing.data[0]["id"]).execute()
        else:
            new_log = {
                "habit_id": log.habit_id,
                "user_id": log.user_id,
                "logged_at": logged_at_str,
                "status": log.status
            }
            supabase.table("habit_logs").insert(new_log).execute()
            
        # 2. TRIGGER DYNAMIC RECALCULATION
        # This ensures streaks reflect the change IMMEDIATELY
        new_streak = await recalculate_streak(supabase, log.habit_id, log.user_id)
        
        # 3. Update persisted streak
        supabase.table("habits").update({"streak_count": new_streak}).eq("id", log.habit_id).execute()

        # 4. Handle Celebrations (only on completion)
        if log.status and new_streak in [3, 7, 14, 30]:
            habit_info = supabase.table("habits").select("title").eq("id", log.habit_id).execute()
            if habit_info.data and len(habit_info.data) > 0:
                await send_streak_celebration(log.user_id, habit_info.data[0]["title"], new_streak)
            
        return {
            "id": existing.data[0]["id"] if (existing.data and len(existing.data) > 0) else "new",
            "habit_id": log.habit_id, 
            "user_id": log.user_id,
            "status": log.status, 
            "logged_at": log.logged_at,
            "created_at": datetime.now()
        }
    except Exception as e:
        print(f"Habit Log Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=HabitResponse)
async def create_habit(habit: HabitCreate):
    """
    Creates a new habit definition.
    """
    supabase = get_supabase_admin()
    try:
        result = supabase.table("habits").insert(habit.model_dump()).execute()
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to create habit")
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs/{user_id}", response_model=List[HabitLogResponse])
async def get_weekly_logs(user_id: str, start_date: date, end_date: date):
    """
    Retrieves all habit logs for a user between two dates.
    Used for rendering the weekly calendar dots.
    """
    supabase = get_supabase_admin()
    try:
        result = supabase.table("habit_logs")\
            .select("*")\
            .eq("user_id", user_id)\
            .gte("logged_at", start_date.isoformat())\
            .lte("logged_at", end_date.isoformat())\
            .execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{habit_id}")
async def delete_habit(habit_id: str):
    """
    Deletes a habit and all its logs.
    """
    supabase = get_supabase_admin()
    try:
        supabase.table("habit_logs").delete().eq("habit_id", habit_id).execute()
        result = supabase.table("habits").delete().eq("id", habit_id).execute()
        return {"status": "success", "message": "Habit and logs deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

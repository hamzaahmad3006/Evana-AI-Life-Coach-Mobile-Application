from fastapi import APIRouter, HTTPException, Depends
from app.schemas.goals import GoalCreate, GoalUpdate, GoalResponse
from app.core.supabase import get_supabase_admin
from app.services.notification_service import send_push_notification
from typing import List

router = APIRouter()

@router.get("/{user_id}", response_model=List[GoalResponse])
async def get_user_goals(user_id: str):
    """
    Retrieves all goals for a specific user.
    """
    supabase = get_supabase_admin()
    try:
        result = supabase.table("goals").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=GoalResponse)
async def create_goal(goal: GoalCreate):
    """
    Creates a new goal for a user.
    """
    supabase = get_supabase_admin()
    try:
        # Pydantic date object to string for Supabase
        goal_data = goal.model_dump()
        goal_data["target_date"] = goal_data["target_date"].isoformat()
        
        result = supabase.table("goals").insert(goal_data).execute()
        if not result.data:
            raise HTTPException(status_code=400, detail="Failed to create goal")
        return result.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{goal_id}", response_model=GoalResponse)
async def update_goal(goal_id: str, goal: GoalUpdate):
    """
    Updates an existing goal's progress and detects milestone crossings for notifications.
    """
    supabase = get_supabase_admin()
    try:
        # 1. Get current progress before update
        current_goal = supabase.table("goals").select("*").eq("id", goal_id).single().execute()
        if not current_goal.data:
            raise HTTPException(status_code=404, detail="Goal not found")
        
        old_percentage = current_goal.data.get("progress", 0)
        user_id = current_goal.data.get("user_id")

        # 2. Perform the update
        update_data = goal.model_dump(exclude_unset=True)
        if "target_date" in update_data:
            update_data["target_date"] = update_data["target_date"].isoformat()
            
        result = supabase.table("goals").update(update_data).eq("id", goal_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Goal update failed")
        
        updated_goal = result.data[0]
        new_percentage = updated_goal.get("progress", old_percentage)

        # 3. Detect Milestones
        milestones = [25, 50, 75, 100]
        hit_milestone = None
        for m in milestones:
            if old_percentage < m <= new_percentage:
                hit_milestone = m

        if hit_milestone:
            # Fetch user push token
            profile = supabase.table("profiles").select("expo_push_token").eq("id", user_id).single().execute()
            token = profile.data.get("expo_push_token") if profile.data else None
            
            if token:
                title = "🎉 Goal Milestone!" if hit_milestone < 100 else "🏆 Goal Completed!"
                body = f"You've reached {hit_milestone}% of your goal: '{updated_goal['title']}'. Incredible work!"
                if hit_milestone == 100:
                    body = f"VICTORY! You've completed your goal: '{updated_goal['title']}'. Take a moment to celebrate!"
                
                send_push_notification(token, title, body, {"goal_id": goal_id, "type": "milestone"})

        return updated_goal
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{goal_id}")
async def delete_goal(goal_id: str):
    """
    Deletes a goal from the database.
    """
    supabase = get_supabase_admin()
    try:
        result = supabase.table("goals").delete().eq("id", goal_id).execute()
        return {"status": "success", "message": "Goal deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

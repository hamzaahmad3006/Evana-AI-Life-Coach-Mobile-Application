import json
from datetime import datetime, timedelta, date
from typing import List, Dict, Any
from app.services.ai_service import get_groq_client
from app.core.supabase import get_supabase_admin
from app.schemas.analytics import AnalyticsSummary, HabitConsistency, GoalProgress, MoodTrend

async def generate_weekly_ai_insight(user_id: str, summary_data: Dict[str, Any]) -> str:
    """
    Uses AI to analyze the user's performance and provide a weekly coaching insight.
    """
    client = get_groq_client()
    
    # Prepare data for AI
    habit_rate = summary_data.get("habit_completion_rate", 0)
    goal_count = summary_data.get("active_goals_count", 0)
    mood_summary = summary_data.get("mood_summary", "Stable")
    tags = ", ".join(summary_data.get("top_tags", []))
    
    system_prompt = (
        "You are Evana, a senior AI life coach. Your task is to provide a 'Weekly Growth Narrative'. "
        "Analyze the user's data and provide a supportive, 2-sentence executive summary. "
        "Address the themes they focused on (tags) and how their consistency (habits) and "
        "mood (emotional trend) played into their week. Be sharp, empathetic, and forward-looking."
    )
    
    user_context = (
        f"Weekly Summary:\n"
        f"- Habit Consistency: {habit_rate:.1f}%\n"
        f"- Emotional Baseline: {mood_summary}\n"
        f"- Themes/Focus Areas: {tags or 'General growth'}\n"
        f"- Goals in Progress: {goal_count}"
    )
    
    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_context}
            ],
            temperature=0.6,
            max_tokens=200,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating analytics insight: {str(e)}")
        return "You're making steady progress. Consistency is the key to transformation!"

async def get_user_analytics(user_id: str, days: int = 7) -> AnalyticsSummary:
    """
    Aggregates user data for the specified timeframe.
    """
    supabase = get_supabase_admin()
    end_date = date.today()
    start_date = end_date - timedelta(days=days-1)
    
    # 1. Fetch Goals & Calculate Progress
    goals_res = supabase.table("goals").select("*").eq("user_id", user_id).execute()
    goal_list = []
    active_goals_count = 0
    completed_goals_count = 0
    
    if goals_res.data:
        # Fetch habit logs once for comparison
        all_logs_res = supabase.table("habit_logs").select("habit_id, status").eq("user_id", user_id).gte("logged_at", start_date.isoformat()).execute()
        
        for g in goals_res.data:
            if g["status"] == "active":
                active_goals_count += 1
                
                # Dynamic Progress Calculation
                progress = g.get("progress", 0)
                linked_habit_id = g.get("linked_habit_id")
                
                if linked_habit_id:
                    # Calculate progress based on habit logs for the period
                    habit_logs = [l for l in all_logs_res.data if l["habit_id"] == linked_habit_id and l["status"] is True]
                    target_completions = g.get("target_completions", 7) # Default to daily if not set
                    progress = min(100, (len(habit_logs) / target_completions) * 100)
                
                goal_list.append(GoalProgress(
                    id=g["id"],
                    title=g["title"],
                    progress=float(progress),
                    color=COLORS_MAP.get(g.get("category", "career").lower(), "#7C5CFC"),
                    bg_color=COLORS_BG_MAP.get(g.get("category", "career").lower(), "#F4F1FF")
                ))
            elif g["status"] == "completed":
                completed_goals_count += 1

    # 2. Fetch Habits & Logs
    habits_res = supabase.table("habits").select("*").eq("user_id", user_id).execute()
    logs_res = supabase.table("habit_logs").select("*").eq("user_id", user_id).gte("logged_at", start_date.isoformat()).execute()
    
    habit_consistency = []
    total_habits = len(habits_res.data) if habits_res.data else 0
    
    for i in range(days):
        current_day = start_date + timedelta(days=i)
        day_str = current_day.strftime("%a")[0] # M, T, W...
        
        day_logs = [l for l in logs_res.data if l["logged_at"] == current_day.isoformat()]
        completed_count = len(day_logs)
        
        habit_consistency.append(HabitConsistency(
            day=day_str,
            date=current_day,
            completed_count=completed_count,
            total_count=total_habits,
            is_fully_completed=(completed_count >= total_habits and total_habits > 0)
        ))

    # 3. Fetch Moods & Build 7-Day Trend
    try:
        reflections_res = supabase.table("reflections").select("created_at, mood, ai_analysis").eq("user_id", user_id).gte("created_at", start_date.isoformat()).execute()
        
        # Build a map of existing mood data
        mood_data_map = {}
        for r in (reflections_res.data or []):
            try:
                r_date = datetime.fromisoformat(r["created_at"].replace('Z', '+00:00')).date()
                ai_data = r.get("ai_analysis")
                if isinstance(ai_data, dict) and "sentiment_score" in ai_data:
                    m_score = ai_data["sentiment_score"] / 2
                else:
                    m_score = MOOD_SCORE_MAP.get(r.get("mood", "Neutral"), 3)
                
                # Take the latest/highest if multiple exist for a day
                mood_data_map[r_date.isoformat()] = {
                    "score": m_score,
                    "emoji": r.get("mood", "😌")
                }
            except:
                continue

        # Generate 7-day filled sequence
        mood_trends = []
        mood_scores_for_avg = []
        
        for i in range(days):
            current_day = start_date + timedelta(days=i)
            day_key = current_day.isoformat()
            
            if day_key in mood_data_map:
                day_data = mood_data_map[day_key]
                score = day_data["score"]
                emoji = day_data["emoji"]
                mood_scores_for_avg.append(score)
            else:
                # Default to Neutral baseline if no data
                score = 3.0
                emoji = "😴"
                
            mood_trends.append(MoodTrend(
                date=current_day,
                mood_score=int(score),
                mood_emoji=emoji
            ))
            
        avg_mood = sum(mood_scores_for_avg) / len(mood_scores_for_avg) if mood_scores_for_avg else 3
        mood_summary = "Positive" if avg_mood > 3.5 else "Stable" if avg_mood > 2.5 else "Challenging"
    except Exception as e:
        print(f"Analytics Mood Error: {e}")
        mood_trends = []
        mood_summary = "Stable"

    # 4. Generate AI Insight
    try:
        completion_rate = sum([1 for h in habit_consistency if h.completed_count > 0]) / days * 100
        summary_for_ai = {
            "habit_completion_rate": completion_rate,
            "active_goals_count": active_goals_count,
            "mood_summary": mood_summary,
            "top_tags": list(set(all_tags))[:5]
        }
        ai_insight = await generate_weekly_ai_insight(user_id, summary_for_ai)
    except:
        ai_insight = "Continue focusing on your daily habits to see consistent growth."
    
    # 5. Calculate Streak (Safer Fetch)
    try:
        profile_res = supabase.table("profiles").select("current_streak").eq("id", user_id).execute()
        streak_count = profile_res.data[0].get("current_streak", 0) if (profile_res.data and len(profile_res.data) > 0) else 0
    except:
        streak_count = 0

    return AnalyticsSummary(
        habit_streak=streak_count,
        total_goals_active=active_goals_count,
        goals_completed_count=completed_goals_count,
        weekly_ai_insight=ai_insight,
        habit_consistency=habit_consistency,
        goal_progress=goal_list,
        mood_trends=mood_trends
    )

# Constants for Mapping
COLORS_MAP = {
    "fitness": "#2DD4BF",
    "health": "#2DD4BF",
    "career": "#7C5CFC",
    "learning": "#F59E0B",
    "mind": "#F59E0B",
    "personal": "#F43F5E",
    "finance": "#47C28B"
}

COLORS_BG_MAP = {
    "fitness": "#E1F5EE",
    "health": "#E1F5EE",
    "career": "#F4F1FF",
    "learning": "#FEF3C7",
    "mind": "#FEF3C7",
    "personal": "#FFE4E6",
    "finance": "#E6F6EF"
}

MOOD_SCORE_MAP = {
    "😊": 5, "🤩": 5,
    "😌": 4,
    "😴": 3, "Neutral": 3,
    "😔": 2,
    "😤": 1
}

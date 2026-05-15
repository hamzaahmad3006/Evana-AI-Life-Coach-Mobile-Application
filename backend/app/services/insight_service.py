import json
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from app.services.ai_service import get_groq_client
from app.core.supabase import get_supabase_admin
from app.schemas.insights import AIInsight, InsightGenerationResponse

async def generate_user_insights(user_id: str) -> InsightGenerationResponse:
    """
    The 'Core Intelligence' function. It analyzes user data across all pillars 
    and generates deep, actionable coaching insights using Groq.
    """
    supabase = get_supabase_admin()
    client = get_groq_client()
    
    # 1. Gather Data (Last 14 Days)
    cutoff_date = (datetime.now() - timedelta(days=14)).isoformat()
    
    # Habits & Logs
    habits = supabase.table("habits").select("*").eq("user_id", user_id).execute()
    logs = supabase.table("habit_logs").select("*").eq("user_id", user_id).gte("logged_at", cutoff_date).execute()
    
    # Reflections
    reflections = supabase.table("reflections").select("*").eq("user_id", user_id).gte("created_at", cutoff_date).execute()
    
    # Goals
    goals = supabase.table("goals").select("*").eq("user_id", user_id).eq("status", "active").execute()

    # 2. Prepare Context for AI
    context = {
        "habits": habits.data,
        "recent_logs_count": len(logs.data),
        "reflections": [{"mood": r["mood"], "summary": r.get("ai_summary", "")} for r in reflections.data],
        "active_goals": [{"title": g["title"], "progress": g.get("progress", 0)} for g in goals.data]
    }

    system_prompt = (
        "You are Evana, a senior AI Life Coach with 20 years of experience in behavioral psychology. "
        "Your goal is to analyze the user's data and provide 4 deep, actionable insights. "
        "Each insight must be formatted as JSON with keys: 'title', 'description', 'type', 'priority'. "
        "Types: 'habit', 'mood', 'goal', 'celebration'. "
        "Prioritize correlations (e.g., how journaling affects habit consistency). "
        "Return ONLY a JSON array of 4 objects."
    )

    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"User Data Context: {json.dumps(context)}"}
            ],
            temperature=0.6,
            response_format={"type": "json_object"}
        )
        
        raw_response = completion.choices[0].message.content
        parsed = json.loads(raw_response)
        
        # Handle cases where LLM might wrap the array in a key
        insight_list = parsed.get("insights", parsed) if isinstance(parsed, dict) else parsed
        
        generated_insights = []
        for item in insight_list[:4]:
            insight = AIInsight(
                title=item["title"],
                description=item["description"],
                type=item["type"],
                priority=item.get("priority", 1)
            )
            generated_insights.append(insight)
            
            # Optional: Persist to DB (if table exists)
            try:
                supabase.table("ai_insights").insert({
                    "user_id": user_id,
                    "title": insight.title,
                    "description": insight.description,
                    "type": insight.type,
                    "priority": insight.priority
                }).execute()
            except:
                pass # Silently fail if table doesn't exist yet

        return InsightGenerationResponse(
            insights=generated_insights,
            featured_insight=generated_insights[0] if generated_insights else None
        )

    except Exception as e:
        print(f"Error generating insights: {str(e)}")
        # Fallback insights if AI fails
        fallback = [
            AIInsight(title="Consistency is Key", description="You're doing great! Keep tracking your habits to see long-term patterns.", type="habit"),
            AIInsight(title="Reflect more", description="Try to journal at least 3 times a week to unlock deeper emotional insights.", type="mood")
        ]
        return InsightGenerationResponse(insights=fallback, featured_insight=fallback[0])

async def get_saved_insights(user_id: str) -> List[AIInsight]:
    """
    Retrieves the most recent cached insights for the user.
    """
    supabase = get_supabase_admin()
    try:
        res = supabase.table("ai_insights").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(10).execute()
        return [AIInsight(**item) for item in res.data]
    except:
        return []

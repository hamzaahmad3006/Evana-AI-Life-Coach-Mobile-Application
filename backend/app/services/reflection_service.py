import json
from datetime import date
from typing import Dict, Any, Optional
from app.services.ai_service import get_groq_client
from app.core.supabase import get_supabase_admin

async def analyze_daily_reflection(user_id: str, content: str, mood: str) -> Dict[str, Any]:
    """
    Uses AI to perform deep emotional analysis on a journal entry.
    Now includes contextual data (habits/goals) for smarter correlations.
    """
    client = get_groq_client()
    supabase = get_supabase_admin()
    
    # 1. Fetch Context (Habits completed today and active Goals)
    try:
        # Get today's logs
        today = date.today().isoformat()
        logs_res = supabase.table("habit_logs").select("habit_id").eq("user_id", user_id).eq("logged_at", today).eq("status", True).execute()
        completed_habit_ids = [log["habit_id"] for log in logs_res.data]
        
        # Get habit titles
        habits_res = supabase.table("habits").select("title").in_("id", completed_habit_ids).execute()
        completed_habits = [h["title"] for h in habits_res.data]
        
        # Get active goals
        goals_res = supabase.table("goals").select("title").eq("user_id", user_id).eq("status", "active").execute()
        active_goals = [g["title"] for g in goals_res.data]
    except Exception as context_err:
        print(f"DEBUG: Could not fetch context for AI analysis: {context_err}")
        completed_habits = []
        active_goals = []

    system_prompt = (
        "You are Evana, a world-class AI life coach and behavioral psychologist. "
        "Analyze the user's journal entry and return a structured JSON response. "
        "You have access to the user's context (habits they completed today and their active goals). "
        "Use this context to find CORRELATIONS between their mood and their actions."
        "\n\nReturn a JSON object with these fields:"
        "1. 'sentiment_score': (int 1-10)"
        "2. 'primary_emotion': (string)"
        "3. 'coaching_note': (string, an empathetic and actionable 2-sentence insight. Connect their reflection to their habits/goals if possible.)"
        "4. 'tags': (list of strings, e.g., ['productivity', 'self-care'])"
        "5. 'intensity': (string, 'low', 'medium', 'high')"
        "6. 'correlation': (string, a brief observation of how their habits/goals affected their day)"
        "\nIMPORTANT: Return ONLY the raw JSON object."
    )
    
    user_context = (
        f"USER MOOD: {mood}\n"
        f"JOURNAL ENTRY: {content}\n"
        f"CONTEXT - HABITS COMPLETED TODAY: {', '.join(completed_habits) if completed_habits else 'None yet'}\n"
        f"CONTEXT - ACTIVE GOALS: {', '.join(active_goals) if active_goals else 'None set'}"
    )
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_context}
    ]
    
    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            temperature=0.4, # Lower temperature for more consistent analysis
            response_format={"type": "json_object"},
        )
        analysis_str = completion.choices[0].message.content.strip()
        return json.loads(analysis_str)
    except Exception as e:
        print(f"CRITICAL ERROR analyzing reflection: {str(e)}")
        return {
            "sentiment_score": 5,
            "primary_emotion": "Neutral",
            "coaching_note": "Thank you for reflecting today. Keep moving toward your goals.",
            "tags": [],
            "intensity": "low",
            "correlation": "Not enough data to find a pattern yet."
        }

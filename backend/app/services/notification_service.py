import requests
from typing import List, Dict, Any, Optional
from app.core.supabase import get_supabase_admin

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"

def send_push_notification(token: str, title: str, body: str, data: Optional[Dict[str, Any]] = None):
    """
    Sends a push notification to a specific device via Expo's Push API.
    """
    message = {
        "to": token,
        "sound": "default",
        "title": title,
        "body": body,
        "data": data or {},
    }
    
    try:
        response = requests.post(EXPO_PUSH_URL, json=message)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        print(f"Error sending push notification: {str(e)}")
        return None

async def nudge_user_for_habit(user_id: str, habit_name: str):
    """
    Logic for a specific accountability nudge.
    """
    supabase = get_supabase_admin()
    profile = supabase.table("profiles").select("expo_push_token").eq("id", user_id).single().execute()
    
    token = profile.data.get("expo_push_token")
    if token:
        send_push_notification(
            token=token,
            title="Consistency Check-in",
            body=f"Hey! You haven't logged your '{habit_name}' habit today. Let's keep the streak alive!",
            data={"screen": "habits"}
        )

async def send_ai_insight_nudge(user_id: str, insight_title: str):
    """
    Sends a nudge when a fresh AI insight is available.
    """
    supabase = get_supabase_admin()
    profile = supabase.table("profiles").select("expo_push_token").eq("id", user_id).single().execute()
    
    token = profile.data.get("expo_push_token")
    if token:
        send_push_notification(
            token=token,
            title="Fresh Wisdom from Evana",
            body=f"I've analyzed your patterns: {insight_title}. Tap to see your new growth plan.",
            data={"screen": "insights"}
        )

async def send_streak_celebration(user_id: str, habit_name: str, streak_count: int):
    """
    Sends a congratulatory nudge when a user hits a streak milestone.
    """
    supabase = get_supabase_admin()
    profile = supabase.table("profiles").select("expo_push_token").eq("id", user_id).single().execute()
    
    token = profile.data.get("expo_push_token")
    if token:
        title = "🔥 Unstoppable Streak!"
        body = f"That's {streak_count} days in a row for '{habit_name}'! Your consistency is inspiring. Keep going!"
        
        if streak_count == 3:
            title = "🥉 3-Day Atomic Win!"
            body = f"You've logged '{habit_name}' for 3 days straight. The habit is starting to stick!"
        elif streak_count == 7:
            title = "🥈 Weekly Warrior!"
            body = f"A full week of '{habit_name}'! You're officially in the rhythm."
        elif streak_count >= 30:
            title = "👑 Legendary Consistency!"
            body = f"{streak_count} days of '{habit_name}'! This is part of who you are now."

        send_push_notification(
            token=token,
            title=title,
            body=body,
            data={"screen": "habits", "type": "streak", "streak": streak_count}
        )

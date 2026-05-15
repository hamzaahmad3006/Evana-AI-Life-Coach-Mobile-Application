from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.services.notification_service import send_push_notification, nudge_user_for_habit
from app.services.motivation_service import trigger_morning_broadcast
from app.core.supabase import get_supabase_admin

router = APIRouter()

@router.post("/morning-broadcast")
async def morning_broadcast():
    """
    Triggers personalized morning motivation for all registered users.
    """
    try:
        results = await trigger_morning_broadcast()
        return {"status": "success", "results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class TestNotification(BaseModel):
    user_id: str
    title: str
    body: str
    data: Optional[Dict[str, Any]] = None

@router.post("/test")
async def send_test_notification(payload: TestNotification):
    """
    Sends a test push notification to a specific user.
    """
    supabase = get_supabase_admin()
    profile = supabase.table("profiles").select("expo_push_token").eq("id", payload.user_id).single().execute()
    
    token = profile.data.get("expo_push_token")
    if not token:
        raise HTTPException(status_code=400, detail="User has no registered push token")
        
    result = send_push_notification(token, payload.title, payload.body, payload.data)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to send notification")
        
    return {"status": "success", "result": result}

@router.post("/nudge/habit/{user_id}")
async def trigger_habit_nudge(user_id: str, habit_name: str):
    """
    Manually triggers a habit accountability nudge for testing.
    """
    try:
        await nudge_user_for_habit(user_id, habit_name)
        return {"status": "nudge_sent"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

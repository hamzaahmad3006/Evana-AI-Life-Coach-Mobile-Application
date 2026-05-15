from fastapi import APIRouter, HTTPException, Depends
from app.schemas.assistant import AssistantChatRequest, AssistantChatResponse
from app.services.assistant_service import get_assistant_response
from typing import List

router = APIRouter()

@router.post("/chat", response_model=AssistantChatResponse)
async def assistant_chat(request: AssistantChatRequest):
    """
    General purpose AI Assistant endpoint.
    Provides context-aware life coaching based on user goals and habits.
    """
    try:
        response = await get_assistant_response(request.user_id, request.message)
        return response
    except Exception as e:
        print(f"ERROR in Assistant Chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{user_id}", response_model=List[dict])
async def get_chat_history(user_id: str):
    """
    Retrieves the persistent chat history for a specific user.
    """
    from app.core.supabase import get_supabase_admin
    supabase = get_supabase_admin()
    
    try:
        result = supabase.table("conversations")\
            .select("*")\
            .eq("user_id", user_id)\
            .order("created_at", desc=False)\
            .execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from fastapi import APIRouter, Depends, HTTPException
from app.schemas.chat import OnboardingChatRequest, OnboardingChatResponse
from app.services.onboarding_service import get_onboarding_response

router = APIRouter()

@router.post("/onboarding", response_model=OnboardingChatResponse)
async def onboarding_chat(request: OnboardingChatRequest):
    """
    Handles the conversational onboarding chat with Evana.
    Extracts intent and provides coaching responses.
    """
    try:
        response = await get_onboarding_response(request.messages, request.user_context)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suggestions")
async def get_suggestions(request: OnboardingChatRequest):
    """
    Generates structured goal suggestions based on the full chat history.
    """
    from app.services.onboarding_service import generate_goal_suggestions
    try:
        suggestions = await generate_goal_suggestions(request.messages, request.user_context)
        return {"suggestions": suggestions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

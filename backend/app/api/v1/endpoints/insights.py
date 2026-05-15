from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.insights import AIInsight, InsightGenerationResponse
from app.services.insight_service import generate_user_insights, get_saved_insights

router = APIRouter()

@router.get("/{user_id}", response_model=List[AIInsight])
async def get_user_coaching_insights(user_id: str):
    """
    Fetches the latest coaching insights for a user.
    If no insights exist, it triggers a generation.
    """
    try:
        insights = await get_saved_insights(user_id)
        if not insights:
            response = await generate_user_insights(user_id)
            return response.insights
        return insights
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate/{user_id}", response_model=InsightGenerationResponse)
async def trigger_insight_generation(user_id: str):
    """
    Force-generates fresh AI insights based on the latest data.
    """
    try:
        return await generate_user_insights(user_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

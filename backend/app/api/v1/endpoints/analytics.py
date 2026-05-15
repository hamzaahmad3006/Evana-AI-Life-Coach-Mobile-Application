from fastapi import APIRouter, HTTPException
from app.schemas.analytics import AnalyticsSummary
from app.services.analytics_service import get_user_analytics

router = APIRouter()

@router.get("/summary/{user_id}", response_model=AnalyticsSummary)
async def get_analytics_summary(user_id: str, days: int = 7):
    """
    Returns a comprehensive analytics summary for the user.
    Default timeframe is 7 days.
    """
    try:
        summary = await get_user_analytics(user_id, days)
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

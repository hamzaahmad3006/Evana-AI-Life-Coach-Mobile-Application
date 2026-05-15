from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime

class AIInsight(BaseModel):
    id: Optional[str] = None
    title: str
    description: str
    type: str  # 'habit', 'mood', 'goal', 'celebration'
    priority: int = 1
    is_read: bool = False
    created_at: Optional[datetime] = None

class InsightGenerationResponse(BaseModel):
    insights: List[AIInsight]
    featured_insight: Optional[AIInsight] = None

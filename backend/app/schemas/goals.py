from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date

class GoalBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str
    target_date: date
    progress: int = Field(default=0, ge=0, le=100)
    status: str = "active"

class GoalCreate(GoalBase):
    user_id: str

class GoalUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    target_date: Optional[date] = None
    progress: Optional[int] = Field(None, ge=0, le=100)
    status: Optional[str] = None

class GoalResponse(GoalBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

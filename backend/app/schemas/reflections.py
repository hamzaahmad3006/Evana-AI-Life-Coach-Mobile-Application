from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ReflectionBase(BaseModel):
    content: str
    mood: Optional[str] = "Neutral"

class ReflectionCreate(ReflectionBase):
    user_id: str

class ReflectionUpdate(BaseModel):
    content: Optional[str] = None
    mood: Optional[str] = None
    ai_summary: Optional[str] = None
    ai_analysis: Optional[dict] = None

class ReflectionResponse(ReflectionBase):
    id: str
    user_id: str
    ai_summary: Optional[str] = None
    ai_analysis: Optional[dict] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

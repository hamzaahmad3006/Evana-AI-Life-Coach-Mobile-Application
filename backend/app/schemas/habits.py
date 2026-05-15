from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date

class HabitBase(BaseModel):
    title: str
    description: Optional[str] = None
    emoji: str = "✨"
    bg_color: str = "#7C5CFC"
    frequency: str = "daily" # daily, weekly
    streak_count: int = 0

class HabitCreate(HabitBase):
    user_id: str

class HabitUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    emoji: Optional[str] = None
    bg_color: Optional[str] = None
    frequency: Optional[str] = None
    streak_count: Optional[int] = None

class HabitLogCreate(BaseModel):
    habit_id: str
    user_id: str
    logged_at: date
    status: bool = True

class HabitResponse(HabitBase):
    id: str
    user_id: str
    is_completed_today: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class HabitLogResponse(BaseModel):
    id: str
    habit_id: str
    user_id: str
    logged_at: date
    status: bool
    created_at: datetime

    class Config:
        from_attributes = True

class HabitDashboardResponse(BaseModel):
    habits: List[HabitResponse]
    global_streak: int

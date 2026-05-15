from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import date

class HabitConsistency(BaseModel):
    day: str  # e.g., "M", "T"
    date: date
    completed_count: int
    total_count: int
    is_fully_completed: bool

class GoalProgress(BaseModel):
    id: str
    title: str
    progress: float
    color: str
    bg_color: str

class MoodTrend(BaseModel):
    date: date
    mood_score: int  # 1-5 or based on emoji mapping
    mood_emoji: str

class AnalyticsSummary(BaseModel):
    habit_streak: int
    total_goals_active: int
    goals_completed_count: int
    weekly_ai_insight: Optional[str] = None
    habit_consistency: List[HabitConsistency]
    goal_progress: List[GoalProgress]
    mood_trends: List[MoodTrend]

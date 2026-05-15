from pydantic import BaseModel, Field
from typing import List, Optional

class ChatMessage(BaseModel):
    role: str # 'user' or 'assistant'
    content: str

class OnboardingChatRequest(BaseModel):
    user_id: str
    messages: List[ChatMessage]
    user_context: Optional[dict] = None

class OnboardingChatResponse(BaseModel):
    message: str
    is_ready_for_goals: bool = False
    suggested_goals: Optional[List[dict]] = None

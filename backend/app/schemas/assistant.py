from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime

class ChatMessage(BaseModel):
    role: str # 'user' or 'assistant'
    content: str

class AssistantChatRequest(BaseModel):
    user_id: str
    message: str # The latest message from the user
    context: Optional[Dict[str, Any]] = None

class AssistantChatResponse(BaseModel):
    message: str
    id: str # Message ID from DB
    created_at: datetime
    suggested_actions: Optional[List[str]] = None

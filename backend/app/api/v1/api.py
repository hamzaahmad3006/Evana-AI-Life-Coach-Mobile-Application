from fastapi import APIRouter
from app.api.v1.endpoints import auth, health, chat, assistant, voice_assistant, goals, habits, reflections, analytics, insights, notifications

api_router = APIRouter()

# Include health routes at root level of API
api_router.include_router(health.router, tags=["health"])

# Include auth routes under /auth prefix
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])

# Include chat routes under /chat prefix (for onboarding)
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])

# Include assistant routes under /assistant prefix (main coaching assistant)
api_router.include_router(assistant.router, prefix="/assistant", tags=["assistant"])
api_router.include_router(voice_assistant.router, prefix="/assistant", tags=["voice_assistant"])

# Include goals routes under /goals prefix
api_router.include_router(goals.router, prefix="/goals", tags=["goals"])

# Include habits routes under /habits prefix
api_router.include_router(habits.router, prefix="/habits", tags=["habits"])

# Include reflections routes under /reflections prefix
api_router.include_router(reflections.router, prefix="/reflections", tags=["reflections"])

# Include analytics routes under /analytics prefix
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])

# Include insights routes under /insights prefix
api_router.include_router(insights.router, prefix="/insights", tags=["insights"])

# Include notification routes under /notifications prefix
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])

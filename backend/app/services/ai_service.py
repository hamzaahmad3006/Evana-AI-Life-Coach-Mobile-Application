from groq import AsyncGroq
from app.core.config import settings

def get_groq_client() -> AsyncGroq:
    """
    Returns an initialized Async GROQ client.
    """
    return AsyncGroq(api_key=settings.GROQ_API_KEY)

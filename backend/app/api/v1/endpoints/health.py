from fastapi import APIRouter
from app.core.supabase import get_supabase_admin

router = APIRouter()

@router.get("/")
async def root():
    return {"message": "Evana API is live and accessible from your mobile device!"}

@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.get("/test-supabase")
async def test_supabase():
    """Verify Supabase connection by querying the profiles table."""
    try:
        supabase = get_supabase_admin()
        supabase.table("profiles").select("id").limit(1).execute()
        return {"status": "connected", "message": "Supabase is working!"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

from supabase import create_client, Client
from app.core.config import settings

def get_supabase_admin() -> Client:
    """
    Returns a Supabase client with SERVICE_ROLE privileges.
    Use this for backend operations that need to bypass RLS.
    """
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

def get_supabase_client() -> Client:
    """
    Returns a Supabase client with ANON key privileges.
    Use this for operations that should respect RLS policies.
    """
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_ANON_KEY)

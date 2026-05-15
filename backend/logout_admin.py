import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Use SERVICE_ROLE_KEY to bypass RLS and perform admin actions
url = os.getenv("SUPABASE_URL")
# NOTE: You must add SUPABASE_SERVICE_ROLE_KEY to your backend/.env
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") 

if not key:
    print("❌ Error: SUPABASE_SERVICE_ROLE_KEY not found in .env")
    print("Please get your Service Role key from Supabase Dashboard > Settings > API")
    exit(1)

supabase: Client = create_client(url, key)

def force_logout_user(user_id: str):
    """
    Invalidates all sessions for a specific user.
    """
    try:
        # This will sign out the user from all devices by invalidating their refresh tokens
        supabase.auth.admin.remove_user(user_id)
        print(f"✅ Successfully removed user {user_id} and invalidated all active sessions.")
    except Exception as e:
        print(f"❌ Failed to logout user: {e}")

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python logout_admin.py <USER_ID>")
        exit(1)
        
    user_id_to_clear = sys.argv[1]
    force_logout_user(user_id_to_clear)

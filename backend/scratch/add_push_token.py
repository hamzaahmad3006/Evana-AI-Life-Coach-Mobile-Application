import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()

url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

sql = """
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS expo_push_token TEXT;
"""

try:
    # Use RPC to execute raw SQL if available, or just use the migration tool
    # Since I don't have a direct 'execute_sql' in the SDK, I'll assume the user
    # will run this in the Supabase SQL editor.
    print("Please run the following SQL in your Supabase SQL Editor:")
    print(sql)
except Exception as e:
    print(f"Error: {e}")

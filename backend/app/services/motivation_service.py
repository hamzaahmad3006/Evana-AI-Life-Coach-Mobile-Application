from typing import Optional
from app.services.ai_service import get_groq_client
from app.core.supabase import get_supabase_admin
from app.services.notification_service import send_push_notification

async def generate_personalized_motivation(user_name: str, bio: Optional[str] = None) -> str:
    """
    Generates a personalized 1-sentence morning motivation nudge using AI.
    """
    client = get_groq_client()
    
    context = f"User Name: {user_name}\nLife Context: {bio or 'Generic growth mindset'}"
    
    system_prompt = (
        "You are Evana, a world-class performance coach. Your task is to write a single, "
        "powerful, 1-sentence morning motivation nudge for a user. "
        "Be punchy, encouraging, and highly personal. Use the user's name. "
        "Avoid clichés like 'have a nice day'. Focus on momentum and identity."
    )
    
    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": context}
            ],
            temperature=0.8,
            max_tokens=60,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating motivation: {str(e)}")
        return f"Good morning, {user_name}! Let's make today count. Your future self is cheering you on."

async def trigger_morning_broadcast():
    """
    Fetches all users with push tokens and sends personalized morning nudges.
    """
    supabase = get_supabase_admin()
    
    # 1. Fetch all users with tokens
    users_res = supabase.table("profiles").select("id, full_name, bio, expo_push_token").not_.is_("expo_push_token", "null").execute()
    users = users_res.data
    
    print(f"DEBUG: Starting morning broadcast for {len(users)} users...")
    
    results = {"success": 0, "failed": 0}
    
    for user in users:
        try:
            user_id = user["id"]
            name = user.get("full_name", "there")
            bio = user.get("bio")
            token = user["expo_push_token"]
            
            # 2. Generate personalized message
            message = await generate_personalized_motivation(name, bio)
            
            # 3. Send Push
            send_push_notification(
                token=token,
                title="🌅 Morning Momentum",
                body=message,
                data={"screen": "home", "type": "motivation"}
            )
            results["success"] += 1
        except Exception as e:
            print(f"ERROR: Failed to send morning nudge to {user.get('id')}: {str(e)}")
            results["failed"] += 1
            
    return results

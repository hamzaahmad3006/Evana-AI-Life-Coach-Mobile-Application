import json
from typing import List, Dict, Any, Optional
from datetime import datetime, date
from app.services.ai_service import get_groq_client
from app.core.supabase import get_supabase_admin
from app.schemas.assistant import AssistantChatResponse

async def get_assistant_response(user_id: str, user_message: str) -> AssistantChatResponse:
    """
    Main orchestrator for the AI Assistant.
    1. Gathers user context (Goals, Habits, History)
    2. Calls Groq with a rich system prompt
    3. Saves interaction to the 'conversations' table
    """
    supabase = get_supabase_admin()
    client = get_groq_client()

    # 1. Gather Context (Parallel fetching in real prod, but sequential here for clarity)
    
    # Profile
    profile = supabase.table("profiles").select("*").eq("id", user_id).single().execute()
    user_name = profile.data.get("full_name", "there") if profile.data else "there"
    
    # Goals
    goals = supabase.table("goals").select("*").eq("user_id", user_id).eq("status", "active").execute()
    goal_list = [g["title"] for g in goals.data] if goals.data else []
    
    # Habits & Today's Logs
    today = date.today().isoformat()
    habits = supabase.table("habits").select("*").eq("user_id", user_id).execute()
    habit_logs = supabase.table("habit_logs").select("*").eq("user_id", user_id).eq("logged_at", today).execute()
    
    completed_habit_ids = [log["habit_id"] for log in habit_logs.data] if habit_logs.data else []
    habit_status = []
    if habits.data:
        for h in habits.data:
            status = "✅ Done" if h["id"] in completed_habit_ids else "⏳ Pending"
            habit_status.append(f"{h['title']}: {status}")

    # History (Last 10 messages)
    history = supabase.table("conversations").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(10).execute()
    chat_history = []
    if history.data:
        # Reverse to get chronological order
        for msg in reversed(history.data):
            chat_history.append({"role": msg["role"], "content": msg["content"]})

    # 2. Construct System Prompt
    system_prompt = (
        "You are Evana, a highly sophisticated and empathetic AI life coach. "
        f"You are coaching {user_name}. Your tone is professional, encouraging, and insight-driven. "
        "\n--- USER CONTEXT ---\n"
    )
    
    if goal_list:
        system_prompt += f"ACTIVE GOALS: {', '.join(goal_list)}\n"
    
    if habit_status:
        system_prompt += f"TODAY'S HABITS:\n" + "\n".join(habit_status) + "\n"
    
    system_prompt += (
        "\n--- COACHING GUIDELINES ---\n"
        "- Use the user's goals and habit progress to provide specific, personalized advice.\n"
        "- If they are missing habits, ask empathetically what challenges they face.\n"
        "- Keep responses concise but impactful (max 3 paragraphs).\n"
        "- Focus on growth, mindset, and practical productivity."
    )

    # 3. Save User Message to DB
    user_record = supabase.table("conversations").insert({
        "user_id": user_id,
        "role": "user",
        "content": user_message
    }).execute()

    # 4. Call Groq
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend(chat_history)
    messages.append({"role": "user", "content": user_message})

    print(f"DEBUG Assistant: Calling Groq for user {user_id}")
    completion = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.7,
        max_tokens=800,
    )
    ai_text = completion.choices[0].message.content

    # 5. Save AI Response to DB
    ai_record = supabase.table("conversations").insert({
        "user_id": user_id,
        "role": "assistant",
        "content": ai_text
    }).execute()

    record_data = ai_record.data[0]
    
    return AssistantChatResponse(
        message=ai_text,
        id=record_data["id"],
        created_at=record_data["created_at"]
    )

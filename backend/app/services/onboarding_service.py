import json
from typing import List, Optional, Dict
from app.services.ai_service import get_groq_client
from app.schemas.chat import ChatMessage, OnboardingChatResponse

async def get_onboarding_response(
    messages: List[ChatMessage], 
    user_context: Optional[Dict] = None
) -> OnboardingChatResponse:
    """
    Orchestrates the onboarding conversation with Evana.
    """
    client = get_groq_client()
    
    # Construct System Prompt
    system_prompt = (
        "You are Evana, a highly empathetic and professional AI life coach. "
        "Your goal is to conduct an onboarding conversation to help the user define their goals. "
    )
    
    if user_context:
        full_name = user_context.get("full_name", "User")
        interests = user_context.get("interests", [])
        system_prompt += f"\nYou are coaching {full_name}. Their interests are: {', '.join(interests)}. "
    
    system_prompt += (
        "\nAsk probing questions to understand their specific challenges and desired outcomes. "
        "Be encouraging but structured. "
        "When you have enough information to suggest 3 specific, actionable goals, "
        "end your message with the exact tag: [GOALS_READY]."
    )

    # Format messages for Groq
    groq_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        # Pydantic objects might need .role or ['role'] depending on how they are passed
        role = msg.role if hasattr(msg, 'role') else msg.get('role')
        content = msg.content if hasattr(msg, 'content') else msg.get('content')
        groq_messages.append({"role": role, "content": content})

    print(f"DEBUG: Sending {len(groq_messages)} messages to Groq")
    
    # Call Groq
    try:
        completion = await client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=groq_messages,
            temperature=0.7,
            max_tokens=1000,
        )
        print("DEBUG: Groq call successful")
    except Exception as e:
        print(f"DEBUG: Groq call failed: {str(e)}")
        raise e

    ai_text = completion.choices[0].message.content
    print(f"DEBUG: AI Response: {ai_text[:50]}...")
    
    # Check for readiness signal
    is_ready = "[GOALS_READY]" in ai_text
    clean_message = ai_text.replace("[GOALS_READY]", "").strip()

    return OnboardingChatResponse(
        message=clean_message,
        is_ready_for_goals=is_ready
    )

async def generate_goal_suggestions(messages: List[ChatMessage], user_context: Optional[Dict] = None) -> List[dict]:
    """
    Final step: Generates structured goal suggestions based on the conversation history.
    """
    client = get_groq_client()
    
    prompt = (
        "Based on the following conversation history between Evana (AI coach) and a user, "
        "generate exactly 3 highly personalized, actionable goals. "
        "Output the result as a JSON list of objects. Each object must have: "
        "'title', 'category', 'duration', 'description', and 'reasoning'. "
        "\nConversation history:\n"
    )
    
    for msg in messages:
        role = msg.role if hasattr(msg, 'role') else msg.get('role')
        content = msg.content if hasattr(msg, 'content') else msg.get('content')
        prompt += f"{role.upper()}: {content}\n"

    completion = await client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},
        temperature=0.5,
    )

    try:
        data = json.loads(completion.choices[0].message.content)
        # Ensure it returns a list under a 'goals' key or just the list
        return data.get("goals", data) if isinstance(data, dict) else data
    except Exception:
        return []

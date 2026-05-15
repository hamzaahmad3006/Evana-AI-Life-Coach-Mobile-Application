from fastapi import APIRouter, Depends, HTTPException, Header
from typing import Optional
from app.schemas.auth import UserSignUp, UserLogin, UserProfileUpdate
from app.core.supabase import get_supabase_admin, get_supabase_client

router = APIRouter()

@router.post("/signup")
async def signup(user_data: UserSignUp):
    """Create a new user via Supabase."""
    supabase = get_supabase_admin()
    try:
        response = supabase.auth.sign_up({
            "email": user_data.email,
            "password": user_data.password,
            "options": {"data": {"full_name": user_data.full_name}}
        })
        return {"message": "User created successfully", "user": response.user}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
async def login(credentials: UserLogin):
    """Authenticate user and return session."""
    supabase = get_supabase_client()
    try:
        response = supabase.auth.sign_in_with_password({
            "email": credentials.email,
            "password": credentials.password
        })
        return {"message": "Login successful", "session": response.session}
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid credentials")

async def get_current_user(authorization: Optional[str] = Header(None)):
    """Dependency to protect routes by verifying Supabase JWT."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid token")
    
    token = authorization.split(" ")[1]
    supabase = get_supabase_client()
    try:
        response = supabase.auth.get_user(token)
        return response.user
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

@router.get("/me")
async def get_profile(user=Depends(get_current_user)):
    """Protected route that returns the current user's profile."""
    return {"user": user}

@router.put("/profile")
async def update_profile(profile_data: UserProfileUpdate, user=Depends(get_current_user)):
    """Update user profile in both Auth metadata and profiles table."""
    supabase = get_supabase_admin()
    try:
        # 1. Update Auth Metadata
        if profile_data.full_name:
            supabase.auth.admin.update_user_by_id(
                user.id, 
                attributes={"user_metadata": {"full_name": profile_data.full_name}}
            )

        # 2. Update Profiles Table
        update_payload = {}
        if profile_data.full_name: update_payload["full_name"] = profile_data.full_name
        if profile_data.bio: update_payload["bio"] = profile_data.bio
        if profile_data.interests: update_payload["interests"] = profile_data.interests

        if update_payload:
            supabase.table("profiles").update(update_payload).eq("id", user.id).execute()

        return {"message": "Profile updated successfully", "data": update_payload}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

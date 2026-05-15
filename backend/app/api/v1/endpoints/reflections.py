from fastapi import APIRouter, HTTPException, BackgroundTasks
from app.schemas.reflections import ReflectionCreate, ReflectionUpdate, ReflectionResponse
from app.core.supabase import get_supabase_admin
from app.services.reflection_service import analyze_daily_reflection
from typing import List

router = APIRouter()

@router.get("/{user_id}", response_model=List[ReflectionResponse])
async def get_user_reflections(user_id: str):
    """
    Retrieves all journal reflections for a user.
    """
    supabase = get_supabase_admin()
    try:
        result = supabase.table("reflections").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
        return result.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=ReflectionResponse)
async def create_reflection(reflection: ReflectionCreate):
    """
    Creates a new journal entry and performs deep AI analysis.
    """
    supabase = get_supabase_admin()
    try:
        # 1. Save the raw entry
        print(f"DEBUG: Saving reflection for user {reflection.user_id}")
        result = supabase.table("reflections").insert(reflection.model_dump()).execute()
        if not result.data:
            print("ERROR: Failed to insert reflection into Supabase")
            raise HTTPException(status_code=400, detail="Failed to create reflection")
        
        reflection_record = result.data[0]
        print(f"DEBUG: Saved reflection record ID: {reflection_record['id']}")
        
        # 2. Perform Deep Analysis
        try:
            ai_analysis = await analyze_daily_reflection(
                reflection.user_id, 
                reflection.content, 
                reflection.mood
            )
            
            # 3. Update the record with structured analysis and summary
            updated = supabase.table("reflections").update({
                "ai_analysis": ai_analysis,
                "ai_summary": ai_analysis.get("coaching_note", "")
            }).eq("id", reflection_record["id"]).execute()
            
            return updated.data[0]
        except Exception as ai_err:
            print(f"WARNING: AI Analysis failed, returning raw record: {str(ai_err)}")
            return reflection_record

    except Exception as e:
        print(f"CRITICAL ENDPOINT ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{reflection_id}")
async def delete_reflection(reflection_id: str):
    """
    Deletes a journal entry.
    """
    supabase = get_supabase_admin()
    try:
        supabase.table("reflections").delete().eq("id", reflection_id).execute()
        return {"status": "success", "message": "Reflection deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

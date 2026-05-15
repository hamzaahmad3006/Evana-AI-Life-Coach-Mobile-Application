from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.services.voice_service import voice_service
from app.services.assistant_service import get_assistant_response
import base64

router = APIRouter()

@router.post("/voice")
async def voice_assistant_interaction(
    user_id: str = Form(...),
    audio: UploadFile = File(...)
):
    """
    Unified voice interaction endpoint:
    1. STT (Deepgram Nova-2)
    2. LLM (Groq Llama 3.3)
    3. TTS (Deepgram Aura)
    """
    try:
        # 1. Read audio bytes
        audio_content = await audio.read()
        
        # 2. Transcribe (Speech to Text)
        transcript = await voice_service.transcribe_audio(audio_content, audio.content_type)
        if not transcript:
            raise HTTPException(status_code=400, detail="Could not transcribe audio")
            
        print(f"DEBUG: Voice Transcript: {transcript}")
        
        # 3. Get AI Response (Cognition)
        # We wrap the transcript into our existing assistant logic
        ai_response_obj = await get_assistant_response(user_id, transcript)
        response_text = ai_response_obj.message
        
        # 4. Synthesize Response (Text to Speech)
        audio_base64 = await voice_service.synthesize_speech_base64(response_text)
        
        return {
            "user_id": user_id,
            "user_transcript": transcript,
            "ai_response_text": response_text,
            "ai_audio_base64": audio_base64,
            "status": "success"
        }
        
    except Exception as e:
        print(f"CRITICAL ERROR in Voice Assistant: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

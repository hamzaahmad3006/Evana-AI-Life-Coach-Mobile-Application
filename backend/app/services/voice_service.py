from deepgram import DeepgramClient, PrerecordedOptions, SpeakOptions
import os
import base64
from app.core.config import settings

class VoiceService:
    def __init__(self):
        self.api_key = settings.DEEPGRAM_API_KEY
        if not self.api_key:
            print("WARNING: DEEPGRAM_API_KEY not found in settings")
        self.client = DeepgramClient(self.api_key)

    async def transcribe_audio(self, audio_content: bytes, mimetype: str = "audio/wav") -> str:
        """
        Transcribes audio using Deepgram's Nova-2 model.
        """
        try:
            options = PrerecordedOptions(
                model="nova-2",
                smart_format=True,
                language="en-US",
            )
            
            payload = {"buffer": audio_content}
            response = self.client.listen.prerecorded.v("1").transcribe_file(payload, options)
            
            transcript = response.results.channels[0].alternatives[0].transcript
            return transcript
        except Exception as e:
            print(f"Error in STT: {str(e)}")
            return ""

    async def synthesize_speech_base64(self, text: str) -> str:
        """
        Converts text to speech using Deepgram's Aura model and returns base64 string.
        """
        try:
            # aura-asteria-en is a high-quality, professional female voice
            options = SpeakOptions(
                model="aura-asteria-en",
            )
            
            response = self.client.speak.v("1").save("temp_speech.mp3", {"text": text}, options)
            
            # Read the generated file and convert to base64
            with open("temp_speech.mp3", "rb") as audio_file:
                audio_data = audio_file.read()
                base64_audio = base64.b64encode(audio_data).decode('utf-8')
            
            # Clean up temp file
            if os.path.exists("temp_speech.mp3"):
                os.remove("temp_speech.mp3")
                
            return base64_audio
        except Exception as e:
            print(f"Error in TTS: {str(e)}")
            return ""

# Global instance
voice_service = VoiceService()

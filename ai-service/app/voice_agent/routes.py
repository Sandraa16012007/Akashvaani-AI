from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from pydantic import BaseModel
import logging

from app.voice_agent.whisper_service import transcribe_audio
from app.voice_agent.gemini_service import generate_response
from app.voice_agent.intent_parser import parse_llm_output
from app.voice_agent.utils import save_temp_audio, cleanup_temp_file

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["Voice Agent"])


class TextQueryRequest(BaseModel):
    text: str
    language: str = "en"


@router.post("/voice-query")
async def voice_query(
    audio: UploadFile = File(...),
    browser_text: str = Form(None)
):
    """
    Accept an audio file, transcribe it with Whisper,
    process with Gemini, and return a structured response.
    Preference browser_text for consistency if provided.
    """
    logger.info("Received voice query request")
    file_path = None
    try:
        # 1. Save the uploaded audio to a temp file
        file_path = await save_temp_audio(audio)

        # 2. Transcribe with Whisper (needed for language detection)
        logger.info(f"Transcribing audio file: {file_path}")
        stt_result = transcribe_audio(file_path)

        # Use browser_text if available for the final query to match what user saw
        final_text = browser_text if browser_text and browser_text.strip() else stt_result["text"]
        
        if not final_text:
            return {
                "text": "",
                "response": "I couldn't hear anything. Could you please try again?",
                "intent": "answer",
                "route": None,
                "language": "en"
            }

        # 3. Get Gemini response
        logger.info(f"Generating Gemini response for text: '{final_text}' in language: {stt_result['language']}")
        llm_output = generate_response(
            final_text,
            stt_result["language"]
        )

        # 4. Parse the LLM output
        parsed = parse_llm_output(llm_output)

        return {
            "text": final_text,
            "response": parsed["reply"],
            "intent": parsed["intent"],
            "route": parsed["route"],
            "language": parsed["response_language"] # Sync with response language
        }

    except RuntimeError as e:
        logger.error(f"Voice query processing error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in voice query: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred processing your voice query.")
    finally:
        # Always clean up the temp file
        if file_path:
            cleanup_temp_file(file_path)


@router.post("/text-query")
async def text_query(request: TextQueryRequest):
    """
    Accept a text query (fallback when audio fails or user types),
    process with Gemini, and return a structured response.
    Reuses the same Gemini + intent pipeline as voice queries.
    """
    try:
        if not request.text.strip():
            raise HTTPException(status_code=400, detail="Query text cannot be empty.")

        # Skip Whisper, go directly to Gemini
        logger.info(f"Received text query: '{request.text}'")
        llm_output = generate_response(
            request.text,
            request.language
        )

        parsed = parse_llm_output(llm_output)

        return {
            "text": request.text,
            "response": parsed["reply"],
            "intent": parsed["intent"],
            "route": parsed["route"],
            "language": parsed["response_language"]
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Text query error: {e}")
        raise HTTPException(status_code=500, detail="An error occurred processing your query.")

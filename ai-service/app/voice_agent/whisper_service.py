import os
import sys
import whisper
import logging

# Ensure ffmpeg (installed via winget) is on PATH for this process.
# The conda environment does not automatically inherit the WinGet Links directory.
_WINGET_LINKS = os.path.join(os.environ.get("LOCALAPPDATA", ""), "Microsoft", "WinGet", "Links")
if _WINGET_LINKS and os.path.isdir(_WINGET_LINKS) and _WINGET_LINKS not in os.environ.get("PATH", ""):
    os.environ["PATH"] = _WINGET_LINKS + os.pathsep + os.environ.get("PATH", "")

logger = logging.getLogger(__name__)

# Load Whisper base model — good balance of speed + accuracy for Hindi/English
# Model downloads automatically on first run (~150MB)
logger.info("Loading Whisper 'base' model...")
model = whisper.load_model("base")
logger.info("Whisper model loaded successfully.")


def transcribe_audio(file_path: str) -> dict:
    """
    Transcribe an audio file using OpenAI Whisper.
    Auto-detects language (Hindi, English, Hinglish).

    Args:
        file_path: Path to the audio file (wav, webm, mp3, etc.)

    Returns:
        dict with keys: text (str), language (str like 'hi', 'en')
    """
    try:
        result = model.transcribe(file_path)
        detected_language = result.get("language", "en")
        transcribed_text = result.get("text", "").strip()

        logger.info(f"Transcription complete — Language: {detected_language}, Text: {transcribed_text[:80]}...")

        return {
            "text": transcribed_text,
            "language": detected_language
        }
    except Exception as e:
        logger.error(f"Whisper transcription failed: {e}")
        raise RuntimeError(f"Speech-to-text failed: {str(e)}")

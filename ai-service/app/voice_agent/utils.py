import os
import uuid
import tempfile
import logging
from fastapi import UploadFile

logger = logging.getLogger(__name__)

# Use system temp directory for audio files
TEMP_DIR = os.path.join(tempfile.gettempdir(), "akashvaani_audio")
os.makedirs(TEMP_DIR, exist_ok=True)


async def save_temp_audio(upload_file: UploadFile) -> str:
    """
    Save an uploaded audio file to a temporary location.

    Args:
        upload_file: FastAPI UploadFile object

    Returns:
        str: Path to the saved temporary file
    """
    # Determine file extension from content type or filename
    ext = _get_extension(upload_file)
    filename = f"{uuid.uuid4().hex}{ext}"
    file_path = os.path.join(TEMP_DIR, filename)

    try:
        content = await upload_file.read()
        with open(file_path, "wb") as f:
            f.write(content)

        logger.info(f"Saved temp audio: {file_path} ({len(content)} bytes)")
        return file_path

    except Exception as e:
        logger.error(f"Failed to save temp audio: {e}")
        raise RuntimeError(f"Could not save audio file: {str(e)}")


def cleanup_temp_file(file_path: str):
    """Delete a temporary audio file after processing."""
    try:
        if file_path and os.path.exists(file_path):
            os.remove(file_path)
            logger.info(f"Cleaned up temp file: {file_path}")
    except Exception as e:
        logger.warning(f"Failed to clean up temp file {file_path}: {e}")


def _get_extension(upload_file: UploadFile) -> str:
    """Determine the file extension from content type or filename."""
    content_type = upload_file.content_type or ""
    
    type_map = {
        "audio/webm": ".webm",
        "audio/wav": ".wav",
        "audio/wave": ".wav",
        "audio/x-wav": ".wav",
        "audio/mp3": ".mp3",
        "audio/mpeg": ".mp3",
        "audio/ogg": ".ogg",
        "audio/mp4": ".m4a",
        "audio/x-m4a": ".m4a",
    }

    if content_type in type_map:
        return type_map[content_type]

    # Try to get from filename
    if upload_file.filename:
        _, ext = os.path.splitext(upload_file.filename)
        if ext:
            return ext

    # Default to webm (browser MediaRecorder default)
    return ".webm"

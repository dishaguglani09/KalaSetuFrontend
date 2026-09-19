import os
import tempfile
import shutil
import logging
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from services.speech import transcribe, SUPPORTED_LANGUAGES

logger = logging.getLogger("kalasetu-speech-api")
logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="KalaSetu Speech Service",
    description="Local Speech-to-Text service for KalaSetu powered by faster-whisper",
    version="1.0.0"
)

# Allow CORS so frontend or localhost can interact seamlessly
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {
        "status": "ok",
        "service": "KalaSetu Local Speech Service",
        "engine": "faster-whisper",
        "model": "small",
        "supported_languages": SUPPORTED_LANGUAGES
    }

@app.post("/api/speech/transcribe")
async def transcribe_audio(
    file: UploadFile = File(...),
    language: str = Form("hi")
):
    """
    Accepts an audio file and language code ('hi', 'en', 'pa').
    Transcribes the audio locally using faster-whisper and returns the transcript.
    Temporary files are strictly deleted after processing.
    """
    lang_code = language.strip().lower() if language else "hi"
    if lang_code not in SUPPORTED_LANGUAGES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported language '{language}'. Supported: {list(SUPPORTED_LANGUAGES.keys())}"
        )

    # Determine file suffix
    filename = file.filename or "audio.webm"
    _, ext = os.path.splitext(filename)
    if not ext:
        ext = ".webm"

    temp_path = None
    try:
        # Create temporary file to store the upload
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as temp_file:
            temp_path = temp_file.name
            shutil.copyfileobj(file.file, temp_file)

        logger.info(f"Received audio ({os.path.getsize(temp_path)} bytes) for transcription in '{lang_code}'")

        # Perform local transcription with faster-whisper
        result = transcribe(audio_path=temp_path, language=lang_code)
        return result

    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Transcription error: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Voice transcription failed: {str(e)}"
        )
    finally:
        # Guarantee removal of temporary file so recordings are not permanently stored
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except Exception as e:
                logger.warning(f"Failed to delete temp file {temp_path}: {e}")

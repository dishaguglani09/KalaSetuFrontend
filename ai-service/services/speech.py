import os
import _socket
import socket
import urllib.request
import json
import ssl
import logging
from faster_whisper import WhisperModel

logger = logging.getLogger("kalasetu-speech")
logging.basicConfig(level=logging.INFO)

# Resilient DNS fallback for local router timeouts
_doh_ctx = ssl.create_default_context()
_doh_ctx.check_hostname = False
_doh_ctx.verify_mode = ssl.CERT_NONE
_dns_cache = {}

def _resolve_ips(hostname: str) -> list[str]:
    if hostname in _dns_cache:
        return _dns_cache[hostname]
    try:
        url = f"https://8.8.8.8/resolve?name={hostname}&type=A"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=3.0, context=_doh_ctx) as resp:
            data = json.loads(resp.read().decode())
            answers = data.get("Answer", [])
            ips = [a["data"] for a in answers if a.get("type") == 1]
            if ips:
                _dns_cache[hostname] = ips
                return ips
    except Exception:
        pass
    return []

_real_getaddrinfo = _socket.getaddrinfo

def _custom_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    try:
        return _real_getaddrinfo(host, port, family, type, proto, flags)
    except (_socket.gaierror, OSError):
        if isinstance(host, str):
            ips = _resolve_ips(host)
            if ips:
                results = []
                for ip in ips:
                    try:
                        results.extend(_real_getaddrinfo(ip, port, family, type, proto, flags))
                    except Exception:
                        pass
                if results:
                    return results
        raise

_socket.getaddrinfo = _custom_getaddrinfo
socket.getaddrinfo = _custom_getaddrinfo

# Supported voice languages
SUPPORTED_LANGUAGES = {
    "hi": "Hindi",
    "en": "English",
    "pa": "Punjabi"
}

logger.info("Loading faster-whisper model (small, cpu, int8)...")
# Load model ONCE when the service starts
model = WhisperModel(
    "small",
    device="cpu",
    compute_type="int8"
)
logger.info("faster-whisper model loaded successfully and ready for inference.")

def transcribe(audio_path: str, language: str = "hi") -> dict:
    """
    Transcribe audio file using local faster-whisper.
    Accepts:
        audio_path: path to audio file on disk
        language: 'hi', 'en', or 'pa'
    Returns:
        dict: {"transcript": str, "language": str, "language_name": str}
    """
    lang_code = language.strip().lower() if language else "hi"
    if lang_code not in SUPPORTED_LANGUAGES:
        raise ValueError(
            f"Unsupported language '{language}'. Supported languages are: {', '.join(SUPPORTED_LANGUAGES.keys())}"
        )

    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    segments, info = model.transcribe(
        audio_path,
        language=lang_code,
        beam_size=5,
        vad_filter=True
    )

    transcript_parts = []
    for segment in segments:
        text = segment.text.strip()
        if text:
            transcript_parts.append(text)

    final_transcript = " ".join(transcript_parts).strip()

    return {
        "transcript": final_transcript,
        "language": lang_code,
        "language_name": SUPPORTED_LANGUAGES[lang_code]
    }

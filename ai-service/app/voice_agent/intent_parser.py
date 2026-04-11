import json
import re
import logging

logger = logging.getLogger(__name__)


def parse_llm_output(raw_output: str) -> dict:
    """
    Safely parse Gemini's response into a structured dict.
    Handles cases where Gemini wraps JSON in markdown code fences
    or returns plain text.

    Args:
        raw_output: Raw string from Gemini

    Returns:
        dict with keys: reply (str), intent (str), route (str|None)
    """
    if not raw_output:
        return {
            "reply": "I couldn't generate a response. Please try again.",
            "intent": "answer",
            "route": None,
            "response_language": "en"
        }

    # Step 1: Try direct JSON parse
    try:
        parsed = json.loads(raw_output)
        return _validate_parsed(parsed)
    except json.JSONDecodeError:
        pass

    # Step 2: Try to extract JSON from markdown code fences like ```json ... ```
    json_match = re.search(r'```(?:json)?\s*(\{.*?\})\s*```', raw_output, re.DOTALL)
    if json_match:
        try:
            parsed = json.loads(json_match.group(1))
            return _validate_parsed(parsed)
        except json.JSONDecodeError:
            pass

    # Step 3: Try to find any JSON object in the text
    json_match = re.search(r'\{[^{}]*"reply"[^{}]*\}', raw_output, re.DOTALL)
    if json_match:
        try:
            parsed = json.loads(json_match.group(0))
            return _validate_parsed(parsed)
        except json.JSONDecodeError:
            pass

    # Step 4: Fallback — treat entire output as the reply
    logger.warning(f"Could not parse Gemini output as JSON, using raw text as reply")
    return {
        "reply": raw_output.strip(),
        "intent": "answer",
        "route": None,
        "response_language": "en" # Fallback to English
    }


def _validate_parsed(parsed: dict) -> dict:
    """Ensure the parsed dict has all required keys with valid values."""
    valid_routes = {
        "/dashboard/schemes",
        "/dashboard/applications", 
        "/dashboard/documents",
        "/dashboard/profile",
        None
    }

    reply = parsed.get("reply", "")
    intent = parsed.get("intent", "answer")
    route = parsed.get("route", None)
    response_lang = parsed.get("response_language", "en")

    # Normalize intent
    if intent not in ("navigate", "answer"):
        intent = "answer"

    # Normalize route
    if route and route not in valid_routes:
        # Try to match partial routes
        if "scheme" in str(route).lower():
            route = "/dashboard/schemes"
            # preserve search param if present
            if "?" in str(parsed.get("route", "")):
                route = parsed.get("route")
        elif "application" in str(route).lower():
            route = "/dashboard/applications"
        elif "document" in str(route).lower():
            route = "/dashboard/documents"
        elif "profile" in str(route).lower():
            route = "/dashboard/profile"
        else:
            route = None

    # Normalise language
    if response_lang not in ("hi", "en"):
        response_lang = "en"

    return {
        "reply": reply,
        "intent": intent,
        "route": route,
        "response_language": response_lang
    }

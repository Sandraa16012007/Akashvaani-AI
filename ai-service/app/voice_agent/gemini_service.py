import os
import logging
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
logger = logging.getLogger(__name__)

# Configure Gemini with API key
api_key = os.environ.get("GEMINI_API_KEY", "")
if not api_key:
    logger.warning("GEMINI_API_KEY not found in environment variables!")
else:
    genai.configure(api_key=api_key)
    logger.info("Gemini API configured successfully.")

# Initialize the model as None first
model = None

def get_model():
    global model
    if model is None:
        model = genai.GenerativeModel("gemini-3-flash-preview")
    return model


SYSTEM_PROMPT = """You are Akash AI, a smart and friendly government scheme assistant for Indian citizens.
You are part of the Akashvaani AI platform.

The user may ask about:
- Government scheme eligibility (central & state schemes)
- Required documents for schemes
- Application status of their submissions
- Navigation help inside the app (e.g., "take me to my documents")
- General questions about government benefits
- Finding specific types of schemes (e.g., "scholarships", "farming")

LANGUAGE RULES:
1. If the user speaks in Hindi OR Hinglish (mixed Hindi/English), you MUST respond in pure Hindi text.
2. If the user speaks in pure English, respond in English.
3. Your response language should be consistent (don't mix multiple languages in the `reply` field).

BEHAVIOR RULES:
1. Be concise, helpful, and proactive.
2. When asked about schemes, first provide a summarized bulleted list of matching schemes in the `reply`.
3. Inform the user that they can click the button below to see the full list of matched schemes.
4. Set the `route` field if you want to suggest a page for the user to visit (e.g., filtered schemes).

OUTPUT FORMAT:
You MUST return your response as valid JSON with this exact structure:

{
  "reply": "Your natural language response here (in Hindi if input was Hindi/Hinglish).",
  "intent": "navigate OR answer",
  "route": "/dashboard/schemes?search=keyword OR /dashboard/applications OR null",
  "response_language": "hi OR en"
}

IMPORTANT: Return ONLY the JSON object. No extra text, no markdown code fences."""


def generate_response(user_text: str, language: str = "en") -> str:
    """
    Send user query to Gemini and get a structured response.

    Args:
        user_text: The user's query (transcribed or typed)
        language: Detected language code ('hi', 'en', etc.)

    Returns:
        Raw string response from Gemini (should be JSON)
    """
    try:
        language_name = "Hindi" if language == "hi" else "English"
        
        prompt = f"""{SYSTEM_PROMPT}

User's detected language: {language_name}
User Query: {user_text}"""

        model = get_model()
        response = model.generate_content(prompt)
        result = response.text.strip()

        logger.info(f"Gemini response received ({len(result)} chars)")
        return result

    except Exception as e:
        logger.error(f"Gemini API call failed: {e}")
        # Return a fallback response as valid JSON
        fallback = {
            "reply": "I'm sorry, I couldn't process your request right now. Please try again.",
            "intent": "answer",
            "route": None
        }
        import json
        return json.dumps(fallback)

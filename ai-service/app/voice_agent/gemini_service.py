import os
import logging
import asyncio
from dotenv import load_dotenv
import google.generativeai as genai
from app.db.supabase_client import fetch_schemes

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
        model = genai.GenerativeModel("gemini-2.5-flash")
    return model

SYSTEM_PROMPT_BASE = """You are Akash AI, a smart and friendly government scheme assistant for Indian citizens.
You are part of the Akashvaani AI platform.

THE CORE RULE:
- You ONLY know about and can ONLY recommend schemes from the "AVAILABLE SCHEMES FROM DATABASE" list provided below.
- If a user asks about a scheme NOT in that list, you MUST politely state that you only have information on specific documented schemes and offer to show them the full list.
- NEVER invent or hallucinate scheme names, benefits, or eligibility rules.

LANGUAGE RULES:
1. If the user speaks in Hindi OR Hinglish (mixed Hindi/English), you MUST respond in pure Hindi text.
2. If the user speaks in pure English, respond in English.
3. Your response language should be consistent (don't mix multiple languages in the `reply` field).

BEHAVIOR RULES:
1. Be concise, helpful, and proactive.
2. When a matching scheme is found, provide its name and a brief summary in the `reply`.
3. Inform the user they can click the button below to view the scheme details on the Schemes Page.
4. Set the `route` field for navigation: /dashboard/schemes?search=SchemeName (Use the exact name from the database list).

OUTPUT FORMAT:
Return ONLY a valid JSON object:

{
  "reply": "Your natural language response (Hindi if input was Hindi/Hinglish).",
  "intent": "navigate OR answer",
  "route": "/dashboard/schemes?search=ExactSchemeName OR null",
  "response_language": "hi OR en"
}"""

async def get_schemes_context():
    """Fetches schemes and formats them for the prompt context."""
    try:
        schemes = await fetch_schemes()
        if not schemes:
            return "No schemes currently available in the database."
        
        context = "AVAILABLE SCHEMES FROM DATABASE:\n"
        for s in schemes:
            context += f"- {s.get('scheme_name')} (Category: {s.get('state', 'Central')}): {s.get('description')[:150]}...\n"
        return context
    except Exception as e:
        logger.error(f"Error fetching schemes for context: {e}")
        return "Error fetching database schemes. Proceed with general knowledge but prioritize navigation to /dashboard/schemes."

async def generate_response(user_text: str, language: str = "en") -> str:
    """
    Send user query to Gemini and get a structured response.
    """
    try:
        # Fetch schemes context as needed
        schemes_context = await get_schemes_context()

        language_name = "Hindi/Hinglish" if language == "hi" else "English"
        
        full_system_prompt = f"{SYSTEM_PROMPT_BASE}\n\n{schemes_context}"
        
        prompt = f"""{full_system_prompt}

User's detected language: {language_name}
User Query: {user_text}"""

        model = get_model()
        response = model.generate_content(prompt)
        result = response.text.strip()

        # Pre-process JSON to ensure URL encoding in the route
        try:
            import json
            import urllib.parse
            data = json.loads(result)
            if data.get("route") and "?search=" in data["route"]:
                base, query = data["route"].split("?search=", 1)
                data["route"] = f"{base}?search={urllib.parse.quote(query)}"
                result = json.dumps(data)
        except Exception as pe:
            logger.warning(f"Could not post-process route encoding: {pe}")

        logger.info(f"Gemini response received ({len(result)} chars)")
        return result

    except Exception as e:
        logger.error(f"Gemini API call failed: {e}")
        import json
        fallback = {
            "reply": "I'm sorry, I couldn't process your request right now. Please try again.",
            "intent": "answer",
            "route": None,
            "response_language": "en"
        }
        return json.dumps(fallback)

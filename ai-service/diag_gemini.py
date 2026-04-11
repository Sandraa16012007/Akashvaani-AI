import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

key = os.environ.get("GEMINI_API_KEY")
print(f"Key found: {key[:5]}...{key[-5:] if key else ''}")

genai.configure(api_key=key)

try:
    # Try 1.5-flash as a fallback if 2.0-flash fails
    model = genai.GenerativeModel("gemini-3-flash-preview")
    response = model.generate_content("Hello, are you there?")
    print(f"Response (1.5-flash): {response.text}")
except Exception as e:
    print(f"Error (1.5-flash): {e}")

try:
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content("Hello, are you there?")
    print(f"Response (2.0-flash): {response.text}")
except Exception as e:
    print(f"Error (2.0-flash): {e}")

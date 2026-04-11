import asyncio
import os
import sys

# Add the current directory to path so it can find 'app'
sys.path.append(os.getcwd())

from app.voice_agent.gemini_service import generate_response

async def debug_ai():
    print("Testing generate_response...")
    try:
        # Test with a simple query
        result = await generate_response("Which schemes can I apply for?", "en")
        print("Result:")
        print(result)
    except Exception as e:
        print(f"CRITICAL FAILURE: {e}")

if __name__ == "__main__":
    asyncio.run(debug_ai())

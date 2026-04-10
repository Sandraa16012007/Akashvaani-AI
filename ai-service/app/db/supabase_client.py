import os
from dotenv import load_dotenv
from supabase import create_async_client, AsyncClient

load_dotenv()

url: str = os.environ.get("SUPABASE_URL", "")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")

# We initialize this client on demand or could manage it centrally.
# Using a function to ensure it's awaited properly if used within FastAPI.
async def get_supabase() -> AsyncClient:
    if not url or not key:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    return await create_async_client(url, key)

async def fetch_schemes():
    """Fetches all schemes from the database."""
    client = await get_supabase()
    response = await client.table("schemes").select("*").execute()
    return response.data

async def store_document_extraction(document_data: dict):
    """Stores extracted document data."""
    client = await get_supabase()
    response = await client.table("documents").insert(document_data).execute()
    return response.data

async def create_application(application_data: dict):
    """Creates a new draft application."""
    client = await get_supabase()
    response = await client.table("applications").insert(application_data).execute()
    return response.data

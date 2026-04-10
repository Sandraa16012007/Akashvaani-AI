from fastapi import FastAPI, HTTPException
from .db.supabase_client import (
    fetch_schemes,
    create_application,
    store_document_extraction
)

app = FastAPI(title="Akashvaani AI Service")

@app.get("/")
async def health_check():
    return {"status": "AI Service is running"}

@app.get("/schemes")
async def get_schemes():
    try:
        data = await fetch_schemes()
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/applications")
async def draft_application(app_data: dict):
    try:
        data = await create_application(app_data)
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/documents")
async def save_document(doc_data: dict):
    try:
        data = await store_document_extraction(doc_data)
        return {"data": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

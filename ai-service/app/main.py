from fastapi import FastAPI, HTTPException, UploadFile, File, Form
import uuid
from .db.supabase_client import (
    fetch_schemes,
    create_application,
    store_document_extraction,
    upload_document_to_storage
)
from .services.ocr_service import run_ocr_extraction

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

@app.post("/documents/upload")
async def upload_document(
    user_id: str = Form(...),
    document_type: str = Form("id_proof"),
    file: UploadFile = File(...)
):
    try:
        file_bytes = await file.read()
        
        # 1. Generate unique file name and upload to Supabase Storage
        ext = file.filename.split('.')[-1] if '.' in file.filename else 'pdf'
        unique_filename = f"{user_id}_{uuid.uuid4().hex[:8]}.{ext}"
        
        file_url = await upload_document_to_storage(
            unique_filename, 
            file_bytes, 
            file.content_type
        )
        
        # 2 & 3. Run mock OCR extraction
        extracted_data = await run_ocr_extraction(file_bytes, file.filename)
        
        # 4. Save extracted data into Supabase 'documents' table
        doc_record = {
            "user_id": user_id,
            "document_type": document_type,
            "file_url": file_url,
            "extracted_data": extracted_data
        }
        
        saved_data = await store_document_extraction(doc_record)
        
        # Return extracted citizen profile
        return extracted_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

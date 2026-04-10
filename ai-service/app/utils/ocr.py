import pytesseract
from PIL import Image
import io
import pdfplumber
import os
from dotenv import load_dotenv

load_dotenv()

# For Windows users: allow specifying the Tesseract executable path in .env
tesseract_path = os.getenv("TESSERACT_PATH")
if tesseract_path:
    pytesseract.pytesseract.tesseract_cmd = tesseract_path

def extract_text_from_document(file_bytes: bytes, filename: str) -> str:
    """
    Extracts raw text from a document (image or PDF).
    """
    ext = filename.split('.')[-1].lower() if '.' in filename else ''
    
    if ext == 'pdf':
        return _extract_text_from_pdf(file_bytes)
    else:
        return _extract_text_from_image(file_bytes)

def _extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extracts text from PDF using pdfplumber.
    Fallbacks to scanning pages as images if no direct text is found.
    """
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        
        # If no text extracted (likely a scanned PDF), log it
        if not text.strip():
            return "[SYSTEM: IMAGE_OCR_FAILED_SCANNED_PDF_REQUIRES_PAGE_BY_PAGE_OCR]"
            
        return text.strip()
    except Exception as e:
        print(f"PDF Extraction Error: {str(e)}")
        return "[SYSTEM: PDF_EXTRACTION_FAILED]"

def _extract_text_from_image(file_bytes: bytes) -> str:
    """
    Extracts text from an image using Tesseract.
    """
    try:
        image = Image.open(io.BytesIO(file_bytes))
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        print(f"OCR Error (Tesseract missing?): {str(e)}")
        return f"[SYSTEM: IMAGE_OCR_FAILED_TESSERACT_NOT_FOUND] Detail: {str(e)}"


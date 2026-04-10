from typing import Optional
import re
from pydantic import BaseModel, Field
from datetime import datetime

class CitizenProfile(BaseModel):
    name: str = Field(default="Unknown", description="Full name of the citizen")
    email: Optional[str] = Field(default=None, description="Email address of the citizen")
    age: Optional[int] = Field(default=None, description="Age of the citizen in years")
    gender: Optional[str] = Field(default=None, description="Gender of the citizen")
    state: Optional[str] = Field(default=None, description="State of residence (e.g., Uttar Pradesh, Maharashtra)")
    district: Optional[str] = Field(default=None, description="District of residence")
    occupation: Optional[str] = Field(default=None, description="Occupation of the citizen (e.g., Student, Farmer)")
    annual_income: Optional[float] = Field(default=None, description="Estimated annual income if mentioned")
    education: Optional[str] = Field(default=None, description="Highest education level (e.g., BTech, Graduate)")
    confidence_score: float = Field(default=0.0, description="Confidence score based on extraction")

def extract_citizen_profile(raw_text: str, image_bytes: Optional[bytes] = None) -> CitizenProfile:
    """
    Extracts structured citizen profile data using heuristic-based regex patterns
    from the raw Tesseract OCR text, removing the dependency on OpenAI.
    """
    # Normalize text for better matching
    clean_text = re.sub(r'\s+', ' ', raw_text)
    
    profile = CitizenProfile()
    
    # 1. Extraction: Gender
    if re.search(r"\bMale\b|\bMALE\b", clean_text, re.I):
        profile.gender = "Male"
    elif re.search(r"\bFemale\b|\bFEMALE\b", clean_text, re.I):
        profile.gender = "Female"

    # 1.5. Extraction: Email
    email_match = re.search(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}", clean_text)
    if email_match:
        profile.email = email_match.group(0).lower()

    # 2. Extraction: Age/DOB
    # Look for DOB patterns (DD/MM/YYYY or YYYY)
    dob_match = re.search(r"(\d{2}/\d{2}/\d{4})", clean_text)
    if dob_match:
        try:
            dob_str = dob_match.group(1)
            dob_year = int(dob_str.split('/')[-1])
            profile.age = datetime.now().year - dob_year
        except:
            pass
    else:
        # Look for "Year of Birth : YYYY" or similar
        yob_match = re.search(r"(?:Year of Birth|YOB)\s*[:\-]?\s*(\d{4})", clean_text, re.I)
        if yob_match:
            profile.age = datetime.now().year - int(yob_match.group(1))
        else:
            # Look for just 4-digit years that could be birth years (1950-2020)
            year_match = re.search(r"\b(19[5-9]\d|20[0-2]\d)\b", clean_text)
            if year_match:
                profile.age = datetime.now().year - int(year_match.group(1))

    # 3. Extraction: Name
    name_patterns = [
        r"(?:Name|Full Name|Nama)\s*[:\-]\s*([A-Z][A-Z\s]{2,})",
        r"([A-Z]{3,}\s[A-Z]{3,})", # Consecutive uppercase words
    ]
    for pattern in name_patterns:
        match = re.search(pattern, clean_text)
        if match:
            extracted_name = match.group(1).strip()
            # Basic validation: avoid common noise words
            if not any(word in extracted_name.upper() for word in ["GOVERNMENT", "INDIA", "AADHAAR", "ADDRESS"]):
                profile.name = extracted_name
                break
            
    # 4. Extraction: State
    indian_states = [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
        "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
        "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
        "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
        "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
        "Delhi", "Jammu Kashm", "Ladakh", "Puducherry", "Chandigarh"
    ]
    for state in indian_states:
        if state.lower() in clean_text.lower():
            profile.state = state
            break

    # 5. Extraction: District
    dist_match = re.search(r"(?:District|Dist|DISTRICT)\s*[:\-]?\s*([A-Z][A-Z\s]+)", clean_text, re.I)
    if dist_match:
        profile.district = dist_match.group(1).strip().split(' ')[0] # Take first word usually

    # 6. Extraction: Occupation
    if re.search(r"student|college|university|school|institute|degree|faculty", clean_text, re.I):
        profile.occupation = "Student"
    elif re.search(r"farmer|kisan|agriculture|crop|land", clean_text, re.I):
        profile.occupation = "Farmer"
    elif re.search(r"teacher|professor|lecturer", clean_text, re.I):
        profile.occupation = "Teacher"
    elif re.search(r"worker|labor|daily wage", clean_text, re.I):
        profile.occupation = "Worker"

    # 7. Extraction: Annual Income
    income_match = re.search(r"(?:Income|Annual Income|INR|Rs\.?)\s*[:\-]?\s*([\d,]+)", clean_text, re.I)
    if income_match:
        try:
            income_val = float(income_match.group(1).replace(',', ''))
            if income_val > 1000: # Simple gate for noise
                profile.annual_income = income_val
        except:
            pass

    # 8. Extraction: Education
    edu_patterns = [r"B\.?Tech", r"M\.?Tech", r"B\.?E", r"B\.?Sc", r"M\.?Sc", r"MBA", r"PhD", r"Graduate", r"Intermediate", r"Matric"]
    for edu in edu_patterns:
        if re.search(edu, clean_text, re.I):
            profile.education = edu.replace('\\', '')
            break

    # 9. Confidence Score
    fields_to_check = [profile.age, profile.gender, profile.state, profile.district, profile.occupation, profile.annual_income, profile.education, profile.email]
    filled_fields = sum(1 for v in fields_to_check if v is not None)
    if profile.name != "Unknown":
        filled_fields += 1
    
    profile.confidence_score = min(1.0, (filled_fields / 9.0) + 0.1) # Base bump for effort

    return profile


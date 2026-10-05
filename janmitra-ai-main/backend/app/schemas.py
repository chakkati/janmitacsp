from pydantic import BaseModel, Field
from typing import List, Optional, Any
from decimal import Decimal
from datetime import datetime

# --- PROFILE SCHEMAS ---
class ProfileBase(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    caste_category: Optional[str] = None # General, OBC, SC, ST, EBC
    occupation: Optional[str] = None # Student, Farmer, Job Seeker, etc.
    annual_income: Decimal = Field(default=0.00, max_digits=12, decimal_places=2)
    is_disabled: bool = False
    disability_percentage: int = 0
    is_farmer: bool = False
    marital_status: Optional[str] = None
    district: Optional[str] = None
    state: str = "Andhra Pradesh"

class ProfileCreate(ProfileBase):
    id: str # Matches auth.users.id from Supabase

class ProfileUpdate(ProfileBase):
    pass

class ProfileResponse(ProfileBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- DEPARTMENT & CATEGORY SCHEMAS ---
class DepartmentResponse(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None
    website: Optional[str] = None

    class Config:
        from_attributes = True

class CategoryResponse(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

# --- ELIGIBILITY RULE SCHEMAS ---
class EligibilityRuleResponse(BaseModel):
    id: str
    field_name: str
    operator: str
    rule_value: str
    error_message: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True

# --- DOCUMENT SCHEMAS ---
class DocumentResponse(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

# --- SCHEME SCHEMAS ---
class SchemeResponse(BaseModel):
    id: str
    name: str
    code: str
    description: str
    benefits_summary: str
    category: Optional[CategoryResponse] = None
    department: Optional[DepartmentResponse] = None
    official_website: Optional[str] = None
    helpline: Optional[str] = None
    district_availability: Optional[List[str]] = None
    pdf_source_url: Optional[str] = None
    last_updated: datetime
    rules: List[EligibilityRuleResponse] = []
    documents: List[DocumentResponse] = []

    class Config:
        from_attributes = True

# --- ELIGIBILITY RUN SCHEMAS ---
class RuleMatchStatus(BaseModel):
    field_name: str
    description: str
    passed: bool
    error_message: Optional[str] = None

class EligibilityCheckResult(BaseModel):
    scheme_id: str
    scheme_name: str
    eligible: bool
    benefits_summary: str
    rules_checked: List[RuleMatchStatus]
    required_documents: List[DocumentResponse]
    official_website: Optional[str] = None
    helpline: Optional[str] = None
    pdf_source_url: Optional[str] = None

# --- MOCK CHAT SCHEMAS ---
class ChatMessageCreate(BaseModel):
    content: str

class ChatMessageResponse(BaseModel):
    id: str
    role: str
    content: str
    sources: Optional[List[dict]] = None
    created_at: datetime

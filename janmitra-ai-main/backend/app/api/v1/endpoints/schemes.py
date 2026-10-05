from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Scheme, Profile
from app.schemas import SchemeResponse, EligibilityCheckResult
from app.services.rule_engine import evaluate_scheme_eligibility
from app.utils.auth import get_current_user_id

router = APIRouter()

@router.get("", response_model=List[SchemeResponse])
def list_schemes(db: Session = Depends(get_db)):
    """
    Returns all seeded government schemes.
    """
    schemes = db.query(Scheme).all()
    return schemes

@router.get("/{scheme_id}", response_model=SchemeResponse)
def get_scheme_by_id(scheme_id: str, db: Session = Depends(get_db)):
    """
    Returns detailed parameters of a specific government scheme.
    """
    scheme = db.query(Scheme).filter(Scheme.id == scheme_id).first()
    if not scheme:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheme not found"
        )
    return scheme

@router.get("/match/me", response_model=List[EligibilityCheckResult])
def match_my_eligibility(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Evaluates the currently logged-in user's profile against all seeded schemes
    using the programmatic Rule Engine.
    """
    # Fetch user profile
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User profile not found. Setup profile first."
        )
        
    schemes = db.query(Scheme).all()
    results = []
    
    for scheme in schemes:
        # Run Rule Engine evaluations
        eligible, rules_checked = evaluate_scheme_eligibility(profile, scheme.name, scheme.rules)
        
        results.append(EligibilityCheckResult(
            scheme_id=scheme.id,
            scheme_name=scheme.name,
            eligible=eligible,
            benefits_summary=scheme.benefits_summary,
            rules_checked=rules_checked,
            required_documents=scheme.documents,
            official_website=scheme.official_website,
            helpline=scheme.helpline,
            pdf_source_url=scheme.pdf_source_url
        ))
        
    return results

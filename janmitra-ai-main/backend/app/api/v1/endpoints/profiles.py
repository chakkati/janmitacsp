from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Profile
from app.schemas import ProfileUpdate, ProfileResponse
from app.utils.auth import get_current_user_id

router = APIRouter()

@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Retrieves the profile of the currently logged-in user.
    If the profile does not exist yet, it automatically creates a default onboarding one.
    """
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        # Auto-create profile for seamless onboarding
        profile = Profile(
            id=user_id,
            full_name="",
            phone_number="",
            age=18,
            gender="Male",
            caste_category="General",
            occupation="Other",
            annual_income=0.00,
            is_disabled=False,
            is_farmer=False,
            district="Visakhapatnam",
            state="Andhra Pradesh"
        )
        db.add(profile)
        db.commit()
        db.refresh(profile)
        
    return profile

@router.put("/me", response_model=ProfileResponse)
def update_my_profile(
    profile_data: ProfileUpdate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """
    Updates the profile parameters of the currently logged-in user.
    """
    profile = db.query(Profile).filter(Profile.id == user_id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
        
    # Update fields dynamically
    update_dict = profile_data.model_dump(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(profile, key, value)
        
    db.commit()
    db.refresh(profile)
    return profile

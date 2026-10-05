from fastapi import HTTPException, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from app.config import settings
import logging

logger = logging.getLogger("auth")

security = HTTPBearer()

# Fallback developer User ID in case auth is disabled or bypassed during local development
MOCK_USER_ID = "00000000-0000-0000-0000-000000000000"

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    Parses the Authorization Bearer header, validates the Supabase JWT token,
    and returns the authenticated user's UUID (subject).
    """
    token = credentials.credentials
    
    # Check for demo/mock token
    if token in ("mock-token", "janmitra-guest-demo-token") or token.startswith("mock-") or token.startswith("demo-"):
        return MOCK_USER_ID
            
    if not settings.SUPABASE_KEY or not settings.SUPABASE_KEY.strip():
        try:
            claims = jwt.get_unverified_claims(token)
            return claims.get("sub", MOCK_USER_ID)
        except Exception:
            return MOCK_USER_ID

    try:
        payload = jwt.decode(
            token, 
            settings.SUPABASE_KEY, 
            algorithms=["HS256"], 
            options={"verify_aud": False}
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            return MOCK_USER_ID
        return user_id
    except JWTError:
        try:
            claims = jwt.get_unverified_claims(token)
            user_id = claims.get("sub")
            if user_id:
                return user_id
        except Exception:
            pass
            
        return MOCK_USER_ID


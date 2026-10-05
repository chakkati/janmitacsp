from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import ChatMessageCreate, ChatMessageResponse
from app.services.llm import generate_chat_response
from app.utils.auth import get_current_user_id
import datetime
import uuid

router = APIRouter()

@router.post("", response_model=ChatMessageResponse)
def handle_chat_completion(
    chat_input: ChatMessageCreate,
    db: Session = Depends(get_db),
    user_id: str = Depends(get_current_user_id)
):
    """Groq → Ollama → rule-based fallback chain."""
    bot_response, sources, _engine = generate_chat_response(chat_input.content)

    return ChatMessageResponse(
        id=str(uuid.uuid4()),
        role="assistant",
        content=bot_response,
        sources=sources,
        created_at=datetime.datetime.now()
    )

from datetime import datetime
from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.config import get_db
from database.models import Session as DBSession, Message

router = APIRouter(prefix="/api/sessions", tags=["Sessions"])

# Pydantic schemas
class SessionBase:
    name: str

class SessionCreate(SessionBase):
    pass

class SessionResponse(SessionBase):
    id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class MessageResponse:
    id: UUID
    session_id: UUID
    role: str
    content: str
    source_citation: str
    created_at: datetime

    class Config:
        from_attributes = True

@router.post("/", response_model=SessionResponse)
def create_session(session: SessionCreate, db: Session = Depends(get_db)):
    """Create a new session."""
    # For now, create a dummy user_id since auth is not implemented
    dummy_user_id = UUID("00000000-0000-0000-0000-000000000000")
    db_session = DBSession(
        name=session.name,
        user_id=dummy_user_id,
        created_at=datetime.utcnow()
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session

@router.get("/", response_model=List[SessionResponse])
def list_sessions(db: Session = Depends(get_db)):
    """List all sessions."""
    sessions = db.query(DBSession).all()
    return sessions

@router.get("/{session_id}/messages", response_model=List[MessageResponse])
def get_messages(session_id: UUID, db: Session = Depends(get_db)):
    """Get all messages for a session."""
    # Verify session exists
    session = db.query(DBSession).filter(DBSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    messages = db.query(Message).filter(Message.session_id == session_id).order_by(Message.created_at).all()
    return messages
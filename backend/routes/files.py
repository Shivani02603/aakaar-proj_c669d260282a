from datetime import datetime
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from database.config import get_db
from database.models import UploadedFile as DBUploadedFile, Session as DBSession

router = APIRouter(prefix="/api/files", tags=["Files"])

# Pydantic schemas
class UploadedFileBase:
    session_id: UUID
    filename: str

class UploadedFileCreate(UploadedFileBase):
    pass

class UploadedFileResponse(UploadedFileBase):
    id: UUID
    uploaded_at: datetime

    class Config:
        from_attributes = True

@router.post("/upload", response_model=UploadedFileResponse)
async def upload_file(
    session_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload a file and associate it with a session."""
    # Verify session exists
    session = db.query(DBSession).filter(DBSession.id == session_id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Create uploaded file record
    db_file = DBUploadedFile(
        session_id=session_id,
        filename=file.filename,
        uploaded_at=datetime.utcnow()
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    
    # Here you would typically save the file to disk or cloud storage
    # For now, we just create the database record
    
    return db_file
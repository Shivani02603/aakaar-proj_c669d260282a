from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from typing import List, Optional
import uuid
from pydantic import BaseModel, Field
from datetime import datetime
import logging

from ai.ingest import ingest_excel_file
from ai.rag import answer_query

logger = logging.getLogger(__name__)

router = APIRouter(prefix='/api/ai', tags=['AI'])

# Request/Response Models
class IngestRequest(BaseModel):
    session_id: str = Field(..., description="ID of the chat session")
    user_id: str = Field(..., description="ID of the user")

class IngestResponse(BaseModel):
    file_id: str = Field(..., description="Unique ID assigned to the uploaded file")
    filename: str = Field(..., description="Original filename")
    sheets_processed: List[str] = Field(..., description="List of sheet names processed")
    chunk_count: int = Field(..., description="Number of chunks created and embedded")
    message: str = Field(..., description="Status message")

class QueryRequest(BaseModel):
    session_id: str = Field(..., description="ID of the chat session")
    user_id: str = Field(..., description="ID of the user")
    query: str = Field(..., description="Natural language question")
    top_k: Optional[int] = Field(default=5, description="Number of chunks to retrieve")

class SourceCitation(BaseModel):
    file_id: str = Field(..., description="ID of the source file")
    filename: str = Field(..., description="Name of the source file")
    sheet_name: str = Field(..., description="Excel sheet name")
    chunk_index: int = Field(..., description="Index of the chunk within the sheet")
    content_preview: str = Field(..., description="First 100 chars of chunk content")

class QueryResponse(BaseModel):
    answer: str = Field(..., description="Generated answer from Gemini")
    sources: List[SourceCitation] = Field(..., description="List of source chunks used")
    query_id: str = Field(..., description="Unique ID for this query/response pair")

@router.post("/ingest", response_model=IngestResponse)
async def ingest_file(
    session_id: str,
    user_id: str,
    file: UploadFile = File(...)
):
    """
    Upload an Excel file, parse sheets, chunk, embed, and store in pgvector.
    """
    if not file.filename.endswith('.xlsx'):
        raise HTTPException(status_code=400, detail="Only .xlsx files are supported")
    
    try:
        # Generate a unique file ID
        file_id = str(uuid.uuid4())
        
        # Call ingestion pipeline
        result = ingest_excel_file(
            file_id=file_id,
            filename=file.filename,
            file_content=await file.read(),
            session_id=session_id,
            user_id=user_id
        )
        
        return IngestResponse(
            file_id=file_id,
            filename=file.filename,
            sheets_processed=result["sheets_processed"],
            chunk_count=result["chunk_count"],
            message="File successfully ingested and embedded"
        )
    
    except Exception as e:
        logger.error(f"Ingestion failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")

@router.post("/query", response_model=QueryResponse)
async def query_rag(
    request: QueryRequest
):
    """
    Process a natural language query: embed, retrieve top-k chunks, generate answer with Gemini.
    """
    try:
        # Call RAG pipeline
        result = answer_query(
            session_id=request.session_id,
            user_id=request.user_id,
            query=request.query,
            top_k=request.top_k
        )
        
        # Format sources for response
        sources = []
        for src in result["sources"]:
            sources.append(SourceCitation(
                file_id=src["file_id"],
                filename=src["filename"],
                sheet_name=src["sheet_name"],
                chunk_index=src["chunk_index"],
                content_preview=src["content"][:100] + "..." if len(src["content"]) > 100 else src["content"]
            ))
        
        return QueryResponse(
            answer=result["answer"],
            sources=sources,
            query_id=str(uuid.uuid4())
        )
    
    except Exception as e:
        logger.error(f"Query failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")
import os
import pandas as pd
from typing import List, Dict, Any, Tuple
import uuid
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Lazy imports inside functions to avoid loading at module level
# We'll import the embedding function and vector store inside the functions that need them

def chunk_text(text: str, chunk_size: int = 1000, chunk_overlap: int = 200) -> List[str]:
    """
    Recursive chunking strategy for text.
    Splits text into chunks of specified size with overlap.
    """
    if not text or len(text.strip()) == 0:
        return []
    
    # Simple recursive character-based chunking (for simplicity)
    # In production, you might want token-based chunking
    chunks = []
    start = 0
    text_length = len(text)
    
    while start < text_length:
        end = start + chunk_size
        if end >= text_length:
            chunks.append(text[start:])
            break
        
        # Try to find a good break point (space, newline, period)
        break_point = end
        for i in range(end, max(start, end - 100), -1):
            if i < len(text) and text[i] in (' ', '\n', '.', ',', ';', '!', '?'):
                break_point = i + 1  # Include the break character
                break
        
        chunk = text[start:break_point]
        if chunk.strip():  # Only add non-empty chunks
            chunks.append(chunk)
        
        # Move start position with overlap
        start = break_point - chunk_overlap
        if start < 0:
            start = 0
    
    return chunks

def chunk_dataframe(df: pd.DataFrame, sheet_name: str) -> List[Dict[str, Any]]:
    """
    Convert DataFrame to text chunks with metadata.
    """
    chunks = []
    
    # Convert DataFrame to text representation
    # Include column names and sample rows
    text_representation = f"Sheet: {sheet_name}\n"
    text_representation += f"Columns: {', '.join(df.columns.tolist())}\n\n"
    
    # Add data rows
    for i, row in df.iterrows():
        row_text = f"Row {i}: "
        row_values = []
        for col in df.columns:
            value = row[col]
            if pd.isna(value):
                value = "N/A"
            row_values.append(f"{col}={value}")
        row_text += "; ".join(row_values)
        text_representation += row_text + "\n"
    
    # Chunk the text
    text_chunks = chunk_text(text_representation)
    
    # Create chunk objects with metadata
    for i, chunk_text_content in enumerate(text_chunks):
        chunk_obj = {
            "chunk_id": str(uuid.uuid4()),
            "chunk_index": i,
            "content": chunk_text_content,
            "sheet_name": sheet_name,
            "total_chunks": len(text_chunks),
            "row_range_start": 0,  # Simplified - in production you'd track actual row ranges
            "row_range_end": len(df) - 1
        }
        chunks.append(chunk_obj)
    
    return chunks

def ingest_excel(file_path: str, session_id: str, user_id: str) -> Dict[str, Any]:
    """
    Main ingestion function for Excel files.
    Reads Excel file, chunks each sheet, embeds chunks, and stores in vector database.
    """
    try:
        # Lazy imports to avoid loading at module level
        from .embeddings import get_embedding
        from .vector_store import VectorStore
        
        # Read Excel file
        logger.info(f"Reading Excel file: {file_path}")
        excel_file = pd.ExcelFile(file_path)
        
        all_chunks = []
        file_metadata = {
            "file_path": file_path,
            "file_name": os.path.basename(file_path),
            "file_size": os.path.getsize(file_path),
            "uploaded_at": datetime.utcnow().isoformat(),
            "user_id": user_id,
            "session_id": session_id,
            "total_sheets": len(excel_file.sheet_names)
        }
        
        # Process each sheet
        for sheet_name in excel_file.sheet_names:
            try:
                df = pd.read_excel(excel_file, sheet_name=sheet_name)
                logger.info(f"Processing sheet '{sheet_name}' with {len(df)} rows")
                
                # Chunk the sheet data
                sheet_chunks = chunk_dataframe(df, sheet_name)
                all_chunks.extend(sheet_chunks)
                
            except Exception as e:
                logger.error(f"Error processing sheet '{sheet_name}': {str(e)}")
                continue
        
        # Embed and store chunks
        logger.info(f"Embedding {len(all_chunks)} chunks")
        
        # Initialize vector store
        vector_store = VectorStore()
        
        # Process chunks in batches to avoid rate limits
        batch_size = 50
        for i in range(0, len(all_chunks), batch_size):
            batch = all_chunks[i:i + batch_size]
            
            # Get embeddings for batch
            texts = [chunk["content"] for chunk in batch]
            embeddings = get_embedding(texts)
            
            # Prepare records for vector store
            records = []
            for chunk, embedding in zip(batch, embeddings):
                record = {
                    "id": chunk["chunk_id"],
                    "embedding": embedding,
                    "metadata": {
                        "content": chunk["content"],
                        "sheet_name": chunk["sheet_name"],
                        "chunk_index": chunk["chunk_index"],
                        "total_chunks": chunk["total_chunks"],
                        "row_range_start": chunk["row_range_start"],
                        "row_range_end": chunk["row_range_end"],
                        "file_name": file_metadata["file_name"],
                        "file_path": file_metadata["file_path"],
                        "user_id": user_id,
                        "session_id": session_id,
                        "uploaded_at": file_metadata["uploaded_at"]
                    }
                }
                records.append(record)
            
            # Upsert to vector store
            vector_store.upsert(records)
            logger.info(f"Upserted batch {i//batch_size + 1}/{(len(all_chunks)-1)//batch_size + 1}")
        
        # Store file metadata in database
        # This would typically be done via a database service
        # For now, we'll just log it
        logger.info(f"File metadata: {file_metadata}")
        
        return {
            "success": True,
            "file_metadata": file_metadata,
            "total_chunks": len(all_chunks),
            "total_sheets": len(excel_file.sheet_names),
            "message": f"Successfully ingested {len(all_chunks)} chunks from {len(excel_file.sheet_names)} sheets"
        }
        
    except Exception as e:
        logger.error(f"Error ingesting Excel file: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": f"Failed to ingest Excel file: {str(e)}"
        }
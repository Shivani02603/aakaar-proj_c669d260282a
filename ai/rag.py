import os
import logging
from typing import List, Dict, Any, Optional
import google.generativeai as genai

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def retrieve_context(query: str, top_k: int = 5, session_id: Optional[str] = None, user_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Retrieve relevant context for a query using vector similarity search.
    """
    try:
        # Lazy imports to avoid loading at module level
        from .embeddings import get_embedding
        from .vector_store import VectorStore
        
        # Embed the query
        logger.info(f"Embedding query: {query[:50]}...")
        query_embedding = get_embedding([query])[0]
        
        # Initialize vector store
        vector_store = VectorStore()
        
        # Search for similar chunks
        # Apply filters for session_id and user_id if provided
        filters = {}
        if session_id:
            filters["session_id"] = session_id
        if user_id:
            filters["user_id"] = user_id
        
        logger.info(f"Searching vector store with filters: {filters}")
        results = vector_store.search(
            query_embedding=query_embedding,
            top_k=top_k,
            filters=filters
        )
        
        # Format results
        formatted_results = []
        for result in results:
            formatted_result = {
                "content": result.get("metadata", {}).get("content", ""),
                "score": result.get("score", 0.0),
                "metadata": {
                    "file_name": result.get("metadata", {}).get("file_name", "Unknown"),
                    "sheet_name": result.get("metadata", {}).get("sheet_name", "Unknown"),
                    "chunk_index": result.get("metadata", {}).get("chunk_index", 0),
                    "row_range_start": result.get("metadata", {}).get("row_range_start", 0),
                    "row_range_end": result.get("metadata", {}).get("row_range_end", 0),
                    "uploaded_at": result.get("metadata", {}).get("uploaded_at", "")
                }
            }
            formatted_results.append(formatted_result)
        
        logger.info(f"Retrieved {len(formatted_results)} context chunks")
        return formatted_results
        
    except Exception as e:
        logger.error(f"Error retrieving context: {str(e)}")
        return []

def build_prompt(query: str, context_chunks: List[Dict[str, Any]]) -> str:
    """
    Build a prompt for the LLM with retrieved context.
    """
    prompt = """You are a helpful data analyst assistant. Answer the user's question based ONLY on the provided context from Excel files. 
If the context doesn't contain relevant information, say "I cannot answer based on the provided data."

CONTEXT:
"""
    
    # Add context chunks with source citations
    for i, chunk in enumerate(context_chunks):
        metadata = chunk.get("metadata", {})
        prompt += f"\n[Source {i+1}: File: {metadata.get('file_name', 'Unknown')}, "
        prompt += f"Sheet: {metadata.get('sheet_name', 'Unknown')}, "
        prompt += f"Rows: {metadata.get('row_range_start', 0)}-{metadata.get('row_range_end', 0)}]\n"
        prompt += f"{chunk.get('content', '')}\n"
    
    prompt += f"\nQUESTION: {query}\n\n"
    prompt += "ANSWER (be concise, cite sources like [Source 1], [Source 2] when using specific information):"
    
    return prompt

def answer_question(query: str, session_id: str, user_id: str) -> Dict[str, Any]:
    """
    Main RAG function: retrieve context and generate answer using Gemini.
    """
    try:
        # Retrieve context
        context_chunks = retrieve_context(query, top_k=5, session_id=session_id, user_id=user_id)
        
        if not context_chunks:
            return {
                "answer": "I couldn't find any relevant data to answer your question. Please make sure you have uploaded Excel files and they contain relevant information.",
                "sources": [],
                "success": False
            }
        
        # Build prompt
        prompt = build_prompt(query, context_chunks)
        
        # Initialize Gemini client (lazy - inside function)
        # Read API key from environment variable
        gemini_api_key = os.environ.get("GEMINI_API_KEY")
        if not gemini_api_key:
            raise ValueError("GEMINI_API_KEY environment variable is not set")
        
        # Configure Gemini
        genai.configure(api_key=gemini_api_key)
        
        # Initialize model - using exactly gemini-2.0-flash as specified
        model = genai.GenerativeModel('gemini-2.0-flash')
        
        # Generate response
        logger.info("Generating response with Gemini")
        response = model.generate_content(prompt)
        
        # Extract answer text
        answer_text = response.text if hasattr(response, 'text') else str(response)
        
        # Prepare sources list
        sources = []
        for chunk in context_chunks:
            metadata = chunk.get("metadata", {})
            source_info = {
                "file_name": metadata.get("file_name", "Unknown"),
                "sheet_name": metadata.get("sheet_name", "Unknown"),
                "row_range": f"{metadata.get('row_range_start', 0)}-{metadata.get('row_range_end', 0)}",
                "relevance_score": chunk.get("score", 0.0),
                "content_preview": chunk.get("content", "")[:200] + "..." if len(chunk.get("content", "")) > 200 else chunk.get("content", "")
            }
            sources.append(source_info)
        
        return {
            "answer": answer_text,
            "sources": sources,
            "success": True,
            "query": query,
            "context_chunks_count": len(context_chunks)
        }
        
    except Exception as e:
        logger.error(f"Error answering question: {str(e)}")
        return {
            "answer": f"Sorry, I encountered an error while processing your question: {str(e)}",
            "sources": [],
            "success": False,
            "error": str(e)
        }
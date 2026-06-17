import os
from typing import List, Dict, Any, Optional
import psycopg2
from psycopg2.extras import Json
import numpy as np

class VectorStore:
    """PostgreSQL pgvector store for embeddings."""
    
    def __init__(self):
        self._connection = None
        self.dimension = 1536
    
    def _get_connection(self):
        """Lazily establish database connection."""
        if self._connection is None or self._connection.closed:
            db_url = os.getenv("DATABASE_URL")
            if not db_url:
                raise ValueError("DATABASE_URL environment variable not set")
            
            self._connection = psycopg2.connect(db_url)
            self._connection.autocommit = True
            
            # Ensure pgvector extension is available
            with self._connection.cursor() as cur:
                cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
                cur.execute(f"""
                    CREATE TABLE IF NOT EXISTS document_chunks (
                        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                        embedding vector({self.dimension}),
                        metadata JSONB,
                        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                # Create index for cosine similarity search
                cur.execute("""
                    CREATE INDEX IF NOT EXISTS embedding_cosine_idx 
                    ON document_chunks USING ivfflat (embedding vector_cosine_ops)
                """)
        
        return self._connection
    
    def upsert(self, id: str, vector: List[float], metadata: Dict[str, Any]) -> None:
        """
        Insert or update a vector with metadata.
        
        Args:
            id: Unique identifier for the chunk
            vector: Embedding vector (list of floats)
            metadata: Dictionary containing chunk metadata
        """
        conn = self._get_connection()
        
        # Ensure vector has correct dimension
        if len(vector) != self.dimension:
            raise ValueError(f"Vector dimension {len(vector)} does not match expected {self.dimension}")
        
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO document_chunks (id, embedding, metadata)
                VALUES (%s, %s, %s)
                ON CONFLICT (id) DO UPDATE SET
                    embedding = EXCLUDED.embedding,
                    metadata = EXCLUDED.metadata,
                    created_at = CURRENT_TIMESTAMP
            """, (id, vector, Json(metadata)))
    
    def search(self, query_embedding: List[float], top_k: int = 5, **filters) -> List[Dict[str, Any]]:
        """
        Search for similar vectors using cosine similarity.
        
        Args:
            query_embedding: Query embedding vector
            top_k: Number of results to return
            **filters: Optional metadata filters (not implemented in basic version)
            
        Returns:
            List of matches with id, metadata, and similarity score
        """
        conn = self._get_connection()
        
        if len(query_embedding) != self.dimension:
            raise ValueError(f"Query vector dimension {len(query_embedding)} does not match expected {self.dimension}")
        
        # Build WHERE clause for filters
        where_clauses = []
        params = [query_embedding, top_k]
        
        for key, value in filters.items():
            if isinstance(value, (list, tuple)):
                placeholders = ",".join(["%s"] * len(value))
                where_clauses.append(f"metadata->>'{key}' IN ({placeholders})")
                params.extend(value)
            else:
                where_clauses.append(f"metadata->>'{key}' = %s")
                params.append(value)
        
        where_sql = " AND ".join(where_clauses)
        if where_sql:
            where_sql = "WHERE " + where_sql
        
        with conn.cursor() as cur:
            cur.execute(f"""
                SELECT 
                    id,
                    metadata,
                    1 - (embedding <=> %s) as similarity
                FROM document_chunks
                {where_sql}
                ORDER BY embedding <=> %s
                LIMIT %s
            """, [query_embedding, query_embedding, top_k])
            
            results = cur.fetchall()
            
            matches = []
            for row in results:
                matches.append({
                    "id": row[0],
                    "metadata": row[1],
                    "similarity": float(row[2])  # Convert Decimal to float
                })
            
            return matches
    
    def close(self):
        """Close the database connection."""
        if self._connection and not self._connection.closed:
            self._connection.close()
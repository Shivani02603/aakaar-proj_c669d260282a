import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Types based on backend models
export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

export interface UserCreate {
  email: string;
  username: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface Session {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface SessionCreate {
  name: string;
}

export interface Message {
  id: string;
  session_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
}

export interface UploadedFile {
  id: string;
  session_id: string;
  filename: string;
  filepath: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface IngestRequest {
  session_id: string;
  file_ids: string[];
}

export interface IngestResponse {
  message: string;
  chunk_count: number;
}

export interface QueryRequest {
  session_id: string;
  query: string;
}

export interface SourceCitation {
  id: string;
  content: string;
  source: string;
  page?: number;
  similarity: number;
}

export interface QueryResponse {
  answer: string;
  citations: SourceCitation[];
}

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints (removed - not in contract)
// Sessions endpoints
export const createSession = async (data: SessionCreate): Promise<AxiosResponse<Session>> => {
  return api.post('/api/sessions', data);
};

export const listSessions = async (): Promise<AxiosResponse<Session[]>> => {
  return api.get('/api/sessions');
};

export const getSessionMessages = async (sessionId: string): Promise<AxiosResponse<Message[]>> => {
  return api.get(`/api/sessions/${sessionId}/messages`);
};

// Files endpoints
export const uploadFile = async (
  sessionId: string,
  file: File
): Promise<AxiosResponse<UploadedFile>> => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post(`/api/files/upload?session_id=${sessionId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// AI endpoints
export const ingestDocuments = async (data: IngestRequest): Promise<AxiosResponse<IngestResponse>> => {
  return api.post('/api/ai/ingest', data);
};

export const aiQuery = async (data: QueryRequest): Promise<AxiosResponse<QueryResponse>> => {
  return api.post('/api/ai/query', data);
};

// Users endpoints (removed - not in contract)
// Health check (removed - not in contract)

export default api;
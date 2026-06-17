import { Message, Session, UploadedFile } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

async function handleResponse(response: Response) {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }
  return response.json();
}

export async function createSession(sessionData: { name: string }): Promise<Session> {
  const response = await fetch(`${API_BASE}/api/sessions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(sessionData),
  });
  return handleResponse(response);
}

export async function listSessions(): Promise<Session[]> {
  const response = await fetch(`${API_BASE}/api/sessions`);
  return handleResponse(response);
}

export async function getMessages(sessionId: string): Promise<Message[]> {
  const response = await fetch(`${API_BASE}/api/sessions/${sessionId}/messages`);
  return handleResponse(response);
}

export async function uploadFile(sessionId: string, file: File): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE}/api/files/upload?session_id=${sessionId}`, {
    method: 'POST',
    body: formData,
  });
  return handleResponse(response);
}

export async function ingestDocuments(sessionId: string, fileIds: string[]): Promise<any> {
  const response = await fetch(`${API_BASE}/api/ai/ingest`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ session_id: sessionId, file_ids: fileIds }),
  });
  return handleResponse(response);
}

export async function aiQuery(sessionId: string, query: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/ai/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ session_id: sessionId, query }),
  });
  return handleResponse(response);
}
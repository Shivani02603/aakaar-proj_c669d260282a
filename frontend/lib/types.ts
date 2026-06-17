export interface Session {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface Message {
  id: string;
  session_id: string;
  content: string;
  role: 'user' | 'assistant';
  created_at: string;
  citations?: Citation[];
}

export interface Citation {
  id: string;
  document_id: string;
  content: string;
  page_number?: number;
  source: string;
}

export interface UploadedFile {
  id: string;
  filename: string;
  filepath: string;
  file_size: number;
  mime_type: string;
  session_id: string;
  uploaded_at: string;
}
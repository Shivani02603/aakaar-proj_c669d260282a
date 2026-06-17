'use client';

import { useState } from 'react';
import { Session } from '@/lib/types';
import { createSession, uploadFile, ingestDocuments } from '@/lib/api';

interface SidebarProps {
  sessions: Session[];
  selectedSession: Session | null;
  onSelectSession: (session: Session) => void;
  onSessionCreated: (session: Session) => void;
  onSessionDeleted: (sessionId: string) => void;
  loading: boolean;
}

export default function Sidebar({
  sessions,
  selectedSession,
  onSelectSession,
  onSessionCreated,
  onSessionDeleted,
  loading,
}: SidebarProps) {
  const [newSessionName, setNewSessionName] = useState('');
  const [uploading, setUploading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName.trim()) return;

    try {
      const session = await createSession({ name: newSessionName });
      onSessionCreated(session);
      setNewSessionName('');
    } catch (error) {
      console.error('Failed to create session:', error);
      alert('Failed to create session');
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !selectedSession) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        await uploadFile(selectedSession.id, file);
        setUploadedFiles(prev => [...prev, file]);
      }
      alert('Files uploaded successfully');
    } catch (error) {
      console.error('Failed to upload files:', error);
      alert('Failed to upload files');
    } finally {
      setUploading(false);
    }
  };

  const handleIngestDocuments = async () => {
    if (!selectedSession) return;

    setIngesting(true);
    try {
      // In a real app, you would get file IDs from uploaded files
      await ingestDocuments(selectedSession.id, []);
      alert('Documents ingested successfully');
    } catch (error) {
      console.error('Failed to ingest documents:', error);
      alert('Failed to ingest documents');
    } finally {
      setIngesting(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;

    try {
      // Note: There's no DELETE endpoint in the contract, so we'll just update UI
      // In a real app, you would call a DELETE endpoint here
      onSessionDeleted(sessionId);
    } catch (error) {
      console.error('Failed to delete session:', error);
      alert('Failed to delete session');
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Aakaar AI</h1>
        <p className="text-sm text-gray-500">AI-powered document analysis</p>
      </div>

      <div className="p-4 border-b border-gray-200">
        <form onSubmit={handleCreateSession} className="space-y-2">
          <input
            type="text"
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
            placeholder="New session name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !newSessionName.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Session
          </button>
        </form>
      </div>

      {selectedSession && (
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Upload Files</h3>
            <input
              type="file"
              multiple
              onChange={handleFileUpload}
              disabled={uploading || loading}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {uploading && (
              <p className="text-xs text-gray-500 mt-1">Uploading...</p>
            )}
          </div>

          <div>
            <button
              onClick={handleIngestDocuments}
              disabled={ingesting || loading || uploadedFiles.length === 0}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ingesting ? 'Ingesting...' : 'Ingest Documents'}
            </button>
            <p className="text-xs text-gray-500 mt-1">
              Process uploaded files for AI analysis
            </p>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-medium text-gray-700 mb-2">Sessions</h3>
          {loading ? (
            <p className="text-sm text-gray-500">Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-gray-500">No sessions yet</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-md cursor-pointer transition-colors ${
                    selectedSession?.id === session.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-gray-200'
                  }`}
                  onClick={() => onSelectSession(session)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 text-sm">
                        {session.name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(session.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p>Upload files and ask questions about their content.</p>
          <p className="mt-1">AI will provide answers with citations.</p>
        </div>
      </div>
    </div>
  );
}
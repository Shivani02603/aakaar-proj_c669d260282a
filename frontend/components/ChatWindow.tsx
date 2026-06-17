'use client';

import { useState, useRef, useEffect } from 'react';
import { Session, Message } from '@/lib/types';
import { aiQuery } from '@/lib/api';

interface ChatWindowProps {
  session: Session | null;
  messages: Message[];
  onNewMessage: (message: Message) => void;
  loading: boolean;
}

export default function ChatWindow({
  session,
  messages,
  onNewMessage,
  loading,
}: ChatWindowProps) {
  const [query, setQuery] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !session || sending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      session_id: session.id,
      content: query,
      role: 'user',
      created_at: new Date().toISOString(),
    };

    onNewMessage(userMessage);
    const currentQuery = query;
    setQuery('');
    setSending(true);

    try {
      const response = await aiQuery(session.id, currentQuery);
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        session_id: session.id,
        content: response.answer || 'No response from AI',
        role: 'assistant',
        created_at: new Date().toISOString(),
        citations: response.citations || [],
      };
      
      onNewMessage(aiMessage);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        session_id: session.id,
        content: 'Sorry, I encountered an error processing your request.',
        role: 'assistant',
        created_at: new Date().toISOString(),
      };
      
      onNewMessage(errorMessage);
    } finally {
      setSending(false);
    }
  };

  if (!session) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-700">No Session Selected</h3>
          <p className="text-gray-500 mt-1">Select a session or create a new one to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">{session.name}</h2>
            <p className="text-sm text-gray-500">
              Created {new Date(session.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {messages.length} messages
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-700">No messages yet</h3>
              <p className="text-gray-500 mt-1">Start a conversation by asking a question below</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                  
                  {message.citations && message.citations.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 border-opacity-20">
                      <p className="text-sm font-medium mb-2">Sources:</p>
                      <div className="space-y-2">
                        {message.citations.map((citation, index) => (
                          <div
                            key={index}
                            className="text-sm p-2 bg-white bg-opacity-10 rounded"
                          >
                            <p className="font-medium">{citation.source}</p>
                            <p className="mt-1 opacity-90">{citation.content}</p>
                            {citation.page_number && (
                              <p className="text-xs mt-1 opacity-75">
                                Page {citation.page_number}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs opacity-75 mt-2">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your documents..."
            disabled={sending || loading}
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || loading || !query.trim()}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Ask questions about your uploaded documents. AI will provide answers with citations.
        </p>
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';

interface FrontendItem {
  id: string;
  name: string;
  description: string;
  version: string;
  created_at: string;
  updated_at: string;
}

export default function FrontendPage() {
  const [items, setItems] = useState<FrontendItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      setError(null);
      // In a real app, this would be an API call
      // const response = await fetch('/api/frontend');
      // const data = await response.json();
      
      // Mock data for demonstration
      const mockData: FrontendItem[] = [
        {
          id: '1',
          name: 'Dashboard Component',
          description: 'Main dashboard with analytics',
          version: '1.0.0',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-20T14:45:00Z',
        },
        {
          id: '2',
          name: 'User Profile',
          description: 'User profile management',
          version: '2.1.0',
          created_at: '2024-01-10T09:15:00Z',
          updated_at: '2024-01-25T11:20:00Z',
        },
        {
          id: '3',
          name: 'Settings Panel',
          description: 'Application settings configuration',
          version: '1.5.0',
          created_at: '2024-01-05T13:45:00Z',
          updated_at: '2024-01-22T16:30:00Z',
        },
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      setItems(mockData);
    } catch (err) {
      setError('Failed to load frontend items');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      // In a real app, this would be an API call
      // await fetch(`/api/frontend/${id}`, { method: 'DELETE' });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setItems(items.filter(item => item.id !== id));
    } catch (err) {
      alert('Failed to delete item');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-500">Loading frontend items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Frontend Components</h1>
          <p className="text-gray-600 mt-2">Manage your frontend components and modules</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Version
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-600 max-w-xs">{item.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {item.version}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(item.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {items.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500">No frontend items found</p>
            </div>
          )}
        </div>

        <div className="mt-6">
          <a
            href="/frontend/new"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
          >
            Create New Frontend Item
          </a>
        </div>
      </div>
    </div>
  );
}
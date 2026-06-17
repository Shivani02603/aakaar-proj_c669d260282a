```typescript
'use client';

import { useState, useEffect } from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

interface StatCard {
  title: string;
  value: number;
  change: number;
  description: string;
}

interface RecentItem {
  id: string;
  name: string;
  type: string;
  date: string;
  status: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatCard[]>([
    { title: 'Session Management', value: 42, change: 12, description: 'Active sessions' },
    { title: 'Deployment', value: 8, change: 2, description: 'Running instances' },
    { title: 'Frontend', value: 95, change: 5, description: 'Performance score' },
    { title: 'Ingestion Pipeline', value: 1567, change: 234, description: 'Documents processed' },
  ]);

  const [recentItems, setRecentItems] = useState<RecentItem[]>([
    { id: '1', name: 'Q4 Financial Report', type: 'Session', date: '2024-01-15', status: 'Active' },
    { id: '2', name: 'User Analytics Dashboard', type: 'Deployment', date: '2024-01-14', status: 'Running' },
    { id: '3', name: 'Chat Interface Update', type: 'Frontend', date: '2024-01-13', status: 'Completed' },
    { id: '4', name: 'Product Specifications', type: 'Document', date: '2024-01-12', status: 'Processed' },
    { id: '5', name: 'Market Research Data', type: 'Session', date: '2024-01-11', status: 'Archived' },
  ]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data fetching
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'completed':
      case 'processed':
        return 'bg-blue-100 text-blue-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change: number) => {
    return change >= 0 ? '↑' : '↓';
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 p-8 ${inter.className}`}>
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-40"></div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-lg shadow">
              <div className="h-12 bg-gray-200 rounded-t-lg"></div>
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 border-b border-gray-200 p-4">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50 p-8 ${inter.className}`}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-700">{stat.title}</h3>
                <span className={`text-sm font-medium ${getChangeColor(stat.change)}`}>
                  {getChangeIcon(stat.change)} {Math.abs(stat.change)}%
                </span>
              </div>
              <div className="mb-2">
                <span className="text-3xl font-bold text-gray-900">{stat.value.toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-500">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Recent Items Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Recent Activity</h2>
            <p className="text-sm text-gray-500 mt-1">Latest items across all modules</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentItems.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                        View
                      </button>
                      <button className="text-gray-600 hover:text-gray-900">
                        More
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {recentItems.length} of {recentItems.length} items
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Previous
                </button>
                <button className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```
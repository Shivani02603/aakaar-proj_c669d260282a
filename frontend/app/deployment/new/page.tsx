'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewDeploymentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    environment: 'development',
    version: '',
    url: '',
    config: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.version.trim()) {
      newErrors.version = 'Version is required';
    } else if (!/^v\d+\.\d+\.\d+$/.test(formData.version)) {
      newErrors.version = 'Version must be in format v1.2.3';
    }

    if (!formData.url.trim()) {
      newErrors.url = 'URL is required';
    } else if (!/^https?:\/\/.+/.test(formData.url)) {
      newErrors.url = 'URL must start with http:// or https://';
    }

    if (!formData.config.trim()) {
      newErrors.config = 'Configuration is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      // In a real implementation, this would call your API
      // const response = await fetch('/api/deployments', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Deployment created successfully!');
      router.push('/deployment');
    } catch (err) {
      console.error('Failed to create deployment:', err);
      alert('Failed to create deployment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Create New Deployment</h1>
          <p className="text-gray-600 mt-2">Deploy a new version of your application</p>
        </div>

        <div className="bg-white shadow sm:rounded-lg">
          <form onSubmit={handleSubmit} className="space-y-6 p-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Deployment Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g., Production Deployment v1.2.3"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="environment" className="block text-sm font-medium text-gray-700">
                Environment *
              </label>
              <select
                id="environment"
                name="environment"
                value={formData.environment}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="development">Development</option>
                <option value="staging">Staging</option>
                <option value="production">Production</option>
              </select>
            </div>

            <div>
              <label htmlFor="version" className="block text-sm font-medium text-gray-700">
                Version *
              </label>
              <input
                type="text"
                id="version"
                name="version"
                value={formData.version}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.version ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g., v1.2.3"
              />
              {errors.version && (
                <p className="mt-1 text-sm text-red-600">{errors.version}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">Must follow semantic versioning (vX.Y.Z)</p>
            </div>

            <div>
              <label htmlFor="url" className="block text-sm font-medium text-gray-700">
                Application URL *
              </label>
              <input
                type="text"
                id="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.url ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                placeholder="e.g., https://app.example.com"
              />
              {errors.url && (
                <p className="mt-1 text-sm text-red-600">{errors.url}</p>
              )}
            </div>

            <div>
              <label htmlFor="config" className="block text-sm font-medium text-gray-700">
                Configuration (JSON) *
              </label>
              <textarea
                id="config"
                name="config"
                value={formData.config}
                onChange={handleChange}
                rows={6}
                className={`mt-1 block w-full px-3 py-2 border ${
                  errors.config ? 'border-red-300' : 'border-gray-300'
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 font-mono text-sm`}
                placeholder='{"key": "value", "database": {"host": "localhost", "port": 5432}}'
              />
              {errors.config && (
                <p className="mt-1 text-sm text-red-600">{errors.config}</p>
              )}
              <p className="mt-1 text-sm text-gray-500">Enter deployment configuration in JSON format</p>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/deployment')}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Deployment'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
'use client';
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Form } from '@/lib/api/types';
import { FormGrid } from '@/components/forms/FormGrid';
import { CreateFormDialog } from '@/components/forms/CreateFormDialog';
import { Button } from '@/components/ui/Button';

export default function FormsList() {
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchForms = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await api.get<Form[]>('/api/v1/forms');
      setForms(data);
    } catch (err: unknown) {
      const e = err as { message?: string };
      setError(e.message || 'Failed to load forms');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchForms();
  }, []);

  const handleCreateSuccess = (newForm: Form) => {
    setForms([newForm, ...forms]);
    setIsCreateModalOpen(false);
  };

  return (
    <main className="min-h-screen bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Workspace
          </h1>
          <Button onClick={() => setIsCreateModalOpen(true)} variant="primary">
            + Create Form
          </Button>
        </div>

        {/* Content States */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-xl h-[160px] animate-pulse p-5 flex flex-col justify-between">
                <div>
                  <div className="h-5 bg-gray-200 rounded w-16 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="flex justify-between mt-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white border border-red-100 rounded-xl p-8 text-center max-w-2xl mx-auto mt-12">
            <h3 className="text-lg font-medium text-red-800 mb-2">Failed to load workspace</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <Button onClick={fetchForms} variant="secondary">
              Try Again
            </Button>
          </div>
        ) : (
          <FormGrid forms={forms} onCreateClick={() => setIsCreateModalOpen(true)} />
        )}

      </div>

      <CreateFormDialog 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={handleCreateSuccess}
      />
    </main>
  );
}

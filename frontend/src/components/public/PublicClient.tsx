'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { PublicForm } from '@/lib/api/types';
import { QuestionRenderer } from '@/components/questions/QuestionRenderer';

export function PublicClient({ slug }: { slug: string }) {
  const [form, setForm] = useState<PublicForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadForm() {
      try {
        const data = await api.get(`/api/v1/public/forms/${slug}`);
        setForm(data as PublicForm);
      } catch (err: unknown) {
        const e = err as { status?: number, message?: string, data?: { detail?: string } };
        setErrorStatus(e.status || null);
        setErrorMessage(e.data?.detail || e.message || 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    loadForm();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (errorStatus === 404) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <h1 className="text-3xl font-medium text-gray-900 mb-4">Form unavailable</h1>
        <p className="text-lg text-gray-500 max-w-md">
          This form is currently not available. It may have been unpublished or deleted by its creator.
        </p>
      </div>
    );
  }

  if (errorMessage || !form) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <h1 className="text-3xl font-medium text-gray-900 mb-4">Error loading form</h1>
        <p className="text-lg text-red-500 max-w-md">
          {errorMessage || 'Failed to load form. Please check your connection and try again.'}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 md:py-24 animate-in fade-in duration-500">
      <div className="max-w-3xl w-full px-6 mb-16 text-center">
        <h1 className="text-3xl md:text-5xl font-medium text-gray-900 mb-6">{form.title}</h1>
        {form.description && (
          <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto">{form.description}</p>
        )}
      </div>
      
      <div className="max-w-3xl w-full space-y-16 pb-24">
        {form.questions.map((question, idx) => (
          <div key={question.id} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <QuestionRenderer question={question} index={idx} />
          </div>
        ))}
        {form.questions.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            No questions available.
          </div>
        )}
      </div>
    </div>
  );
}

'use client';
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Form } from '@/lib/api/types';
import { BuilderHeader } from '@/components/builder/BuilderHeader';
import { QuestionList } from '@/components/builder/QuestionList';
import { BuilderCanvas } from '@/components/builder/BuilderCanvas';
import { QuestionSettings } from '@/components/builder/QuestionSettings';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export function BuilderClient({ id }: { id: string }) {
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchForm = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.get<Form>(`/api/v1/forms/${id}`);
        if (mounted) {
          setForm(data);
          // Auto-select first question if exists
          if (data.questions && data.questions.length > 0) {
            setSelectedQuestionId(data.questions[0].id);
          }
        }
      } catch (err: unknown) {
        if (!mounted) return;
        const e = err as { status?: number, message?: string };
        if (e.status === 404) {
          setNotFound(true);
        } else {
          setError(e.message || 'Failed to load form');
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    fetchForm();
    return () => { mounted = false; };
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col">
        <svg className="animate-spin h-8 w-8 text-gray-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-500 font-medium">Loading builder...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col p-4 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Form not found</h1>
        <p className="text-gray-500 mb-6 max-w-md">The form you are looking for does not exist or you do not have access to it.</p>
        <Link href="/forms">
          <Button variant="primary">Return to workspace</Button>
        </Link>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col p-4 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-2">Error loading form</h1>
        <p className="text-gray-700 mb-6">{error || 'An unexpected error occurred.'}</p>
        <Link href="/forms">
          <Button variant="secondary">Return to workspace</Button>
        </Link>
      </div>
    );
  }

  const selectedQuestion = form.questions.find(q => q.id === selectedQuestionId) || null;
  const selectedIndex = selectedQuestion ? form.questions.findIndex(q => q.id === selectedQuestionId) : undefined;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      <BuilderHeader form={form} />
      
      <main className="flex flex-1 overflow-hidden">
        <QuestionList 
          questions={form.questions} 
          selectedId={selectedQuestionId} 
          onSelect={setSelectedQuestionId} 
        />
        
        <BuilderCanvas 
          question={selectedQuestion} 
          index={selectedIndex} 
        />
        
        <QuestionSettings 
          question={selectedQuestion} 
        />
      </main>
    </div>
  );
}

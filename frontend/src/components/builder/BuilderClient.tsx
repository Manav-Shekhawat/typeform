'use client';
import React, { useEffect, useState } from 'react';
import { api } from '@/lib/api/client';
import { Form } from '@/lib/api/types';
import { BuilderHeader } from '@/components/builder/BuilderHeader';
import { QuestionList } from '@/components/builder/QuestionList';
import { BuilderCanvas } from '@/components/builder/BuilderCanvas';
import { QuestionSettings } from '@/components/builder/QuestionSettings';
import { QuestionTypePicker } from '@/components/builder/QuestionTypePicker';
import { DeleteQuestionModal } from '@/components/builder/DeleteQuestionModal';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { QuestionType, Question } from '@/lib/api/types';
import { classNames } from '@/lib/utils/classNames';

export function BuilderClient({ id }: { id: string }) {
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  
  const [isTypePickerOpen, setIsTypePickerOpen] = useState(false);
  const [isCreatingQuestion, setIsCreatingQuestion] = useState(false);
  
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [isDeletingQuestion, setIsDeletingQuestion] = useState(false);
  
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const saveTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleCreateQuestion = async (type: QuestionType) => {
    if (!form) return;
    setIsCreatingQuestion(true);
    setActionError(null);
    setActionSuccess(null);
    
    const order_index = form.questions && form.questions.length > 0
      ? Math.max(...form.questions.map(q => q.order_index)) + 1
      : 0;
    
    let properties = {};
    if (type === QuestionType.MULTIPLE_CHOICE || type === QuestionType.DROPDOWN) {
      properties = { choices: ["Option 1", "Option 2"] };
    } else if (type === QuestionType.RATING) {
      properties = { steps: 5 };
    }
    
    try {
      const newQuestion = await api.post<Question>(`/api/v1/forms/${id}/questions`, {
        type,
        title: "Untitled question",
        description: null,
        is_required: false,
        order_index,
        properties
      });
      
      const updatedForm = { ...form, questions: [...(form.questions || []), newQuestion] };
      setForm(updatedForm);
      setSelectedQuestionId(newQuestion.id);
      setIsTypePickerOpen(false);
    } catch (err: unknown) {
      const e = err as { message?: string, data?: { detail?: string } };
      setActionError(e?.data?.detail || e.message || 'Failed to create question.');
    } finally {
      setIsCreatingQuestion(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!form || !questionToDelete) return;
    
    setIsDeletingQuestion(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      await api.delete(`/api/v1/forms/${id}/questions/${questionToDelete}`);
      
      const idx = form.questions.findIndex(q => q.id === questionToDelete);
      const newQuestions = form.questions.filter(q => q.id !== questionToDelete);
      
      let nextId = null;
      if (newQuestions.length > 0) {
        if (idx < newQuestions.length) {
          nextId = newQuestions[idx].id;
        } else {
          nextId = newQuestions[newQuestions.length - 1].id;
        }
      }
      
      setForm({ ...form, questions: newQuestions });
      setSelectedQuestionId(nextId);
      setQuestionToDelete(null);
      
      setActionSuccess("Question deleted");
      setTimeout(() => setActionSuccess(null), 3000);
      
    } catch (err: unknown) {
      const e = err as { status?: number, message?: string, data?: { detail?: string } };
      if (e.status === 404) {
        setActionError("Question no longer exists, reloading form...");
        setQuestionToDelete(null);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        setActionError(e?.data?.detail || e.message || "Could not delete question. Please try again.");
      }
    } finally {
      setIsDeletingQuestion(false);
    }
  };

  const handleUpdateQuestion = (updatedQuestion: Question) => {
    if (!form) return;
    
    const newQuestions = form.questions.map(q => 
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    setForm({ ...form, questions: newQuestions });

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaveStatus('saving');

    saveTimeoutRef.current = setTimeout(async () => {
      if (!updatedQuestion.title.trim()) {
        setSaveStatus('error');
        return;
      }
      
      if (updatedQuestion.type === QuestionType.NUMBER) {
        const props = updatedQuestion.properties as { min?: number, max?: number };
        if (props.min !== undefined && props.max !== undefined && props.min > props.max) {
           setSaveStatus('error');
           return;
        }
      }

      if (updatedQuestion.type === QuestionType.MULTIPLE_CHOICE || updatedQuestion.type === QuestionType.DROPDOWN) {
        const props = updatedQuestion.properties as { choices?: string[] };
        const choices = props.choices || [];
        if (choices.length === 0 || choices.some(c => !c.trim()) || new Set(choices).size !== choices.length) {
          setSaveStatus('error');
          return;
        }
      }

      try {
        await api.put(`/api/v1/forms/${id}/questions/${updatedQuestion.id}`, {
          title: updatedQuestion.title,
          description: updatedQuestion.description,
          is_required: updatedQuestion.is_required,
          properties: updatedQuestion.properties
        });
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err: unknown) {
        const e = err as { status?: number };
        if (e.status === 404) {
          alert('Question no longer exists, reloading form...');
          window.location.reload();
        } else {
          setSaveStatus('error');
        }
      }
    }, 500);
  };

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
          onAddQuestionClick={() => {
            setActionError(null);
            setActionSuccess(null);
            setIsTypePickerOpen(true);
          }}
        />
        
        <BuilderCanvas 
          question={selectedQuestion} 
          index={selectedIndex} 
        />
        
        <QuestionSettings 
          question={selectedQuestion} 
          onUpdate={handleUpdateQuestion}
          onDeleteRequest={setQuestionToDelete}
          saveStatus={saveStatus}
        />
      </main>

      <QuestionTypePicker
        isOpen={isTypePickerOpen}
        onClose={() => setIsTypePickerOpen(false)}
        onSelect={handleCreateQuestion}
        isLoading={isCreatingQuestion}
      />
      
      <DeleteQuestionModal
        isOpen={questionToDelete !== null}
        onClose={() => setQuestionToDelete(null)}
        onConfirm={handleDeleteQuestion}
        isDeleting={isDeletingQuestion}
      />

      {/* Action Toasts */}
      {(actionError || actionSuccess) && (
        <div className={classNames(
          "fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg border flex items-start z-50 max-w-sm",
          actionError ? "bg-red-50 border-red-200 text-red-800" : "bg-green-50 border-green-200 text-green-800"
        )}>
          {actionError ? (
            <svg className="w-5 h-5 mr-3 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 mr-3 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
          
          <div className="flex-1">
            <h4 className="text-sm font-medium">{actionError ? 'Error' : 'Success'}</h4>
            <p className={classNames(
              "text-sm mt-1",
              actionError ? "text-red-600" : "text-green-600"
            )}>{actionError || actionSuccess}</p>
          </div>
          
          <button 
            onClick={() => {
              setActionError(null);
              setActionSuccess(null);
            }} 
            className={classNames(
              "ml-3 transition-colors",
              actionError ? "text-red-500 hover:text-red-700" : "text-green-500 hover:text-green-700"
            )}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

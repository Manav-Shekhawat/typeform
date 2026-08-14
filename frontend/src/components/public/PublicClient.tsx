'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/api/client';
import { PublicForm } from '@/lib/api/types';
import { QuestionRenderer } from '@/components/questions/QuestionRenderer';

export function PublicClient({ slug }: { slug: string }) {
  const [form, setForm] = useState<PublicForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    async function loadForm() {
      try {
        const data = await api.get(`/api/v1/public/forms/${slug}`);
        setForm(data as PublicForm);
      } catch (err: unknown) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const e = err as any;
        setErrorStatus(e.status || null);
        
        let errorMsg = 'An unknown error occurred';
        const detail = e.data?.detail || e.message;
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail)) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          errorMsg = detail.map((d: any) => d.message || d.msg || String(d)).join(', ');
        } else if (detail && typeof detail === 'object') {
          errorMsg = detail.message || detail.msg || JSON.stringify(detail);
        }
        
        setErrorMessage(errorMsg);
      } finally {
        setLoading(false);
      }
    }
    
    loadForm();
  }, [slug]);

  const validateCurrent = useCallback(() => {
    if (!form || form.questions.length === 0) return true;
    const currentQ = form.questions[currentIndex];
    const val = answers[currentQ.id];
    
    if (currentQ.is_required) {
      if (val === undefined || val === null || val === '') {
        setInlineError('This question is required. Please provide an answer.');
        return false;
      }
      if (Array.isArray(val) && val.length === 0) {
        setInlineError('This question is required. Please provide an answer.');
        return false;
      }
    }

    if (currentQ.type === 'EMAIL' && val !== undefined && val !== null && val !== '') {
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      if (!emailRegex.test(String(val))) {
        setInlineError('Enter a valid email address.');
        return false;
      }
    }

    if (currentQ.type === 'NUMBER' && val !== undefined && val !== null && val !== '') {
      const num = Number(val);
      if (isNaN(num)) {
        setInlineError('Enter a valid number.');
        return false;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const props = (currentQ.properties || {}) as any;
      if (props.min !== undefined && num < props.min) {
        setInlineError(`Number must be greater than or equal to ${props.min}.`);
        return false;
      }
      if (props.max !== undefined && num > props.max) {
        setInlineError(`Number must be less than or equal to ${props.max}.`);
        return false;
      }
    }

    setInlineError(null);
    return true;
  }, [form, currentIndex, answers]);

  const handleNext = useCallback(() => {
    if (!validateCurrent()) return;
    if (form && currentIndex < form.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [validateCurrent, form, currentIndex]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setInlineError(null);
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrent()) return;
    setIsSubmitting(true);
    setInlineError(null);
    
    try {
      await api.post(`/api/v1/public/forms/${slug}/responses`, {
        answers: Object.entries(answers).map(([question_id, value]) => {
          const q = form?.questions.find(q => q.id === question_id);
          let normalizedValue = value;
          if (q?.type === 'NUMBER' && value !== undefined && value !== null && value !== '') {
            normalizedValue = Number(value);
          }
          return {
            question_id,
            value: normalizedValue
          };
        })
      });
      setIsSubmitted(true);
    } catch (err: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const e = err as any;
      let errorMsg = 'Submission failed. Please try again.';
      
      const detail = e.data?.detail || e.message;
      if (typeof detail === 'string') {
        errorMsg = detail;
      } else if (Array.isArray(detail)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        errorMsg = detail.map((d: any) => d.message || d.msg || String(d)).join(', ');
      } else if (detail && typeof detail === 'object') {
        errorMsg = detail.message || detail.msg || JSON.stringify(detail);
      }
      
      setInlineError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleAnswerChange = (questionId: string, val: any) => {
    setInlineError(null);
    setAnswers(prev => ({
      ...prev,
      [questionId]: val
    }));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleGlobalKey = () => {
      // Basic global keyboard nav can be handled here if needed,
      // but most is handled by the QuestionRenderer onEnter.
    };
    window.addEventListener('keydown', handleGlobalKey);
    return () => window.removeEventListener('keydown', handleGlobalKey);
  }, []);

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
          This form is no longer available.
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

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-3xl font-medium text-gray-900 mb-4">Thank you</h1>
        <p className="text-lg text-gray-500 max-w-md">
          {form.thank_you_message || 'Your response has been recorded.'}
        </p>
      </div>
    );
  }

  if (form.questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <h1 className="text-3xl font-medium text-gray-900 mb-4">{form.title}</h1>
        <p className="text-lg text-gray-500">This form has no questions.</p>
      </div>
    );
  }

  const currentQ = form.questions[currentIndex];
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === form.questions.length - 1;

  const onEnterAction = () => {
    if (isLast) {
      handleSubmit();
    } else {
      handleNext();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="max-w-3xl w-full px-6 mb-8 flex justify-between items-center text-gray-400 font-medium">
        <span>{form.title}</span>
        <span>{currentIndex + 1} of {form.questions.length}</span>
      </div>
      
      {/* Question Content */}
      <div className="max-w-3xl w-full flex-grow flex flex-col justify-center pb-24">
        <div key={currentQ.id} className="animate-in slide-in-from-bottom-8 fade-in duration-500">
          <QuestionRenderer 
            question={currentQ} 
            index={currentIndex}
            interactive={true}
            value={answers[currentQ.id]}
            onChange={(val) => handleAnswerChange(currentQ.id, val)}
            onEnter={onEnterAction}
            error={inlineError || undefined}
          />
        </div>

        {/* Navigation Actions */}
        <div className="px-6 flex items-center mt-8 ml-0 md:ml-12 space-x-4">
          {isLast ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-gray-900 text-white rounded-md text-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 focus:outline-none focus:ring-4 focus:ring-gray-200"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-8 py-3 bg-gray-900 text-white rounded-md text-lg font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-4 focus:ring-gray-200 flex items-center"
            >
              OK <span className="ml-2 text-sm opacity-70 border-l border-white/20 pl-2">press Enter ↵</span>
            </button>
          )}

          {!isFirst && (
            <button
              onClick={handlePrevious}
              disabled={isSubmitting}
              className="px-4 py-3 bg-white border border-gray-200 text-gray-600 rounded-md text-lg font-medium hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50 focus:outline-none"
              title="Previous question"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

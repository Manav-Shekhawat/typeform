import React from 'react';
import { Form } from '@/lib/api/types';
import { QuestionRenderer } from '@/components/questions/QuestionRenderer';
import { Button } from '@/components/ui/Button';

interface BuilderPreviewProps {
  form: Form;
  onClose: () => void;
}

export function BuilderPreview({ form, onClose }: BuilderPreviewProps) {
  return (
    <div className="fixed inset-0 bg-gray-50 z-50 flex flex-col overflow-hidden animate-in fade-in duration-200">
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-gray-100 text-gray-500 mr-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-900">Preview Mode</span>
        </div>
        
        <Button variant="secondary" onClick={onClose}>
          Back to builder
        </Button>
      </header>

      <main className="flex-1 overflow-y-auto w-full">
        <div className="max-w-3xl w-full mx-auto px-6 py-12 md:py-24">
          <div className="mb-16 text-center">
            <h1 className="text-3xl md:text-5xl font-medium text-gray-900 mb-6">{form.title}</h1>
            {form.description && (
              <p className="text-xl text-gray-500 font-light max-w-2xl mx-auto">{form.description}</p>
            )}
          </div>
          
          <div className="space-y-24">
            {form.questions.length === 0 ? (
              <div className="text-center text-gray-400 py-12 border-2 border-dashed border-gray-200 rounded-xl">
                No questions yet. Add some questions to preview them here.
              </div>
            ) : (
              form.questions.map((question, idx) => (
                <QuestionRenderer key={question.id} question={question} index={idx} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

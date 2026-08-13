import React from 'react';
import { Form } from '@/lib/api/types';
import { FormCard } from './FormCard';
import { Button } from '@/components/ui/Button';

interface FormGridProps {
  forms: Form[];
  onCreateClick: () => void;
}

export function FormGrid({ forms, onCreateClick }: FormGridProps) {
  if (forms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 bg-white border border-gray-200 border-dashed rounded-xl">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
        <p className="text-gray-500 mb-6 text-center max-w-sm">
          Get started by creating your first form. You can add questions, customize the design, and start collecting responses.
        </p>
        <Button onClick={onCreateClick} variant="primary">
          Create Form
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {forms.map((form) => (
        <FormCard key={form.id} form={form} />
      ))}
    </div>
  );
}

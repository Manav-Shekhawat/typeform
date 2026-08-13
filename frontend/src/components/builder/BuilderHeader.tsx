import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Form } from '@/lib/api/types';

interface BuilderHeaderProps {
  form: Form | null;
}

export function BuilderHeader({ form }: BuilderHeaderProps) {
  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 sticky top-0 z-10 shrink-0">
      <div className="flex items-center space-x-4 flex-1">
        <Link 
          href="/forms" 
          className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          aria-label="Back to workspace"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-sm font-medium text-gray-900 truncate max-w-[200px] sm:max-w-md">
          {form ? form.title : 'Loading...'}
        </h1>
      </div>
      
      <div className="flex items-center space-x-2 flex-1 justify-end">
        <Button variant="ghost" className="hidden sm:inline-flex" disabled>
          Preview
        </Button>
        <Button variant="primary" disabled>
          Publish
        </Button>
      </div>
    </header>
  );
}

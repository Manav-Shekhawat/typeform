import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Form } from '@/lib/api/types';

interface BuilderHeaderProps {
  form: Form | null;
  onPreview: () => void;
  onPublish: () => void;
  onUnpublish: () => void;
  isPublishing: boolean;
}

export function BuilderHeader({ form, onPreview, onPublish, onUnpublish, isPublishing }: BuilderHeaderProps) {
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
        <div className="flex items-center space-x-3">
          <h1 className="text-sm font-medium text-gray-900 truncate max-w-[200px] sm:max-w-md">
            {form ? form.title : 'Loading...'}
          </h1>
          {form && (
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${form.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {form.status === 'published' ? 'Published' : 'Draft'}
            </span>
          )}
        </div>
      </div>
      
      <div className="flex items-center space-x-2 flex-1 justify-end">
        {form && (
          <Link href={`/forms/${form.id}/results`} className="hidden sm:inline-flex">
            <Button variant="ghost">
              Results
            </Button>
          </Link>
        )}
        <Button variant="ghost" className="hidden sm:inline-flex" onClick={onPreview} disabled={!form}>
          Preview
        </Button>
        
        {form?.status === 'published' ? (
          <Button variant="secondary" onClick={onUnpublish} disabled={isPublishing}>
            {isPublishing ? 'Updating...' : 'Unpublish'}
          </Button>
        ) : (
          <Button variant="primary" onClick={onPublish} disabled={!form || isPublishing}>
            {isPublishing ? 'Publishing...' : 'Publish'}
          </Button>
        )}
      </div>
    </header>
  );
}

import React from 'react';
import Link from 'next/link';
import { Form } from '@/lib/api/types';
import { formatDate } from '@/lib/utils/formatDate';

interface FormCardProps {
  form: Form;
}

export function FormCard({ form }: FormCardProps) {
  const isPublished = form.status === 'published';

  return (
    <Link 
      href={`/forms/${form.id}/builder`}
      className="group flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md hover:border-gray-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
    >
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <span 
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              isPublished 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {isPublished ? 'Published' : 'Draft'}
          </span>
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 group-hover:text-black mb-1">
          {form.title}
        </h3>
        {form.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
            {form.description}
          </p>
        )}
      </div>
      
      <div className="px-5 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-1">
          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span>{form.response_count} {form.response_count === 1 ? 'response' : 'responses'}</span>
        </div>
        <span>
          {formatDate(form.updated_at)}
        </span>
      </div>
    </Link>
  );
}

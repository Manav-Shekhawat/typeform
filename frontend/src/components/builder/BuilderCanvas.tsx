import React from 'react';
import { Question } from '@/lib/api/types';
import { QuestionRenderer } from '@/components/questions/QuestionRenderer';

interface BuilderCanvasProps {
  question: Question | null;
  index: number | undefined;
}

export function BuilderCanvas({ question, index }: BuilderCanvasProps) {
  if (!question) {
    return (
      <div className="flex-1 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-gray-400 border border-gray-100">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Canvas</h3>
          <p className="text-gray-500 text-sm">Select a question to preview it here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto relative flex items-center justify-center">
      <QuestionRenderer question={question} index={index} />
    </div>
  );
}

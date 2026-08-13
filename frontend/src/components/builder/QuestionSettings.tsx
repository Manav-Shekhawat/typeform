import React from 'react';
import { Question } from '@/lib/api/types';

interface QuestionSettingsProps {
  question: Question | null;
}

export function QuestionSettings({ question }: QuestionSettingsProps) {
  if (!question) {
    return (
      <div className="w-80 border-l border-gray-200 bg-white p-6 shrink-0 overflow-y-auto hidden lg:block">
        <div className="text-sm text-gray-400 text-center mt-10">
          Select a question to edit its settings
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 border-l border-gray-200 bg-white p-6 shrink-0 overflow-y-auto hidden lg:block">
      <h2 className="text-base font-semibold text-gray-900 mb-6">Settings</h2>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Type
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600 capitalize">
            {question.type.replace('_', ' ').toLowerCase()}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reference ID
          </label>
          <div className="text-xs text-gray-400 font-mono break-all bg-gray-50 p-2 rounded">
            {question.id}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <label className="flex items-center space-x-3 cursor-not-allowed opacity-60">
            <input 
              type="checkbox" 
              checked={question.is_required}
              readOnly
              className="h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900 cursor-not-allowed"
            />
            <span className="text-sm font-medium text-gray-900">Required</span>
          </label>
          <p className="text-xs text-gray-500 mt-1 ml-7">
            Prevent submission until answered
          </p>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <div className="text-xs text-gray-500 text-center italic bg-yellow-50 p-3 rounded text-yellow-800 border border-yellow-100">
            Settings persistence will be implemented in a future phase.
          </div>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Question } from '@/lib/api/types';

interface QuestionBasicSettingsProps {
  question: Question;
  onChange: (updates: Partial<Question>) => void;
}

export function QuestionBasicSettings({ question, onChange }: QuestionBasicSettingsProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Title
        </label>
        <input
          type="text"
          value={question.title}
          onChange={(e) => onChange({ title: e.target.value })}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          placeholder="Question title"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={question.description || ''}
          onChange={(e) => onChange({ description: e.target.value || undefined })}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
          placeholder="Optional description"
          rows={3}
        />
      </div>

      <div className="pt-2">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input 
            type="checkbox" 
            checked={question.is_required}
            onChange={(e) => onChange({ is_required: e.target.checked })}
            className="h-4 w-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
          />
          <span className="text-sm font-medium text-gray-900">Required</span>
        </label>
        <p className="text-xs text-gray-500 mt-1 ml-7">
          Prevent submission until answered
        </p>
      </div>
    </div>
  );
}

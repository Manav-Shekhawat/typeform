import React from 'react';
import { Question, QuestionType } from '@/lib/api/types';
import { QuestionBasicSettings } from './settings/QuestionBasicSettings';
import { QuestionOptionsEditor } from './settings/QuestionOptionsEditor';
import { QuestionNumberSettings } from './settings/QuestionNumberSettings';
import { QuestionRatingSettings } from './settings/QuestionRatingSettings';

interface QuestionSettingsProps {
  question: Question | null;
  onUpdate: (updatedQuestion: Question) => void;
  onDeleteRequest: (questionId: string) => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

export function QuestionSettings({ question, onUpdate, onDeleteRequest, saveStatus }: QuestionSettingsProps) {
  if (!question) {
    return (
      <div className="w-80 border-l border-gray-200 bg-white p-6 shrink-0 overflow-y-auto hidden lg:block">
        <div className="text-sm text-gray-400 text-center mt-10">
          Select a question to edit its settings
        </div>
      </div>
    );
  }

  const handleChange = (updates: Partial<Question>) => {
    onUpdate({ ...question, ...updates });
  };

  return (
    <div className="w-80 border-l border-gray-200 bg-white p-6 shrink-0 overflow-y-auto hidden lg:block relative">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-gray-900">Settings</h2>
        <div className="text-xs font-medium">
          {saveStatus === 'saving' && <span className="text-gray-500">Saving...</span>}
          {saveStatus === 'saved' && <span className="text-green-600">Saved</span>}
          {saveStatus === 'error' && <span className="text-red-600">Save failed</span>}
        </div>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Type
          </label>
          <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600 capitalize cursor-not-allowed">
            {question.type.replace('_', ' ').toLowerCase()}
          </div>
        </div>

        <QuestionBasicSettings question={question} onChange={handleChange} />

        {(question.type === QuestionType.MULTIPLE_CHOICE || question.type === QuestionType.DROPDOWN) && (
          <QuestionOptionsEditor question={question} onChange={handleChange} />
        )}

        {question.type === QuestionType.NUMBER && (
          <QuestionNumberSettings question={question} onChange={handleChange} />
        )}

        {question.type === QuestionType.RATING && (
          <QuestionRatingSettings question={question} onChange={handleChange} />
        )}
        
        <div className="pt-8 pb-4">
          <button
            onClick={() => onDeleteRequest(question.id)}
            className="w-full flex items-center justify-center py-2 px-4 border border-red-200 text-red-600 rounded-md text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Question
          </button>
        </div>
      </div>
    </div>
  );
}

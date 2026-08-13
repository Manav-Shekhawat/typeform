import React from 'react';
import { Question, QuestionType } from '@/lib/api/types';
import { QuestionBasicSettings } from './settings/QuestionBasicSettings';
import { QuestionOptionsEditor } from './settings/QuestionOptionsEditor';
import { QuestionNumberSettings } from './settings/QuestionNumberSettings';
import { QuestionRatingSettings } from './settings/QuestionRatingSettings';

interface QuestionSettingsProps {
  question: Question | null;
  onUpdate: (updatedQuestion: Question) => void;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

export function QuestionSettings({ question, onUpdate, saveStatus }: QuestionSettingsProps) {
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
      </div>
    </div>
  );
}

import React from 'react';
import { Question } from '@/lib/api/types';

interface QuestionOptionsEditorProps {
  question: Question;
  onChange: (updates: Partial<Question>) => void;
}

export function QuestionOptionsEditor({ question, onChange }: QuestionOptionsEditorProps) {
  const properties = (question.properties as { choices?: string[] }) || {};
  const choices = properties.choices || ["Option 1"];

  const handleChoiceChange = (index: number, value: string) => {
    const newChoices = [...choices];
    newChoices[index] = value;
    onChange({ properties: { ...properties, choices: newChoices } });
  };

  const handleAddChoice = () => {
    const newChoices = [...choices, `Option ${choices.length + 1}`];
    onChange({ properties: { ...properties, choices: newChoices } });
  };

  const handleDeleteChoice = (index: number) => {
    if (choices.length <= 1) return; // backend requires at least one
    const newChoices = choices.filter((_, i) => i !== index);
    onChange({ properties: { ...properties, choices: newChoices } });
  };

  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <label className="block text-sm font-medium text-gray-700">Options</label>
      <div className="space-y-2">
        {choices.map((choice, idx) => (
          <div key={idx} className="flex items-center space-x-2">
            <input
              type="text"
              value={choice}
              onChange={(e) => handleChoiceChange(idx, e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder={`Option ${idx + 1}`}
            />
            <button
              onClick={() => handleDeleteChoice(idx)}
              disabled={choices.length <= 1}
              className="p-1.5 text-gray-400 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={handleAddChoice}
        className="text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors"
      >
        + Add option
      </button>
    </div>
  );
}

import React from 'react';
import { Question } from '@/lib/api/types';

interface QuestionRatingSettingsProps {
  question: Question;
  onChange: (updates: Partial<Question>) => void;
}

export function QuestionRatingSettings({ question, onChange }: QuestionRatingSettingsProps) {
  const properties = (question.properties as { steps?: number }) || {};
  const steps = properties.steps ?? 5;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = parseInt(e.target.value, 10);
    onChange({ properties: { ...properties, steps: val } });
  };

  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <label className="block text-sm font-medium text-gray-700 mb-1">Rating Steps</label>
      <select
        value={steps}
        onChange={handleChange}
        className="w-full bg-white border border-gray-300 text-gray-900 py-2 px-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
      >
        {[3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
          <option key={num} value={num}>
            {num} steps
          </option>
        ))}
      </select>
    </div>
  );
}

import React from 'react';
import { Question } from '@/lib/api/types';

interface QuestionNumberSettingsProps {
  question: Question;
  onChange: (updates: Partial<Question>) => void;
}

export function QuestionNumberSettings({ question, onChange }: QuestionNumberSettingsProps) {
  const properties = (question.properties as { min?: number; max?: number }) || {};

  const handleMinChange = (value: string) => {
    const num = value === '' ? undefined : Number(value);
    onChange({ properties: { ...properties, min: num } });
  };

  const handleMaxChange = (value: string) => {
    const num = value === '' ? undefined : Number(value);
    onChange({ properties: { ...properties, max: num } });
  };

  return (
    <div className="space-y-4 pt-4 border-t border-gray-100">
      <label className="block text-sm font-medium text-gray-700">Number Bounds (Optional)</label>
      
      <div className="flex items-center space-x-3">
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Minimum</label>
          <input
            type="number"
            value={properties.min ?? ''}
            onChange={(e) => handleMinChange(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="No min"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs text-gray-500 mb-1">Maximum</label>
          <input
            type="number"
            value={properties.max ?? ''}
            onChange={(e) => handleMaxChange(e.target.value)}
            className="w-full px-3 py-1.5 bg-white border border-gray-300 rounded-md text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
            placeholder="No max"
          />
        </div>
      </div>
      {properties.min !== undefined && properties.max !== undefined && properties.min > properties.max && (
        <p className="text-xs text-red-600">Minimum cannot be greater than Maximum.</p>
      )}
    </div>
  );
}

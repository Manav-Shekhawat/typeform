import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { QuestionType } from '@/lib/api/types';
import { classNames } from '@/lib/utils/classNames';

interface QuestionTypePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: QuestionType) => void;
  isLoading: boolean;
}

const QUESTION_TYPES = [
  { id: QuestionType.SHORT_TEXT, label: 'Short text', icon: 'M4 6h16M4 12h8' },
  { id: QuestionType.LONG_TEXT, label: 'Long text', icon: 'M4 6h16M4 12h16M4 18h12' },
  { id: QuestionType.EMAIL, label: 'Email', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: QuestionType.NUMBER, label: 'Number', icon: 'M7 20l4-16m2 16l4-16M6 9h14M4 15h14' },
  { id: QuestionType.YES_NO, label: 'Yes / No', icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
  { id: QuestionType.MULTIPLE_CHOICE, label: 'Multiple choice', icon: 'M4 6h16M4 12h16M4 18h16M8 6a2 2 0 11-4 0 2 2 0 014 0zM8 12a2 2 0 11-4 0 2 2 0 014 0zM8 18a2 2 0 11-4 0 2 2 0 014 0z' },
  { id: QuestionType.DROPDOWN, label: 'Dropdown', icon: 'M19 9l-7 7-7-7' },
  { id: QuestionType.RATING, label: 'Rating', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
];

export function QuestionTypePicker({ isOpen, onClose, onSelect, isLoading }: QuestionTypePickerProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Choose question type">
      <div className="mt-4 max-h-[60vh] overflow-y-auto">
        <div className="grid grid-cols-2 sm:grid-cols-2 gap-3 pb-2">
          {QUESTION_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              disabled={isLoading}
              className={classNames(
                "flex items-center text-left p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-900 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded bg-gray-100 text-gray-600 mr-3 shrink-0">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={type.icon} />
                </svg>
              </div>
              <span className="font-medium text-gray-900 text-sm">{type.label}</span>
            </button>
          ))}
        </div>
        
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center rounded-lg backdrop-blur-[1px]">
            <svg className="animate-spin h-6 w-6 text-gray-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}
      </div>
    </Modal>
  );
}

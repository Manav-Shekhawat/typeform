import React from 'react';
import { Question } from '@/lib/api/types';
import { classNames } from '@/lib/utils/classNames';

interface QuestionListItemProps {
  question: Question;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

export function QuestionListItem({ question, index, isSelected, onClick }: QuestionListItemProps) {
  return (
    <button
      onClick={onClick}
      className={classNames(
        "w-full text-left flex items-start px-3 py-2.5 rounded-lg text-sm transition-colors mb-1 group outline-none focus-visible:ring-2 focus-visible:ring-gray-900 focus-visible:ring-offset-1",
        isSelected 
          ? "bg-blue-50 text-blue-900" 
          : "hover:bg-gray-100 text-gray-700"
      )}
    >
      <div className="flex items-center justify-center w-6 h-6 shrink-0 bg-white border border-gray-200 rounded text-xs font-medium text-gray-500 mr-3 mt-0.5 group-hover:border-gray-300">
        {index + 1}
      </div>
      <div className="flex-1 min-w-0">
        <div className={classNames(
          "truncate font-medium",
          isSelected ? "text-blue-900" : "text-gray-900"
        )}>
          {question.title || "Untitled Question"}
        </div>
        <div className="text-xs text-gray-500 truncate mt-0.5">
          {question.type.replace('_', ' ').toLowerCase()}
        </div>
      </div>
    </button>
  );
}

import React from 'react';
import { Question } from '@/lib/api/types';
import { classNames } from '@/lib/utils/classNames';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface QuestionListItemProps {
  question: Question;
  index: number;
  isSelected: boolean;
  onClick: () => void;
}

export function QuestionListItem({ question, index, isSelected, onClick }: QuestionListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={classNames(
        "group flex items-center p-2 rounded-md cursor-pointer transition-colors relative",
        isSelected 
          ? "bg-blue-50 text-blue-900 shadow-sm border border-blue-200" 
          : "hover:bg-gray-50 text-gray-700 border border-transparent"
      )}
      onClick={onClick}
    >
      <div 
        {...attributes} 
        {...listeners}
        className={classNames(
          "w-6 h-6 flex items-center justify-center cursor-grab active:cursor-grabbing text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity",
          isSelected && "opacity-100 text-blue-500"
        )}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      <div className={classNames(
        "flex items-center justify-center w-5 h-5 rounded-sm mr-3 text-xs font-medium shrink-0 ml-1",
        isSelected ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500 group-hover:bg-gray-200"
      )}>
        {index + 1}
      </div>
      
      <div className={classNames(
        "w-5 h-5 flex items-center justify-center mr-2 shrink-0",
        isSelected ? "text-blue-500" : "text-gray-400"
      )}>
        {getIconForType(question.type)}
      </div>

      <span className="text-sm font-medium truncate flex-1">
        {question.title || 'Untitled question'}
      </span>

      {question.is_required && (
        <span className={classNames(
          "text-xs ml-2 font-bold",
          isSelected ? "text-blue-500" : "text-red-400"
        )}>*</span>
      )}
    </div>
  );
}

function getIconForType(type: string) {
  switch (type) {
    case 'SHORT_TEXT':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8" /></svg>;
    case 'LONG_TEXT':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h12" /></svg>;
    case 'NUMBER':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" /></svg>;
    case 'MULTIPLE_CHOICE':
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16M8 6a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
    default:
      return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><circle cx="12" cy="12" r="2" fill="currentColor" /></svg>;
  }
}

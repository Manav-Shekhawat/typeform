import React, { useEffect, useRef } from 'react';
import { Question, QuestionType, PublicQuestion } from '@/lib/api/types';

interface QuestionRendererProps {
  question: Question | PublicQuestion;
  index?: number;
  interactive?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange?: (val: any) => void;
  onEnter?: () => void;
  error?: string;
}

export function QuestionRenderer({ question, index, interactive = false, value, onChange, onEnter, error }: QuestionRendererProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputRef = useRef<any>(null);

  useEffect(() => {
    if (interactive && inputRef.current && typeof inputRef.current.focus === 'function') {
      inputRef.current.focus();
    }
  }, [interactive, question.id]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!interactive) return;
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onEnter?.();
    }
  };

  const renderInputPreview = () => {
    switch (question.type) {
      case QuestionType.SHORT_TEXT:
        return (
          <input 
            ref={inputRef}
            type="text" 
            placeholder="Type your answer here..."
            className={`w-full bg-transparent border-b py-2 text-xl focus:outline-none transition-colors ${interactive ? '' : 'pointer-events-none'} ${error ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-gray-900'}`}
            readOnly={!interactive}
            value={value || ''}
            onChange={e => onChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        );
      case QuestionType.LONG_TEXT:
        return (
          <textarea 
            ref={inputRef}
            placeholder="Type your answer here... (Shift+Enter for new line)"
            className={`w-full bg-transparent border-b py-2 text-xl focus:outline-none transition-colors resize-none ${interactive ? '' : 'pointer-events-none'} ${error ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-gray-900'}`}
            rows={3}
            readOnly={!interactive}
            value={value || ''}
            onChange={e => onChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        );
      case QuestionType.EMAIL:
        return (
          <input 
            ref={inputRef}
            type="email" 
            placeholder="name@example.com"
            className={`w-full bg-transparent border-b py-2 text-xl focus:outline-none transition-colors ${interactive ? '' : 'pointer-events-none'} ${error ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-gray-900'}`}
            readOnly={!interactive}
            value={value || ''}
            onChange={e => onChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        );
      case QuestionType.NUMBER:
        return (
          <input 
            ref={inputRef}
            type="number" 
            placeholder="42"
            className={`w-full bg-transparent border-b py-2 text-xl focus:outline-none transition-colors ${interactive ? '' : 'pointer-events-none'} ${error ? 'border-red-500 focus:border-red-600' : 'border-gray-300 focus:border-gray-900'}`}
            readOnly={!interactive}
            value={value || ''}
            onChange={e => onChange?.(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        );
      case QuestionType.YES_NO:
        return (
          <div 
            className={`flex space-x-4 ${interactive ? '' : 'pointer-events-none'}`}
            tabIndex={interactive ? 0 : undefined}
            onKeyDown={(e) => {
              if (!interactive) return;
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                onChange?.(false);
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                onChange?.(true);
              } else if (e.key === 'Enter') {
                e.preventDefault();
                onEnter?.();
              }
            }}
            ref={inputRef}
          >
            <button 
              type="button"
              className={`px-6 py-3 border-2 rounded-md text-lg font-medium transition-colors ${value === true ? 'border-gray-900 bg-gray-50 text-gray-900' : 'border-gray-200 bg-white text-gray-500'} ${error ? 'border-red-500' : ''}`}
              onClick={() => interactive && onChange?.(true)}
            >
              Yes
            </button>
            <button 
              type="button"
              className={`px-6 py-3 border-2 rounded-md text-lg font-medium transition-colors ${value === false ? 'border-gray-900 bg-gray-50 text-gray-900' : 'border-gray-200 bg-white text-gray-500'} ${error ? 'border-red-500' : ''}`}
              onClick={() => interactive && onChange?.(false)}
            >
              No
            </button>
          </div>
        );
      case QuestionType.MULTIPLE_CHOICE: {
        const choices = (question.properties as { choices?: string[] })?.choices || ["Option 1", "Option 2"];
        return (
          <div 
            className={`space-y-3 ${interactive ? '' : 'pointer-events-none'}`}
            tabIndex={interactive ? 0 : undefined}
            onKeyDown={(e) => {
              if (!interactive) return;
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                const idx = choices.indexOf(value);
                const next = idx < choices.length - 1 ? idx + 1 : 0;
                onChange?.(choices[next]);
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                const idx = choices.indexOf(value);
                const next = idx > 0 ? idx - 1 : choices.length - 1;
                onChange?.(choices[next]);
              } else if (e.key === 'Enter') {
                e.preventDefault();
                onEnter?.();
              }
            }}
            ref={inputRef}
          >
            {choices.map((choice: string, idx: number) => {
              const selected = value === choice;
              return (
                <div 
                  key={idx} 
                  className={`flex items-center px-4 py-3 border-2 rounded-md cursor-pointer transition-colors ${selected ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white'} ${error ? 'border-red-500' : ''}`}
                  onClick={() => interactive && onChange?.(choice)}
                >
                  <div className={`w-5 h-5 rounded border mr-3 flex items-center justify-center ${selected ? 'border-gray-900 bg-gray-900' : 'border-gray-300'}`}>
                    {selected && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span className={`text-lg ${selected ? 'text-gray-900 font-medium' : 'text-gray-700'}`}>{choice}</span>
                </div>
              );
            })}
          </div>
        );
      }
      case QuestionType.DROPDOWN: {
        const choices = (question.properties as { choices?: string[] })?.choices || ["Option 1", "Option 2"];
        return (
          <div className={`relative ${interactive ? '' : 'pointer-events-none'}`}>
            <select 
              ref={inputRef}
              className={`w-full bg-white border text-gray-700 py-3 px-4 rounded-md text-lg appearance-none focus:outline-none focus:border-gray-900 ${error ? 'border-red-500' : 'border-gray-300'}`}
              value={value || ''}
              onChange={e => onChange?.(e.target.value)}
              onKeyDown={handleKeyDown}
            >
              <option value="" disabled>Select an option...</option>
              {choices.map((choice, idx) => (
                <option key={idx} value={choice}>{choice}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 pointer-events-none">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        );
      }
      case QuestionType.RATING: {
        const steps = (question.properties as { steps?: number })?.steps || 5;
        return (
          <div 
            className={`flex space-x-2 outline-none ${interactive ? '' : 'pointer-events-none'}`}
            tabIndex={interactive ? 0 : undefined}
            onKeyDown={(e) => {
              if (!interactive) return;
              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                e.preventDefault();
                const current = (typeof value === 'number') ? value : 0;
                if (current < steps) onChange?.(current + 1);
              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                e.preventDefault();
                const current = (typeof value === 'number') ? value : 0;
                if (current > 1) onChange?.(current - 1);
              } else if (e.key === 'Enter') {
                e.preventDefault();
                onEnter?.();
              }
            }}
            ref={inputRef}
          >
            {Array.from({ length: steps }).map((_, i) => {
              const active = (typeof value === 'number') && value >= i + 1;
              return (
                <svg 
                  key={i} 
                  className={`w-10 h-10 cursor-pointer transition-colors ${active ? 'text-yellow-400' : 'text-gray-200'} hover:text-yellow-300`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  onClick={() => interactive && onChange?.(i + 1)}
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              );
            })}
          </div>
        );
      }
      default:
        return <div className="text-gray-400 italic">Unsupported question type</div>;
    }
  };

  return (
    <div className="max-w-3xl w-full mx-auto px-6 py-12 md:py-24 transition-opacity duration-300">
      <div className="mb-8">
        <h2 className="text-2xl md:text-3xl font-medium text-gray-900 flex items-start">
          {index !== undefined && (
            <span className="text-gray-400 mr-4 font-normal select-none">
              {index + 1}
              <span className="text-gray-300 ml-1">→</span>
            </span>
          )}
          <span>
            {question.title || "Untitled Question"}
            {question.is_required && <span className="text-red-500 ml-2" title="Required">*</span>}
          </span>
        </h2>
        {question.description && (
          <p className="mt-4 text-lg md:text-xl text-gray-500 font-light max-w-2xl ml-0 md:ml-12">
            {question.description}
          </p>
        )}
      </div>

      <div className="mt-8 ml-0 md:ml-12">
        {renderInputPreview()}
        {error && <p className="mt-3 text-red-500 text-sm font-medium">{error}</p>}
      </div>
    </div>
  );
}

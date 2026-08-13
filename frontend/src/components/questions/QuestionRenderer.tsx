import React from 'react';
import { Question, QuestionType } from '@/lib/api/types';

interface QuestionRendererProps {
  question: Question;
  index?: number;
}

export function QuestionRenderer({ question, index }: QuestionRendererProps) {
  const renderInputPreview = () => {
    switch (question.type) {
      case QuestionType.SHORT_TEXT:
        return (
          <input 
            type="text" 
            placeholder="Type your answer here..."
            className="w-full bg-transparent border-b border-gray-300 py-2 text-xl focus:outline-none focus:border-gray-900 placeholder-gray-300 transition-colors pointer-events-none"
            readOnly
          />
        );
      case QuestionType.LONG_TEXT:
        return (
          <textarea 
            placeholder="Type your answer here..."
            className="w-full bg-transparent border-b border-gray-300 py-2 text-xl focus:outline-none focus:border-gray-900 placeholder-gray-300 transition-colors resize-none pointer-events-none"
            rows={3}
            readOnly
          />
        );
      case QuestionType.EMAIL:
        return (
          <input 
            type="email" 
            placeholder="name@example.com"
            className="w-full bg-transparent border-b border-gray-300 py-2 text-xl focus:outline-none focus:border-gray-900 placeholder-gray-300 transition-colors pointer-events-none"
            readOnly
          />
        );
      case QuestionType.NUMBER:
        return (
          <input 
            type="number" 
            placeholder="42"
            className="w-full bg-transparent border-b border-gray-300 py-2 text-xl focus:outline-none focus:border-gray-900 placeholder-gray-300 transition-colors pointer-events-none"
            readOnly
          />
        );
      case QuestionType.YES_NO:
        return (
          <div className="flex space-x-4 pointer-events-none">
            <button className="px-6 py-3 border-2 border-gray-200 rounded-md text-lg font-medium text-gray-500 bg-white">Yes</button>
            <button className="px-6 py-3 border-2 border-gray-200 rounded-md text-lg font-medium text-gray-500 bg-white">No</button>
          </div>
        );
      case QuestionType.MULTIPLE_CHOICE: {
        const choices = (question.properties as { choices?: string[] })?.choices || ["Option 1", "Option 2"];
        return (
          <div className="space-y-3 pointer-events-none">
            {choices.map((choice: string, idx: number) => (
              <div key={idx} className="flex items-center px-4 py-3 border-2 border-gray-200 rounded-md bg-white">
                <div className="w-5 h-5 rounded border border-gray-300 mr-3"></div>
                <span className="text-lg text-gray-700">{choice}</span>
              </div>
            ))}
          </div>
        );
      }
      case QuestionType.DROPDOWN:
        return (
          <div className="relative pointer-events-none">
            <select className="w-full bg-white border border-gray-300 text-gray-700 py-3 px-4 rounded-md text-lg appearance-none">
              <option>Select an option...</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        );
      case QuestionType.RATING: {
        const steps = (question.properties as { steps?: number })?.steps || 5;
        return (
          <div className="flex space-x-2 pointer-events-none">
            {Array.from({ length: steps }).map((_, i) => (
              <svg key={i} className="w-10 h-10 text-gray-200" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
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
      </div>
    </div>
  );
}

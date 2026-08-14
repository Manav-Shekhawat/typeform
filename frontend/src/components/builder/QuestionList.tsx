import React from 'react';
import { Question } from '@/lib/api/types';
import { QuestionListItem } from '@/components/builder/QuestionListItem';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface QuestionListProps {
  questions: Question[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAddQuestionClick: () => void;
  onReorder: (activeId: string, overId: string) => void;
}

export function QuestionList({ questions, selectedId, onSelect, onAddQuestionClick, onReorder }: QuestionListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorder(active.id as string, over.id as string);
    }
  };

  return (
    <div className="w-64 border-r border-gray-200 bg-white flex flex-col shrink-0 overflow-y-auto">
      <div className="p-4 flex-1">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Content
        </h2>
        
        {questions.length === 0 ? (
          <div className="text-sm text-gray-500 text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            No questions yet
          </div>
        ) : (
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={questions.map(q => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-1">
                {questions.map((q, index) => (
                  <QuestionListItem
                    key={q.id}
                    question={q}
                    index={index}
                    isSelected={selectedId === q.id}
                    onClick={() => onSelect(q.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="p-4 border-t border-gray-100 mt-auto sticky bottom-0 bg-white">
        <button
          className="w-full flex items-center justify-center py-2 px-4 border border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-1"
          onClick={onAddQuestionClick}
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add question
        </button>
      </div>
    </div>
  );
}

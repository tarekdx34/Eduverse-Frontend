/**
 * QuestionReorder - Drag-and-drop question reordering component
 * Uses native HTML5 drag and drop for simplicity
 */

import React, { useState, useCallback } from 'react';
import { GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { QuestionFormData, QUESTION_TYPE_CONFIG } from './types';

interface QuestionReorderProps {
  questions: QuestionFormData[];
  onReorder: (questions: QuestionFormData[]) => void;
}

export function QuestionReorder({ questions, onReorder }: QuestionReorderProps) {
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const cardCls = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200';
  const headingCls = isDark ? 'text-white' : 'text-gray-900';
  const subCls = isDark ? 'text-slate-400' : 'text-gray-600';

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    
    // Make the drag image semi-transparent
    const element = e.currentTarget as HTMLElement;
    element.style.opacity = '0.5';
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const element = e.currentTarget as HTMLElement;
    element.style.opacity = '1';
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndex !== null && draggedIndex !== index) {
      setDragOverIndex(index);
    }
  }, [draggedIndex]);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
    
    if (sourceIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    // Reorder the questions array
    const newQuestions = [...questions];
    const [removed] = newQuestions.splice(sourceIndex, 1);
    newQuestions.splice(dropIndex, 0, removed);

    // Update order indices
    const reindexed = newQuestions.map((q, idx) => ({
      ...q,
      orderIndex: idx,
    }));

    onReorder(reindexed);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [questions, onReorder]);

  // Move question up
  const moveUp = useCallback((index: number) => {
    if (index <= 0) return;
    const newQuestions = [...questions];
    [newQuestions[index - 1], newQuestions[index]] = [newQuestions[index], newQuestions[index - 1]];
    onReorder(newQuestions.map((q, idx) => ({ ...q, orderIndex: idx })));
  }, [questions, onReorder]);

  // Move question down
  const moveDown = useCallback((index: number) => {
    if (index >= questions.length - 1) return;
    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[index + 1]] = [newQuestions[index + 1], newQuestions[index]];
    onReorder(newQuestions.map((q, idx) => ({ ...q, orderIndex: idx })));
  }, [questions, onReorder]);

  if (questions.length <= 1) {
    return null; // No need to show reorder UI for single question
  }

  return (
    <div className="space-y-2">
      <p className={`text-sm ${subCls} mb-3`}>
        Drag and drop to reorder questions, or use the arrow buttons.
      </p>
      {questions.map((question, index) => (
        <div
          key={question.tempId || question.id || index}
          draggable
          onDragStart={(e) => handleDragStart(e, index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          className={`
            flex items-center gap-3 p-3 rounded-lg border cursor-move transition-all
            ${cardCls}
            ${draggedIndex === index ? 'opacity-50' : ''}
            ${dragOverIndex === index ? 'ring-2' : ''}
          `}
          style={{
            '--tw-ring-color': primaryHex,
          } as React.CSSProperties}
        >
          <GripVertical size={18} className={`${subCls} flex-shrink-0`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${headingCls}`}>
                Q{index + 1}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-gray-100'} ${subCls}`}>
                {QUESTION_TYPE_CONFIG[question.questionType]?.label || question.questionType}
              </span>
              <span className={`text-xs ${subCls}`}>
                ({question.points} pts)
              </span>
            </div>
            <p className={`text-sm truncate ${subCls} mt-0.5`}>
              {question.questionText || 'No question text'}
            </p>
          </div>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => moveUp(index)}
              disabled={index === 0}
              className={`p-1 rounded transition-colors ${index === 0 ? 'opacity-30 cursor-not-allowed' : `hover:bg-white/10 ${subCls}`}`}
              aria-label="Move up"
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={() => moveDown(index)}
              disabled={index === questions.length - 1}
              className={`p-1 rounded transition-colors ${index === questions.length - 1 ? 'opacity-30 cursor-not-allowed' : `hover:bg-white/10 ${subCls}`}`}
              aria-label="Move down"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

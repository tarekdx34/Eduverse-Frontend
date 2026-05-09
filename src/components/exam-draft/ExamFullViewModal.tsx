import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import { Button } from '../ui/button';
import { useTheme } from '../../pages/instructor-dashboard/contexts/ThemeContext';
import {
  StatusBadge,
  LoadingSkeleton,
  EmptyState,
} from '../shared/index';
import ExamGenerationService from '../../services/api/examGenerationService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface ExamQuestion {
  id: string;
  questionId?: number;
  questionText: string;
  weight: number;
  questionType?: string;
  difficulty?: string;
  expectedAnswerText?: string;
  options?: Array<{ optionText?: string; isCorrect?: boolean }>;
}

interface ExamSection {
  id?: number;
  title: string;
  instructions?: string;
  totalMarks?: number;
  items?: ExamQuestion[];
}

interface ExamFullData {
  examId: number;
  title: string;
  status?: string;
  totalWeight: number;
  questionCount: number;
  sections?: ExamSection[];
  items?: ExamQuestion[];
}

interface ExamFullViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  examId: number;
}

export const ExamFullViewModal: React.FC<ExamFullViewModalProps> = ({
  open,
  onOpenChange,
  examId,
}) => {
  const { isDark, primaryHex } = useTheme();
  const [exam, setExam] = useState<ExamFullData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const loadExam = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ExamGenerationService.getExamFull(examId);
      setExam(data as ExamFullData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load exam';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    if (open) {
      void loadExam();
    }
  }, [open, loadExam]);

  const handleExport = async () => {
    try {
      setExporting(true);
      await ExamGenerationService.exportExamWord(examId);
      toast.success('Exam exported to Word');
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to export exam',
      );
    } finally {
      setExporting(false);
    }
  };

  const hasSections = exam && exam.sections && exam.sections.length > 0;

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderColor: isDark ? '#374151' : '#e5e7eb',
        }}
      >
        <DialogHeader>
          <div className="flex items-center gap-3 flex-wrap">
            <DialogTitle>{exam?.title || `Exam #${examId}`}</DialogTitle>
            {exam?.status && <StatusBadge status={exam.status} />}
          </div>
          <DialogDescription className="sr-only">Full view of exam sections and questions</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Exam Stats */}
          {exam && (
            <div className="grid grid-cols-2 gap-3">
              <div
                className="rounded-lg border p-3"
                style={{
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  borderColor: isDark ? '#4b5563' : '#d1d5db',
                }}
              >
                <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Questions
                </div>
                <div className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {exam.questionCount}
                </div>
              </div>
              <div
                className="rounded-lg border p-3"
                style={{
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                  borderColor: isDark ? '#4b5563' : '#d1d5db',
                }}
              >
                <div className={`text-xs font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Total Marks
                </div>
                <div className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                  {exam.totalWeight}
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <LoadingSkeleton rows={5} cols={1} />
          ) : error ? (
            <div
              className="rounded-lg border p-4 text-center"
              style={{
                backgroundColor: isDark ? '#7f1d1d' : '#fee2e2',
                borderColor: isDark ? '#991b1b' : '#fecaca',
              }}
            >
              <p className={isDark ? 'text-red-200' : 'text-red-800'}>
                {error}
              </p>
              <button
                onClick={() => void loadExam()}
                className="mt-3 px-3 py-1 rounded text-sm text-white"
                style={{ backgroundColor: primaryHex }}
              >
                Retry
              </button>
            </div>
          ) : exam ? (
            hasSections ? (
              <Accordion type="single" collapsible className="w-full">
                {exam.sections!.map((section, sectionIdx) => (
                  <AccordionItem
                    key={section.id || sectionIdx}
                    value={`section-${sectionIdx}`}
                  >
                    <AccordionTrigger className={isDark ? 'text-gray-100 hover:text-gray-200' : ''}>
                      <div className="text-left">
                        <div className="font-semibold">{section.title}</div>
                        {section.items && (
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {section.items.length} questions • {section.items.reduce((sum, item) => sum + item.weight, 0)} marks
                          </div>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-3">
                        {section.instructions && (
                          <div
                            className="rounded p-3"
                            style={{
                              backgroundColor: isDark ? '#374151' : '#f3f4f6',
                            }}
                          >
                            <div className={`text-xs font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              Instructions
                            </div>
                            <p className={isDark ? 'text-gray-200 text-sm' : 'text-gray-800 text-sm'}>
                              {section.instructions}
                            </p>
                          </div>
                        )}
                        <div className="space-y-2">
                          {section.items?.map((item, itemIdx) => (
                            <QuestionCard
                              key={item.id}
                              question={item}
                              index={itemIdx + 1}
                              isDark={isDark}
                              primaryHex={primaryHex}
                            />
                          ))}
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : exam.items && exam.items.length > 0 ? (
              <div className="space-y-3">
                {exam.items.map((item, idx) => (
                  <QuestionCard
                    key={item.id}
                    question={item}
                    index={idx + 1}
                    isDark={isDark}
                    primaryHex={primaryHex}
                  />
                ))}
              </div>
            ) : (
              <EmptyState title="No questions in this exam" />
            )
          ) : null}
        </div>

        <DialogFooter>
          <Button
            onClick={handleExport}
            disabled={exporting || loading}
            style={{ backgroundColor: primaryHex }}
            className="text-white"
          >
            {exporting ? (
              <>
                <Loader2 size={16} className="inline mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              'Export to Word'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className={isDark ? 'border-gray-600 text-gray-200' : ''}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface QuestionCardProps {
  question: ExamQuestion;
  index: number;
  isDark: boolean;
  primaryHex: string;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  index,
  isDark,
  primaryHex,
}) => {
  return (
    <div
      className="rounded-lg border p-4"
      style={{
        backgroundColor: isDark ? '#374151' : '#f9fafb',
        borderColor: isDark ? '#4b5563' : '#e5e7eb',
      }}
    >
      <div className="flex gap-3">
        <div
          className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold"
          style={{ backgroundColor: primaryHex }}
        >
          {index}
        </div>
        <div className="flex-1">
          <p className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            {question.questionText}
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {question.questionType && (
              <span
                className="inline-flex px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: `${primaryHex}20`,
                  color: primaryHex,
                }}
              >
                {question.questionType}
              </span>
            )}
            {question.difficulty && (
              <span
                className="inline-flex px-2 py-0.5 rounded text-xs font-medium"
                style={{
                  backgroundColor: isDark ? '#4b5563' : '#e5e7eb',
                  color: isDark ? '#d1d5db' : '#6b7280',
                }}
              >
                {question.difficulty}
              </span>
            )}
            <span
              className="inline-flex px-2 py-0.5 rounded text-xs font-medium"
              style={{
                backgroundColor: isDark ? '#4b5563' : '#e5e7eb',
                color: isDark ? '#d1d5db' : '#6b7280',
              }}
            >
              {question.weight} mark{question.weight !== 1 ? 's' : ''}
            </span>
          </div>
          {question.expectedAnswerText && (
            <div className="mt-2">
              <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Expected Answer
              </div>
              <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {question.expectedAnswerText}
              </p>
            </div>
          )}
          {question.options && question.options.length > 0 && (
            <div className="mt-2">
              <div className={`text-xs font-semibold mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Options
              </div>
              <ul className="space-y-1">
                {question.options.map((opt, idx) => (
                  <li key={idx} className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    <span className={opt.isCorrect ? 'font-semibold text-green-600' : ''}>
                      {opt.optionText}
                      {opt.isCorrect && ' ✓'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

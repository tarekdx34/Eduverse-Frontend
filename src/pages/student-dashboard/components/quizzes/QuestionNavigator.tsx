import React from 'react';
import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface QuestionNavigatorProps {
  questions: Array<{ id: string }>;
  currentIndex: number;
  answers: Record<string, any>;
  skippedQuestions: Set<string>;
  onSelectQuestion: (index: number) => void;
  onClose: () => void;
}

const QuestionNavigator: React.FC<QuestionNavigatorProps> = ({
  questions,
  currentIndex,
  answers,
  skippedQuestions,
  onSelectQuestion,
  onClose,
}) => {
  const { isDark } = useTheme();
  const { isRTL } = useLanguage();

  // Determine status for each question
  const getQuestionStatus = (index: number): 'answered' | 'skipped' | 'current' | 'unanswered' => {
    if (index === currentIndex) {
      return 'current';
    }

    const questionId = questions[index]?.id;
    if (!questionId) {
      return 'unanswered';
    }

    if (skippedQuestions.has(questionId)) {
      return 'skipped';
    }

    if (answers[questionId] !== undefined && answers[questionId] !== null && answers[questionId] !== '') {
      return 'answered';
    }

    return 'unanswered';
  };

  // Get button styling based on status
  const getButtonStyle = (status: 'answered' | 'skipped' | 'current' | 'unanswered') => {
    const baseStyle = 'w-full aspect-square rounded-xl font-semibold text-sm flex items-center justify-center transition-all hover:scale-105 cursor-pointer';

    switch (status) {
      case 'answered':
        return `${baseStyle} bg-[#10B981] text-white`;
      case 'skipped':
        return `${baseStyle} bg-[#F59E0B] text-white`;
      case 'current':
        return `${baseStyle} bg-[var(--accent-color)] text-white shadow-lg`;
      case 'unanswered':
        return isDark
          ? `${baseStyle} bg-white/10 text-slate-400`
          : `${baseStyle} bg-slate-100 text-slate-500`;
    }
  };

  const legendItems = [
    { color: '#10B981', label: 'Answered', status: 'answered' as const },
    { color: '#F59E0B', label: 'Skipped', status: 'skipped' as const },
    { color: 'var(--accent-color)', label: 'Current', status: 'current' as const },
    { color: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0', label: 'Unanswered', status: 'unanswered' as const },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Question Navigator"
    >
      {/* Modal Content */}
      <div
        className={`rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transition-colors ${
          isDark ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
          <h2 className="text-2xl font-bold">Question Navigator</h2>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
            aria-label="Close navigator"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Question Grid */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-75">Questions</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((question, index) => {
                const status = getQuestionStatus(index);
                return (
                  <button
                    key={question.id}
                    onClick={() => {
                      onSelectQuestion(index);
                      onClose();
                    }}
                    className={getButtonStyle(status)}
                    aria-label={`Question ${index + 1}, ${status}`}
                    aria-current={index === currentIndex ? 'true' : undefined}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3 pt-4 border-t border-opacity-20" style={{ borderColor: isDark ? 'white' : 'black' }}>
            <h3 className="text-sm font-semibold uppercase tracking-wide opacity-75">Legend</h3>
            <div className={`flex flex-wrap gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              {legendItems.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center gap-2"
                  style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
                >
                  <div
                    className="w-5 h-5 rounded-lg flex-shrink-0 border border-opacity-20"
                    style={{
                      backgroundColor: item.color,
                      borderColor: isDark ? 'white' : 'black',
                    }}
                  />
                  <span className="text-sm">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Summary Stats */}
          <div className={`grid grid-cols-4 gap-3 pt-4 border-t border-opacity-20 ${isRTL ? 'text-right' : 'text-left'}`} style={{ borderColor: isDark ? 'white' : 'black' }}>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <div className="text-xs opacity-75 mb-1">Answered</div>
              <div className="text-lg font-bold">
                {Object.keys(answers).length}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <div className="text-xs opacity-75 mb-1">Skipped</div>
              <div className="text-lg font-bold">
                {skippedQuestions.size}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <div className="text-xs opacity-75 mb-1">Unanswered</div>
              <div className="text-lg font-bold">
                {questions.length - Object.keys(answers).length - skippedQuestions.size}
              </div>
            </div>
            <div className={`p-3 rounded-lg ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <div className="text-xs opacity-75 mb-1">Total</div>
              <div className="text-lg font-bold">
                {questions.length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionNavigator;

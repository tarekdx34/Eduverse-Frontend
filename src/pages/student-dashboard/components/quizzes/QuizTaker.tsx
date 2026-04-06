import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, SkipForward, Send, Grid3X3, AlertTriangle, X } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useQuizTimer } from '../../../../hooks/useQuizTimer';
import { QuizService } from '../../../../services/api/quizService';
import { Timer } from './Timer';
import ProgressBar from './ProgressBar';
import QuestionNavigator from './QuestionNavigator';
import QuestionDisplay from './QuestionDisplay';
import type { QuizQuestion, AnswersState, MatchingPair, AttemptResult } from './types';

interface QuizTakerProps {
  quizId: string;
  attemptId: string;
  questions: QuizQuestion[];
  timeLimitSeconds: number;
  quizTitle: string;
  courseCode: string;
  courseColor: string;
  savedAnswers?: AnswersState;
  onSubmit: (result: AttemptResult) => void;
  onExit: () => void;
}

const QuizTaker: React.FC<QuizTakerProps> = ({
  quizId,
  attemptId,
  questions,
  timeLimitSeconds,
  quizTitle,
  courseCode,
  courseColor,
  savedAnswers,
  onSubmit,
  onExit,
}) => {
  const { isDark } = useTheme();
  const { language, t } = useLanguage();
  const isRTL = language === 'ar';

  // State Management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswersState>(savedAnswers || {});
  const [skippedQuestions, setSkippedQuestions] = useState<Set<string>>(new Set());
  const [showNavigator, setShowNavigator] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout>();

  const currentQuestion = questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;

  // Transform answers to API format
  const transformAnswersForApi = useCallback(() => {
    const answersArray = questions.map((question) => {
      const answer = answers[question.id];

      if (!answer) {
        return {
          questionId: question.id,
          answerText: '',
        };
      }

      let answerText = '';

      switch (question.type || question.questionType) {
        case 'mcq': {
          // For MCQ, send the selected option text
          answerText = answer.selectedOption || answer || '';
          break;
        }

        case 'true_false': {
          // For true/false, send 'true' or 'false'
          answerText = String(answer.selectedOption || answer || 'false');
          break;
        }

        case 'short_answer':
        case 'essay': {
          // For text answers, send the text directly
          answerText = answer.answerText || answer || '';
          break;
        }

        case 'matching': {
          // For matching, serialize the pairs as JSON string
          const pairs = answer.matchingPairs || [];
          answerText = JSON.stringify(pairs);
          break;
        }

        case 'multiple_select': {
          // For multiple select, serialize selected options as JSON
          const selected = answer.selectedOptions || [];
          answerText = JSON.stringify(selected);
          break;
        }

        default:
          answerText = typeof answer === 'string' ? answer : JSON.stringify(answer);
      }

      return {
        questionId: question.id,
        answerText,
      };
    });

    return answersArray;
  }, [answers, questions]);

  // Auto-save handler
  const handleAutoSave = useCallback(async () => {
    try {
      const answersArray = transformAnswersForApi();
      await QuizService.saveProgress(quizId, attemptId, answersArray);
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [quizId, attemptId, transformAnswersForApi]);

  // Timer hook
  const { timeRemaining, isAutoSaving, timeRemainingFormatted } = useQuizTimer({
    timeLimit: timeLimitSeconds,
    onTimeExpired: () => {
      toast.info(t('quiz.timeExpired'));
      handleSubmit();
    },
    onAutoSave: handleAutoSave,
    autoSaveInterval: 30,
  });

  // Handle answer change
  const handleAnswerChange = useCallback((questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }));

    // Remove from skipped if previously skipped
    setSkippedQuestions((prev) => {
      const updated = new Set(prev);
      updated.delete(questionId);
      return updated;
    });
  }, []);

  // Navigation handlers
  const handlePreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex]);

  const handleNextQuestion = useCallback(() => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }, [currentQuestionIndex, totalQuestions]);

  const handleSkipQuestion = useCallback(() => {
    setSkippedQuestions((prev) => new Set(prev).add(currentQuestion.id));

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }, [currentQuestion.id, currentQuestionIndex, totalQuestions]);

  const handleJumpToQuestion = useCallback((index: number) => {
    setCurrentQuestionIndex(index);
    setShowNavigator(false);
  }, []);

  // Submit handler
  const handleSubmit = async () => {
    setShowSubmitConfirm(false);
    setSubmitting(true);

    try {
      const answersArray = transformAnswersForApi();
      console.log('[QuizTaker] Submitting answers:', JSON.stringify(answersArray, null, 2));
      console.log('[QuizTaker] Number of answers:', answersArray.length);
      console.log('[QuizTaker] Sample answer:', answersArray[0]);
      
      const result = await QuizService.submitAttempt(quizId, attemptId, answersArray);
      console.log('[QuizTaker] Submit result:', result);
      console.log('[QuizTaker] Result percentage:', result.percentage);
      console.log('[QuizTaker] Result answers:', result.answers);
      
      toast.success(t('quiz.submittedSuccessfully'));
      onSubmit(result);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error(t('quiz.submitFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  // Exit handler
  const handleExit = () => {
    setShowExitConfirm(false);
    onExit();
  };

  // Calculate progress stats
  const unansweredCount = totalQuestions - answeredCount;
  const skippedCount = skippedQuestions.size;
  const reviewCount = totalQuestions - answeredCount - skippedCount;

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  if (!currentQuestion) {
    return (
      <div className={`flex items-center justify-center h-screen ${isDark ? 'bg-slate-950' : 'bg-white'}`}>
        <div className="text-center">
          <p className={isDark ? 'text-slate-400' : 'text-slate-600'}>
            {t('quiz.noQuestionsAvailable')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${isDark ? 'bg-slate-950' : 'bg-slate-50'} transition-colors duration-200`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Top Bar */}
      <div
        className={`sticky top-0 z-40 border-b ${
          isDark
            ? 'bg-slate-900/80 border-slate-800 backdrop-blur-xl'
            : 'bg-white/80 border-slate-200 backdrop-blur-xl'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left: Back button */}
            <button
              onClick={() => setShowExitConfirm(true)}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                  : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
              title={t('common.back')}
            >
              <ChevronLeft size={24} />
            </button>

            {/* Center: Course info and counter */}
            <div className="flex items-center gap-2 flex-1 justify-center">
              <div
                className={`px-3 py-1 rounded-full text-sm font-medium text-white`}
                style={{ backgroundColor: courseColor }}
              >
                {courseCode}
              </div>
              <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                {currentQuestionIndex + 1} / {totalQuestions}
              </span>
            </div>

            {/* Right: Timer and Navigator */}
            <div className="flex items-center gap-3">
              <Timer
                timeRemaining={timeRemaining}
                timeLimitSeconds={timeLimitSeconds}
                isAutoSaving={isAutoSaving}
              />

              <button
                onClick={() => setShowNavigator(true)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                    : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
                title={t('quiz.navigatorButton')}
              >
                <Grid3X3 size={24} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar
            answered={answeredCount}
            total={totalQuestions}
            skipped={skippedCount}
          />
          <div
            className={`mt-4 flex justify-center gap-6 text-sm ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              {t('quiz.answered')}: {answeredCount}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              {t('quiz.skipped')}: {skippedCount}
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-400" />
              {t('quiz.unanswered')}: {reviewCount}
            </div>
          </div>
        </div>

        {/* Question Card */}
        <div
          className={`rounded-[2.5rem] backdrop-blur-sm p-8 mb-8 transition-all duration-200 ${
            isDark
              ? 'bg-slate-800/50 border border-slate-700/50 shadow-2xl'
              : 'bg-white/50 border border-slate-200/50 shadow-lg'
          }`}
        >
          <QuestionDisplay
            id={currentQuestion.id}
            questionNumber={currentQuestionIndex + 1}
            questionType={currentQuestion.questionType || currentQuestion.type || 'mcq'}
            questionText={currentQuestion.questionText}
            options={currentQuestion.options}
            matchingPairs={currentQuestion.matchingPairs}
            points={parseFloat(currentQuestion.points || '0')}
            selectedAnswer={answers[currentQuestion.id] || null}
            onAnswerChange={(answer) => handleAnswerChange(currentQuestion.id, answer)}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center gap-4">
          <button
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              currentQuestionIndex === 0
                ? isDark
                  ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : isDark
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
            }`}
          >
            {!isRTL && <ChevronLeft size={20} />}
            {t('common.previous')}
            {isRTL && <ChevronLeft size={20} />}
          </button>

          <button
            onClick={handleSkipQuestion}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
              isDark
                ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
            }`}
          >
            <SkipForward size={20} />
            {t('quiz.skip')}
          </button>

          {currentQuestionIndex === totalQuestions - 1 ? (
            <button
              onClick={() => setShowSubmitConfirm(true)}
              disabled={submitting}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                submitting
                  ? isDark
                    ? 'bg-emerald-900/50 text-emerald-400 cursor-not-allowed'
                    : 'bg-emerald-100 text-emerald-600 cursor-not-allowed'
                  : isDark
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
              }`}
            >
              <Send size={20} />
              {submitting ? t('common.submitting') : t('quiz.submit')}
            </button>
          ) : (
            <button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === totalQuestions - 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                currentQuestionIndex === totalQuestions - 1
                  ? isDark
                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : isDark
                    ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
              }`}
            >
              {t('common.next')}
              {!isRTL && <ChevronRight size={20} />}
              {isRTL && <ChevronRight size={20} />}
            </button>
          )}
        </div>
      </div>

      {/* Question Navigator Modal */}
      {showNavigator && (
        <QuestionNavigator
          questions={questions}
          currentQuestionIndex={currentQuestionIndex}
          answers={answers}
          skippedQuestions={skippedQuestions}
          onSelectQuestion={handleJumpToQuestion}
          onClose={() => setShowNavigator(false)}
          isDark={isDark}
        />
      )}

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div
            className={`rounded-[2.5rem] p-8 w-full max-w-md mx-4 shadow-2xl ${
              isDark ? 'bg-slate-800' : 'bg-white'
            }`}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-full bg-amber-100">
                <AlertTriangle className="text-amber-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('quiz.exitConfirmTitle')}
                </h3>
                <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t('quiz.exitConfirmMessage')}
                </p>
              </div>
              <button
                onClick={() => setShowExitConfirm(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-slate-700 text-slate-400'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowExitConfirm(false)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  isDark
                    ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                }`}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleExit}
                className="px-6 py-2 rounded-full font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                {t('quiz.exitQuiz')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
          <div
            className={`rounded-[2.5rem] p-8 w-full max-w-md mx-4 shadow-2xl ${
              isDark ? 'bg-slate-800' : 'bg-white'
            }`}
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 rounded-full bg-blue-100">
                <AlertTriangle className="text-blue-600" size={24} />
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {t('quiz.submitConfirmTitle')}
                </h3>
                <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                  {t('quiz.submitConfirmMessage')}
                </p>
                {unansweredCount > 0 && (
                  <p className={`text-sm mt-2 font-medium ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                    {t('quiz.unansweredWarning', { count: unansweredCount })}
                  </p>
                )}
              </div>
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-slate-700 text-slate-400'
                    : 'hover:bg-slate-100 text-slate-600'
                }`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  isDark
                    ? 'bg-slate-700 text-slate-200 hover:bg-slate-600'
                    : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
                }`}
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`px-6 py-2 rounded-full font-medium transition-colors ${
                  submitting
                    ? isDark
                      ? 'bg-emerald-900/50 text-emerald-400 cursor-not-allowed'
                      : 'bg-emerald-100 text-emerald-600 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {submitting ? t('common.submitting') : t('quiz.confirmSubmit')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizTaker;

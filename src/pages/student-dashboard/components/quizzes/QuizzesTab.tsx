import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { QuizService } from '../../../../services/api/quizService';
import { QuizList } from './QuizList';
import QuizTaker from './QuizTaker';
import { QuizResults } from './QuizResults';
import { AttemptHistory } from './AttemptHistory';
import type {
  QuizView,
  QuizQuestion,
  QuizResultData,
  AnswersState,
  AttemptResult,
  MatchingPair,
} from './types';

interface ActiveQuizState {
  quizId: string;
  attemptId: string;
  questions: QuizQuestion[];
  timeLimitSeconds: number;
  quizTitle: string;
  courseCode: string;
  courseColor: string;
  savedAnswers: AnswersState;
  showCorrectAnswers: boolean;
  maxAttempts: number;
  remainingAttempts: number;
  passingScore: number;
}

/**
 * QuizzesTab - Main container component for student quiz dashboard
 * Manages quiz view state, orchestrates child components, and handles quiz lifecycle
 */
const QuizzesTab = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === 'dark';
  const isRTL = language === 'ar';

  // State management
  const [view, setView] = useState<QuizView>('list');
  const [activeQuiz, setActiveQuiz] = useState<ActiveQuizState | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResultData | null>(null);
  const [startingQuizId, setStartingQuizId] = useState<string | null>(null);

  /**
   * Helper: Convert percentage to letter grade
   */
  const getLetterGrade = (pct: number): string => {
    if (pct >= 93) return 'A';
    if (pct >= 90) return 'A-';
    if (pct >= 87) return 'B+';
    if (pct >= 83) return 'B';
    if (pct >= 80) return 'B-';
    if (pct >= 77) return 'C+';
    if (pct >= 73) return 'C';
    if (pct >= 70) return 'C-';
    if (pct >= 60) return 'D';
    return 'F';
  };

  /**
   * Helper: Restore saved answers from API response
   */
  const restoreAnswers = (
    answers: any[],
    questions: QuizQuestion[]
  ): AnswersState => {
    const result: AnswersState = {};

    answers?.forEach((ans) => {
      const question = questions.find(
        (q) => String(q.id) === String(ans.questionId)
      );
      if (!question) return;

      if (
        question.questionType === 'mcq' &&
        question.options &&
        ans.selectedOption
      ) {
        const idx = parseInt(ans.selectedOption, 10);
        if (!isNaN(idx) && question.options[idx]) {
          result[ans.questionId] = question.options[idx];
        }
      } else if (
        question.questionType === 'true_false' &&
        ans.selectedOption
      ) {
        result[ans.questionId] = ans.selectedOption === '0' ? 'True' : 'False';
      } else if (ans.answerText) {
        result[ans.questionId] = ans.answerText;
      }
    });

    return result;
  };

  /**
   * Handle starting a quiz
   * Flow: Fetch quiz → Check for in-progress → Start/Resume attempt → Set active quiz
   */
  const handleStartQuiz = useCallback(
    async (quizId: string) => {
      setStartingQuizId(quizId);
      try {
        // 1. Fetch full quiz with questions
        const fullQuiz = await QuizService.getById(quizId);
        console.log('[QuizzesTab] Full quiz data:', fullQuiz);
        console.log('[QuizzesTab] Questions from quiz:', fullQuiz.questions);

        // 2. Check for existing in-progress attempt
        const existingAttempt = await QuizService.getInProgressAttempt(quizId);

        let attempt;
        let savedAnswers: AnswersState = {};

        if (existingAttempt) {
          // Resume existing attempt
          toast.info('Resuming quiz...');
          attempt = existingAttempt;
          const attemptDetails = await QuizService.getAttempt(
            quizId,
            existingAttempt.id
          );
          // Restore saved answers from attemptDetails.answers
          savedAnswers = restoreAnswers(
            attemptDetails.answers,
            fullQuiz.questions
          );
        } else {
          // Start new attempt
          attempt = await QuizService.startAttempt(quizId);
          console.log('[QuizzesTab] New attempt started:', attempt);
          console.log('[QuizzesTab] Questions from attempt:', attempt.questions);
        }

        // Use questions from attempt if available, otherwise from quiz
        const questions = (attempt as any).questions || fullQuiz.questions || [];
        console.log('[QuizzesTab] Final questions array:', questions);
        console.log('[QuizzesTab] Questions count:', questions.length);
        
        // Normalize question IDs (handle both id and questionId fields)
        const normalizedQuestions = questions.map((q: any) => ({
          ...q,
          id: String(q.id || q.questionId || q.question_id || ''),
          type: q.questionType || q.type || 'mcq',
          points: String(q.points || '0'),
        }));
        
        console.log('[QuizzesTab] Normalized questions:', normalizedQuestions);

        // Calculate remaining time for resumed attempts
        const startTime = new Date(attempt.startedAt).getTime();
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const totalSeconds = (fullQuiz.timeLimitMinutes || 30) * 60;
        let remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

        // Check if the resumed attempt has expired
        let isNewAttempt = !existingAttempt;
        if (existingAttempt && remainingSeconds <= 0) {
          toast.error('Previous attempt has expired. Starting a new attempt...');
          // Start a new attempt instead
          attempt = await QuizService.startAttempt(quizId);
          savedAnswers = {}; // Clear saved answers
          isNewAttempt = true;
          remainingSeconds = totalSeconds; // Full time for new attempt
        }

        // Get remaining attempts
        const myAttempts = await QuizService.getMyAttempts(quizId);
        const remaining = Math.max(0, fullQuiz.maxAttempts - myAttempts.length);

        setActiveQuiz({
          quizId,
          attemptId: attempt.id,
          questions: normalizedQuestions,
          timeLimitSeconds: isNewAttempt ? totalSeconds : remainingSeconds,
          quizTitle: fullQuiz.title,
          courseCode: fullQuiz.course?.code || 'Course',
          courseColor: '#3B82F6',
          savedAnswers,
          showCorrectAnswers: !!fullQuiz.showCorrectAnswers,
          maxAttempts: fullQuiz.maxAttempts,
          remainingAttempts: remaining,
          passingScore: parseFloat(fullQuiz.passingScore || '50'),
        });
        setView('active');
      } catch (error: any) {
        console.error('[QuizzesTab] Error starting quiz:', error);
        if (error.message?.includes('Maximum attempts')) {
          toast.error('Maximum attempts reached');
        } else {
          toast.error('Failed to start quiz');
        }
      } finally {
        setStartingQuizId(null);
      }
    },
    []
  );

  /**
   * Handle quiz submission
   * Transform AttemptResult to QuizResultData and display results
   */
  const handleQuizSubmit = useCallback((result: AttemptResult) => {
    const questions = activeQuiz?.questions || [];
    const passingScore = activeQuiz?.passingScore || 50;
    
    // Defensive: Handle case where answers array might be undefined
    const answers = result.answers || [];

    const resultData: QuizResultData = {
      score: result.totalScore,
      maxScore: result.maxScore,
      percentage: result.percentage,
      passed: result.percentage >= passingScore,
      grade: getLetterGrade(result.percentage),
      correct: answers.filter((a) => a.isCorrect).length,
      wrong: answers.filter(
        (a) => !a.isCorrect && a.selectedAnswer
      ).length,
      skipped: answers.filter((a) => !a.selectedAnswer).length,
      questions: answers.map((a) => ({
        questionId: String(a.questionId),
        questionText: a.questionText || '',
        questionType: 'mcq', // Default, could be improved
        isCorrect: a.isCorrect,
        userAnswer: a.selectedAnswer || null,
        correctAnswer: a.correctAnswer || null,
        points: 0,
        pointsEarned: a.pointsEarned,
      })),
    };

    setQuizResult(resultData);
    setView('results');
  }, [activeQuiz]);

  /**
   * Handle viewing a previous attempt result
   */
  const handleViewAttempt = useCallback((attemptId: string) => {
    // TODO: Implement viewing previous attempt
    toast.info('View attempt: ' + attemptId);
  }, []);

  /**
   * Render appropriate view based on current state
   */
  const renderView = () => {
    switch (view) {
      case 'list':
        return (
          <div className="space-y-6">
            <QuizList
              onStartQuiz={handleStartQuiz}
              loadingQuizId={startingQuizId}
            />
            <AttemptHistory limit={5} onViewResults={handleViewAttempt} />
          </div>
        );

      case 'active':
        if (!activeQuiz) return null;
        return (
          <QuizTaker
            quizId={activeQuiz.quizId}
            attemptId={activeQuiz.attemptId}
            questions={activeQuiz.questions}
            timeLimitSeconds={activeQuiz.timeLimitSeconds}
            quizTitle={activeQuiz.quizTitle}
            courseCode={activeQuiz.courseCode}
            courseColor={activeQuiz.courseColor}
            savedAnswers={activeQuiz.savedAnswers}
            onSubmit={handleQuizSubmit}
            onExit={() => setView('list')}
          />
        );

      case 'results':
        if (!quizResult || !activeQuiz) return null;
        return (
          <QuizResults
            result={quizResult}
            quizTitle={activeQuiz.quizTitle}
            showCorrectAnswers={activeQuiz.showCorrectAnswers}
            canRetake={activeQuiz.remainingAttempts > 1}
            onRetake={() => handleStartQuiz(activeQuiz.quizId)}
            onBackToList={() => {
              setView('list');
              setActiveQuiz(null);
              setQuizResult(null);
            }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div
      className={`w-full ${
        isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'
      } ${isRTL ? 'rtl' : 'ltr'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {renderView()}
    </div>
  );
};

export { QuizzesTab };
export default QuizzesTab;

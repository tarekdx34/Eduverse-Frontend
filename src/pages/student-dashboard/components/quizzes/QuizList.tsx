import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { QuizService, Quiz as ApiQuiz, QuizAttempt as ApiAttempt } from '../../../../services/api/quizService';
import QuizCard from './QuizCard';

interface QuizListProps {
  onStartQuiz: (quizId: string) => void;
  loadingQuizId?: string | null;
}

interface QuizDisplayData {
  id: string;
  title: string;
  course: string;
  questionsCount: number;
  duration: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  maxAttempts: number;
  remainingAttempts: number;
  color: string;
}

const QUIZ_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

const getDifficultyLevel = (value: string): 'Easy' | 'Medium' | 'Hard' => {
  const lower = (value || '').toLowerCase();
  if (lower === 'easy' || lower === 'practice') return 'Easy';
  if (lower === 'hard' || lower === 'advanced') return 'Hard';
  return 'Medium';
};

export const QuizList: React.FC<QuizListProps> = ({ onStartQuiz, loadingQuizId }) => {
  const { isDark } = useTheme();
  const { language, isRTL } = useLanguage();
  
  const [quizzes, setQuizzes] = useState<QuizDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Translations
  const translations = {
    en: {
      title: 'Quiz Center',
      description: 'Explore and take available quizzes to test your knowledge',
      loading: 'Loading quizzes...',
      empty: 'No quizzes available',
      emptyDescription: 'Check back later for new quizzes',
      error: 'Failed to load quizzes',
      questions: 'Questions',
      duration: 'Duration',
      minutes: 'min',
      attempts: 'Attempts',
      remaining: 'remaining',
    },
    ar: {
      title: 'مركز الاختبارات',
      description: 'استكشف وخذ الاختبارات المتاحة لاختبار معرفتك',
      loading: 'جاري تحميل الاختبارات...',
      empty: 'لا توجد اختبارات متاحة',
      emptyDescription: 'تحقق لاحقاً من الاختبارات الجديدة',
      error: 'فشل في تحميل الاختبارات',
      questions: 'أسئلة',
      duration: 'المدة',
      minutes: 'دقيقة',
      attempts: 'المحاولات',
      remaining: 'متبقية',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.en;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch quizzes and attempts in parallel
        const [quizzesResponse, attemptsArray] = await Promise.all([
          QuizService.getAll(),
          QuizService.getMyAttempts(),
        ]);

        // Build attempts count map per quiz
        const attemptsCountMap = new Map<string, number>();
        if (Array.isArray(attemptsArray)) {
          attemptsArray.forEach((attempt: any) => {
            const quizIdKey = String(attempt.quizId || attempt.quiz_id || '');
            const count = attemptsCountMap.get(quizIdKey) || 0;
            attemptsCountMap.set(quizIdKey, count + 1);
          });
        }

        // Handle different response formats
        let quizData: any[] = [];
        if (Array.isArray(quizzesResponse)) {
          quizData = quizzesResponse;
        } else if (quizzesResponse?.data && Array.isArray(quizzesResponse.data)) {
          quizData = quizzesResponse.data;
        }

        // Transform quizzes to display data
        // API may return quizId or id, questions array or totalQuestions count
        const transformedQuizzes: QuizDisplayData[] = quizData.map(
          (quiz: any, index: number) => {
            // Handle both quizId and id
            const quizId = String(quiz.quizId || quiz.id || '');
            const attemptCount = attemptsCountMap.get(quizId) || 0;
            const maxAttempts = quiz.maxAttempts || 1;
            const remaining = Math.max(0, maxAttempts - attemptCount);

            // Handle both questions array and totalQuestions count
            const questionsCount = quiz.totalQuestions ?? quiz.questions?.length ?? 0;

            return {
              id: quizId,
              title: quiz.title || 'Untitled Quiz',
              course: quiz.course?.code || quiz.course?.name || quiz.courseName || 'Course',
              questionsCount: questionsCount,
              duration: `${quiz.timeLimitMinutes || quiz.duration || 30} min`,
              difficulty: getDifficultyLevel(quiz.quizType || quiz.difficulty || 'practice'),
              color: QUIZ_COLORS[index % QUIZ_COLORS.length],
              remainingAttempts: remaining,
              maxAttempts: maxAttempts,
            };
          }
        );

        setQuizzes(transformedQuizzes);
      } catch (err) {
        console.error('Failed to load quizzes:', err);
        const errorMessage = err instanceof Error ? err.message : t.error;
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [language, t.error]);

  const handleCardClick = (quizId: string) => {
    const quiz = quizzes.find((q) => q.id === quizId);
    if (quiz && quiz.remainingAttempts === 0) {
      toast.error('No attempts remaining for this quiz');
      return;
    }
    onStartQuiz(quizId);
  };

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
            <p className={`text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.loading}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && quizzes.length === 0) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t.title}
          </h2>
          <div
            className={`rounded-lg border-2 border-red-500 p-8 text-center ${
              isDark ? 'bg-gray-800' : 'bg-red-50'
            }`}
          >
            <p className={`text-lg ${isDark ? 'text-red-400' : 'text-red-600'}`}>
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (quizzes.length === 0) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-8">
            <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t.title}
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.description}
            </p>
          </div>
          <div
            className={`rounded-lg border-2 border-dashed p-12 text-center ${
              isDark
                ? 'border-gray-700 bg-gray-800'
                : 'border-gray-300 bg-white'
            }`}
          >
            <p className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {t.empty}
            </p>
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              {t.emptyDescription}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main content
  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {t.title}
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {t.description}
          </p>
        </div>

        {/* Grid */}
        <div
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${isRTL ? 'direction-rtl' : ''}`}
          style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        >
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              id={quiz.id}
              title={quiz.title}
              course={quiz.course}
              questionsCount={quiz.questionsCount}
              duration={quiz.duration}
              difficulty={quiz.difficulty}
              maxAttempts={quiz.maxAttempts}
              remainingAttempts={quiz.remainingAttempts}
              color={quiz.color}
              isLoading={loadingQuizId === quiz.id}
              onStart={() => handleCardClick(quiz.id)}
            />
          ))}
        </div>

        {/* Stats Footer */}
        <div className="mt-12 pt-8 border-t border-gray-300 dark:border-gray-700">
          <div className={`flex flex-wrap gap-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            <div>
              <span className="font-semibold">{quizzes.length}</span> quizzes
            </div>
            <div>
              <span className="font-semibold">
                {quizzes.filter((q) => q.remainingAttempts > 0).length}
              </span>{' '}
              available
            </div>
            <div>
              <span className="font-semibold">
                {quizzes.reduce((sum, q) => sum + q.remainingAttempts, 0)}
              </span>{' '}
              {t.attempts} {t.remaining}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizList;

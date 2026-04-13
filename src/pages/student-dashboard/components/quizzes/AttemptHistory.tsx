import { useState, useEffect } from 'react';
import { Loader2, Trophy, Calendar, TrendingUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { QuizService, QuizAttempt } from '../../../../services/api/quizService';

interface AttemptHistoryProps {
  onViewResults?: (attemptId: string, quizId: string) => void;
  limit?: number;
}

const getScoreColor = (pct: number) => {
  if (pct >= 90) return '#10B981';
  if (pct >= 70) return '#3B82F6';
  if (pct >= 50) return '#F59E0B';
  return '#EF4444';
};

const getLetterGrade = (pct: number) => {
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

const formatDate = (dateString: string | null) => {
  if (!dateString) return '';
  const locale = typeof window !== 'undefined' ? (document.dir === 'rtl' ? 'ar-EG' : 'en-US') : 'en-US';
  return new Date(dateString).toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const AttemptHistory: React.FC<AttemptHistoryProps> = ({ onViewResults, limit }) => {
  const { isDark } = useTheme();
  const { language } = useLanguage();
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAttempts();
  }, []);

  const fetchAttempts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await QuizService.getMyAttempts();
      const displayedAttempts = limit ? data.slice(0, limit) : data;
      setAttempts(displayedAttempts);
    } catch (err) {
      console.error('Error fetching attempts:', err);
      setError(language === 'ar' ? 'خطأ في تحميل محاولاتك' : 'Error loading your attempts');
    } finally {
      setLoading(false);
    }
  };

  const isRTL = language === 'ar';

  if (loading) {
    return (
      <div
        className={`rounded-[2.5rem] p-8 backdrop-blur-lg ${
          isDark
            ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50'
            : 'bg-gradient-to-br from-white/50 to-blue-50/50 border border-white/50'
        } flex flex-col items-center justify-center min-h-[400px]`}
      >
        <Loader2 className={`w-8 h-8 animate-spin mb-3 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          {language === 'ar' ? 'جاري التحميل...' : 'Loading...'}
        </p>
      </div>
    );
  }

  if (attempts.length === 0) {
    return (
      <div
        className={`rounded-[2.5rem] p-8 backdrop-blur-lg ${
          isDark
            ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50'
            : 'bg-gradient-to-br from-white/50 to-blue-50/50 border border-white/50'
        } flex flex-col items-center justify-center min-h-[300px]`}
      >
        <Trophy className={`w-12 h-12 mb-3 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
        <p className={`text-lg font-semibold ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {language === 'ar' ? 'لا توجد محاولات بعد' : 'No attempts yet'}
        </p>
        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
          {language === 'ar'
            ? 'ابدأ محاولتك الأولى في إحدى الاختبارات'
            : 'Start your first quiz attempt'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Trophy className={`w-6 h-6 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />
        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {language === 'ar' ? 'النتائج الأخيرة' : 'Recent Results'}
        </h2>
      </div>

      {/* Attempts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {attempts.map((attempt) => {
          // Handle different field naming conventions (camelCase vs snake_case)
          const quizId = (attempt as any).quizId || (attempt as any).quiz_id || '';
          const quizTitle = attempt.quiz?.title || (attempt as any).quiz_title || 'Quiz';
          const courseName = attempt.quiz?.course?.name || (attempt as any).course_name || 'Course';
          
          // Use backend-computed totals when available, with safe numeric fallbacks
          const scoreObtained = Number((attempt as any).score_obtained ?? attempt.score ?? 0);
          const totalScore = Number((attempt as any).total_score ?? (attempt as any).maxScore ?? 0);
          const percentage = Number(
            (attempt as any).score_percentage ??
              (totalScore > 0 ? (scoreObtained / totalScore) * 100 : 0)
          );
          const submittedAt = attempt.submittedAt || (attempt as any).submitted_at;
          
          const grade = getLetterGrade(percentage);
          const scoreColor = getScoreColor(percentage);
          const passed = percentage >= 50;

          return (
            <div
              key={attempt.id}
              onClick={() => onViewResults?.(attempt.id, quizId)}
              className={`rounded-[2.5rem] p-6 backdrop-blur-lg cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                isDark
                  ? 'bg-gradient-to-br from-gray-800/50 to-gray-900/50 border border-gray-700/50 hover:border-gray-600/50'
                  : 'bg-gradient-to-br from-white/50 to-blue-50/50 border border-white/50 hover:border-blue-200/50'
              }`}
            >
              {/* Top Section: Title and Grade Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {quizTitle}
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {courseName}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                    isDark ? 'bg-gray-700/50' : 'bg-gray-200/50'
                  }`}
                  style={{ color: scoreColor }}
                >
                  {grade}
                </div>
              </div>

              {/* Date Section */}
              <div className="flex items-center gap-2 mb-4">
                <Calendar className={`w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {formatDate(submittedAt)}
                </p>
              </div>

              {/* Score Progress Bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {language === 'ar' ? 'النتيجة' : 'Score'}
                  </p>
                  <p className={`text-sm font-bold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {scoreObtained.toFixed(1)} / {totalScore.toFixed(1)}
                  </p>
                </div>
                <div
                  className={`w-full h-2 rounded-full overflow-hidden ${
                    isDark ? 'bg-gray-700/50' : 'bg-gray-300/50'
                  }`}
                >
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: scoreColor,
                    }}
                  />
                </div>
              </div>

              {/* Percentage and Status Section */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp
                    className="w-4 h-4"
                    style={{ color: scoreColor }}
                  />
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {percentage.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      passed
                        ? isDark
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-green-100 text-green-700'
                        : isDark
                          ? 'bg-red-500/20 text-red-300'
                          : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {passed ? (language === 'ar' ? 'نجاح' : 'Passed') : (language === 'ar' ? 'فشل' : 'Failed')}
                  </span>
                </div>
              </div>

              {/* Action Link */}
              {onViewResults && (
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onViewResults(attempt.id, quizId);
                    }}
                    className={`text-sm font-semibold transition-colors ${
                      isDark
                        ? 'text-blue-400 hover:text-blue-300'
                        : 'text-blue-600 hover:text-blue-700'
                    }`}
                  >
                    {language === 'ar' ? 'عرض النتائج' : 'View Results'} →
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AttemptHistory;

import { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useApi, useMutation } from '../../../hooks/useApi';
import { quizService } from '../../../services/api/quizService';
import { LoadingSkeleton } from '../../../components/shared';
import {
  ClipboardCheck,
  Clock,
  ChevronLeft,
  ChevronRight,
  SkipForward,
  Send,
  RotateCcw,
  Grid3X3,
  X,
  CheckCircle,
  XCircle,
  Minus,
  Trophy,
  BookOpen,
  AlertTriangle,
  BarChart3,
  Database,
  Settings,
  Bot,
} from 'lucide-react';

// --- Types & Helpers ---

interface QuizItem {
  id: number;
  title: string;
  course: string;
  questions: number;
  duration: string;
  difficulty: string;
  icon: React.ReactNode;
  color: string;
}

interface QuestionItem {
  id: number;
  text: string;
  type: 'mcq' | 'tf';
  options: string[];
  correct: number;
}

const quizColors = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];
const quizIconComponents = [BarChart3, Database, Settings, Bot, BookOpen, ClipboardCheck];

type View = 'selection' | 'active' | 'results';

const getDifficultyColor = (d: string) => {
  if (d === 'Easy') return 'text-green-600 bg-green-100 border-green-200';
  if (d === 'Medium') return 'text-amber-600 bg-amber-100 border-amber-200';
  return 'text-red-600 bg-red-100 border-red-200';
};

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

// --- Component ---

export const QuizTaking = () => {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { isRTL } = useLanguage();

  // API data
  const { data: apiQuizzes, loading: quizzesLoading } = useApi(() => quizService.listQuizzes(), []);
  const { data: apiAttempts, loading: attemptsLoading, refetch: refetchAttempts } = useApi(() => quizService.getMyAttempts(), []);
  const { mutate: doStartAttempt } = useMutation((quizId: number) => quizService.startAttempt(quizId));
  const { mutate: doSubmitAttempt } = useMutation(
    (params: { attemptId: number; answers: { questionId: number; answer: string }[] }) =>
      quizService.submitAttempt(params.attemptId, params.answers)
  );

  const [view, setView] = useState<View>('selection');
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [skippedQuestions, setSkippedQuestions] = useState<Set<number>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [currentAttemptId, setCurrentAttemptId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);

  // Map API quizzes to display format
  const mappedQuizzes: QuizItem[] = (apiQuizzes || []).map((q, i) => {
    const Icon = quizIconComponents[i % quizIconComponents.length];
    return {
      id: q.id,
      title: q.title,
      course: `Course ${q.courseId}`,
      questions: q.questions?.length || 0,
      duration: `${q.duration} min`,
      difficulty: q.totalPoints >= 80 ? 'Hard' : q.totalPoints >= 40 ? 'Medium' : 'Easy',
      icon: <Icon className="w-6 h-6" />,
      color: quizColors[i % quizColors.length],
    };
  });

  // Map API attempts to recent results
  const mappedResults = (apiAttempts || [])
    .filter((a) => a.submittedAt && a.score !== undefined)
    .slice(0, 4)
    .map((a) => {
      const quiz = (apiQuizzes || []).find((q) => q.id === a.quizId);
      const total = quiz?.totalPoints || 100;
      const score = a.score || 0;
      const pct = Math.round((score / total) * 100);
      return {
        title: quiz?.title || `Quiz #${a.quizId}`,
        course: quiz ? `Course ${quiz.courseId}` : '',
        score,
        total,
        grade: getLetterGrade(pct),
        date: a.submittedAt
          ? new Date(a.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          : '',
      };
    });

  const currentQuestion = questions[currentQuestionIndex];

  // Timer
  useEffect(() => {
    if (view !== 'active') return;
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft((t) => (t <= 1 ? 0 : t - 1)), 1000);
    return () => clearInterval(timer);
  }, [view, timeLeft]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const startQuiz = async (quiz: QuizItem) => {
    try {
      const attempt = await doStartAttempt(quiz.id);
      setCurrentAttemptId(attempt?.id ?? null);

      const fullQuiz = await quizService.getQuiz(quiz.id);
      const mapped: QuestionItem[] = (fullQuiz.questions || []).map((q) => ({
        id: q.id,
        text: q.questionText,
        type: (q.type?.toLowerCase().includes('true') || q.type?.toLowerCase() === 'tf' ? 'tf' : 'mcq') as 'mcq' | 'tf',
        options: q.options?.map((o) => o.text) || [],
        correct: q.options?.findIndex((o) => o.isCorrect) ?? -1,
      }));

      setQuestions(mapped);
      setActiveQuiz(quiz);
      setCurrentQuestionIndex(0);
      setAnswers({});
      setSkippedQuestions(new Set());
      setTimeLeft(fullQuiz.duration * 60);
      setView('active');
    } catch (error) {
      console.error('Failed to start quiz:', error);
    }
  };

  const selectAnswer = (optionIndex: number) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: optionIndex }));
    setSkippedQuestions((prev) => {
      const next = new Set(prev);
      next.delete(currentQuestion.id);
      return next;
    });
  };

  const skipQuestion = () => {
    if (!currentQuestion) return;
    if (!(currentQuestion.id in answers)) {
      setSkippedQuestions((prev) => new Set(prev).add(currentQuestion.id));
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    }
  };

  const submitQuiz = useCallback(async () => {
    if (currentAttemptId) {
      try {
        const formattedAnswers = Object.entries(answers).map(([qId, optIdx]) => ({
          questionId: Number(qId),
          answer: String(optIdx),
        }));
        await doSubmitAttempt({ attemptId: currentAttemptId, answers: formattedAnswers });
        refetchAttempts();
      } catch (error) {
        console.error('Failed to submit quiz:', error);
      }
    }
    setView('results');
  }, [currentAttemptId, answers, doSubmitAttempt, refetchAttempts]);

  // Auto-submit on timer end
  useEffect(() => {
    if (view === 'active' && timeLeft === 0) submitQuiz();
  }, [view, timeLeft, submitQuiz]);

  const computeResults = () => {
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    questions.forEach((q) => {
      if (answers[q.id] !== undefined) {
        if (answers[q.id] === q.correct) correct++;
        else wrong++;
      } else {
        skipped++;
      }
    });
    const total = questions.length || 1;
    const pct = Math.round((correct / total) * 100);
    return { correct, wrong, skipped, pct, grade: getLetterGrade(pct) };
  };

  const retakeQuiz = () => { if (activeQuiz) startQuiz(activeQuiz); };
  const backToQuizzes = () => setView('selection');

  const cardClass = isDark ? 'bg-card-dark border border-white/5' : 'glass border border-slate-100';
  const textPrimary = isDark ? 'text-white' : 'text-slate-800';
  const textSecondary = isDark ? 'text-slate-400' : 'text-slate-500';
  const optionBase = isDark
    ? 'border-white/10 hover:border-white/20'
    : 'border-slate-200 hover:border-slate-300';

  // ===================== VIEW 1: Quiz Selection =====================
  if (view === 'selection') {
    return (
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Header */}
        <div className="bg-gradient-to-br from-[var(--accent-color)] via-blue-600 to-blue-700 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center gap-3 mb-3">
            <ClipboardCheck className="w-8 h-8" />
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">Quiz Center</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Quiz Center</h1>
          <p className="text-blue-100 text-lg">Test Your Knowledge</p>
        </div>

        {/* Available Quizzes */}
        <div>
          <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Available Quizzes</h2>
          {quizzesLoading ? (
            <LoadingSkeleton variant="card" count={4} />
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mappedQuizzes.map((quiz) => (
              <div
                key={quiz.id}
                className={`${cardClass} rounded-[2.5rem] p-6 transition-all hover:shadow-lg`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${quiz.color}15`, color: quiz.color }}
                  >
                    {quiz.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold ${textPrimary} truncate`}>{quiz.title}</h3>
                    <span
                      className="inline-block mt-1 text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${quiz.color}20`, color: quiz.color }}
                    >
                      {quiz.course}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm mb-4">
                  <div className={`flex items-center gap-1 ${textSecondary}`}>
                    <BookOpen className="w-4 h-4" />
                    <span>{quiz.questions} questions</span>
                  </div>
                  <div className={`flex items-center gap-1 ${textSecondary}`}>
                    <Clock className="w-4 h-4" />
                    <span>{quiz.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getDifficultyColor(quiz.difficulty)}`}
                  >
                    {quiz.difficulty}
                  </span>
                  <button
                    onClick={() => startQuiz(quiz)}
                    className="px-5 py-2 rounded-xl bg-[var(--accent-color)] text-white text-sm font-medium hover:opacity-90 transition-colors"
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Recent Results */}
        <div>
          <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>Recent Results</h2>
          {attemptsLoading ? (
            <LoadingSkeleton variant="card" count={2} />
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mappedResults.map((r, idx) => {
              const pct = Math.round((r.score / r.total) * 100);
              return (
                <div key={idx} className={`${cardClass} rounded-[2.5rem] p-6`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className={`font-semibold ${textPrimary}`}>{r.title}</h3>
                      <span className={`text-xs ${textSecondary}`}>
                        {r.course} · {r.date}
                      </span>
                    </div>
                    <span
                      className="text-lg font-bold px-3 py-1 rounded-xl"
                      style={{
                        backgroundColor: `${getScoreColor(pct)}15`,
                        color: getScoreColor(pct),
                      }}
                    >
                      {r.grade}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex-1 h-2.5 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}
                    >
                      <div
                        className="h-2.5 rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: getScoreColor(pct) }}
                      />
                    </div>
                    <span className={`text-sm font-semibold ${textPrimary}`}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      </div>
    );
  }

  // ===================== VIEW 2: Quiz Active =====================
  if (view === 'active') {
    if (!activeQuiz || !currentQuestion) return null;
    const answeredCount = Object.keys(answers).length;
    const progressPct = (answeredCount / (questions.length || 1)) * 100;

    return (
      <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Top Bar */}
        <div
          className={`${cardClass} rounded-[2.5rem] p-4 flex items-center justify-between flex-wrap gap-3`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowExitConfirm(true)}
              className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'} transition-colors`}
            >
              <ChevronLeft className={`w-5 h-5 ${textPrimary}`} />
            </button>
            <span className="text-sm font-medium" style={{ color: activeQuiz.color }}>
              {activeQuiz.course}
            </span>
          </div>

          <span className={`text-sm font-semibold ${textPrimary}`}>
            Question {currentQuestionIndex + 1} / {questions.length}
          </span>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${timeLeft <= 60 ? 'bg-red-500/10 text-red-500' : isDark ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-700'}`}
            >
              <Clock className="w-4 h-4" />
              <span className="font-mono font-semibold text-sm">{formatTime(timeLeft)}</span>
            </div>
            <button
              onClick={() => setShowNavigator(true)}
              className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'} transition-colors`}
            >
              <Grid3X3 className={`w-5 h-5 ${textPrimary}`} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className={`${cardClass} rounded-2xl p-3`}>
          <div className="flex items-center justify-between mb-1.5">
            <span className={`text-xs font-medium ${textSecondary}`}>
              {answeredCount} of {questions.length} answered
            </span>
            <span className={`text-xs font-medium ${textSecondary}`}>
              {Math.round(progressPct)}%
            </span>
          </div>
          <div className={`w-full h-2 rounded-full ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
            <div
              className="h-2 rounded-full bg-[var(--accent-color)] transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className={`${cardClass} rounded-[2.5rem] p-6 sm:p-8`}>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 rounded-lg bg-[var(--accent-color)] text-white text-sm font-bold flex items-center justify-center">
              {currentQuestion.id}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${currentQuestion.type === 'mcq' ? 'bg-blue-100 text-blue-700' : 'bg-blue-100 text-blue-700'}`}
            >
              {currentQuestion.type === 'mcq' ? 'Multiple Choice' : 'True / False'}
            </span>
          </div>

          <h2 className={`text-xl font-bold mb-6 ${textPrimary}`}>{currentQuestion.text}</h2>

          <div className="space-y-3">
            {currentQuestion.options.map((opt, idx) => {
              const isSelected = answers[currentQuestion.id] === idx;
              const label = currentQuestion.type === 'mcq' ? String.fromCharCode(65 + idx) : '';
              return (
                <button
                  key={idx}
                  onClick={() => selectAnswer(idx)}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                    isSelected
                      ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10'
                      : optionBase
                  }`}
                >
                  {currentQuestion.type === 'mcq' && (
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                        isSelected
                          ? 'bg-[var(--accent-color)] text-white'
                          : isDark
                            ? 'bg-white/10 text-slate-400'
                            : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {label}
                    </span>
                  )}
                  <span
                    className={`font-medium ${isSelected ? 'text-[var(--accent-color)]' : textPrimary}`}
                  >
                    {opt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentQuestionIndex((i) => i - 1)}
            disabled={currentQuestionIndex === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-colors ${
              currentQuestionIndex === 0
                ? 'opacity-40 cursor-not-allowed'
                : isDark
                  ? 'hover:bg-white/10'
                  : 'hover:bg-slate-100'
            } ${textPrimary}`}
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <button
            onClick={skipQuestion}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/10 text-amber-600 font-medium text-sm hover:bg-amber-500/20 transition-colors"
          >
            <SkipForward className="w-4 h-4" /> Skip
          </button>

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex((i) => i + 1)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-color)] text-white font-medium text-sm hover:opacity-90 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submitQuiz}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10B981] text-white font-medium text-sm hover:bg-[#059669] transition-colors"
            >
              <Send className="w-4 h-4" /> Submit
            </button>
          )}
        </div>

        {/* Question Navigator Modal */}
        {showNavigator && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
              className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} rounded-[2.5rem] p-6 w-full max-w-md shadow-2xl`}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className={`font-bold text-lg ${textPrimary}`}>Question Navigator</h3>
                <button
                  onClick={() => setShowNavigator(false)}
                  className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
                >
                  <X className={`w-5 h-5 ${textPrimary}`} />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-5">
                {questions.map((q, idx) => {
                  const isAnswered = answers[q.id] !== undefined;
                  const isSkipped = skippedQuestions.has(q.id);
                  const isCurrent = idx === currentQuestionIndex;
                  let bg = isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-500';
                  if (isCurrent) bg = 'bg-[var(--accent-color)] text-white';
                  else if (isAnswered) bg = 'bg-[#10B981] text-white';
                  else if (isSkipped) bg = 'bg-[#F59E0B] text-white';
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentQuestionIndex(idx);
                        setShowNavigator(false);
                      }}
                      className={`w-full aspect-square rounded-xl font-semibold text-sm flex items-center justify-center transition-all hover:scale-105 ${bg}`}
                    >
                      {q.id}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap gap-3 text-xs">
                {[
                  { color: 'bg-[#10B981]', label: 'Answered' },
                  { color: 'bg-[#F59E0B]', label: 'Skipped' },
                  { color: 'bg-[var(--accent-color)]', label: 'Current' },
                  { color: isDark ? 'bg-white/10' : 'bg-slate-200', label: 'Unanswered' },
                ].map((l) => (
                  <div key={l.label} className={`flex items-center gap-1.5 ${textSecondary}`}>
                    <span className={`w-3 h-3 rounded ${l.color}`} />
                    {l.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Exit Confirmation Modal */}
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div
              className={`${isDark ? 'bg-[#1a1a2e]' : 'bg-white'} rounded-[2.5rem] p-6 w-full max-w-sm shadow-2xl text-center`}
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
                <AlertTriangle className="w-7 h-7 text-amber-500" />
              </div>
              <h3 className={`font-bold text-lg mb-2 ${textPrimary}`}>Leave Quiz?</h3>
              <p className={`text-sm mb-6 ${textSecondary}`}>
                Your progress will be lost. Are you sure you want to exit?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitConfirm(false)}
                  className={`flex-1 py-2.5 rounded-xl font-medium text-sm ${isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'} transition-colors`}
                >
                  Continue Quiz
                </button>
                <button
                  onClick={() => {
                    setShowExitConfirm(false);
                    backToQuizzes();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors"
                >
                  Exit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ===================== VIEW 3: Quiz Results =====================
  const results = computeResults();
  const scoreColor = getScoreColor(results.pct);
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (results.pct / 100) * circumference;

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Results Card */}
      <div className={`${cardClass} rounded-[2.5rem] p-6 sm:p-8`}>
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-4">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}
                strokeWidth="8"
              />
              <circle
                cx="60"
                cy="60"
                r="54"
                fill="none"
                stroke={scoreColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-3xl font-bold ${textPrimary}`}>{results.pct}%</span>
              <span className={`text-xs ${textSecondary}`}>
                {Object.keys(answers).length} / {questions.length}
              </span>
            </div>
          </div>

          <h2 className={`text-2xl font-bold mb-1 ${textPrimary}`}>
            {results.pct >= 70
              ? 'Great Job!'
              : results.pct >= 50
                ? 'Good Effort!'
                : 'Keep Practicing!'}
          </h2>
          <span
            className="text-lg font-bold px-4 py-1 rounded-xl"
            style={{ backgroundColor: `${scoreColor}15`, color: scoreColor }}
          >
            Grade: {results.grade}
          </span>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-2">
          {[
            { label: 'Correct', value: results.correct, icon: CheckCircle, color: '#10B981' },
            { label: 'Wrong', value: results.wrong, icon: XCircle, color: '#EF4444' },
            { label: 'Skipped', value: results.skipped, icon: Minus, color: '#F59E0B' },
          ].map((s) => (
            <div
              key={s.label}
              className={`${isDark ? 'bg-white/5' : 'bg-slate-50'} rounded-2xl p-4 text-center`}
            >
              <s.icon className="w-6 h-6 mx-auto mb-1" style={{ color: s.color }} />
              <div className={`text-xl font-bold ${textPrimary}`}>{s.value}</div>
              <div className={`text-xs ${textSecondary}`}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Question Review */}
      <div className={`${cardClass} rounded-[2.5rem] overflow-hidden`}>
        <div
          className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}
        >
          <h3 className={`font-semibold ${textPrimary} flex items-center gap-2`}>
            <BookOpen className="w-5 h-5 text-[var(--accent-color)]" />
            Question Review
          </h3>
        </div>
        <div className="p-4 space-y-3">
          {questions.map((q) => {
            const userAnswer = answers[q.id];
            const isCorrect = userAnswer === q.correct;
            const isSkippedQ = userAnswer === undefined;

            return (
              <div
                key={q.id}
                className={`p-4 rounded-2xl border ${
                  isSkippedQ
                    ? isDark
                      ? 'border-amber-500/20 bg-amber-500/5'
                      : 'border-amber-200 bg-amber-50'
                    : isCorrect
                      ? isDark
                        ? 'border-green-500/20 bg-green-500/5'
                        : 'border-green-200 bg-green-50'
                      : isDark
                        ? 'border-red-500/20 bg-red-500/5'
                        : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {isSkippedQ ? (
                      <Minus className="w-5 h-5 text-amber-500" />
                    ) : isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium mb-1 ${textPrimary}`}>
                      <span className={textSecondary}>Q{q.id}.</span> {q.text}
                    </p>
                    <div className={`text-xs space-y-0.5 ${textSecondary}`}>
                      {!isSkippedQ && (
                        <p>
                          Your answer:{' '}
                          <span
                            className={
                              isCorrect ? 'text-green-500 font-medium' : 'text-red-500 font-medium'
                            }
                          >
                            {q.options[userAnswer]}
                          </span>
                        </p>
                      )}
                      {(isSkippedQ || !isCorrect) && (
                        <p>
                          Correct answer:{' '}
                          <span className="text-green-500 font-medium">{q.options[q.correct]}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={retakeQuiz}
          className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[var(--accent-color)] text-white font-medium text-sm hover:opacity-90 transition-colors"
        >
          <RotateCcw className="w-4 h-4" /> Retake Quiz
        </button>
        <button
          onClick={backToQuizzes}
          className={`flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium text-sm transition-colors ${
            isDark
              ? 'bg-white/10 text-white hover:bg-white/15'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Trophy className="w-4 h-4" /> Back to Quizzes
        </button>
      </div>
    </div>
  );
};

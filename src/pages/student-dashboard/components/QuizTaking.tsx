import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
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
  Loader2,
  Check,
} from 'lucide-react';
import { useApi } from '../../../hooks/useApi';
import { useQuizTimer } from '../../../hooks/useQuizTimer';
import { QuizService } from '../../../services/api/quizService';
import { toast } from 'sonner';

// --- Mock Data ---

const defaultAvailableQuizzes: any[] = [];

const mockQuestions: any[] = [];

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
  const { isRTL, t, language } = useLanguage();
  const hasToken = !!localStorage.getItem('accessToken');

  // Locale-aware date formatting helper
  const formatDate = (
    dateString: string | null | undefined,
    options?: Intl.DateTimeFormatOptions
  ) => {
    if (!dateString) return '';
    const locale = language === 'ar' ? 'ar-EG' : 'en-US';
    const defaultOptions: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(locale, options || defaultOptions);
  };

  // Fetch quizzes from API - returns { data: Quiz[], total: number }
  const { data: apiResponse, loading } = useApi(async () => {
    if (!hasToken) return null;
    try {
      return await QuizService.getAll();
    } catch (err) {
      console.warn('Failed to load quizzes for Student Dashboard:', err);
      return null;
    }
  }, []);

  const QUIZ_ICONS = [
    <BarChart3 className="w-6 h-6" />,
    <Database className="w-6 h-6" />,
    <Settings className="w-6 h-6" />,
    <Bot className="w-6 h-6" />,
  ];
  const QUIZ_COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4'];

  const mappedQuizzes = (() => {
    if (!apiResponse?.data || apiResponse.data.length === 0) return [];
    return apiResponse.data.map((q: any, i: number) => ({
      id: q.id, // String ID from API
      title: q.title,
      course: q.course?.code || q.course?.name || `Course ${q.courseId}`,
      questions: q.questions?.length || 0,
      duration: `${q.timeLimitMinutes || 30} min`,
      timeLimitMinutes: q.timeLimitMinutes || 30,
      difficulty: q.quizType === 'graded' ? 'Medium' : 'Easy',
      quizType: q.quizType,
      maxAttempts: q.maxAttempts,
      passingScore: parseFloat(q.passingScore || '50'),
      showCorrectAnswers: q.showCorrectAnswers,
      icon: QUIZ_ICONS[i % QUIZ_ICONS.length],
      color: QUIZ_COLORS[i % QUIZ_COLORS.length],
    }));
  })();

  const availableQuizzes = mappedQuizzes;
  const [recentGradedAttempts, setRecentGradedAttempts] = useState<any[]>([]);

  const [view, setView] = useState<View>('selection');
  const [activeQuiz, setActiveQuiz] = useState(availableQuizzes[0]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [skippedQuestions, setSkippedQuestions] = useState<Set<string>>(new Set());
  const [showNavigator, setShowNavigator] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [autoSaveIndicator, setAutoSaveIndicator] = useState(false);

  // API state for quiz attempt
  const [currentAttempt, setCurrentAttempt] = useState<any>(null);
  const [currentAttemptId, setCurrentAttemptId] = useState<string>('');
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [startingQuiz, setStartingQuiz] = useState(false);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizResult, setQuizResult] = useState<any>(null);
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);
  const [timeLimit, setTimeLimit] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState<Record<string, number>>({}); // Track remaining attempts per quiz

  // Auto-save tracking
  const lastAutoSaveRef = useRef<Record<string, any>>({});

  const questions = quizQuestions.length > 0 ? quizQuestions : mockQuestions;
  const currentQuestion = questions[currentQuestionIndex];

  // Load remaining attempts for all quizzes and recent results
  useEffect(() => {
    const loadAttempts = async () => {
      if (!hasToken || !apiResponse?.data) return;
      try {
        const myAttempts = await QuizService.getMyAttempts();
        const attemptsByQuiz: Record<string, number> = {};

        apiResponse.data.forEach((quiz: any) => {
          const quizAttempts = myAttempts.filter((a) => a.quizId === quiz.id).length;
          const remaining = Math.max(0, quiz.maxAttempts - quizAttempts);
          attemptsByQuiz[quiz.id] = remaining;
        });

        setQuizAttempts(attemptsByQuiz);

        // Get recent graded attempts for results display
        const gradedAttempts = myAttempts
          .filter((a) => a.status === 'graded' && a.submittedAt)
          .sort((a, b) => new Date(b.submittedAt!).getTime() - new Date(a.submittedAt!).getTime())
          .slice(0, 5)
          .map((attempt) => {
            const quiz = attempt.quiz;
            const score = parseFloat(attempt.score || '0');
            // Calculate max score from questions if available, or use a default
            const maxScore = quiz?.questions?.reduce((sum: number, q: any) => sum + parseFloat(q.points || '10'), 0) || 100;
            const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
            return {
              title: quiz?.title || 'Quiz',
              course: quiz?.course?.code || `Course`,
              score,
              total: maxScore,
              pct,
              grade: getLetterGrade(pct),
              date: attempt.submittedAt,
            };
          });

        setRecentGradedAttempts(gradedAttempts);
      } catch (err) {
        console.warn('Failed to load attempt counts:', err);
      }
    };

    loadAttempts();
  }, [apiResponse, hasToken]);

  // Auto-submit function - to be passed to timer
  const handleTimeExpired = useCallback(async () => {
    if (submittingQuiz) return; // Prevent double-submit
    await submitQuiz();
  }, [submittingQuiz]);

  // Auto-save function for useQuizTimer
  const handleAutoSave = useCallback(async () => {
    if (!currentAttemptId || !currentAttempt) {
      console.warn('Cannot auto-save: no active attempt');
      return;
    }

    try {
      // Transform answers to API format - send index for MCQ
      const answersArray = quizQuestions
        .map((q: any) => {
          const value = answers[String(q.id)];

          if (q.questionType === 'mcq') {
            // value is the selected option text, find its index
            const selectedIndex = q.options?.findIndex((opt: string) => opt === value);
            return {
              questionId: Number(q.id),
              selectedOption: selectedIndex !== undefined && selectedIndex >= 0 ? [String(selectedIndex)] : [],
              answerText: undefined,
            };
          } else if (q.questionType === 'true_false') {
            const tfIndex = value === 'True' ? '0' : value === 'False' ? '1' : undefined;
            return {
              questionId: Number(q.id),
              selectedOption: tfIndex ? [tfIndex] : [],
              answerText: undefined,
            };
          } else {
            return {
              questionId: Number(q.id),
              selectedOption: undefined,
              answerText: value || '',
            };
          }
        })
        .filter((a: any) => (a.selectedOption && a.selectedOption.length > 0) || a.answerText);

      // Only save if answers have changed
      const currentAnswerHash = JSON.stringify(answersArray);
      if (currentAnswerHash === JSON.stringify(lastAutoSaveRef.current)) {
        return; // No changes, skip save
      }

      setAutoSaveIndicator(true);
      await QuizService.saveProgress(currentAttempt.quizId, currentAttemptId, answersArray);
      lastAutoSaveRef.current = answersArray;
      toast.success('Auto-saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
      toast.error('Auto-save failed');
    } finally {
      setAutoSaveIndicator(false);
    }
  }, [currentAttemptId, currentAttempt, quizQuestions, answers]);

  // Use timer hook only when quiz is active and has a time limit
  const {
    timeRemaining,
    isExpired,
    timeRemainingFormatted,
    isAutoSaving,
    reset: resetTimer,
  } = useQuizTimer({
    timeLimit: timeLimit || 0,
    onTimeExpired: handleTimeExpired,
    onAutoSave: handleAutoSave,
    autoSaveInterval: 30,
  });

  const startQuiz = async (quiz: (typeof availableQuizzes)[0]) => {
    setStartingQuiz(true);
    try {
      // First, fetch the full quiz with questions
      const fullQuiz = await QuizService.getById(quiz.id);
      
      // Check for existing in-progress attempt to resume
      const existingAttempt = await QuizService.getInProgressAttempt(quiz.id);

      let attempt;
      let questionsFromAttempt: any[] = [];
      let savedAnswers: Record<string, any> = {};

      if (existingAttempt) {
        // Resume existing attempt
        toast.info('Resuming quiz...');
        attempt = existingAttempt;

        // Get attempt details with questions and saved answers
        const attemptDetails = await QuizService.getAttempt(quiz.id, existingAttempt.id);
        // Use questions from fullQuiz if attempt doesn't have them
        questionsFromAttempt = attemptDetails.questions || existingAttempt.questions || fullQuiz.questions || [];

        // Restore saved answers if available
        if (attemptDetails.answers) {
          attemptDetails.answers.forEach((ans: any) => {
            // Convert stored index back to option text for MCQ display
            const question = questionsFromAttempt.find((q: any) => String(q.id) === String(ans.questionId));
            if (question && question.options && ans.selectedOption) {
              const idx = parseInt(ans.selectedOption, 10);
              if (!isNaN(idx) && question.options[idx]) {
                savedAnswers[ans.questionId] = question.options[idx];
              }
            } else if (ans.answerText) {
              savedAnswers[ans.questionId] = ans.answerText;
            }
          });
        }
      } else {
        // Start new attempt
        attempt = await QuizService.startAttempt(quiz.id);
        // Use questions from fullQuiz or attempt
        questionsFromAttempt = attempt.questions || fullQuiz.questions || [];
      }

      // Update active quiz with full details
      const updatedQuiz = {
        ...quiz,
        questions: questionsFromAttempt.length,
        timeLimitMinutes: fullQuiz.timeLimitMinutes || quiz.timeLimitMinutes || 30,
        passingScore: parseFloat(fullQuiz.passingScore || '50'),
        showCorrectAnswers: fullQuiz.showCorrectAnswers,
      };

      setCurrentAttempt(attempt);
      setCurrentAttemptId(attempt.id);
      setQuizQuestions(questionsFromAttempt);
      setActiveQuiz(updatedQuiz);
      setCurrentQuestionIndex(0);
      setAnswers(savedAnswers);
      setSkippedQuestions(new Set());
      lastAutoSaveRef.current = {};

      // Set timer - calculate remaining time for resumed attempts
      const startTime = new Date(attempt.startedAt).getTime();
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const totalTimeLimitSeconds = (fullQuiz.timeLimitMinutes || 30) * 60;
      const remainingTime = Math.max(0, totalTimeLimitSeconds - elapsedSeconds);
      setTimeLimit(existingAttempt ? remainingTime : totalTimeLimitSeconds);

      // Calculate remaining attempts
      const maxAttempts = fullQuiz.maxAttempts || quiz.maxAttempts || 1;
      const myAttempts = (await QuizService.getMyAttempts(quiz.id)) || [];
      const remaining = Math.max(0, maxAttempts - myAttempts.length);
      setRemainingAttempts(remaining);

      setView('active');
    } catch (error: any) {
      console.error('Failed to start quiz:', error);
      // Check if it's max attempts error
      if (error.message?.includes('Maximum attempts')) {
        toast.error('Maximum attempts reached');
      } else {
        toast.error('Failed to start quiz. Please try again.');
      }
    } finally {
      setStartingQuiz(false);
    }
  };

  const selectAnswer = (selectedValue: any) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: selectedValue }));
    setSkippedQuestions((prev) => {
      const next = new Set(prev);
      next.delete(String(currentQuestion.id));
      return next;
    });
  };

  const skipQuestion = () => {
    if (!(String(currentQuestion.id) in answers)) {
      setSkippedQuestions((prev) => new Set(prev).add(String(currentQuestion.id)));
    }
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((i) => i + 1);
    }
  };

  const submitQuiz = useCallback(async () => {
    if (!currentAttempt || !currentAttemptId) {
      console.error('No active attempt to submit');
      return;
    }

    setSubmittingQuiz(true);
    try {
      // Transform answers to API format
      // For MCQ: send the INDEX of the selected option as string
      const answersArray = quizQuestions
        .map((q: any) => {
          const value = answers[String(q.id)];

          if (q.questionType === 'mcq') {
            // value is the selected option text, find its index
            const selectedIndex = q.options?.findIndex((opt: string) => opt === value);
            return {
              questionId: Number(q.id),
              selectedOption: selectedIndex !== undefined && selectedIndex >= 0 ? [String(selectedIndex)] : [],
              answerText: null,
            };
          } else if (q.questionType === 'true_false') {
            // For true/false, value should be 'true' or 'false' or index
            const tfIndex = value === 'True' ? '0' : value === 'False' ? '1' : value;
            return {
              questionId: Number(q.id),
              selectedOption: tfIndex ? [tfIndex] : [],
              answerText: null,
            };
          } else {
            // For short_answer, essay, etc.
            return {
              questionId: Number(q.id),
              selectedOption: null,
              answerText: value || '',
            };
          }
        })
        .filter((a: any) => (a.selectedOption && a.selectedOption.length > 0) || a.answerText);

      // Submit to API
      const result = await QuizService.submitAttempt(
        currentAttempt.quizId,
        currentAttemptId,
        answersArray
      );

      // Build result with question details for review
      const questionsWithResults = quizQuestions.map((q: any) => {
        const userAnswer = answers[String(q.id)];
        const correctAnswerIndex = parseInt(q.correctAnswer || '0', 10);
        const correctAnswerText = q.options?.[correctAnswerIndex] || q.correctAnswer;
        
        // Determine if answer is correct
        let isCorrect = false;
        if (q.questionType === 'mcq' && q.options && userAnswer !== undefined) {
          // Try exact match first
          let selectedIndex = q.options.findIndex((opt: string) => opt === userAnswer);
          // If not found, try trimmed comparison
          if (selectedIndex === -1) {
            selectedIndex = q.options.findIndex((opt: string) => 
              String(opt).trim().toLowerCase() === String(userAnswer).trim().toLowerCase()
            );
          }
          isCorrect = selectedIndex >= 0 && selectedIndex === correctAnswerIndex;
        } else if (q.questionType === 'true_false') {
          const expectedAnswer = correctAnswerIndex === 0 ? 'True' : 'False';
          isCorrect = String(userAnswer).toLowerCase() === expectedAnswer.toLowerCase();
        }

        return {
          questionId: q.id,
          questionText: q.questionText,
          isCorrect,
          userAnswer,
          correctAnswer: correctAnswerText,
          points: parseFloat(q.points || '0'),
        };
      });

      // Calculate score locally from questions
      const totalPoints = questionsWithResults.reduce((sum: number, q: any) => sum + q.points, 0);
      const earnedPoints = questionsWithResults
        .filter((q: any) => q.isCorrect)
        .reduce((sum: number, q: any) => sum + q.points, 0);
      
      // Parse API values (they might be strings like "10.00")
      const apiScore = result?.totalScore !== undefined ? parseFloat(String(result.totalScore)) : NaN;
      const apiMaxScore = result?.maxScore !== undefined ? parseFloat(String(result.maxScore)) : NaN;
      const apiPercentage = result?.percentage !== undefined ? parseFloat(String(result.percentage)) : NaN;
      
      // Use API values if valid, otherwise use calculated values
      const finalScore = !isNaN(apiScore) ? apiScore : earnedPoints;
      const finalMaxScore = !isNaN(apiMaxScore) ? apiMaxScore : totalPoints;
      // Calculate percentage from scores, or use API percentage if both scores are 0/invalid
      const calculatedPercentage = finalMaxScore > 0 ? Math.round((finalScore / finalMaxScore) * 100) : 0;
      const finalPercentage = !isNaN(apiPercentage) && finalScore === 0 && finalMaxScore === 0 
        ? Math.round(apiPercentage) 
        : calculatedPercentage;
      const passingScoreThreshold = parseFloat(String(activeQuiz.passingScore || 50));

      // Calculate passed based on local percentage, don't trust API passed field
      const isPassed = finalPercentage >= passingScoreThreshold;
      
      setQuizResult({
        ...result,
        questions: questionsWithResults,
        score: finalScore,
        maxScore: finalMaxScore,
        percentage: finalPercentage,
        passed: isPassed,
      });
      setView('results');
    } catch (error) {
      console.error('Failed to submit quiz:', error);
      toast.error('Failed to submit quiz. Please try again.');
    } finally {
      setSubmittingQuiz(false);
    }
  }, [currentAttempt, currentAttemptId, answers, quizQuestions, activeQuiz]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const computeResults = () => {
    // If we have API result with questions, use that
    if (quizResult?.questions) {
      const correct = quizResult.questions.filter((q: any) => q.isCorrect).length;
      const wrong = quizResult.questions.filter((q: any) => !q.isCorrect && q.userAnswer).length;
      const skipped = quizResult.questions.filter((q: any) => !q.userAnswer).length;
      // Use ?? instead of || to handle explicit 0 percentage correctly
      const pct = quizResult.percentage ?? 0;
      const passingScore = parseFloat(String(activeQuiz.passingScore || 50));
      
      // Always calculate passed locally based on percentage vs passing score
      const isPassed = Math.round(pct) >= passingScore;
      return {
        correct,
        wrong,
        skipped,
        pct: Math.round(pct),
        grade: getLetterGrade(pct),
        score: quizResult.score,
        maxScore: quizResult.maxScore,
        passed: isPassed,
      };
    }

    // Fallback to local calculation
    let correct = 0;
    let wrong = 0;
    let skipped = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    
    questions.forEach((q: any) => {
      const points = parseFloat(q.points || '1');
      totalPoints += points;
      
      const userAnswer = answers[String(q.id)];
      if (userAnswer !== undefined && userAnswer !== '') {
        // Check correctness based on question type
        if (q.questionType === 'mcq' && q.options && q.correctAnswer !== undefined) {
          const correctAnswerIndex = parseInt(q.correctAnswer, 10);
          const selectedIndex = q.options.findIndex((opt: string) => opt === userAnswer);
          if (selectedIndex === correctAnswerIndex) {
            correct++;
            earnedPoints += points;
          } else {
            wrong++;
          }
        } else if (q.questionType === 'true_false') {
          const correctAnswerIndex = parseInt(q.correctAnswer || '0', 10);
          const expectedAnswer = correctAnswerIndex === 0 ? 'True' : 'False';
          if (userAnswer === expectedAnswer) {
            correct++;
            earnedPoints += points;
          } else {
            wrong++;
          }
        } else if (q.correct !== undefined) {
          // Mock questions with direct correct field
          if (userAnswer === q.correct) {
            correct++;
            earnedPoints += points;
          } else {
            wrong++;
          }
        }
      } else {
        skipped++;
      }
    });
    
    const pct = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passingScore = activeQuiz.passingScore || 50;
    
    return { 
      correct, 
      wrong, 
      skipped, 
      pct, 
      grade: getLetterGrade(pct),
      score: earnedPoints,
      maxScore: totalPoints,
      passed: pct >= passingScore,
    };
  };

  const retakeQuiz = () => startQuiz(activeQuiz);
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
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Quiz Center
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Test your knowledge with interactive quizzes
            </p>
          </div>
        </div>

        {/* Available Quizzes */}
        <div>
          <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>
            Available Quizzes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableQuizzes.map((quiz) => (
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
                  {quiz.maxAttempts && (
                    <div className={`flex items-center gap-1 ${textSecondary}`}>
                      <span className="text-xs">
                        {quizAttempts[quiz.id] || 0}/{quiz.maxAttempts} attempts
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getDifficultyColor(quiz.difficulty)}`}
                  >
                    {quiz.difficulty}
                  </span>
                  <button
                    onClick={() => startQuiz(quiz)}
                    disabled={startingQuiz || (quiz.maxAttempts && quizAttempts[quiz.id] === 0)}
                    title={
                      quiz.maxAttempts && quizAttempts[quiz.id] === 0
                        ? 'No more attempts available'
                        : ''
                    }
                    className="px-5 py-2 rounded-xl bg-[var(--accent-color)] text-white text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {startingQuiz ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      'Start Quiz'
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Results */}
        <div>
          <h2 className={`text-lg font-semibold mb-4 ${textPrimary}`}>
            Recent Results
          </h2>
          {recentGradedAttempts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentGradedAttempts.map((r, idx) => {
                return (
                  <div key={idx} className={`${cardClass} rounded-[2.5rem] p-6`}>
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className={`font-semibold ${textPrimary}`}>{r.title}</h3>
                        <span className={`text-xs ${textSecondary}`}>
                          {r.course} · {formatDate(r.date)}
                        </span>
                      </div>
                      <span
                        className="text-lg font-bold px-3 py-1 rounded-xl"
                        style={{
                          backgroundColor: `${getScoreColor(r.pct)}15`,
                          color: getScoreColor(r.pct),
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
                          style={{ width: `${r.pct}%`, backgroundColor: getScoreColor(r.pct) }}
                        />
                      </div>
                      <span className={`text-sm font-semibold ${textPrimary}`}>{r.pct}%</span>
                    </div>
                    <div className={`text-xs mt-2 ${textSecondary}`}>
                      Score: {r.score}/{r.total} pts
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className={`${cardClass} rounded-[2.5rem] p-6 text-center`}>
              <p className={textSecondary}>No quiz results yet. Take a quiz to see your results here!</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ===================== VIEW 2: Quiz Active =====================
  if (view === 'active') {
    const answeredCount = Object.keys(answers).length;
    const progressPct = (answeredCount / questions.length) * 100;

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
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${timeRemaining <= 60 ? 'bg-red-500/10 text-red-500' : isDark ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-700'}`}
              role="region"
              aria-label="Quiz timer"
              aria-live="polite"
              aria-atomic="true"
            >
              <Clock className="w-4 h-4" />
              <span className="font-mono font-semibold text-sm">{timeRemainingFormatted}</span>
            </div>
            {autoSaveIndicator || isAutoSaving ? (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10 text-green-600">
                <Check className="w-4 h-4" />
                <span className="text-xs font-medium">Auto-saving...</span>
              </div>
            ) : null}
            <button
              onClick={() => setShowNavigator(true)}
              className={`p-2 rounded-xl ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'} transition-colors`}
              aria-label="Open question navigator"
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
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                currentQuestion.questionType === 'mcq'
                  ? 'bg-blue-100 text-blue-700'
                  : currentQuestion.questionType === 'true_false'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-green-100 text-green-700'
              }`}
            >
              {currentQuestion.questionType === 'mcq'
                ? 'Multiple Choice'
                : currentQuestion.questionType === 'true_false'
                  ? 'True / False'
                  : 'Text Answer'}
            </span>
            {currentQuestion.points && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
              >
                {String(currentQuestion.points).replace('.00', '')} pts
              </span>
            )}
          </div>

          <h2 className={`text-xl font-bold mb-6 ${textPrimary}`}>
            {currentQuestion.questionText}
          </h2>

          <div className="space-y-3">
            {currentQuestion.questionType === 'mcq' &&
              currentQuestion.options &&
              currentQuestion.options.map((opt, idx) => {
                const isSelected = answers[String(currentQuestion.id)] === opt;
                const label = String.fromCharCode(65 + idx);
                return (
                  <button
                    key={idx}
                    onClick={() => selectAnswer(opt)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10'
                        : optionBase
                    }`}
                  >
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
                    <span
                      className={`font-medium ${isSelected ? 'text-[var(--accent-color)]' : textPrimary}`}
                    >
                      {opt}
                    </span>
                  </button>
                );
              })}
            {currentQuestion.questionType === 'true_false' &&
              ['True', 'False'].map((opt) => {
                const isSelected = answers[String(currentQuestion.id)] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => selectAnswer(opt)}
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10'
                        : optionBase
                    }`}
                  >
                    <span
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
                        isSelected
                          ? 'bg-[var(--accent-color)] text-white'
                          : isDark
                            ? 'bg-white/10 text-slate-400'
                            : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </span>
                    <span
                      className={`font-medium ${isSelected ? 'text-[var(--accent-color)]' : textPrimary}`}
                    >
                      {opt}
                    </span>
                  </button>
                );
              })}
            {(currentQuestion.questionType === 'short_answer' ||
              currentQuestion.questionType === 'essay' ||
              !currentQuestion.questionType) && (
              <textarea
                value={answers[String(currentQuestion.id)] || ''}
                onChange={(e) => selectAnswer(e.target.value)}
                placeholder={`Enter your ${
                  currentQuestion.questionType === 'essay' ? 'essay' : 'answer'
                } here...`}
                className={`w-full p-4 rounded-2xl border-2 font-medium resize-none focus:outline-none transition-all ${
                  answers[String(currentQuestion.id)]
                    ? `border-[var(--accent-color)] ${isDark ? 'bg-[var(--accent-color)]/10' : 'bg-[var(--accent-color)]/5'}`
                    : optionBase
                } ${isDark ? 'bg-white/5 text-white' : 'bg-slate-50 text-slate-900'}`}
                rows={6}
              />
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentQuestionIndex((i) => i - 1)}
            disabled={currentQuestionIndex === 0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft' && currentQuestionIndex > 0) {
                setCurrentQuestionIndex((i) => i - 1);
              }
            }}
            aria-label={`Previous question (Question ${currentQuestionIndex})`}
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
            aria-label="Skip current question"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500/10 text-amber-600 font-medium text-sm hover:bg-amber-500/20 transition-colors"
          >
            <SkipForward className="w-4 h-4" /> Skip
          </button>

          {currentQuestionIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex((i) => i + 1)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' && currentQuestionIndex < questions.length - 1) {
                  setCurrentQuestionIndex((i) => i + 1);
                }
              }}
              aria-label={`Next question (Question ${currentQuestionIndex + 2})`}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-color)] text-white font-medium text-sm hover:opacity-90 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={submitQuiz}
              disabled={submittingQuiz}
              aria-label="Submit quiz"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#10B981] text-white font-medium text-sm hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <h3 className={`font-bold text-lg ${textPrimary}`}>
                  Question Navigator
                </h3>
                <button
                  onClick={() => setShowNavigator(false)}
                  className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
                >
                  <X className={`w-5 h-5 ${textPrimary}`} />
                </button>
              </div>

              <div className="grid grid-cols-5 gap-2 mb-5">
                {questions.map((q, idx) => {
                  const isAnswered = answers[String(q.id)] !== undefined;
                  const isSkipped = skippedQuestions.has(String(q.id));
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
                {results.score !== undefined && results.maxScore !== undefined
                  ? `${results.score}/${results.maxScore} pts`
                  : `${results.correct} / ${questions.length} correct`}
              </span>
            </div>
          </div>

          <h2 className={`text-2xl font-bold mb-1 ${textPrimary}`}>
            {results.passed
              ? results.pct >= 90
                ? 'Excellent Work!'
                : results.pct >= 70
                  ? 'Great Job!'
                  : 'You Passed!'
              : 'Keep Practicing!'}
          </h2>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="text-lg font-bold px-4 py-1 rounded-xl"
              style={{ backgroundColor: `${scoreColor}15`, color: scoreColor }}
            >
              Grade: {results.grade}
            </span>
            <span
              className={`text-sm font-medium px-3 py-1 rounded-xl ${
                results.passed
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {results.passed ? '✓ Passed' : '✗ Failed'}
            </span>
          </div>
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
          {quizResult?.questions ? (
            quizResult.questions.map((q: any) => {
              const userAnswer = answers[String(q.questionId)];
              const isCorrect = q.isCorrect;
              const isSkippedQ = !userAnswer;

              return (
                <div
                  key={q.questionId}
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
                        <span className={textSecondary}>Q{q.questionId}.</span> {q.questionText}
                      </p>
                      <div className={`text-xs space-y-0.5 ${textSecondary}`}>
                        {!isSkippedQ && (
                          <p>
                            Your answer:{' '}
                            <span
                              className={
                                isCorrect
                                  ? 'text-green-500 font-medium'
                                  : 'text-red-500 font-medium'
                              }
                            >
                              {userAnswer}
                            </span>
                          </p>
                        )}
                        {(isSkippedQ || !isCorrect) && q.correctAnswer && (
                          <p>
                            Correct answer:{' '}
                            <span className="text-green-500 font-medium">{q.correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className={`text-center py-8 ${textSecondary}`}>
              <p className="text-sm">Quiz completed successfully!</p>
              <p className="text-xs mt-2">Detailed review not available for this quiz.</p>
            </div>
          )}
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

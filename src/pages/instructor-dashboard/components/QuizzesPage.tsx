import React, { useState } from 'react';
import {
  ClipboardList,
  Users,
  Calendar,
  Clock,
  BarChart3,
  Sparkles,
  Search,
  Eye,
  Edit,
  X,
  Plus,
  Trash2,
  Loader2,
} from 'lucide-react';
import { CustomDropdown } from './CustomDropdown';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { CleanSelect } from '../../../components/shared';


interface QuizQuestion {
  id: number;
  type: 'mcq' | 'checkbox' | 'text';
  text: string;
  options: string[];
  correctOption: number; // for mcq
  correctOptions: number[]; // for checkbox
}

interface QuizFormData {
  title: string;
  course: string;
  duration: number;
  difficulty: string;
  questions: QuizQuestion[];
}

interface QuizData {
  id?: number;
  raw?: any;
  title: string;
  subject: string;
  subjectColor: string;
  date: string;
  questions: number;
  attempted: number;
  total: number;
  difficulty: string;
  difficultyColor: string;
  duration: number;
  status: string;
  statusColor: string;
}

const defaultQuestion = (): QuizQuestion => ({
  id: Date.now(),
  type: 'mcq',
  text: '',
  options: ['', '', '', ''],
  correctOption: 0,
  correctOptions: [],
});

const defaultFormData = (): QuizFormData => ({
  title: '',
  course: '',
  duration: 30,
  difficulty: 'Medium',
  questions: [defaultQuestion()],
});

const deriveQuizStatus = (quiz: any): { label: string; color: string } => {
  const now = new Date();
  const availableFrom = quiz?.availableFrom ? new Date(quiz.availableFrom) : null;
  const availableUntil = quiz?.availableUntil ? new Date(quiz.availableUntil) : null;

  if (!availableFrom) {
    return { label: 'Draft', color: 'bg-gray-100 text-gray-700' };
  }
  if (availableFrom > now) {
    return { label: 'Scheduled', color: 'bg-blue-100 text-blue-700' };
  }
  if (availableUntil && availableUntil < now) {
    return { label: 'Closed', color: 'bg-gray-100 text-gray-700' };
  }

  return { label: 'Active', color: 'bg-green-100 text-green-700' };
};

const courseLectures: Record<string, string[]> = {
  'Calculus I': ['Lecture 1: Limits', 'Lecture 2: Continuity', 'Lecture 3: Derivatives Intro'],
  'Calculus II': ['Lecture 1: Integration', 'Lecture 2: Techniques', 'Lecture 3: Applications'],
  'Physics I': ['Lecture 1: Kinematics', 'Lecture 2: Dynamics', 'Lecture 3: Energy'],
};

const MOCK_QUIZZES: QuizData[] = [
  {
    title: 'Midterm Review Quiz',
    subject: 'Data Structures',
    subjectColor: 'bg-indigo-100 text-indigo-700',
    date: '2025-01-10',
    questions: 15,
    attempted: 42,
    total: 45,
    difficulty: 'Medium',
    difficultyColor: 'bg-yellow-100 text-yellow-700',
    duration: 30,
    status: 'Active',
    statusColor: 'bg-green-100 text-green-700',
  },
  {
    title: 'Sorting Algorithms',
    subject: 'Algorithms',
    subjectColor: 'bg-blue-100 text-blue-700',
    date: '2024-12-20',
    questions: 10,
    attempted: 38,
    total: 40,
    difficulty: 'Easy',
    difficultyColor: 'bg-green-100 text-green-700',
    duration: 20,
    status: 'Closed',
    statusColor: 'bg-gray-100 text-gray-700',
  },
  {
    title: 'OOP Concepts',
    subject: 'Object-Oriented Programming',
    subjectColor: 'bg-purple-100 text-purple-700',
    date: '2025-01-15',
    questions: 12,
    attempted: 0,
    total: 35,
    difficulty: 'Medium',
    difficultyColor: 'bg-yellow-100 text-yellow-700',
    duration: 25,
    status: 'Draft',
    statusColor: 'bg-orange-100 text-orange-700',
  },
  {
    title: 'Database Normalization',
    subject: 'Database Systems',
    subjectColor: 'bg-teal-100 text-teal-700',
    date: '2025-01-08',
    questions: 8,
    attempted: 35,
    total: 35,
    difficulty: 'Easy',
    difficultyColor: 'bg-green-100 text-green-700',
    duration: 15,
    status: 'Active',
    statusColor: 'bg-green-100 text-green-700',
  },
  {
    title: 'Graph Theory Basics',
    subject: 'Discrete Mathematics',
    subjectColor: 'bg-pink-100 text-pink-700',
    date: '2025-01-18',
    questions: 20,
    attempted: 0,
    total: 50,
    difficulty: 'Hard',
    difficultyColor: 'bg-red-100 text-red-700',
    duration: 40,
    status: 'Scheduled',
    statusColor: 'bg-blue-100 text-blue-700',
  },
];

export interface QuizzesPageProps {
  courses?: any[]; // Passed from InstructorDashboard to populate the filter and create form
}

export function QuizzesPage({ courses = [] }: QuizzesPageProps) {
  const { t, isRTL } = useLanguage();
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;

  const liveCourseOptions = React.useMemo(() => {
    const seen = new Set<string>();
    const mapped = courses
      .map((c: any) => {
        const value = c.courseId ?? c.id;
        const label = c.courseName || c.course?.name || c.name;
        if (value === undefined || value === null || !label) return null;
        return { value: String(value), label: String(label) };
      })
      .filter((item): item is { value: string; label: string } => !!item)
      .filter((item) => {
        if (seen.has(item.value)) return false;
        seen.add(item.value);
        return true;
      });

    return mapped;
  }, [courses]);

  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Filters
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch quizzes
  React.useEffect(() => {
    async function fetchQuizzes() {
      const hasToken = !!localStorage.getItem('accessToken');

      try {
        setLoading(true);
        setListError(null);
        if (!hasToken) {
          // Fallback to mock data in Demo Mode
          setQuizzes(MOCK_QUIZZES);
          setLoading(false);
          return;
        }

        const QuizService = (await import('../../../services/api/quizService')).default;
        // If "all" course is selected, fetch all quizzes, otherwise by course ID
        const params = selectedCourse !== 'all' ? { courseId: String(selectedCourse) } : undefined;
        const response = await QuizService.getAll(params);
        // QuizService.getAll returns { data: Quiz[], total: number }
        const liveQuizzes = response.data || [];
        
        // Map backend Quiz model to UI QuizData model
        const mapped = liveQuizzes.map((q: any) => {
          const statusMeta = deriveQuizStatus(q);
          return {
            id: q.quizId || q.id,
            title: q.title,
            subject: q.course?.name || q.courseName || 'Unknown Course',
            subjectColor: 'bg-indigo-100 text-indigo-700',
            date: new Date(q.availableFrom || q.createdAt || Date.now()).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            }),
            questions: q.totalQuestions || 0,
            attempted: 0, // We'll need another call to get stats per quiz or add it to endpoint
            total: 0,
            difficulty: q.difficulty || 'Medium',
            difficultyColor: 'bg-yellow-100 text-yellow-700',
            duration: q.timeLimitMinutes || q.duration || 30,
            status: statusMeta.label,
            statusColor: statusMeta.color,
            raw: q,
          };
        });
        
        setQuizzes(mapped);
      } catch (err) {
        console.error('Failed to load quizzes', err);
        if (hasToken) {
          setQuizzes([]);
          setListError(
            err instanceof Error ? err.message : 'Failed to load quizzes in Live Mode.'
          );
        } else {
          // Keep demo fallback if no auth token is present.
          setQuizzes(MOCK_QUIZZES);
        }
      } finally {
        setLoading(false);
      }
    }
    
    fetchQuizzes();
  }, [selectedCourse, refreshKey]);

  // Create / Edit quiz form state
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<QuizFormData>(defaultFormData());
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // AI generation modal state
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiCourse, setAiCourse] = useState('');
  const [aiLectures, setAiLectures] = useState<string[]>([]);
  const [aiNumQuestions, setAiNumQuestions] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState('Medium');
  const [aiGenerating, setAiGenerating] = useState(false);

  // View attempts state
  const [viewAttemptsIndex, setViewAttemptsIndex] = useState<number | null>(null);
  const [attemptsData, setAttemptsData] = useState<any[]>([]);
  const [loadingAttempts, setLoadingAttempts] = useState(false);

  // View analysis state
  const [viewAnalysisIndex, setViewAnalysisIndex] = useState<number | null>(null);
  const [statsData, setStatsData] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [publishingIndex, setPublishingIndex] = useState<number | null>(null);

  // --- Helpers ---
  const openCreateForm = () => {
    setFormData(defaultFormData());
    setEditingIndex(null);
    setFormError(null);
    setShowCreateQuiz(true);
  };

  const openEditForm = async (index: number) => {
    setFormError(null);
    try {
      const QuizService = (await import('../../../services/api/quizService')).default;
      const quiz = quizzes[index];
      const quizId = quiz.raw?.quizId || quiz.raw?.id || quiz.id;
      
      const fullQuiz = await QuizService.getById(quizId);
      
      const questions: QuizQuestion[] = (fullQuiz.questions || []).map((q: any) => ({
        id: q.questionId || q.id,
        type: q.questionType === 'short_answer' ? 'text' : 'mcq',
        text: q.questionText,
        options: q.options ? q.options.map((opt: any) => opt.optionText || opt) : ['', '', '', ''],
        correctOption: q.correctAnswer !== undefined ? Number(q.correctAnswer) : 0,
        correctOptions: Array.isArray(q.correctAnswer) ? q.correctAnswer : [],
      }));
      
      setFormData({
        title: fullQuiz.title || quiz.title,
        course: String(fullQuiz.courseId || quiz.raw?.courseId || ''),
        duration: Number(fullQuiz.timeLimitMinutes || quiz.duration || 30),
        difficulty: quiz.difficulty,
        questions: questions.length ? questions : [defaultQuestion()],
      });
      setEditingIndex(index);
      setShowCreateQuiz(true);
    } catch (err) {
      console.error('Failed to load quiz details', err);
    }
  };

  const saveQuiz = async () => {
    const title = formData.title.trim();
    const courseId = Number(formData.course);
    const hasInvalidQuestion = formData.questions.some((q) => {
      if (!q.text.trim()) return true;
      if (q.type === 'mcq' || q.type === 'checkbox') {
        const nonEmptyOptions = q.options.filter((opt) => opt.trim().length > 0);
        return nonEmptyOptions.length < 2;
      }
      return false;
    });

    if (!title) {
      setFormError('Quiz title is required.');
      return;
    }
    if (!Number.isFinite(courseId) || courseId <= 0) {
      setFormError('Please select a valid course from the dropdown.');
      return;
    }
    if (hasInvalidQuestion) {
      setFormError('Each question needs text, and MCQ/checkbox questions need at least two options.');
      return;
    }

    try {
      setFormError(null);
      setIsSaving(true);
      const QuizService = (await import('../../../services/api/quizService')).default;
      
      const payload = {
        title,
        courseId,
        timeLimitMinutes: formData.duration,
        quizType: 'graded',
        maxAttempts: 1,
        passingScore: 50,
      };

      if (editingIndex !== null) {
        const existingQuiz = quizzes[editingIndex];
        const quizId = existingQuiz.raw?.quizId || existingQuiz.raw?.id || existingQuiz.id;
        await QuizService.updateQuiz(quizId, payload);
        // Updating questions correctly is complex for this MVP, assuming user creates new ones instead
      } else {
        const newQuiz = await QuizService.createQuiz(payload);
        const quizId = newQuiz.quizId || (newQuiz as any).id;
        
        // Add questions
        for (const [index, q] of formData.questions.entries()) {
          // correctAnswer must be a string - convert index to option text, or join multiple for checkbox
          let correctAnswer: string = '';
          if (q.type === 'mcq' && q.options[q.correctOption]) {
            correctAnswer = q.options[q.correctOption];
          } else if (q.type === 'checkbox' && q.correctOptions.length > 0) {
            correctAnswer = q.correctOptions.map(idx => q.options[idx] || '').filter(Boolean).join(',');
          }
          
          await QuizService.addQuestion(quizId, {
            questionText: q.text,
            questionType: q.type === 'text' ? 'short_answer' : q.type === 'checkbox' ? 'mcq' : 'mcq',
            points: 10,
            options: q.type === 'mcq' || q.type === 'checkbox' ? q.options : undefined,
            correctAnswer: correctAnswer || '',
            orderIndex: index
          });
        }
      }
      
      setShowCreateQuiz(false);
      setFormData(defaultFormData());
      setRefreshKey(r => r + 1); // trigger list refresh
    } catch (err) {
      console.error('Failed to save quiz', err);
      setFormError(err instanceof Error ? err.message : 'Failed to save quiz in Live Mode.');
    } finally {
      setIsSaving(false);
    }
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, { ...defaultQuestion(), id: Date.now() }],
    }));
  };

  const removeQuestion = (qId: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== qId),
    }));
  };

  const updateQuestion = (qId: number, field: string, value: string | number | string[]) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === qId ? { ...q, [field]: value } : q)),
    }));
  };

  const handleAIGenerate = () => {
    setAiGenerating(true);
    setTimeout(() => {
      const matchedCourse = liveCourseOptions.find((course) => course.label === aiCourse);
      const generated: QuizQuestion[] = Array.from({ length: aiNumQuestions }, (_, i) => ({
        id: Date.now() + i,
        type: i % 3 === 0 ? 'text' : i % 2 === 0 ? 'checkbox' : 'mcq',
        text: `[AI] ${aiCourse} — Question ${i + 1}: What is the key concept covered in ${aiLectures[i % aiLectures.length] || 'the selected lectures'}?`,
        options: ['Correct answer', 'Distractor A', 'Distractor B', 'Distractor C'],
        correctOption: 0,
        correctOptions: [0, 1],
      }));
      setFormData({
        title: `AI Quiz — ${aiCourse}`,
        course: matchedCourse?.value || '',
        duration: aiNumQuestions * 3,
        difficulty: aiDifficulty,
        questions: generated,
      });
      setFormError(null);
      setAiGenerating(false);
      setShowAIModal(false);
      setEditingIndex(null);
      setShowCreateQuiz(true);
    }, 2000);
  };

  const publishQuiz = async (index: number) => {
    try {
      setActionError(null);
      setPublishingIndex(index);
      const QuizService = (await import('../../../services/api/quizService')).default;
      const quiz = quizzes[index];
      const quizId = quiz.raw?.quizId || quiz.raw?.id || quiz.id;
      await QuizService.updateQuiz(quizId, { availableFrom: new Date().toISOString() });
      setRefreshKey(r => r + 1);
    } catch (err) {
      console.error('Failed to publish', err);
      setActionError(err instanceof Error ? err.message : 'Failed to publish quiz.');
    } finally {
      setPublishingIndex(null);
    }
  };

  const loadAttempts = async (index: number) => {
    if (viewAttemptsIndex === index) {
      setViewAttemptsIndex(null);
      return;
    }
    setActionError(null);
    setViewAttemptsIndex(index);
    setViewAnalysisIndex(null);
    setLoadingAttempts(true);
    try {
      const QuizService = (await import('../../../services/api/quizService')).default;
      const quizId = quizzes[index].raw?.quizId || quizzes[index].raw?.id || quizzes[index].id;
      const data = await QuizService.getAttempts({ quizId });
      setAttemptsData(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load attempts', err);
      setActionError(err instanceof Error ? err.message : 'Failed to load attempts.');
    } finally {
      setLoadingAttempts(false);
    }
  };

  const analyzeResults = async (index: number) => {
    if (viewAnalysisIndex === index) {
      setViewAnalysisIndex(null);
      return;
    }
    setActionError(null);
    setViewAnalysisIndex(index);
    setViewAttemptsIndex(null);
    setLoadingStats(true);
    try {
      const QuizService = (await import('../../../services/api/quizService')).default;
      const quizId = quizzes[index].raw?.quizId || quizzes[index].raw?.id || quizzes[index].id;
      const data = await QuizService.getStatistics(quizId);
      setStatsData(data);
    } catch (err) {
      console.error('Failed to load stats', err);
      setActionError(err instanceof Error ? err.message : 'Failed to load statistics.');
    } finally {
      setLoadingStats(false);
    }
  };

  // Mock attempts data
  const mockAttempts = [
    { name: 'Ahmed Mohamed', score: 92, time: '18 min', date: 'May 14' },
    { name: 'Sara Ali', score: 85, time: '22 min', date: 'May 14' },
    { name: 'Omar Hassan', score: 78, time: '25 min', date: 'May 14' },
    { name: 'Fatima Nour', score: 96, time: '15 min', date: 'May 14' },
  ];

  // --- Shared classes ---
  const cardCls = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200';
  const headingCls = isDark ? 'text-white' : 'text-gray-900';
  const subCls = isDark ? 'text-slate-400' : 'text-gray-600';
  const inputCls = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:ring-indigo-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-indigo-500';
  const btnSecCls = isDark ? 'text-slate-300 hover:bg-white/10' : 'text-gray-700 hover:bg-gray-50';
  const overlayBg = 'fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4';
  const modalCls = `relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 shadow-xl border ${cardCls} ${isDark ? 'bg-gray-900' : 'bg-white'}`;
  const getSubjectStyle = (subjectColor: string): React.CSSProperties | undefined => {
    if (subjectColor) return undefined;
    return {
      backgroundColor: isDark ? `${primaryHex}26` : `${primaryHex}1A`,
      color: primaryHex,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${headingCls}`}>
            {t('quizzesManagement')}
          </h2>
          <p className={`${subCls} mt-1 text-sm`}>{t('quizzesDescription')}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: primaryHex }}
            >
              <Sparkles size={20} />
              {t('generateWithAI') || 'AI Generate Quiz'}
            </button>
            <button
              onClick={openCreateForm}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
              style={{ backgroundColor: primaryHex }}
            >
              <ClipboardList size={20} />
              {t('createNewQuiz')}
            </button>
          </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <CustomDropdown
            label={t('courseLabel') || 'Course'}
            value={selectedCourse}
            options={[
              { value: 'all', label: t('allCourses') || 'All Courses' },
              ...liveCourseOptions
            ]}
            onChange={(val) => setSelectedCourse(val as string)}
            stackLabel
            fullWidth
          />
          <CustomDropdown
            label={t('statusLabel') || 'Status'}
            value={selectedStatus}
            options={[
              { value: 'all', label: t('all') || 'All' },
              { value: 'active', label: t('active') || 'Active' },
              { value: 'closed', label: t('closed') || 'Closed' },
            ]}
            onChange={(val) => setSelectedStatus(val as string)}
            stackLabel
            fullWidth
          />
          <div className="w-full flex flex-col gap-1.5 sm:col-span-2 lg:col-span-1">
            <span
              className={`text-sm font-medium whitespace-nowrap ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
            >
              {t('search')}
            </span>
            <div className="relative w-full">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
                size={18}
              />
              <input
                type="text"
                placeholder={t('searchQuizzes') || 'Search quizzes...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
              />
            </div>
          </div>
        </div>

      {/* Quiz Cards */}
      <div className="space-y-4">
        {actionError && (
          <div className={`p-4 rounded-lg border ${isDark ? 'border-red-500/40 bg-red-500/10 text-red-200' : 'border-red-200 bg-red-50 text-red-700'}`}>
            {actionError}
          </div>
        )}
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin text-indigo-500" size={32} />
          </div>
        ) : listError ? (
          <div className={`p-4 rounded-lg border ${isDark ? 'border-red-500/40 bg-red-500/10 text-red-200' : 'border-red-200 bg-red-50 text-red-700'}`}>
            {listError}
          </div>
        ) : quizzes.filter(q => {
            const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = selectedStatus === 'all' || q.status.toLowerCase() === selectedStatus.toLowerCase();
            return matchesSearch && matchesStatus;
        }).map((quiz, index) => (
            <div key={index} className={`rounded-xl p-4 sm:p-6 border shadow-sm ${cardCls}`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className={`text-lg font-semibold truncate ${headingCls}`}>{quiz.title}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${quiz.subjectColor}`}
                      style={getSubjectStyle(quiz.subjectColor)}
                    >
                      {quiz.subject}
                    </span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${subCls} mb-4`}>
                    <Calendar size={14} />
                    <span>{quiz.date}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    <div className="flex items-center gap-2 text-sm">
                      <ClipboardList
                        size={16}
                        className={isDark ? 'text-slate-500' : 'text-gray-400'}
                      />
                      <span className={`${headingCls} font-medium`}>{quiz.questions}</span>
                      <span className={subCls}>{t('questions')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Users size={16} className={isDark ? 'text-slate-500' : 'text-gray-400'} />
                      <span className={`${headingCls} font-medium`}>
                        {quiz.attempted}/{quiz.total}
                      </span>
                      <span className={subCls}>{t('attempted')}</span>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${quiz.difficultyColor}`}
                    >
                      {quiz.difficulty}
                    </span>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock size={16} className={isDark ? 'text-slate-500' : 'text-gray-400'} />
                      <span className={subCls}>
                        {quiz.duration} {t('minDuration')}
                      </span>
                    </div>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium self-start ${quiz.statusColor}`}
                >
                  {quiz.status}
                </span>
              </div>
              <div
                className={`flex flex-wrap items-center gap-2 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}
              >
                <button
                  onClick={() => loadAttempts(index)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm ${btnSecCls} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 rounded-lg transition-colors`}
                >
                  <Eye size={16} />
                  {t('viewAttempts')}
                </button>
                <button
                  onClick={() => openEditForm(index)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm ${btnSecCls} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 rounded-lg transition-colors`}
                >
                  <Edit size={16} />
                  {t('editQuiz')}
                </button>
                <button
                  onClick={() => setShowAIModal(true)}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-indigo-600 hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 rounded-lg transition-colors"
                >
                  <Sparkles size={16} />
                  {t('generateWithAI')}
                </button>
                <button
                  onClick={() => analyzeResults(index)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm ${btnSecCls} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 rounded-lg transition-colors`}
                >
                  <BarChart3 size={16} />
                  {t('analyzeResults')}
                </button>
                {quiz.status !== 'Active' && quiz.status !== 'published' && (
                  <button
                    onClick={() => publishQuiz(index)}
                    disabled={publishingIndex === index}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500 rounded-lg transition-colors ml-auto"
                  >
                    {publishingIndex === index ? 'Publishing...' : t('publish') || 'Publish'}
                  </button>
                )}
              </div>

              {/* View Attempts Panel */}
              {viewAttemptsIndex === index && (
                <div className={`mt-4 p-4 rounded-lg border ${cardCls}`}>
                  <h4 className={`font-semibold mb-3 ${headingCls}`}>{t('viewAttempts')}</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className={subCls}>
                          <th className="text-left pb-2 font-medium">Student</th>
                          <th className="text-left pb-2 font-medium">Score</th>
                          <th className="text-left pb-2 font-medium">Time (min)</th>
                          <th className="text-left pb-2 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingAttempts ? (
                          <tr><td colSpan={4} className="py-4 text-center">Loading attempts...</td></tr>
                        ) : attemptsData?.length === 0 ? (
                          <tr><td colSpan={4} className="py-4 text-center text-gray-500">No attempts found for this quiz</td></tr>
                        ) : attemptsData?.map((a, i) => {
                          const scoreValue = Number(a.percentage ?? a.score);
                          const hasScore = Number.isFinite(scoreValue);
                          const scoreClass = !hasScore
                            ? subCls
                            : scoreValue >= 90
                              ? 'text-green-500'
                              : scoreValue >= 70
                                ? 'text-yellow-500'
                                : 'text-red-500';

                          return (
                            <tr
                              key={i}
                              className={`border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}
                            >
                              <td className={`py-2 ${headingCls}`}>{a.user?.firstName || 'Unknown'} {a.user?.lastName || ''}</td>
                              <td className={`py-2 ${scoreClass} font-medium`}>
                                {hasScore ? `${scoreValue.toFixed(1)}%` : '-'}
                              </td>
                              <td className={`py-2 ${subCls}`}>
                                {a.startedAt && a.submittedAt ? Math.round((new Date(a.submittedAt).getTime() - new Date(a.startedAt).getTime()) / 60000) : '-'}
                              </td>
                              <td className={`py-2 ${subCls}`}>{new Date(a.submittedAt || a.startedAt).toLocaleDateString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Analysis Results Panel */}
              {viewAnalysisIndex === index && (
                <div className={`mt-4 p-4 rounded-lg border ${cardCls}`}>
                  <h4 className={`font-semibold mb-3 ${headingCls}`}>{t('analyzeResults')}</h4>
                  {loadingStats ? (
                    <div className="flex justify-center py-4 text-indigo-500"><Loader2 className="animate-spin" size={24} /></div>
                  ) : !statsData ? (
                    <div className="py-4 text-center text-gray-500">Stats not available yet</div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
                          <p className={`text-xs ${subCls} mb-1`}>Average Score</p>
                          <p className={`text-lg font-bold text-indigo-600 dark:text-indigo-400`}>
                            {statsData.averageScore?.toFixed(0) || 0}%
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800">
                          <p className={`text-xs ${subCls} mb-1`}>Highest Score</p>
                          <p className={`text-lg font-bold text-green-600 dark:text-green-400`}>
                            {statsData.highestScore?.toFixed(0) || 0}%
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800">
                          <p className={`text-xs ${subCls} mb-1`}>Lowest Score</p>
                          <p className={`text-lg font-bold text-red-600 dark:text-red-400`}>
                            {statsData.lowestScore?.toFixed(0) || 0}%
                          </p>
                        </div>
                        <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-100 dark:border-yellow-800">
                          <p className={`text-xs ${subCls} mb-1`}>Pass Rate</p>
                          <p className={`text-lg font-bold text-yellow-600 dark:text-yellow-400`}>
                            {(Number(statsData.passRatePercentage ?? statsData.passRate ?? 0)).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      <div
                        className={`mt-4 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}
                      >
                        <p className={`text-sm ${subCls}`}>
                          <span className={`font-medium ${headingCls}`}>{statsData.totalAttempts || 0}</span> total attempts from{' '}
                          <span className={`font-medium ${headingCls}`}>{statsData.uniqueStudents ?? statsData.completedAttempts ?? 0}</span> unique students.
                        </p>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

      {/* Create / Edit Quiz Modal */}
      {showCreateQuiz && (
        <div className={overlayBg}>
          <div className={modalCls}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${headingCls}`}>
                {editingIndex !== null ? t('editQuiz') : t('createNewQuiz')}
              </h2>
              <button
                onClick={() => setShowCreateQuiz(false)}
                className={`p-1 rounded-lg ${btnSecCls}`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Quiz meta fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="sm:col-span-2">
                <label className={`block text-sm font-medium mb-1 ${subCls}`}>Quiz Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter quiz title"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${subCls}`}>Course</label>
                <CleanSelect
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
                >
                  <option value="">Select course</option>
                  {liveCourseOptions.map((course) => (
                    <option key={course.value} value={course.value}>
                      {course.label}
                    </option>
                  ))}
                </CleanSelect>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${subCls}`}>Duration (min)</label>
                <input
                  type="number"
                  min={1}
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${subCls}`}>Difficulty</label>
                <CleanSelect
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </CleanSelect>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4 mb-6">
              <h3 className={`text-lg font-semibold ${headingCls}`}>
                {t('questions') || 'Questions'} ({formData.questions.length})
              </h3>
              {formData.questions.map((q, qIdx) => (
                <div key={q.id} className={`p-4 rounded-lg border ${cardCls}`}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`text-sm font-semibold ${subCls}`}>Question {qIdx + 1}</span>
                      <CleanSelect
                        value={q.type}
                        onChange={(e) => updateQuestion(q.id, 'type', e.target.value)}
                        className={`px-2 py-1 border rounded-md text-xs focus:outline-none focus:ring-1 ${inputCls}`}
                      >
                        <option value="mcq">Multiple Choice</option>
                        <option value="checkbox">Checkboxes</option>
                        <option value="text">Short Answer (Text)</option>
                      </CleanSelect>
                    </div>
                    {formData.questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(q.id)}
                        className="text-red-500 hover:text-red-700 p-1 self-end sm:self-auto"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                  <textarea
                    value={q.text}
                    onChange={(e) => updateQuestion(q.id, 'text', e.target.value)}
                    placeholder="Enter question text..."
                    rows={2}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 mb-3 resize-none ${inputCls}`}
                  />

                  {q.type === 'text' && (
                    <div className="p-3 bg-gray-50 dark:bg-white/5 border border-dashed border-gray-300 dark:border-white/20 rounded-lg">
                      <p className={`text-sm italic ${subCls}`}>
                        Students will provide a free-text answer for this question.
                      </p>
                    </div>
                  )}

                  {(q.type === 'mcq' || q.type === 'checkbox') && (
                    <div className="space-y-3">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex items-center gap-2">
                          {q.type === 'mcq' ? (
                            <input
                              type="radio"
                              name={`correct-${q.id}`}
                              checked={q.correctOption === oIdx}
                              onChange={() => updateQuestion(q.id, 'correctOption', oIdx)}
                              className="accent-indigo-600 mt-1"
                            />
                          ) : (
                            <input
                              type="checkbox"
                              checked={q.correctOptions.includes(oIdx)}
                              onChange={(e) => {
                                const newOpts = e.target.checked
                                  ? [...q.correctOptions, oIdx]
                                  : q.correctOptions.filter((i) => i !== oIdx);
                                updateQuestion(q.id, 'correctOptions', newOpts);
                              }}
                              className="accent-indigo-600 mt-1"
                            />
                          )}
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...q.options];
                              newOpts[oIdx] = e.target.value;
                              updateQuestion(q.id, 'options', newOpts);
                            }}
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            className={`flex-1 px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-2 ${inputCls}`}
                          />
                          <button
                            onClick={() => {
                              const newOpts = q.options.filter((_, i) => i !== oIdx);
                              updateQuestion(q.id, 'options', newOpts);
                            }}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => updateQuestion(q.id, 'options', [...q.options, ''])}
                        className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline font-medium ml-6"
                      >
                        + Add Option
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 text-sm text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-dashed border-indigo-300 w-full justify-center"
              >
                <Plus size={16} />
                Add Question
              </button>
            </div>

            {/* Actions */}
            {formError && (
              <div className={`mb-4 p-3 rounded-lg border ${isDark ? 'border-red-500/40 bg-red-500/10 text-red-200' : 'border-red-200 bg-red-50 text-red-700'}`}>
                {formError}
              </div>
            )}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowCreateQuiz(false);
                  setFormError(null);
                }}
                disabled={isSaving}
                className={`px-4 py-2 text-sm rounded-lg border ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={saveQuiz}
                disabled={isSaving}
                className="px-6 py-2 text-sm text-white rounded-lg transition-colors"
                style={{ backgroundColor: isSaving ? '#94a3b8' : primaryHex }}
              >
                {isSaving
                  ? 'Saving...'
                  : editingIndex !== null
                    ? 'Update Quiz'
                    : 'Save Quiz'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generate Quiz Modal */}
      {showAIModal && (
        <div className={overlayBg}>
          <div className={`${modalCls} !max-w-lg`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${headingCls} flex items-center gap-2`}>
                <Sparkles size={20} style={{ color: primaryHex }} />
                AI Generate Quiz
              </h2>
              <button
                onClick={() => setShowAIModal(false)}
                className={`p-1 rounded-lg ${btnSecCls}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${subCls}`}>Course</label>
                <CleanSelect
                  value={aiCourse}
                  onChange={(e) => {
                    setAiCourse(e.target.value);
                    setAiLectures([]);
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
                >
                  <option value="">Select course</option>
                  {Object.keys(courseLectures).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </CleanSelect>
              </div>

              {aiCourse && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${subCls}`}>
                    Lectures / Materials
                  </label>
                  <div
                    className={`p-3 border rounded-lg space-y-2 ${isDark ? 'border-white/10' : 'border-gray-200'}`}
                  >
                    {courseLectures[aiCourse]?.map((lec) => (
                      <label
                        key={lec}
                        className={`flex items-center gap-2 text-sm cursor-pointer ${headingCls}`}
                      >
                        <input
                          type="checkbox"
                          checked={aiLectures.includes(lec)}
                          onChange={(e) =>
                            setAiLectures((prev) =>
                              e.target.checked ? [...prev, lec] : prev.filter((l) => l !== lec)
                            )
                          }
                          className="accent-indigo-600"
                        />
                        {lec}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${subCls}`}>
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={aiNumQuestions}
                    onChange={(e) => setAiNumQuestions(Number(e.target.value))}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${subCls}`}>Difficulty</label>
                  <CleanSelect
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </CleanSelect>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAIModal(false)}
                className={`px-4 py-2 text-sm rounded-lg border ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={handleAIGenerate}
                disabled={!aiCourse || aiLectures.length === 0 || aiGenerating}
                className="flex items-center gap-2 px-6 py-2 text-sm text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: primaryHex }}
              >
                {aiGenerating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default QuizzesPage;


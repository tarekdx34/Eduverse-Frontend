import { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Plus,
  Sparkles,
  Clock,
  FileText,
  Users,
  Eye,
  Edit2,
  BarChart3,
  Send,
  X,
  Trash2,
  AlertCircle,
  Loader,
} from 'lucide-react';
import { CleanSelect } from '../../../components/shared';
import { useAuth } from '../../../context/AuthContext';
import QuizService, { QuizAttempt, QuizQuestion } from '../../../services/api/quizService';
import { toast } from 'sonner';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctOption: number;
}

// Updated interface to match backend Quiz type
interface QuizUIData {
  id: string;
  title: string;
  course: string;
  status: 'draft' | 'published' | 'closed';
  questions: number;
  date: string;
  attempts: number;
  duration: number | null;
  raw?: any; // Keep backend data for reference
}

const MOCK_QUIZZES: QuizUIData[] = [
  {
    id: '1',
    title: 'Midterm Review Quiz',
    course: 'Data Structures',
    status: 'published',
    questions: 15,
    date: '2025-01-10',
    attempts: 42,
    duration: 30,
  },
  {
    id: '2',
    title: 'Sorting Algorithms',
    course: 'Algorithms',
    status: 'closed',
    questions: 10,
    date: '2024-12-20',
    attempts: 38,
    duration: 20,
  },
  {
    id: '3',
    title: 'OOP Concepts',
    course: 'Object-Oriented Programming',
    status: 'draft',
    questions: 12,
    date: '2025-01-15',
    attempts: 0,
    duration: 25,
  },
  {
    id: '4',
    title: 'Database Normalization',
    course: 'Database Systems',
    status: 'published',
    questions: 8,
    date: '2025-01-08',
    attempts: 35,
    duration: 15,
  },
  {
    id: '5',
    title: 'Graph Theory Basics',
    course: 'Discrete Mathematics',
    status: 'draft',
    questions: 20,
    date: '2025-01-18',
    attempts: 0,
    duration: 40,
  },
  {
    id: '6',
    title: 'Final Exam Prep',
    course: 'Data Structures',
    status: 'closed',
    questions: 25,
    date: '2024-12-15',
    attempts: 45,
    duration: 60,
  },
];

const COURSES = [
  'Data Structures',
  'Algorithms',
  'Object-Oriented Programming',
  'Database Systems',
  'Discrete Mathematics',
];
const LECTURES: Record<string, string[]> = {
  'Data Structures': ['Arrays & Linked Lists', 'Stacks & Queues', 'Trees & Graphs', 'Hash Tables'],
  Algorithms: ['Sorting', 'Searching', 'Dynamic Programming', 'Greedy Algorithms'],
  'Object-Oriented Programming': [
    'Classes & Objects',
    'Inheritance',
    'Polymorphism',
    'Design Patterns',
  ],
  'Database Systems': ['ER Modeling', 'Normalization', 'SQL Queries', 'Transactions'],
  'Discrete Mathematics': ['Logic', 'Sets & Relations', 'Graph Theory', 'Combinatorics'],
};

const statusColors: Record<string, string> = {
  published: 'bg-green-500/20 text-green-400',
  draft: 'bg-yellow-500/20 text-yellow-400',
  closed: 'bg-blue-500/20 text-blue-400',
  Active: 'bg-green-500/20 text-green-400',
  Draft: 'bg-yellow-500/20 text-yellow-400',
  Completed: 'bg-blue-500/20 text-blue-400',
};

function emptyQuestion(id: number): Question {
  return { id, text: '', options: ['', '', '', ''], correctOption: 0 };
}

export function QuizzesPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const { t } = useLanguage();
  const { user } = useAuth();

  // T090: State management for API integration
  const [quizzes, setQuizzes] = useState<QuizUIData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // UI state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [showGradeModal, setShowGradeModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // T093: Grading state
  const [selectedAttempt, setSelectedAttempt] = useState<QuizAttempt | null>(null);
  const [selectedQuizForGrading, setSelectedQuizForGrading] = useState<QuizUIData | null>(null);
  const [attemptsList, setAttemptsList] = useState<QuizAttempt[]>([]);
  const [gradeForm, setGradeForm] = useState<{
    [key: string]: { questionId: number; pointsEarned: number };
  }>({});

  // Create quiz form state
  const [quizTitle, setQuizTitle] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [duration, setDuration] = useState(30);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion(1)]);

  // AI generation form state
  const [aiCourse, setAiCourse] = useState('');
  const [aiLectures, setAiLectures] = useState<string[]>([]);
  const [aiNumQuestions, setAiNumQuestions] = useState(10);
  const [aiDifficulty, setAiDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');

  // T090: Fetch quizzes from API
  useEffect(() => {
    async function fetchQuizzes() {
      const hasToken = !!localStorage.getItem('accessToken');

      try {
        setLoading(true);
        setError(null);

        if (!hasToken) {
          // Demo mode - use mock data
          setQuizzes(MOCK_QUIZZES);
          setLoading(false);
          return;
        }

        const response = await QuizService.getAll();
        const liveQuizzes = response.data || [];

        // Map backend Quiz to QuizUIData
        const mapped = liveQuizzes.map((q: any) => ({
          id: q.id || String(q.id),
          title: q.title,
          course: q.course?.name || 'Unknown Course',
          status: q.status || 'draft',
          questions: q.questions?.length || 0,
          date: q.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
          attempts: 0, // Will be calculated separately if needed
          duration: q.timeLimit || null,
          raw: q,
        }));

        setQuizzes(mapped);
      } catch (err) {
        console.error('Failed to load quizzes', err);
        if (hasToken) {
          const message = err instanceof Error ? err.message : 'Failed to load quizzes';
          setError(message);
          toast.error(message);
        } else {
          setQuizzes(MOCK_QUIZZES);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchQuizzes();
  }, [refreshKey]);

  const resetForm = () => {
    setQuizTitle('');
    setSelectedCourse('');
    setDuration(30);
    setDifficulty('Medium');
    setQuestions([emptyQuestion(1)]);
  };

  const addQuestion = () => {
    setQuestions((prev) => [...prev, emptyQuestion(prev.length + 1)]);
  };

  const removeQuestion = (id: number) => {
    if (questions.length > 1) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    }
  };

  const updateQuestionText = (id: number, text: string) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, text } : q)));
  };

  const updateOption = (qId: number, optIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId ? { ...q, options: q.options.map((o, i) => (i === optIndex ? value : o)) } : q
      )
    );
  };

  const updateCorrectOption = (qId: number, optIndex: number) => {
    setQuestions((prev) => prev.map((q) => (q.id === qId ? { ...q, correctOption: optIndex } : q)));
  };

  const handleCreateQuiz = () => {
    if (!quizTitle || !selectedCourse) return;
    const newQuiz: QuizUIData = {
      id: String(quizzes.length + 1),
      title: quizTitle,
      course: selectedCourse,
      status: 'draft',
      questions: questions.length,
      date: new Date().toISOString().slice(0, 10),
      attempts: 0,
      duration,
    };
    setQuizzes((prev) => [newQuiz, ...prev]);
    setShowCreateModal(false);
    resetForm();
  };

  const handleAIGenerate = () => {
    if (!aiCourse) return;
    setIsGenerating(true);
    setTimeout(() => {
      const generated: Question[] = Array.from({ length: aiNumQuestions }, (_, i) => ({
        id: i + 1,
        text: `${aiDifficulty} question ${i + 1} about ${aiCourse}`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctOption: Math.floor(Math.random() * 4),
      }));
      setQuizTitle(`AI Generated - ${aiCourse} Quiz`);
      setSelectedCourse(aiCourse);
      setDifficulty(aiDifficulty);
      setQuestions(generated);
      setIsGenerating(false);
      setShowAIModal(false);
      setShowCreateModal(true);
    }, 2000);
  };

  const toggleLecture = (lecture: string) => {
    setAiLectures((prev) =>
      prev.includes(lecture) ? prev.filter((l) => l !== lecture) : [...prev, lecture]
    );
  };

  const publishQuiz = (id: string) => {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: 'published' as const } : q))
    );
  };

  // T093: Load attempts for grading
  const loadAttemptsForGrading = async (quiz: QuizUIData) => {
    try {
      setShowGradeModal(true);
      setSelectedQuizForGrading(quiz);
      const attempts = await QuizService.getAllAttempts({ quizId: quiz.id });
      setAttemptsList(attempts || []);
      setGradeForm({});
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load attempts';
      toast.error(message);
      setShowGradeModal(false);
    }
  };

  // T093: Handle essay grading submission
  const handleGradeSubmit = async () => {
    if (!selectedAttempt || !selectedQuizForGrading) return;

    try {
      setIsSaving(true);
      const grades = Object.values(gradeForm);

      if (grades.length === 0) {
        toast.error('Please enter grades for at least one question');
        return;
      }

      await QuizService.gradeAttempt(selectedQuizForGrading.id, selectedAttempt.id, grades);
      toast.success('Grading submitted successfully');
      setShowGradeModal(false);
      setSelectedAttempt(null);
      setGradeForm({});
      setRefreshKey((prev) => prev + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit grades';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  // T091: Check if user is TA
  const isTa = user?.roles?.includes('teaching_assistant');

  const cardClass = `${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'} rounded-xl border shadow-sm`;
  const headingClass = isDark ? 'text-white' : 'text-gray-900';
  const secondaryText = isDark ? 'text-slate-400' : 'text-gray-600';
  const inputClass = `w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'bg-white border-gray-300 text-gray-900'}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-bold ${headingClass}`}>
            {t('Quiz Management', 'إدارة الاختبارات')}
          </h1>
          <p className={secondaryText}>
            {t(
              isTa ? 'Grade and review quizzes' : 'Create, manage, and analyze your quizzes',
              'تصنيف ومراجعة الاختبارات'
            )}
          </p>
        </div>
        {/* T091: Hide Create Quiz button for TA */}
        {!isTa && (
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                resetForm();
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              {t('Create New Quiz', 'إنشاء اختبار جديد')}
            </button>
            <button
              onClick={() => setShowAIModal(true)}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <Sparkles className="h-4 w-4" />
              {t('AI Generate', 'توليد بالذكاء الاصطناعي')}
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className={`${cardClass} p-8 flex flex-col items-center justify-center gap-4`}>
          <Loader className="h-8 w-8 animate-spin text-indigo-500" />
          <p className={secondaryText}>{t('Loading quizzes...', 'جارٍ تحميل الاختبارات...')}</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div
          className={`${isDark ? 'bg-red-500/10 border-red-500/20' : 'bg-red-50 border-red-200'} border rounded-lg p-4 flex items-start gap-3`}
        >
          <AlertCircle
            className={`h-5 w-5 flex-shrink-0 ${isDark ? 'text-red-400' : 'text-red-600'} mt-0.5`}
          />
          <div>
            <p className={`font-medium ${isDark ? 'text-red-400' : 'text-red-900'}`}>
              {t('Error loading quizzes', 'خطأ في تحميل الاختبارات')}
            </p>
            <p className={isDark ? 'text-red-300/80 text-sm mt-1' : 'text-red-700 text-sm mt-1'}>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && quizzes.length === 0 && !error && (
        <div className={`${cardClass} p-8 text-center`}>
          <FileText
            className={`h-12 w-12 mx-auto mb-3 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
          />
          <p className={`font-medium ${headingClass}`}>
            {t('No quizzes available', 'لا توجد اختبارات متاحة')}
          </p>
          <p className={`text-sm ${secondaryText} mt-1`}>
            {t('Create your first quiz to get started', 'أنشئ اختبارك الأول للبدء')}
          </p>
        </div>
      )}

      {/* Quiz Grid */}
      {!loading && quizzes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <div key={quiz.id} className={`${cardClass} p-5`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className={`font-semibold truncate ${headingClass}`}>{quiz.title}</h3>
                  <p className={`text-sm mt-1 ${secondaryText}`}>{quiz.course}</p>
                </div>
                <span
                  className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ml-2 ${statusColors[quiz.status]}`}
                >
                  {quiz.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-4 text-sm mb-4">
                <span className={`flex items-center gap-1.5 ${secondaryText}`}>
                  <FileText className="h-4 w-4" />
                  {quiz.questions} {t('questions', 'أسئلة')}
                </span>
                <span className={`flex items-center gap-1.5 ${secondaryText}`}>
                  <Clock className="h-4 w-4" />
                  {quiz.duration || 0} {t('min', 'د')}
                </span>
                <span className={`flex items-center gap-1.5 ${secondaryText}`}>
                  <Users className="h-4 w-4" />
                  {quiz.attempts} {t('attempts', 'محاولات')}
                </span>
              </div>

              <p className={`text-xs mb-4 ${secondaryText}`}>{quiz.date}</p>

              <div className="flex flex-wrap gap-2">
                <button
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <Eye className="h-3.5 w-3.5" />
                  {t('View Attempts', 'عرض المحاولات')}
                </button>
                {/* T092: Hide Edit button for TA */}
                {!isTa && (
                  <button
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    {t('Edit Quiz', 'تعديل الاختبار')}
                  </button>
                )}
                {/* T093: Grade button for TA */}
                {isTa && (
                  <button
                    onClick={() => loadAttemptsForGrading(quiz)}
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${isDark ? 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {t('Grade Essays', 'تصنيف المقالات')}
                  </button>
                )}
                {!isTa && (
                  <button
                    className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${isDark ? 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}`}
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {t('Generate with AI', 'توليد بالذكاء الاصطناعي')}
                  </button>
                )}
                <button
                  className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  <BarChart3 className="h-3.5 w-3.5" />
                  {t('Analyze Results', 'تحليل النتائج')}
                </button>
                {/* T092: Hide Delete/Trash button for TA */}
                {!isTa && quiz.status === 'draft' && (
                  <button
                    onClick={() => publishQuiz(quiz.id)}
                    className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                  >
                    <Send className="h-3.5 w-3.5" />
                    {t('Publish', 'نشر')}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Quiz Modal - Hidden for TA */}
      {!isTa && showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4">
          <div
            className={`w-full max-w-3xl my-8 rounded-2xl border p-6 ${isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${headingClass}`}>
                {t('Create New Quiz', 'إنشاء اختبار جديد')}
              </h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quiz Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>
                  {t('Quiz Title', 'عنوان الاختبار')}
                </label>
                <input
                  type="text"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  placeholder={t('Enter quiz title...', 'أدخل عنوان الاختبار...')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>
                  {t('Course', 'المادة')}
                </label>
                <CleanSelect
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className={inputClass}
                >
                  <option value="">{t('Select course', 'اختر المادة')}</option>
                  {COURSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </CleanSelect>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>
                  {t('Duration (minutes)', 'المدة (دقائق)')}
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  min={5}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>
                  {t('Difficulty', 'الصعوبة')}
                </label>
                <CleanSelect
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                  className={inputClass}
                >
                  <option value="Easy">{t('Easy', 'سهل')}</option>
                  <option value="Medium">{t('Medium', 'متوسط')}</option>
                  <option value="Hard">{t('Hard', 'صعب')}</option>
                </CleanSelect>
              </div>
            </div>

            {/* Questions */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-sm font-semibold ${headingClass}`}>
                  {t('Questions', 'الأسئلة')} ({questions.length})
                </h3>
                <button
                  onClick={addQuestion}
                  className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t('Add Question', 'إضافة سؤال')}
                </button>
              </div>

              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {questions.map((q, qIndex) => (
                  <div key={q.id} className={`${cardClass} p-4`}>
                    <div className="flex items-start justify-between mb-3">
                      <span className={`text-sm font-medium ${headingClass}`}>
                        {t('Question', 'السؤال')} {qIndex + 1}
                      </span>
                      {questions.length > 1 && (
                        <button
                          onClick={() => removeQuestion(q.id)}
                          className="p-1 text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <textarea
                      value={q.text}
                      onChange={(e) => updateQuestionText(q.id, e.target.value)}
                      placeholder={t('Enter question text...', 'أدخل نص السؤال...')}
                      rows={2}
                      className={`${inputClass} mb-3 resize-none`}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctOption === optIndex}
                            onChange={() => updateCorrectOption(q.id, optIndex)}
                            className="accent-indigo-600"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => updateOption(q.id, optIndex, e.target.value)}
                            placeholder={`${t('Option', 'الخيار')} ${String.fromCharCode(65 + optIndex)}`}
                            className={`${inputClass} flex-1`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('Cancel', 'إلغاء')}
              </button>
              <button
                onClick={handleCreateQuiz}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                {t('Create Quiz', 'إنشاء الاختبار')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Generation Modal - Hidden for TA */}
      {!isTa && showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 ${isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'}`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${headingClass}`}>
                <Sparkles className="h-5 w-5 text-blue-400" />
                {t('AI Quiz Generation', 'توليد اختبار بالذكاء الاصطناعي')}
              </h2>
              <button
                onClick={() => setShowAIModal(false)}
                className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>
                  {t('Course', 'المادة')}
                </label>
                <CleanSelect
                  value={aiCourse}
                  onChange={(e) => {
                    setAiCourse(e.target.value);
                    setAiLectures([]);
                  }}
                  className={inputClass}
                >
                  <option value="">{t('Select course', 'اختر المادة')}</option>
                  {COURSES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </CleanSelect>
              </div>

              {aiCourse && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>
                    {t('Lectures', 'المحاضرات')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LECTURES[aiCourse]?.map((lecture) => (
                      <button
                        key={lecture}
                        onClick={() => toggleLecture(lecture)}
                        className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                          aiLectures.includes(lecture)
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : isDark
                              ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                              : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {lecture}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>
                    {t('Number of Questions', 'عدد الأسئلة')}
                  </label>
                  <input
                    type="number"
                    value={aiNumQuestions}
                    onChange={(e) => setAiNumQuestions(Number(e.target.value))}
                    min={1}
                    max={50}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>
                    {t('Difficulty', 'الصعوبة')}
                  </label>
                  <CleanSelect
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                    className={inputClass}
                  >
                    <option value="Easy">{t('Easy', 'سهل')}</option>
                    <option value="Medium">{t('Medium', 'متوسط')}</option>
                    <option value="Hard">{t('Hard', 'صعب')}</option>
                  </CleanSelect>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAIModal(false)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                {t('Cancel', 'إلغاء')}
              </button>
              <button
                onClick={handleAIGenerate}
                disabled={isGenerating || !aiCourse}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {t('Generating...', 'جارٍ التوليد...')}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {t('Generate Quiz', 'توليد الاختبار')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* T093: Essay Grading Modal */}
      {showGradeModal && selectedQuizForGrading && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4">
          <div
            className={`w-full max-w-4xl my-8 rounded-2xl border p-6 ${isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'}`}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className={`text-xl font-bold ${headingClass}`}>
                  {t('Grade Essays', 'تصنيف المقالات')} - {selectedQuizForGrading.title}
                </h2>
                <p className={`text-sm ${secondaryText} mt-1`}>
                  {t('Review and grade student submissions', 'مراجعة وتصنيف تقديمات الطلاب')}
                </p>
              </div>
              <button
                onClick={() => setShowGradeModal(false)}
                className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Attempts List */}
            {!selectedAttempt ? (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                {attemptsList.length === 0 ? (
                  <div className={`${cardClass} p-8 text-center`}>
                    <p className={`font-medium ${headingClass}`}>
                      {t('No submissions yet', 'لا توجد تقديمات بعد')}
                    </p>
                  </div>
                ) : (
                  attemptsList.map((attempt) => (
                    <button
                      key={attempt.id}
                      onClick={() => setSelectedAttempt(attempt)}
                      className={`w-full text-left ${cardClass} p-4 hover:opacity-80 transition-opacity`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${headingClass}`}>
                            {attempt.user?.firstName} {attempt.user?.lastName}
                          </p>
                          <p className={`text-sm ${secondaryText}`}>{attempt.user?.email}</p>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${headingClass}`}>
                            {attempt.status === 'graded'
                              ? `${attempt.score}/${selectedQuizForGrading.questions * 10}`
                              : t('Pending', 'قيد الانتظار')}
                          </p>
                          <p className={`text-xs ${secondaryText}`}>
                            {new Date(
                              attempt.submittedAt || attempt.startedAt
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                <div className={cardClass + ' p-4'}>
                  <p className={`font-medium ${headingClass}`}>
                    {selectedAttempt.user?.firstName} {selectedAttempt.user?.lastName}
                  </p>
                  <p className={`text-sm ${secondaryText}`}>{selectedAttempt.user?.email}</p>
                </div>

                {selectedAttempt.answers?.map((answer, idx) => (
                  <div key={answer.id} className={cardClass + ' p-4'}>
                    <div className="mb-3">
                      <p className={`font-medium ${headingClass}`}>
                        {t('Question', 'السؤال')} {idx + 1}
                      </p>
                      <p className={`text-sm ${secondaryText}`}>{answer.answerText}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>
                          {t('Points Earned', 'النقاط المكتسبة')}
                        </label>
                        <input
                          type="number"
                          min={0}
                          max={10}
                          value={gradeForm[answer.id]?.pointsEarned || 0}
                          onChange={(e) =>
                            setGradeForm((prev) => ({
                              ...prev,
                              [answer.id]: {
                                questionId: parseInt(String(answer.id).split('-')[0]),
                                pointsEarned: Number(e.target.value),
                              },
                            }))
                          }
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>
                          {t('Max Points', 'الحد الأقصى للنقاط')}
                        </label>
                        <input
                          type="number"
                          value={10}
                          disabled
                          className={inputClass + ' opacity-50'}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-between gap-3 mt-6 pt-6 border-t border-white/10">
              {selectedAttempt ? (
                <>
                  <button
                    onClick={() => setSelectedAttempt(null)}
                    className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                  >
                    {t('Back', 'رجوع')}
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowGradeModal(false)}
                      className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {t('Cancel', 'إلغاء')}
                    </button>
                    <button
                      onClick={handleGradeSubmit}
                      disabled={isSaving}
                      className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSaving && (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      )}
                      {t('Submit Grades', 'تقديم الدرجات')}
                    </button>
                  </div>
                </>
              ) : (
                <button
                  onClick={() => setShowGradeModal(false)}
                  className={`ml-auto rounded-lg px-4 py-2 text-sm font-medium transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                >
                  {t('Close', 'إغلاق')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

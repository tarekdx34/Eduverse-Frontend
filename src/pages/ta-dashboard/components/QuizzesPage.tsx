import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Plus, Sparkles, Clock, FileText, Users, Eye, Edit2, BarChart3, Send, X, Trash2 } from 'lucide-react';

interface Question {
  id: number;
  text: string;
  options: string[];
  correctOption: number;
}

interface Quiz {
  id: number;
  title: string;
  course: string;
  status: 'Active' | 'Draft' | 'Completed';
  questions: number;
  date: string;
  attempts: number;
  duration: number;
}

const MOCK_QUIZZES: Quiz[] = [
  { id: 1, title: 'Midterm Review Quiz', course: 'Data Structures', status: 'Active', questions: 15, date: '2025-01-10', attempts: 42, duration: 30 },
  { id: 2, title: 'Sorting Algorithms', course: 'Algorithms', status: 'Completed', questions: 10, date: '2024-12-20', attempts: 38, duration: 20 },
  { id: 3, title: 'OOP Concepts', course: 'Object-Oriented Programming', status: 'Draft', questions: 12, date: '2025-01-15', attempts: 0, duration: 25 },
  { id: 4, title: 'Database Normalization', course: 'Database Systems', status: 'Active', questions: 8, date: '2025-01-08', attempts: 35, duration: 15 },
  { id: 5, title: 'Graph Theory Basics', course: 'Discrete Mathematics', status: 'Draft', questions: 20, date: '2025-01-18', attempts: 0, duration: 40 },
  { id: 6, title: 'Final Exam Prep', course: 'Data Structures', status: 'Completed', questions: 25, date: '2024-12-15', attempts: 45, duration: 60 },
];

const COURSES = ['Data Structures', 'Algorithms', 'Object-Oriented Programming', 'Database Systems', 'Discrete Mathematics'];
const LECTURES: Record<string, string[]> = {
  'Data Structures': ['Arrays & Linked Lists', 'Stacks & Queues', 'Trees & Graphs', 'Hash Tables'],
  'Algorithms': ['Sorting', 'Searching', 'Dynamic Programming', 'Greedy Algorithms'],
  'Object-Oriented Programming': ['Classes & Objects', 'Inheritance', 'Polymorphism', 'Design Patterns'],
  'Database Systems': ['ER Modeling', 'Normalization', 'SQL Queries', 'Transactions'],
  'Discrete Mathematics': ['Logic', 'Sets & Relations', 'Graph Theory', 'Combinatorics'],
};

const statusColors: Record<string, string> = {
  Active: 'bg-green-500/20 text-green-400',
  Draft: 'bg-yellow-500/20 text-yellow-400',
  Completed: 'bg-blue-500/20 text-blue-400',
};

function emptyQuestion(id: number): Question {
  return { id, text: '', options: ['', '', '', ''], correctOption: 0 };
}

export function QuizzesPage() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [quizzes, setQuizzes] = useState<Quiz[]>(MOCK_QUIZZES);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIModal, setShowAIModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const resetForm = () => {
    setQuizTitle('');
    setSelectedCourse('');
    setDuration(30);
    setDifficulty('Medium');
    setQuestions([emptyQuestion(1)]);
  };

  const addQuestion = () => {
    setQuestions(prev => [...prev, emptyQuestion(prev.length + 1)]);
  };

  const removeQuestion = (id: number) => {
    if (questions.length > 1) {
      setQuestions(prev => prev.filter(q => q.id !== id));
    }
  };

  const updateQuestionText = (id: number, text: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, text } : q));
  };

  const updateOption = (qId: number, optIndex: number, value: string) => {
    setQuestions(prev => prev.map(q =>
      q.id === qId ? { ...q, options: q.options.map((o, i) => i === optIndex ? value : o) } : q
    ));
  };

  const updateCorrectOption = (qId: number, optIndex: number) => {
    setQuestions(prev => prev.map(q => q.id === qId ? { ...q, correctOption: optIndex } : q));
  };

  const handleCreateQuiz = () => {
    if (!quizTitle || !selectedCourse) return;
    const newQuiz: Quiz = {
      id: quizzes.length + 1,
      title: quizTitle,
      course: selectedCourse,
      status: 'Draft',
      questions: questions.length,
      date: new Date().toISOString().slice(0, 10),
      attempts: 0,
      duration,
    };
    setQuizzes(prev => [newQuiz, ...prev]);
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
    setAiLectures(prev =>
      prev.includes(lecture) ? prev.filter(l => l !== lecture) : [...prev, lecture]
    );
  };

  const publishQuiz = (id: number) => {
    setQuizzes(prev => prev.map(q => q.id === id ? { ...q, status: 'Active' as const } : q));
  };

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
            {t('Create, manage, and analyze your quizzes', 'إنشاء وإدارة وتحليل اختباراتك')}
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => { resetForm(); setShowCreateModal(true); }}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            {t('Create New Quiz', 'إنشاء اختبار جديد')}
          </button>
          <button
            onClick={() => setShowAIModal(true)}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            {t('AI Generate', 'توليد بالذكاء الاصطناعي')}
          </button>
        </div>
      </div>

      {/* Quiz Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {quizzes.map(quiz => (
          <div key={quiz.id} className={`${cardClass} p-5`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold truncate ${headingClass}`}>{quiz.title}</h3>
                <p className={`text-sm mt-1 ${secondaryText}`}>{quiz.course}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ml-2 ${statusColors[quiz.status]}`}>
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
                {quiz.duration} {t('min', 'د')}
              </span>
              <span className={`flex items-center gap-1.5 ${secondaryText}`}>
                <Users className="h-4 w-4" />
                {quiz.attempts} {t('attempts', 'محاولات')}
              </span>
            </div>

            <p className={`text-xs mb-4 ${secondaryText}`}>{quiz.date}</p>

            <div className="flex flex-wrap gap-2">
              <button className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                <Eye className="h-3.5 w-3.5" />
                {t('View Attempts', 'عرض المحاولات')}
              </button>
              <button className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                <Edit2 className="h-3.5 w-3.5" />
                {t('Edit Quiz', 'تعديل الاختبار')}
              </button>
              <button className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${isDark ? 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'}`}>
                <Sparkles className="h-3.5 w-3.5" />
                {t('Generate with AI', 'توليد بالذكاء الاصطناعي')}
              </button>
              <button className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${isDark ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                <BarChart3 className="h-3.5 w-3.5" />
                {t('Analyze Results', 'تحليل النتائج')}
              </button>
              {quiz.status === 'Draft' && (
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

      {/* Create Quiz Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4">
          <div className={`w-full max-w-3xl my-8 rounded-2xl border p-6 ${isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold ${headingClass}`}>
                {t('Create New Quiz', 'إنشاء اختبار جديد')}
              </h2>
              <button onClick={() => setShowCreateModal(false)} className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
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
                  onChange={e => setQuizTitle(e.target.value)}
                  placeholder={t('Enter quiz title...', 'أدخل عنوان الاختبار...')}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>
                  {t('Course', 'المادة')}
                </label>
                <select
                  value={selectedCourse}
                  onChange={e => setSelectedCourse(e.target.value)}
                  className={inputClass}
                >
                  <option value="">{t('Select course', 'اختر المادة')}</option>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>
                  {t('Duration (minutes)', 'المدة (دقائق)')}
                </label>
                <input
                  type="number"
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                  min={5}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>
                  {t('Difficulty', 'الصعوبة')}
                </label>
                <select
                  value={difficulty}
                  onChange={e => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                  className={inputClass}
                >
                  <option value="Easy">{t('Easy', 'سهل')}</option>
                  <option value="Medium">{t('Medium', 'متوسط')}</option>
                  <option value="Hard">{t('Hard', 'صعب')}</option>
                </select>
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
                      onChange={e => updateQuestionText(q.id, e.target.value)}
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
                            onChange={e => updateOption(q.id, optIndex, e.target.value)}
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

      {/* AI Generation Modal */}
      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className={`w-full max-w-lg rounded-2xl border p-6 ${isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-bold flex items-center gap-2 ${headingClass}`}>
                <Sparkles className="h-5 w-5 text-purple-400" />
                {t('AI Quiz Generation', 'توليد اختبار بالذكاء الاصطناعي')}
              </h2>
              <button onClick={() => setShowAIModal(false)} className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-500'}`}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>
                  {t('Course', 'المادة')}
                </label>
                <select
                  value={aiCourse}
                  onChange={e => { setAiCourse(e.target.value); setAiLectures([]); }}
                  className={inputClass}
                >
                  <option value="">{t('Select course', 'اختر المادة')}</option>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {aiCourse && (
                <div>
                  <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>
                    {t('Lectures', 'المحاضرات')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {LECTURES[aiCourse]?.map(lecture => (
                      <button
                        key={lecture}
                        onClick={() => toggleLecture(lecture)}
                        className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                          aiLectures.includes(lecture)
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : isDark ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
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
                    onChange={e => setAiNumQuestions(Number(e.target.value))}
                    min={1}
                    max={50}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${secondaryText}`}>
                    {t('Difficulty', 'الصعوبة')}
                  </label>
                  <select
                    value={aiDifficulty}
                    onChange={e => setAiDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                    className={inputClass}
                  >
                    <option value="Easy">{t('Easy', 'سهل')}</option>
                    <option value="Medium">{t('Medium', 'متوسط')}</option>
                    <option value="Hard">{t('Hard', 'صعب')}</option>
                  </select>
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
                className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors disabled:opacity-50"
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
    </div>
  );
}

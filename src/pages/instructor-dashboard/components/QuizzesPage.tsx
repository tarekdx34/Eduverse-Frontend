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

interface QuizQuestion {
  id: number;
  text: string;
  options: string[];
  correctOption: number;
}

interface QuizFormData {
  title: string;
  course: string;
  duration: number;
  difficulty: string;
  questions: QuizQuestion[];
}

interface QuizData {
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
  text: '',
  options: ['', '', '', ''],
  correctOption: 0,
});

const defaultFormData = (): QuizFormData => ({
  title: '',
  course: '',
  duration: 30,
  difficulty: 'Medium',
  questions: [defaultQuestion()],
});

const courseLectures: Record<string, string[]> = {
  'Calculus I': ['Lecture 1: Limits', 'Lecture 2: Continuity', 'Lecture 3: Derivatives Intro'],
  'Calculus II': ['Lecture 1: Integration', 'Lecture 2: Techniques', 'Lecture 3: Applications'],
  'Physics I': ['Lecture 1: Kinematics', 'Lecture 2: Dynamics', 'Lecture 3: Energy'],
};

export function QuizzesPage() {
  const { t, isRTL } = useLanguage();
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;

  const [quizzes, setQuizzes] = useState<QuizData[]>([
    {
      title: 'Quiz 3 — Derivatives',
      subject: 'Calculus II',
      subjectColor: 'bg-blue-100 text-blue-700',
      date: 'May 14, 10:00 AM',
      questions: 12,
      attempted: 52,
      total: 52,
      difficulty: 'Medium',
      difficultyColor: 'bg-yellow-100 text-yellow-700',
      duration: 30,
      status: 'Active',
      statusColor: 'bg-green-100 text-green-700',
    },
    {
      title: 'Quiz 2 — Limits and Continuity',
      subject: 'Calculus I',
      subjectColor: 'bg-blue-100 text-blue-700',
      date: 'May 10, 10:00 AM',
      questions: 10,
      attempted: 52,
      total: 52,
      difficulty: 'Easy',
      difficultyColor: 'bg-green-100 text-green-700',
      duration: 25,
      status: 'Closed',
      statusColor: 'bg-gray-100 text-gray-700',
    },
    {
      title: 'Quiz 4 — Kinematics',
      subject: 'Physics I',
      subjectColor: 'bg-purple-100 text-purple-700',
      date: 'May 18, 2:00 PM',
      questions: 15,
      attempted: 0,
      total: 43,
      difficulty: 'Hard',
      difficultyColor: 'bg-red-100 text-red-700',
      duration: 45,
      status: 'Scheduled',
      statusColor: 'bg-blue-100 text-blue-700',
    },
  ]);

  // Create / Edit quiz form state
  const [showCreateQuiz, setShowCreateQuiz] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<QuizFormData>(defaultFormData());

  // AI generation modal state
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiCourse, setAiCourse] = useState('');
  const [aiLectures, setAiLectures] = useState<string[]>([]);
  const [aiNumQuestions, setAiNumQuestions] = useState(5);
  const [aiDifficulty, setAiDifficulty] = useState('Medium');
  const [aiGenerating, setAiGenerating] = useState(false);

  // View attempts state
  const [viewAttemptsIndex, setViewAttemptsIndex] = useState<number | null>(null);

  // --- Helpers ---
  const openCreateForm = () => {
    setFormData(defaultFormData());
    setEditingIndex(null);
    setShowCreateQuiz(true);
  };

  const openEditForm = (index: number) => {
    const quiz = quizzes[index];
    const questions: QuizQuestion[] = Array.from({ length: quiz.questions }, (_, i) => ({
      id: Date.now() + i,
      text: `Sample question ${i + 1} for ${quiz.title}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctOption: 0,
    }));
    setFormData({
      title: quiz.title,
      course: quiz.subject,
      duration: quiz.duration,
      difficulty: quiz.difficulty,
      questions,
    });
    setEditingIndex(index);
    setShowCreateQuiz(true);
  };

  const saveQuiz = () => {
    const courseColorMap: Record<string, string> = {
      'Calculus I': 'bg-blue-100 text-blue-700',
      'Calculus II': 'bg-blue-100 text-blue-700',
      'Physics I': 'bg-purple-100 text-purple-700',
    };
    const diffColorMap: Record<string, string> = {
      Easy: 'bg-green-100 text-green-700',
      Medium: 'bg-yellow-100 text-yellow-700',
      Hard: 'bg-red-100 text-red-700',
    };
    const newQuiz: QuizData = {
      title: formData.title,
      subject: formData.course,
      subjectColor: courseColorMap[formData.course] || 'bg-blue-100 text-blue-700',
      date: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }),
      questions: formData.questions.length,
      attempted: 0,
      total: 52,
      difficulty: formData.difficulty,
      difficultyColor: diffColorMap[formData.difficulty] || 'bg-yellow-100 text-yellow-700',
      duration: formData.duration,
      status: 'Scheduled',
      statusColor: 'bg-blue-100 text-blue-700',
    };
    if (editingIndex !== null) {
      setQuizzes((prev) => prev.map((q, i) => (i === editingIndex ? newQuiz : q)));
    } else {
      setQuizzes((prev) => [...prev, newQuiz]);
    }
    setShowCreateQuiz(false);
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
      const generated: QuizQuestion[] = Array.from({ length: aiNumQuestions }, (_, i) => ({
        id: Date.now() + i,
        text: `[AI] ${aiCourse} — Question ${i + 1}: What is the key concept covered in ${aiLectures[i % aiLectures.length] || 'the selected lectures'}?`,
        options: ['Correct answer', 'Distractor A', 'Distractor B', 'Distractor C'],
        correctOption: 0,
      }));
      setFormData({
        title: `AI Quiz — ${aiCourse}`,
        course: aiCourse,
        duration: aiNumQuestions * 3,
        difficulty: aiDifficulty,
        questions: generated,
      });
      setAiGenerating(false);
      setShowAIModal(false);
      setEditingIndex(null);
      setShowCreateQuiz(true);
    }, 2000);
  };

  const publishQuiz = (index: number) => {
    setQuizzes((prev) =>
      prev.map((q, i) =>
        i === index ? { ...q, status: 'Active', statusColor: 'bg-green-100 text-green-700' } : q
      )
    );
  };

  const analyzeResults = (quiz: QuizData) => {
    alert(
      `Analysis for "${quiz.title}":\n• Average Score: 78%\n• Highest: 96%\n• Lowest: 42%\n• Median: 80%\n• ${quiz.attempted}/${quiz.total} students attempted`
    );
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

  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold ${headingCls}`}>
              {t('quizzesManagement')}
            </h1>
            <p className={`${subCls} mt-1`}>{t('quizzesDescription')}</p>
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
        <div className="flex flex-wrap items-center gap-4">
          <CustomDropdown
            label={t('courseLabel')}
            value="all"
            options={[
              { value: 'all', label: t('allCourses') },
              { value: 'calculus', label: 'Calculus I' },
              { value: 'physics', label: 'Physics I' },
            ]}
            onChange={() => {}}
          />
          <CustomDropdown
            label={t('statusLabel')}
            value="active"
            options={[
              { value: 'all', label: t('all') },
              { value: 'active', label: t('active') },
              { value: 'closed', label: t('closed') },
            ]}
            onChange={() => {}}
          />
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search
              className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}
              size={18}
            />
            <input
              type="text"
              placeholder={t('searchQuizzes')}
              className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
            />
          </div>
        </div>

        {/* Quiz Cards */}
        <div className="space-y-4">
          {quizzes.map((quiz, index) => (
            <div key={index} className={`rounded-xl p-4 sm:p-6 border shadow-sm ${cardCls}`}>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <h3 className={`text-lg font-semibold truncate ${headingCls}`}>{quiz.title}</h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${quiz.subjectColor}`}
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
                  onClick={() => setViewAttemptsIndex(viewAttemptsIndex === index ? null : index)}
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
                  onClick={() => analyzeResults(quiz)}
                  className={`flex items-center gap-2 px-3 py-2 text-sm ${btnSecCls} focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 rounded-lg transition-colors`}
                >
                  <BarChart3 size={16} />
                  {t('analyzeResults')}
                </button>
                {quiz.status === 'Scheduled' && (
                  <button
                    onClick={() => publishQuiz(index)}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 rounded-lg transition-colors ml-auto"
                  >
                    {t('publish')}
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
                          <th className="text-left pb-2 font-medium">Time</th>
                          <th className="text-left pb-2 font-medium">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockAttempts.map((a, i) => (
                          <tr
                            key={i}
                            className={`border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}
                          >
                            <td className={`py-2 ${headingCls}`}>{a.name}</td>
                            <td
                              className={`py-2 ${a.score >= 90 ? 'text-green-500' : a.score >= 70 ? 'text-yellow-500' : 'text-red-500'} font-medium`}
                            >
                              {a.score}%
                            </td>
                            <td className={`py-2 ${subCls}`}>{a.time}</td>
                            <td className={`py-2 ${subCls}`}>{a.date}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
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
                <select
                  value={formData.course}
                  onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
                >
                  <option value="">Select course</option>
                  <option value="Calculus I">Calculus I</option>
                  <option value="Calculus II">Calculus II</option>
                  <option value="Physics I">Physics I</option>
                </select>
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
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-4 mb-6">
              <h3 className={`text-lg font-semibold ${headingCls}`}>
                {t('questions') || 'Questions'} ({formData.questions.length})
              </h3>
              {formData.questions.map((q, qIdx) => (
                <div key={q.id} className={`p-4 rounded-lg border ${cardCls}`}>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className={`text-sm font-medium ${subCls}`}>Question {qIdx + 1}</span>
                    {formData.questions.length > 1 && (
                      <button
                        onClick={() => removeQuestion(q.id)}
                        className="text-red-500 hover:text-red-700 p-1"
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {q.options.map((opt, oIdx) => (
                      <label key={oIdx} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`correct-${q.id}`}
                          checked={q.correctOption === oIdx}
                          onChange={() => updateQuestion(q.id, 'correctOption', oIdx)}
                          className="accent-indigo-600"
                        />
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
                      </label>
                    ))}
                  </div>
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
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCreateQuiz(false)}
                className={`px-4 py-2 text-sm rounded-lg border ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={saveQuiz}
                className="px-6 py-2 text-sm text-white rounded-lg transition-colors"
                style={{ backgroundColor: primaryHex }}
              >
                {editingIndex !== null ? 'Update Quiz' : 'Save Quiz'}
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
                <Sparkles size={20} className="text-purple-500" />
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
                <select
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
                </select>
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
                  <select
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(e.target.value)}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
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

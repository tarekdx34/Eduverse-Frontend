import {
  CheckCircle,
  Circle,
  Calendar,
  Clock,
  Hash,
  Plus,
  Trash2,
  Bookmark,
  AlertCircle,
  Flag,
  MinusCircle,
} from 'lucide-react';
import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { assignments } from './Assignments';

interface Todo {
  id: number | string;
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  isCompleted: boolean;
  tags: string[];
}

export function SmartTodoReminder() {
  const { t, isRTL } = useLanguage();
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';

  const assignmentTodos: Todo[] = assignments
    .filter((a) => a.status === 'pending' || a.status === 'in-progress')
    .map((a) => ({
      id: `assign-${a.id}`,
      title: a.title,
      description: a.course,
      dueDate: a.dueDate,
      dueTime: a.dueTime,
      priority: a.priority as 'high' | 'medium' | 'low',
      category: 'Assignment',
      isCompleted: false,
      tags: [a.courseCode, a.type],
    }));

  const [todos, setTodos] = useState<Todo[]>([
    ...assignmentTodos,
    {
      id: 1,
      title: 'Complete CS201 Assignment',
      description: 'Finish the data structures project on binary trees',
      dueDate: '2024-12-05',
      dueTime: '11:59 PM',
      priority: 'high',
      category: 'Academic',
      isCompleted: false,
      tags: ['Assignment', 'CS201'],
    },
    {
      id: 2,
      title: 'Study for Database Exam',
      description: 'Review chapters 5-8 for the midterm exam',
      dueDate: '2024-12-08',
      dueTime: '02:00 PM',
      priority: 'high',
      category: 'Academic',
      isCompleted: false,
      tags: ['Exam', 'CS220'],
    },
    {
      id: 3,
      title: 'Submit Financial Aid Form',
      description: 'Complete and submit the financial aid application',
      dueDate: '2024-12-10',
      dueTime: '05:00 PM',
      priority: 'medium',
      category: 'Financial',
      isCompleted: false,
      tags: ['Important', 'Deadline'],
    },
    {
      id: 4,
      title: 'Attend Club Meeting',
      description: 'Programming club weekly meeting',
      dueDate: '2024-12-06',
      dueTime: '04:00 PM',
      priority: 'low',
      category: 'Events',
      isCompleted: true,
      tags: ['Club', 'Meeting'],
    },
    {
      id: 5,
      title: 'Project Presentation Preparation',
      description: 'Prepare slides for software engineering project',
      dueDate: '2024-12-07',
      dueTime: '10:00 AM',
      priority: 'high',
      category: 'Academic',
      isCompleted: false,
      tags: ['Presentation', 'CS305'],
    },
    {
      id: 6,
      title: 'Lab Report Submission',
      description: 'Submit the web development lab report',
      dueDate: '2024-12-06',
      dueTime: '11:59 PM',
      priority: 'medium',
      category: 'Academic',
      isCompleted: false,
      tags: ['Lab', 'CS150'],
    },
    {
      id: 7,
      title: 'Pay Tuition Fees',
      description: 'Pay remaining tuition balance for this semester',
      dueDate: '2024-12-15',
      dueTime: '11:59 PM',
      priority: 'high',
      category: 'Financial',
      isCompleted: false,
      tags: ['Payment', 'Important'],
    },
    {
      id: 8,
      title: 'Office Hours with Prof. Chen',
      description: 'Discuss algorithm assignment questions',
      dueDate: '2024-12-05',
      dueTime: '03:00 PM',
      priority: 'medium',
      category: 'Academic',
      isCompleted: false,
      tags: ['Office Hours', 'CS201'],
    },
  ]);

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const toggleTodo = (id: number | string) => {
    setTodos(
      todos.map((todo) => (todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo))
    );
  };

  const deleteTodo = (id: number | string) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    if (isDark) {
      switch (priority) {
        case 'high':
          return 'bg-red-900/50 text-red-400 border-red-700';
        case 'medium':
          return 'bg-orange-900/50 text-orange-400 border-orange-700';
        case 'low':
          return 'bg-blue-900/50 text-blue-400 border-blue-700';
        default:
          return 'bg-white/5 text-slate-500 border-white/10';
      }
    }
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      case 'medium':
        return <Flag className="w-4 h-4" />;
      case 'low':
        return <MinusCircle className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDueDateColor = (dueDate: string, isCompleted: boolean) => {
    if (isCompleted) return 'text-slate-500';
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return 'text-red-600 font-semibold';
    if (days === 0) return 'text-orange-600 font-semibold';
    if (days === 1) return 'text-orange-600 font-semibold';
    if (days <= 3) return 'text-yellow-600';
    return 'text-slate-600';
  };

  const filteredTodos = todos
    .filter((todo) => {
      if (filter === 'pending') return !todo.isCompleted;
      if (filter === 'completed') return todo.isCompleted;
      return true;
    })
    .filter((todo) => {
      if (priorityFilter === 'all') return true;
      return todo.priority === priorityFilter;
    })
    .sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (a.priority !== b.priority) {
        return (
          priorityOrder[a.priority as keyof typeof priorityOrder] -
          priorityOrder[b.priority as keyof typeof priorityOrder]
        );
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const pendingCount = todos.filter((t) => !t.isCompleted).length;
  const completedCount = todos.filter((t) => t.isCompleted).length;
  const highPriorityCount = todos.filter((t) => !t.isCompleted && t.priority === 'high').length;
  const dueTodayCount = todos.filter(
    (t) => !t.isCompleted && getDaysUntilDue(t.dueDate) === 0
  ).length;

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high':
        return t('high');
      case 'medium':
        return t('medium');
      case 'low':
        return t('low');
      default:
        return priority;
    }
  };

  return (
    <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 mt-6 px-1">
        <div>
          <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {t('smartTodo')}
          </h1>
          <p className={`text-slate-500 mt-1 font-medium`}>
            {isRTL
              ? 'ابق منظماً مع إدارة المهام الذكية'
              : 'Stay organized with AI-powered task management'}
          </p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-[var(--accent-color)] text-white rounded-xl hover:opacity-90 transition-all font-semibold shadow-lg shadow-[var(--accent-color)]/20">
          <Plus className="w-5 h-5" />
          {t('addTask')}
        </button>
      </div>

      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div
          className={`rounded-[2.5rem] p-6 ${isDark ? 'bg-card-dark border border-white/5' : 'glass'}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-[var(--accent-color)]/20' : 'bg-[var(--accent-color)]/10'}`}
            >
              <Circle
                className={`w-5 h-5 ${isDark ? 'text-[var(--accent-color)]/70' : 'text-[var(--accent-color)]'}`}
              />
            </div>
            <span className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
              {t('pending')}
            </span>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {pendingCount}
          </p>
        </div>

        <div
          className={`rounded-[2.5rem] p-6 ${isDark ? 'bg-card-dark border border-white/5' : 'glass'}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-green-900/50' : 'bg-green-100'}`}
            >
              <CheckCircle className={`w-5 h-5 ${isDark ? 'text-green-400' : 'text-green-600'}`} />
            </div>
            <span className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
              {t('completed')}
            </span>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {completedCount}
          </p>
        </div>

        <div
          className={`rounded-[2.5rem] p-6 ${isDark ? 'bg-card-dark border border-white/5' : 'glass'}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-red-900/50' : 'bg-red-100'}`}
            >
              <AlertCircle className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
            </div>
            <span className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
              {t('high')} {t('priority')}
            </span>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {highPriorityCount}
          </p>
        </div>

        <div
          className={`rounded-[2.5rem] p-6 ${isDark ? 'bg-card-dark border border-white/5' : 'glass'}`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-orange-900/50' : 'bg-orange-100'}`}
            >
              <Calendar className={`w-5 h-5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`} />
            </div>
            <span className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
              {isRTL ? 'مستحق اليوم' : 'Due Today'}
            </span>
          </div>
          <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {dueTodayCount}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div
        className={`rounded-[2.5rem] p-4 mb-6 ${isDark ? 'bg-card-dark border border-white/5' : 'glass'}`}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
              {t('status')}:
            </span>
            <div className="flex gap-2">
              {(['all', 'pending', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm capitalize font-medium transition-colors ${
                    filter === f
                      ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/20'
                      : isDark
                        ? 'bg-white/5 text-slate-400 hover:bg-white/10'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {f === 'all' ? t('all') : f === 'pending' ? t('pending') : t('completed')}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
              {t('priority')}:
            </span>
            <div className="flex gap-2">
              {(['all', 'high', 'medium', 'low'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm capitalize font-medium transition-colors ${
                    priorityFilter === p
                      ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] border border-[var(--accent-color)]/20'
                      : isDark
                        ? 'bg-white/5 text-slate-400 hover:bg-white/10'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {p === 'all' ? t('all') : getPriorityText(p)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Todo List */}
      <div className="space-y-3">
        {filteredTodos.map((todo) => (
          <div
            key={todo.id}
            className={`rounded-[2.5rem] p-5 hover:shadow-lg transition-all ${
              isDark
                ? todo.isCompleted
                  ? 'bg-white/5 border border-white/5 opacity-65'
                  : 'bg-card-dark border border-white/5'
                : todo.isCompleted
                  ? 'opacity-65 glass'
                  : 'glass'
            }`}
          >
            <div className="flex items-start gap-4">
              <button
                onClick={() => toggleTodo(todo.id)}
                className="mt-1 flex-shrink-0 transition-colors"
              >
                {todo.isCompleted ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <Circle
                    className={`w-6 h-6 hover:text-[var(--accent-color)] ${isDark ? 'text-slate-500' : 'text-slate-500'}`}
                  />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3
                      className={`font-semibold mb-1 ${
                        todo.isCompleted
                          ? 'line-through text-slate-500'
                          : isDark
                            ? 'text-white'
                            : 'text-slate-800'
                      }`}
                    >
                      {todo.title}
                    </h3>
                    <p className={`text-sm mb-3 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                      {todo.description}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className={`ml-4 p-2 rounded-lg transition-colors ${isDark ? 'text-slate-500 hover:text-red-400 hover:bg-red-900/30' : 'text-slate-500 hover:text-red-600 hover:bg-red-50'}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3 flex-wrap mb-3">
                  <span
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                      todo.priority
                    )}`}
                  >
                    {getPriorityIcon(todo.priority)}
                    {todo.priority} priority
                  </span>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-700'}`}
                  >
                    {todo.category}
                  </span>

                  <span
                    className={`flex items-center gap-1.5 text-xs font-medium ${getDueDateColor(
                      todo.dueDate,
                      todo.isCompleted
                    )}`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(todo.dueDate).toLocaleDateString()}
                  </span>

                  <span
                    className={`flex items-center gap-1.5 text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {todo.dueTime}
                  </span>

                  {!todo.isCompleted && getDaysUntilDue(todo.dueDate) >= 0 && (
                    <span
                      className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
                    >
                      {getDaysUntilDue(todo.dueDate) === 0
                        ? '🔴 Due today'
                        : getDaysUntilDue(todo.dueDate) === 1
                          ? '🟠 Due tomorrow'
                          : `⏱️ ${getDaysUntilDue(todo.dueDate)} days left`}
                    </span>
                  )}

                  {!todo.isCompleted && getDaysUntilDue(todo.dueDate) < 0 && (
                    <span
                      className={`px-2 py-1 rounded font-medium text-xs ${isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700'}`}
                    >
                      ⚠️ Overdue by {Math.abs(getDaysUntilDue(todo.dueDate))} days
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {todo.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${isDark ? 'bg-[var(--accent-color)]/20 text-[var(--accent-color)]/70 border-[var(--accent-color)]/50' : 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] border-[var(--accent-color)]/10'}`}
                    >
                      <Hash className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTodos.length === 0 && (
        <div
          className={`text-center py-12 rounded-[2.5rem] ${isDark ? 'bg-card-dark border border-white/5' : 'glass'}`}
        >
          <Circle
            className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}
          />
          <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            No tasks found
          </h3>
          <p className={`mb-4 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
            {filter === 'completed'
              ? "You haven't completed any tasks yet"
              : 'Try adjusting your filters or create a new task'}
          </p>
        </div>
      )}
    </div>
  );
}

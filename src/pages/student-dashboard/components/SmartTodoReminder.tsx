import { CheckCircle, Circle, Calendar, Clock, Tag, Plus, Trash2, Star, AlertCircle } from 'lucide-react';
import { useState } from 'react';

interface Todo {
  id: number;
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
  const [todos, setTodos] = useState<Todo[]>([
    {
      id: 1,
      title: 'Complete CS201 Assignment',
      description: 'Finish the data structures project on binary trees',
      dueDate: '2024-12-05',
      dueTime: '11:59 PM',
      priority: 'high',
      category: 'Academic',
      isCompleted: false,
      tags: ['Assignment', 'CS201']
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
      tags: ['Exam', 'CS220']
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
      tags: ['Important', 'Deadline']
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
      tags: ['Club', 'Meeting']
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
      tags: ['Presentation', 'CS305']
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
      tags: ['Lab', 'CS150']
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
      tags: ['Payment', 'Important']
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
      tags: ['Office Hours', 'CS201']
    }
  ]);

  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');

  const toggleTodo = (id: number) => {
    setTodos(todos.map(todo =>
      todo.id === id ? { ...todo, isCompleted: !todo.isCompleted } : todo
    ));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'low':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="w-4 h-4" />;
      case 'medium':
        return <Star className="w-4 h-4" />;
      case 'low':
        return <Circle className="w-4 h-4" />;
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
    if (isCompleted) return 'text-gray-500';
    const days = getDaysUntilDue(dueDate);
    if (days < 0) return 'text-red-600 font-semibold';
    if (days === 0) return 'text-orange-600 font-semibold';
    if (days === 1) return 'text-orange-600 font-semibold';
    if (days <= 3) return 'text-yellow-600';
    return 'text-gray-600';
  };

  const filteredTodos = todos
    .filter(todo => {
      if (filter === 'pending') return !todo.isCompleted;
      if (filter === 'completed') return todo.isCompleted;
      return true;
    })
    .filter(todo => {
      if (priorityFilter === 'all') return true;
      return todo.priority === priorityFilter;
    })
    .sort((a, b) => {
      if (a.isCompleted !== b.isCompleted) {
        return a.isCompleted ? 1 : -1;
      }
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
      }
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  const pendingCount = todos.filter(t => !t.isCompleted).length;
  const completedCount = todos.filter(t => t.isCompleted).length;
  const highPriorityCount = todos.filter(t => !t.isCompleted && t.priority === 'high').length;
  const dueTodayCount = todos.filter(t => !t.isCompleted && getDaysUntilDue(t.dueDate) === 0).length;

  return (
    <div className="p-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Circle className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-gray-600 text-sm font-medium">Pending Tasks</span>
          </div>
          <p className="text-gray-900 text-3xl font-bold">{pendingCount}</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-gray-600 text-sm font-medium">Completed</span>
          </div>
          <p className="text-gray-900 text-3xl font-bold">{completedCount}</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-gray-600 text-sm font-medium">High Priority</span>
          </div>
          <p className="text-gray-900 text-3xl font-bold">{highPriorityCount}</p>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-gray-600 text-sm font-medium">Due Today</span>
          </div>
          <p className="text-gray-900 text-3xl font-bold">{dueTodayCount}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-gray-900 font-semibold text-xl mb-1">Smart To-Do List</h2>
          <p className="text-gray-500 text-sm">Stay organized with AI-powered task management</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium">
          <Plus className="w-5 h-5" />
          Add New Task
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Status:</span>
            <div className="flex gap-2">
              {(['all', 'pending', 'completed'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-sm capitalize font-medium transition-colors ${
                    filter === f
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">Priority:</span>
            <div className="flex gap-2">
              {(['all', 'high', 'medium', 'low'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriorityFilter(p)}
                  className={`px-3 py-1.5 rounded-lg text-sm capitalize font-medium transition-colors ${
                    priorityFilter === p
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {p}
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
            className={`bg-white rounded-lg border border-gray-200 p-5 hover:shadow-lg transition-all ${
              todo.isCompleted ? 'opacity-65 bg-gray-50' : ''
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
                  <Circle className="w-6 h-6 text-gray-400 hover:text-indigo-600" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3
                      className={`text-gray-900 font-semibold mb-1 ${
                        todo.isCompleted ? 'line-through text-gray-500' : ''
                      }`}
                    >
                      {todo.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3">{todo.description}</p>
                  </div>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="ml-4 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
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

                  <span className="flex items-center gap-1.5 text-xs text-gray-600">
                    <Clock className="w-3.5 h-3.5" />
                    {todo.dueTime}
                  </span>

                  {!todo.isCompleted && getDaysUntilDue(todo.dueDate) >= 0 && (
                    <span className="text-xs text-gray-600 font-medium">
                      {getDaysUntilDue(todo.dueDate) === 0
                        ? '🔴 Due today'
                        : getDaysUntilDue(todo.dueDate) === 1
                        ? '🟠 Due tomorrow'
                        : `⏱️ ${getDaysUntilDue(todo.dueDate)} days left`}
                    </span>
                  )}

                  {!todo.isCompleted && getDaysUntilDue(todo.dueDate) < 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded font-medium text-xs">
                      ⚠️ Overdue by {Math.abs(getDaysUntilDue(todo.dueDate))} days
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {todo.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium border border-indigo-100"
                    >
                      <Tag className="w-3 h-3" />
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
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Circle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 font-semibold mb-2">No tasks found</h3>
          <p className="text-gray-600 mb-4">
            {filter === 'completed'
              ? "You haven't completed any tasks yet"
              : 'Try adjusting your filters or create a new task'}
          </p>
        </div>
      )}
    </div>
  );
}

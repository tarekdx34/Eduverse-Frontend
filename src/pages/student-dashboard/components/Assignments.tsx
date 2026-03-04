import {
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Circle,
  Filter,
  TrendingUp,
  Award,
  Target,
  ChevronRight,
  Search,
  SlidersHorizontal,
  Download,
  Eye,
} from 'lucide-react';
import { useState } from 'react';
import AssignmentDetails from './AssignmentDetails';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CustomDropdown } from '../../../components/shared';
import { useApi } from '../../../hooks/useApi';
import { assignmentService } from '../../../services/api/assignmentService';
import { LoadingSkeleton } from '../../../components/shared';

const getDaysUntilDue = (dueDate: string) => {
  const today = new Date();
  const due = new Date(dueDate);
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'pending':
      return 'bg-red-50 text-red-700 border-red-200';
    case 'in-progress':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'submitted':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'graded':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    default:
      return 'bg-background-light text-slate-700 border-slate-100';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Circle className="w-3 h-3" />;
    case 'in-progress':
      return <AlertCircle className="w-3 h-3" />;
    case 'submitted':
    case 'graded':
      return <CheckCircle className="w-3 h-3" />;
    default:
      return <Circle className="w-3 h-3" />;
  }
};

export default function Assignments() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();

  const { data: apiAssignments, loading } = useApi(
    () => assignmentService.listAssignments(),
    []
  );

  const statusColors: Record<string, { color: string; colorLight: string; colorBorder: string }> = {
    draft: { color: 'bg-slate-500', colorLight: 'bg-slate-50', colorBorder: 'border-slate-500' },
    published: { color: 'bg-blue-500', colorLight: 'bg-blue-50', colorBorder: 'border-blue-500' },
    closed: { color: 'bg-green-500', colorLight: 'bg-green-50', colorBorder: 'border-green-500' },
  };

  const assignments = (apiAssignments || []).map((a: any) => {
    const colors = statusColors[a.status] || statusColors.published;
    const dueDateStr = a.dueDate?.split('T')[0] || '';
    return {
      id: a.id,
      title: a.title,
      course: a.course?.name || '',
      courseCode: a.course?.code || '',
      type: a.type || 'Assignment',
      dueDate: dueDateStr,
      dueTime: a.dueDate ? new Date(a.dueDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '11:59 PM',
      status: a.status === 'published' ? 'pending' : a.status === 'closed' ? 'graded' : a.status,
      priority: getDaysUntilDue(dueDateStr) <= 3 ? 'high' : getDaysUntilDue(dueDateStr) <= 7 ? 'medium' : 'low',
      description: a.description || '',
      points: a.totalPoints,
      submittedPoints: null as number | null,
      progress: 0,
      ...colors,
    };
  });

  if (loading) {
    return <LoadingSkeleton variant="list" count={5} />;
  }

  const getUrgencyLabel= (daysUntil: number) => {
    if (daysUntil < 0)
      return {
        label: t('overdue'),
        color: 'text-red-600',
        bg: isDark ? 'bg-red-900/50' : 'bg-red-50',
        border: isDark ? 'border-red-700' : 'border-red-500',
      };
    if (daysUntil === 0)
      return {
        label: t('dueToday'),
        color: 'text-red-600',
        bg: isDark ? 'bg-red-900/50' : 'bg-red-50',
        border: isDark ? 'border-red-700' : 'border-red-500',
      };
    if (daysUntil === 1)
      return {
        label: t('dueTomorrow'),
        color: isDark ? 'text-orange-400' : 'text-orange-600',
        bg: isDark ? 'bg-orange-900/50' : 'bg-orange-50',
        border: isDark ? 'border-orange-700' : 'border-orange-500',
      };
    if (daysUntil <= 3)
      return {
        label: `${daysUntil} ${t('daysLeft')}`,
        color: isDark ? 'text-amber-400' : 'text-amber-600',
        bg: isDark ? 'bg-amber-900/50' : 'bg-amber-50',
        border: isDark ? 'border-amber-700' : 'border-amber-500',
      };
    return {
      label: `${daysUntil} ${t('daysLeft')}`,
      color: isDark ? 'text-slate-400' : 'text-slate-600',
      bg: isDark ? 'bg-white/5' : 'bg-background-light',
      border: isDark ? 'border-white/10' : 'border-slate-200',
    };
  };

  const pendingAssignments = assignments.filter(
    (a) => a.status === 'pending' || a.status === 'in-progress'
  );
  const completedAssignments = assignments.filter(
    (a) => a.status === 'submitted' || a.status === 'graded'
  );

  if (selectedAssignmentId !== null) {
    return (
      <AssignmentDetails
        assignmentId={selectedAssignmentId}
        onBack={() => setSelectedAssignmentId(null)}
      />
    );
  }

  const avgScore = Math.round(
    completedAssignments
      .filter((a) => a.submittedPoints)
      .reduce((sum, a) => sum + (a.submittedPoints! / a.points) * 100, 0) /
      completedAssignments.filter((a) => a.submittedPoints).length
  );

  const totalPoints = assignments.reduce((sum, a) => sum + a.points, 0);
  const earnedPoints = completedAssignments
    .filter((a) => a.submittedPoints)
    .reduce((sum, a) => sum + a.submittedPoints!, 0);

  const filteredCompleted = completedAssignments.filter((a) => {
    const matchesSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || a.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadgeDark = (status: string) => {
    switch (status) {
      case 'pending':
        return isDark
          ? 'bg-red-900/50 text-red-400 border-red-700'
          : 'bg-red-50 text-red-700 border-red-200';
      case 'in-progress':
        return isDark
          ? 'bg-amber-900/50 text-amber-400 border-amber-700'
          : 'bg-amber-50 text-amber-700 border-amber-200';
      case 'submitted':
        return isDark
          ? 'bg-blue-900/50 text-blue-400 border-blue-700'
          : 'bg-blue-50 text-blue-700 border-blue-200';
      case 'graded':
        return isDark
          ? 'bg-emerald-900/50 text-emerald-400 border-emerald-700'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return isDark
          ? 'bg-white/5 text-slate-500 border-white/10'
          : 'bg-background-light text-slate-700 border-slate-100';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
          {t('stayOnTop')}
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Track your progress, manage deadlines, and achieve your academic goals
        </p>
      </div>

      {/* Active Assignments */}
      <div className="glass rounded-[2.5rem] shadow-sm overflow-hidden">
        <div
          className={`p-6 border-b ${isDark ? 'bg-white/5 border-white/5' : 'bg-gradient-to-r from-background-light to-white border-slate-100'}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {t('activeAssignments')}
              </h2>
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                {t('trackManageWork')}
              </p>
            </div>
            <button
              className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl text-sm transition-all ${isDark ? 'border-white/10 text-slate-400 hover:bg-white/5' : 'border-slate-100 text-slate-700 hover:bg-slate-50'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filter
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {pendingAssignments.length === 0 ? (
            <div className="text-center py-12">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}
              >
                <CheckCircle
                  className={`w-8 h-8 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}
                />
              </div>
              <h3 className={`mb-2 font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {t('allCaughtUp')}
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                {t('noPendingAssignments')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {pendingAssignments.map((assignment) => {
                const daysUntil = getDaysUntilDue(assignment.dueDate);
                const urgency = getUrgencyLabel(daysUntil);

                return (
                  <div
                    key={assignment.id}
                    className={`border-2 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer group ${
                      daysUntil <= 2
                        ? isDark
                          ? 'border-red-800 bg-red-900/20'
                          : 'border-red-200 bg-red-50/30'
                        : isDark
                          ? 'border-white/5 hover:border-[var(--accent-color)]'
                          : 'border-slate-100 hover:border-[var(--accent-color)]/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <h3
                            className={`group-hover:text-[var(--accent-color)] transition-colors text-base font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}
                          >
                            {assignment.title}
                          </h3>
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs ${getStatusBadgeDark(assignment.status)}`}
                          >
                            {getStatusIcon(assignment.status)}
                            <span className="capitalize">
                              {assignment.status === 'in-progress' ? t('inProgress') : t('pending')}
                            </span>
                          </span>
                        </div>
                        <p
                          className={`text-xs mb-3 leading-relaxed ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
                        >
                          {assignment.description}
                        </p>
                        <div
                          className={`flex items-center gap-2 text-xs flex-wrap mb-3 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
                        >
                          <div
                            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100'}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${assignment.color}`}></span>
                            <span
                              className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
                            >
                              {assignment.courseCode}
                            </span>
                          </div>
                          <span
                            className={`px-2 py-1 rounded-lg border ${isDark ? 'bg-white/5 text-slate-400 border-white/10' : 'bg-slate-50 text-slate-700 border-slate-100'}`}
                          >
                            {assignment.type}
                          </span>
                          {assignment.priority === 'high' && (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border ${isDark ? 'bg-red-900/50 text-red-400 border-red-700' : 'bg-red-100 text-red-700 border-red-200'}`}
                            >
                              <AlertCircle className="w-3 h-3" />
                              High Priority
                            </span>
                          )}
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border text-xs ${urgency.bg} ${urgency.color} ${urgency.border}`}
                          >
                            <Clock className="w-3 h-3" />
                            {urgency.label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`grid grid-cols-1 sm:grid-cols-3 gap-2 mb-3 rounded-xl p-3 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-background-light border-slate-100'}`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Calendar className="w-3 h-3 text-[var(--accent-color)]" />
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                            {t('dueDate')}
                          </p>
                        </div>
                        <p
                          className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}
                        >
                          {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          {assignment.dueTime}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Clock className="w-3 h-3 text-[var(--accent-color)]" />
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                            {t('timeLeft')}
                          </p>
                        </div>
                        <p
                          className={`text-xs font-semibold ${daysUntil <= 2 ? 'text-red-600' : isDark ? 'text-white' : 'text-slate-800'}`}
                        >
                          {daysUntil > 0
                            ? `${daysUntil} ${t('days')}`
                            : daysUntil === 0
                              ? t('dueToday')
                              : t('overdue')}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <Award className="w-3 h-3 text-[var(--accent-color)]" />
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                            {t('worth')}
                          </p>
                        </div>
                        <p
                          className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}
                        >
                          {assignment.points} {t('pts')}
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span
                          className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
                        >
                          {t('progress')}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-semibold ${isDark ? 'bg-[var(--accent-color)]/20 text-[var(--accent-color)]/70' : 'bg-[var(--accent-color)]/10 text-[var(--accent-color)]'}`}
                        >
                          {assignment.progress}%
                        </span>
                      </div>
                      <div className="relative">
                        <div
                          className={`w-full rounded-full h-2 overflow-hidden ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}
                        >
                          <div
                            className={`${assignment.color} h-2 rounded-full transition-all duration-500 shadow-sm`}
                            style={{ width: `${assignment.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setSelectedAssignmentId(assignment.id)}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-1.5 text-sm font-medium"
                      >
                        <span>{t('continueWork')}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setSelectedAssignmentId(assignment.id)}
                        title={t('viewDetails') || 'View Details'}
                        className={`px-3 py-2 border-2 rounded-lg transition-all ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-slate-100 text-slate-700 hover:bg-slate-50'}`}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        title={t('download') || 'Download'}
                        className={`px-3 py-2 border-2 rounded-lg transition-all ${isDark ? 'border-white/10 text-slate-300 hover:bg-white/10' : 'border-slate-100 text-slate-700 hover:bg-slate-50'}`}
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Completed Assignments */}
      <div className="glass rounded-[2.5rem] shadow-sm overflow-hidden">
        <div
          className={`p-6 border-b ${isDark ? 'bg-white/5 border-white/5' : 'bg-gradient-to-r from-background-light to-white border-slate-100'}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                {t('completedAssignments')}
              </h2>
              <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                {t('reviewSubmitted')}
              </p>
            </div>
            <button
              className={`flex items-center gap-2 px-4 py-2.5 border-2 rounded-xl text-sm transition-all ${isDark ? 'border-white/10 text-slate-400 hover:bg-white/5' : 'border-slate-100 text-slate-700 hover:bg-slate-50'}`}
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search
                className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}
              />
              <input
                type="text"
                placeholder={t('searchAssignments')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 border-2 rounded-xl focus:outline-none focus:border-[var(--accent-color)] transition-all ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-slate-500' : 'border-slate-100 focus:ring-4 focus:ring-[var(--accent-color)]/10'}`}
              />
            </div>
            <div className="w-48">
              <CustomDropdown
                options={[
                  { value: 'all', label: t('allStatus') },
                  { value: 'submitted', label: t('submitted') },
                  { value: 'graded', label: t('graded') },
                ]}
                value={filterStatus}
                onChange={setFilterStatus}
                isDark={isDark}
                accentColor={accentColor}
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead
              className={
                isDark ? 'bg-white/5' : 'bg-gradient-to-r from-background-light to-slate-50'
              }
            >
              <tr>
                <th
                  className={`px-6 py-4 text-left text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
                >
                  {t('assignment')}
                </th>
                <th
                  className={`px-6 py-4 text-left text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
                >
                  {t('course')}
                </th>
                <th
                  className={`px-6 py-4 text-center text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
                >
                  {t('type')}
                </th>
                <th
                  className={`px-6 py-4 text-center text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
                >
                  {t('submitted')}
                </th>
                <th
                  className={`px-6 py-4 text-center text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
                >
                  {t('score')}
                </th>
                <th
                  className={`px-6 py-4 text-center text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
                >
                  Status
                </th>
                <th
                  className={`px-6 py-4 text-center text-sm font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}
                >
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCompleted.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FileText
                        className={`w-12 h-12 mb-3 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}
                      />
                      <p className={isDark ? 'text-slate-500' : 'text-slate-600'}>
                        No completed assignments found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredCompleted.map((assignment) => (
                  <tr
                    key={assignment.id}
                    className={`border-b transition-colors ${isDark ? 'border-white/5 hover:bg-white/5/50' : 'border-slate-100 hover:bg-slate-50'}`}
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p
                          className={`font-medium mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}
                        >
                          {assignment.title}
                        </p>
                        <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          {assignment.description}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-3 h-3 rounded-full ${assignment.color} shadow-sm`}
                        ></span>
                        <div>
                          <p
                            className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
                          >
                            {assignment.courseCode}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                            {assignment.course}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1.5 border rounded-lg text-xs font-medium ${isDark ? 'bg-[var(--accent-color)]/20 border-[var(--accent-color)]/50 text-[var(--accent-color)]/70' : 'bg-[var(--accent-color)]/10 border-[var(--accent-color)]/20 text-[var(--accent-color)]'}`}
                      >
                        {assignment.type}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-center text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
                    >
                      {new Date(assignment.dueDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {assignment.submittedPoints !== null ? (
                        <div>
                          <p
                            className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}
                          >
                            {assignment.submittedPoints}/{assignment.points}
                          </p>
                          <p
                            className={`text-sm font-medium ${
                              (assignment.submittedPoints / assignment.points) * 100 >= 90
                                ? 'text-emerald-600'
                                : (assignment.submittedPoints / assignment.points) * 100 >= 80
                                  ? 'text-green-600'
                                  : (assignment.submittedPoints / assignment.points) * 100 >= 70
                                    ? 'text-amber-600'
                                    : 'text-red-600'
                            }`}
                          >
                            {Math.round((assignment.submittedPoints / assignment.points) * 100)}%
                          </p>
                        </div>
                      ) : (
                        <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-sm font-medium ${getStatusBadgeDark(assignment.status)}`}
                      >
                        {getStatusIcon(assignment.status)}
                        <span className="capitalize">{assignment.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedAssignmentId(assignment.id)}
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-50'}`}
                          title="View Details"
                        >
                          <Eye
                            className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
                          />
                        </button>
                        <button
                          className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'}`}
                          title="Download"
                        >
                          <Download
                            className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

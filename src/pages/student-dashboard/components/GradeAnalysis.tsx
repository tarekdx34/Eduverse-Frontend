import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  BarChart3,
  TrendingUp,
  Award,
  BookOpen,
  Target,
  Sparkles,
  Star,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  Minus,
  Lightbulb,
  Brain,
  Zap,
} from 'lucide-react';

// --- Mock Data ---

const gradeDistribution = [
  { grade: 'A+', count: 3, color: 'from-emerald-500 to-green-500' },
  { grade: 'A', count: 5, color: 'from-green-500 to-teal-500' },
  { grade: 'A-', count: 4, color: 'from-teal-500 to-blue-500' },
  { grade: 'B+', count: 6, color: 'from-blue-500 to-indigo-500' },
  { grade: 'B', count: 3, color: 'from-indigo-500 to-blue-500' },
  { grade: 'B-', count: 2, color: 'from-blue-500 to-blue-500' },
  { grade: 'C+', count: 1, color: 'from-amber-500 to-orange-500' },
  { grade: 'C', count: 1, color: 'from-orange-500 to-red-500' },
  { grade: 'D', count: 0, color: 'from-red-500 to-blue-500' },
  { grade: 'F', count: 0, color: 'from-blue-500 to-red-700' },
];

const semesterGPA = [
  { semester: 'Fall 2022', gpa: 3.2, credits: 15 },
  { semester: 'Spring 2023', gpa: 3.4, credits: 16 },
  { semester: 'Summer 2023', gpa: 3.5, credits: 9 },
  { semester: 'Fall 2023', gpa: 3.6, credits: 17 },
  { semester: 'Spring 2024', gpa: 3.65, credits: 18 },
  { semester: 'Fall 2024', gpa: 3.75, credits: 15 },
];

const courseRanking = [
  { rank: 1, name: 'Software Engineering', code: 'CS305', grade: 'A+', percentage: 97 },
  { rank: 2, name: 'Web Development', code: 'CS150', grade: 'A+', percentage: 95 },
  { rank: 3, name: 'Machine Learning', code: 'CS410', grade: 'A', percentage: 93 },
  { rank: 4, name: 'Database Management Systems', code: 'CS220', grade: 'A', percentage: 91 },
  { rank: 5, name: 'Algorithms', code: 'CS250', grade: 'A-', percentage: 88 },
];

const topPerformers = [
  { name: 'Software Engineering', code: 'CS305', grade: 'A+', percentage: 97 },
  { name: 'Web Development', code: 'CS150', grade: 'A+', percentage: 95 },
];

const needsFocus = [
  { name: 'Discrete Mathematics', code: 'MATH201', grade: 'C+', percentage: 72 },
  { name: 'Computer Networks', code: 'CS301', grade: 'B-', percentage: 76 },
];

const recommendations = [
  {
    title: 'Boost Your Math Skills',
    description:
      'Your Discrete Mathematics grade is below average. Consider joining a study group or using online practice platforms.',
    action: 'Find Study Resources',
  },
  {
    title: 'Maintain Your Momentum',
    description:
      'Your GPA has been steadily increasing. Keep up the great work in Software Engineering and Web Development.',
    action: 'View Study Plan',
  },
  {
    title: 'Explore Advanced Topics',
    description:
      'Based on your strong performance in Machine Learning, consider taking Advanced AI or Deep Learning next semester.',
    action: 'Browse Courses',
  },
];

const studyGoals = [
  { title: 'Semester GPA', current: 3.75, target: 3.8, unit: '' },
  { title: 'Courses Completed', current: 25, target: 30, unit: '' },
  { title: 'Credits Earned', current: 120, target: 144, unit: '' },
];

const focusAreas = [
  { area: 'Discrete Mathematics', reason: 'Lowest grade this semester', priority: 'high' },
  { area: 'Computer Networks', reason: 'Declining performance trend', priority: 'medium' },
  { area: 'Operating Systems', reason: 'Upcoming final exam', priority: 'low' },
];

// --- Component ---

export const GradeAnalysis = () => {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();
  const [activeAnalysisTab, setActiveAnalysisTab] = useState('overview');

  const maxGradeCount = Math.max(...gradeDistribution.map((g) => g.count), 1);
  const maxGPA = 4.0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'comparison', label: 'Comparison', icon: Award },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
  ];

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-amber-400 to-yellow-500 text-white';
      case 2:
        return 'from-slate-300 to-gray-400 text-white';
      case 3:
        return 'from-amber-600 to-orange-700 text-white';
      default:
        return isDark
          ? 'from-white/10 to-white/5 text-slate-400'
          : 'from-slate-100 to-slate-200 text-slate-500';
    }
  };

  const getGPAColor = (gpa: number) => {
    if (gpa >= 3.5) return 'from-green-500 to-emerald-500';
    if (gpa >= 3.0) return 'from-blue-500 to-indigo-500';
    if (gpa >= 2.5) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-blue-500';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return isDark
          ? 'text-red-400 bg-red-500/10 border-red-500/20'
          : 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return isDark
          ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
          : 'text-amber-600 bg-amber-50 border-amber-200';
      case 'low':
        return isDark
          ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
          : 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return '';
    }
  };

  const gpaPercentage = (3.75 / 4.0) * 100;
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (gpaPercentage / 100) * circumference;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Grade Analysis
          </h2>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
            Detailed Performance Insights
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          <span className="text-emerald-500 font-semibold text-lg">+5%</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div
        className={`${isDark ? 'bg-card-dark border border-white/5' : 'glass'} rounded-[2.5rem] flex gap-2 p-2`}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveAnalysisTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all text-sm ${
                activeAnalysisTab === tab.id
                  ? 'bg-[var(--accent-color)] text-white shadow-md'
                  : `${isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-600 hover:bg-slate-100'}`
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}

      {/* === OVERVIEW TAB === */}
      {activeAnalysisTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GPA Overview Card */}
          <div className="bg-gradient-to-br from-[var(--accent-color)] via-blue-600 to-blue-700 rounded-[2.5rem] p-6 text-white shadow-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-blue-200 text-sm mb-1">Academic Standing</p>
                  <span className="bg-green-500/20 border border-green-400/30 text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                    Excellent
                  </span>
                </div>
                <Award className="w-6 h-6 text-blue-200" />
              </div>

              <div className="flex items-center gap-6 my-6">
                {/* SVG Progress Ring */}
                <div className="relative">
                  <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="rgba(255,255,255,0.15)"
                      strokeWidth="8"
                    />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      fill="none"
                      stroke="url(#gpaGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                    />
                    <defs>
                      <linearGradient id="gpaGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#34d399" />
                        <stop offset="100%" stopColor="#22d3ee" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">3.75</span>
                    <span className="text-blue-200 text-xs">/ 4.00</span>
                  </div>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="text-4xl font-bold tracking-tight">3.75</div>
                  <div className="text-blue-200">Cumulative GPA</div>
                  <div className="flex items-center gap-1 text-green-300 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    <span>+0.10 from last semester</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                  <div className="text-xl font-bold">92%</div>
                  <div className="text-blue-200 text-xs">Pass Rate</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                  <div className="text-xl font-bold">A+</div>
                  <div className="text-blue-200 text-xs">Highest Grade</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center border border-white/10">
                  <div className="text-xl font-bold">87%</div>
                  <div className="text-blue-200 text-xs">Average</div>
                </div>
              </div>
            </div>
          </div>

          {/* Grade Distribution */}
          <div
            className={`${isDark ? 'bg-card-dark border border-white/5' : 'glass'} rounded-[2.5rem] overflow-hidden`}
          >
            <div
              className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}
            >
              <h3
                className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}
              >
                <BarChart3 className="w-5 h-5 text-[var(--accent-color)]" />
                Grade Distribution
              </h3>
            </div>
            <div className="p-5 space-y-3">
              {gradeDistribution.map((item) => (
                <div key={item.grade} className="flex items-center gap-3">
                  <span
                    className={`w-8 text-sm font-semibold text-right ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                  >
                    {item.grade}
                  </span>
                  <div
                    className={`flex-1 ${isDark ? 'bg-white/5' : 'bg-slate-100'} rounded-full h-5 overflow-hidden`}
                  >
                    {item.count > 0 && (
                      <div
                        className={`h-full bg-gradient-to-r ${item.color} rounded-full flex items-center justify-end pr-2 transition-all`}
                        style={{
                          width: `${(item.count / maxGradeCount) * 100}%`,
                          minWidth: item.count > 0 ? '2rem' : '0',
                        }}
                      >
                        <span className="text-white text-xs font-bold">{item.count}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Performance Stats */}
          <div
            className={`${isDark ? 'bg-card-dark border border-white/5' : 'glass'} rounded-[2.5rem] overflow-hidden`}
          >
            <div
              className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}
            >
              <h3
                className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}
              >
                <Target className="w-5 h-5 text-[var(--accent-color)]" />
                Performance Stats
              </h3>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4">
              {[
                {
                  label: 'Total Courses',
                  value: '25',
                  icon: BookOpen,
                  color: 'text-blue-500',
                  bg: isDark ? 'bg-blue-500/10' : 'bg-blue-50',
                },
                {
                  label: 'Passed',
                  value: '23',
                  icon: CheckCircle,
                  color: 'text-green-500',
                  bg: isDark ? 'bg-green-500/10' : 'bg-green-50',
                },
                {
                  label: 'Highest Grade',
                  value: 'A+',
                  icon: Star,
                  color: 'text-indigo-500',
                  bg: isDark ? 'bg-indigo-500/10' : 'bg-indigo-50',
                },
                {
                  label: 'Lowest Grade',
                  value: 'C',
                  icon: AlertTriangle,
                  color: 'text-amber-500',
                  bg: isDark ? 'bg-amber-500/10' : 'bg-amber-50',
                },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={`${isDark ? 'border-white/5' : 'border-slate-100'} border-2 rounded-xl p-4 transition-all`}
                  >
                    <div
                      className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center mb-3`}
                    >
                      <Icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <div
                      className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}
                    >
                      {stat.value}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {stat.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Credit Progress */}
          <div
            className={`${isDark ? 'bg-card-dark border border-white/5' : 'glass'} rounded-[2.5rem] overflow-hidden`}
          >
            <div
              className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}
            >
              <h3
                className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}
              >
                <BookOpen className="w-5 h-5 text-[var(--accent-color)]" />
                Credit Progress
              </h3>
            </div>
            <div className="p-5">
              <div className="flex items-end justify-between mb-4">
                <div>
                  <div className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    120
                  </div>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    of 144 credits earned
                  </div>
                </div>
                <div className="text-right">
                  <span className="bg-gradient-to-r from-[var(--accent-color)] to-indigo-500 bg-clip-text text-transparent text-2xl font-bold">
                    83%
                  </span>
                  <div className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Completed
                  </div>
                </div>
              </div>
              <div className={`w-full ${isDark ? 'bg-white/10' : 'bg-slate-200'} rounded-full h-4`}>
                <div
                  className="h-4 rounded-full bg-gradient-to-r from-[var(--accent-color)] via-blue-500 to-indigo-500 transition-all relative overflow-hidden"
                  style={{ width: '83%' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                </div>
              </div>
              <div
                className={`flex justify-between mt-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
              >
                <span>0</span>
                <span>36</span>
                <span>72</span>
                <span>108</span>
                <span>144</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === TRENDS TAB === */}
      {activeAnalysisTab === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* GPA Trend Chart */}
          <div
            className={`${isDark ? 'bg-card-dark border border-white/5' : 'glass'} rounded-[2.5rem] overflow-hidden lg:col-span-2`}
          >
            <div
              className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}
            >
              <h3
                className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}
              >
                <TrendingUp className="w-5 h-5 text-[var(--accent-color)]" />
                GPA Trend
              </h3>
            </div>
            <div className="p-5">
              <div className="flex items-end gap-3" style={{ height: '220px' }}>
                {semesterGPA.map((sem) => {
                  const heightPercent = (sem.gpa / maxGPA) * 100;
                  return (
                    <div
                      key={sem.semester}
                      className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                    >
                      <span
                        className={`text-xs font-semibold ${isDark ? 'text-white' : 'text-slate-700'}`}
                      >
                        {sem.gpa.toFixed(2)}
                      </span>
                      <div
                        className={`w-full rounded-t-lg bg-gradient-to-t ${getGPAColor(sem.gpa)} transition-all relative overflow-hidden group cursor-pointer`}
                        style={{ height: `${heightPercent}%`, minHeight: '20px' }}
                      >
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all" />
                      </div>
                      <span
                        className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'} text-center leading-tight`}
                      >
                        {sem.semester.replace(' ', '\n')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Semester Comparison */}
          <div
            className={`${isDark ? 'bg-card-dark border border-white/5' : 'glass'} rounded-[2.5rem] overflow-hidden`}
          >
            <div
              className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}
            >
              <h3
                className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}
              >
                <BarChart3 className="w-5 h-5 text-[var(--accent-color)]" />
                Semester Comparison
              </h3>
            </div>
            <div className="p-4 space-y-4">
              {semesterGPA
                .slice(-3)
                .reverse()
                .map((sem) => {
                  const gpaPercent = (sem.gpa / maxGPA) * 100;
                  const barColor =
                    sem.gpa >= 3.5
                      ? 'from-green-500 to-emerald-500'
                      : sem.gpa >= 3.0
                        ? 'from-blue-500 to-indigo-500'
                        : sem.gpa >= 2.5
                          ? 'from-amber-500 to-orange-500'
                          : 'from-red-500 to-blue-500';
                  return (
                    <div key={sem.semester}>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}
                        >
                          {sem.semester}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                          >
                            {sem.credits} cr
                          </span>
                          <span
                            className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}
                          >
                            {sem.gpa.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`w-full ${isDark ? 'bg-white/10' : 'bg-slate-200'} rounded-full h-2`}
                      >
                        <div
                          className={`h-2 rounded-full bg-gradient-to-r ${barColor} transition-all`}
                          style={{ width: `${gpaPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* === COMPARISON TAB === */}
      {activeAnalysisTab === 'comparison' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Course Ranking */}
          <div
            className={`${isDark ? 'bg-card-dark border border-white/5' : 'glass'} rounded-[2.5rem] overflow-hidden`}
          >
            <div
              className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}
            >
              <h3
                className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}
              >
                <Award className="w-5 h-5 text-[var(--accent-color)]" />
                Course Ranking
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {courseRanking.map((course) => (
                <div
                  key={course.rank}
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isDark ? 'hover:bg-white/5 border border-white/5' : 'hover:bg-slate-50 border border-slate-100'}`}
                >
                  <div
                    className={`w-9 h-9 rounded-lg bg-gradient-to-br ${getRankColor(course.rank)} flex items-center justify-center text-sm font-bold shadow-sm`}
                  >
                    #{course.rank}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}
                    >
                      {course.name}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {course.code}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        course.grade.startsWith('A')
                          ? isDark
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-green-50 text-green-600 border border-green-200'
                          : isDark
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            : 'bg-blue-50 text-blue-600 border border-blue-200'
                      }`}
                    >
                      {course.grade}
                    </span>
                    <span
                      className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-700'}`}
                    >
                      {course.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Best / Worst Side by Side */}
          <div className="space-y-6">
            {/* Top Performers */}
            <div
              className={`${isDark ? 'bg-card-dark border border-white/5' : 'glass'} rounded-[2.5rem] overflow-hidden`}
            >
              <div
                className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}
              >
                <h3
                  className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}
                >
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  Top Performers
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {topPerformers.map((course) => (
                  <div
                    key={course.code}
                    className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-green-500/5 border border-green-500/10' : 'bg-green-50/50 border border-green-100'}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-green-500/10' : 'bg-green-100'}`}
                    >
                      <TrendingUp className="w-5 h-5 text-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}
                      >
                        {course.name}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {course.code}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-500 font-bold text-sm">{course.grade}</div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {course.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Needs Focus */}
            <div
              className={`${isDark ? 'bg-card-dark border border-white/5' : 'glass'} rounded-[2.5rem] overflow-hidden`}
            >
              <div
                className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}
              >
                <h3
                  className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}
                >
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Needs Focus
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {needsFocus.map((course) => (
                  <div
                    key={course.code}
                    className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-amber-500/5 border border-amber-500/10' : 'bg-amber-50/50 border border-amber-100'}`}
                  >
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${isDark ? 'bg-amber-500/10' : 'bg-amber-100'}`}
                    >
                      <AlertTriangle className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}
                      >
                        {course.name}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {course.code}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-amber-500 font-bold text-sm">{course.grade}</div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {course.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === INSIGHTS TAB === */}
      {activeAnalysisTab === 'insights' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* AI Recommendations */}
          <div
            className={`${isDark ? 'bg-card-dark border border-white/5' : 'glass'} rounded-[2.5rem] overflow-hidden lg:col-span-2`}
          >
            <div
              className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}
            >
              <h3
                className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}
              >
                <Sparkles className="w-5 h-5 text-[var(--accent-color)]" />
                AI Recommendations
              </h3>
            </div>
            <div className="p-5 space-y-4">
              {recommendations.map((rec, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border-2 transition-all ${isDark ? 'border-white/5 hover:border-[var(--accent-color)]/30' : 'border-slate-100 hover:border-[var(--accent-color)]/30'}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-[var(--accent-color)]/10' : 'bg-blue-50'}`}
                    >
                      <Sparkles className="w-5 h-5 text-[var(--accent-color)]" />
                    </div>
                    <div className="flex-1">
                      <h4
                        className={`font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}
                      >
                        {rec.title}
                      </h4>
                      <p className={`text-sm mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {rec.description}
                      </p>
                      <button className="flex items-center gap-1 text-sm font-medium text-[var(--accent-color)] hover:underline">
                        {rec.action}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Study Goals */}
            <div
              className={`${isDark ? 'bg-card-dark border border-white/5' : 'glass'} rounded-[2.5rem] overflow-hidden`}
            >
              <div
                className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}
              >
                <h3
                  className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}
                >
                  <Target className="w-5 h-5 text-[var(--accent-color)]" />
                  Study Goals
                </h3>
              </div>
              <div className="p-4 space-y-4">
                {studyGoals.map((goal) => {
                  const progress = (goal.current / goal.target) * 100;
                  return (
                    <div key={goal.title}>
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-700'}`}
                        >
                          {goal.title}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {goal.current} / {goal.target}
                        </span>
                      </div>
                      <div
                        className={`w-full ${isDark ? 'bg-white/10' : 'bg-slate-200'} rounded-full h-2`}
                      >
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-[var(--accent-color)] to-indigo-500 transition-all"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Focus Areas */}
            <div
              className={`${isDark ? 'bg-card-dark border border-white/5' : 'glass'} rounded-[2.5rem] overflow-hidden`}
            >
              <div
                className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}
              >
                <h3
                  className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}
                >
                  <Brain className="w-5 h-5 text-[var(--accent-color)]" />
                  Focus Areas
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {focusAreas.map((item) => (
                  <div
                    key={item.area}
                    className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'border border-white/5' : 'border border-slate-100'}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
                      >
                        {item.area}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {item.reason}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium border capitalize ${getPriorityColor(item.priority)}`}
                    >
                      {item.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  BookOpen,
  Clock,
  AlertTriangle,
  CheckCircle,
  ChevronRight,
  Calendar,
  Brain,
  Zap,
  PieChart,
  Activity
} from 'lucide-react';

interface CourseProgress {
  id: string;
  code: string;
  name: string;
  progress: number;
  grade: string;
  gradePoints: number;
  status: 'on-track' | 'needs-attention' | 'excellent';
  completedTasks: number;
  totalTasks: number;
  studyHours: number;
  weakTopics: string[];
  strongTopics: string[];
}

interface WeeklyActivity {
  day: string;
  studyHours: number;
  tasksCompleted: number;
  quizzesTaken: number;
}

const courseProgress: CourseProgress[] = [
  {
    id: '1',
    code: 'CS220',
    name: 'Database Management Systems',
    progress: 78,
    grade: 'A-',
    gradePoints: 3.7,
    status: 'on-track',
    completedTasks: 14,
    totalTasks: 18,
    studyHours: 24,
    weakTopics: ['Normalization', 'Query Optimization'],
    strongTopics: ['SQL Joins', 'ER Diagrams', 'Indexing']
  },
  {
    id: '2',
    code: 'CS201',
    name: 'Data Structures & Algorithms',
    progress: 65,
    grade: 'B+',
    gradePoints: 3.3,
    status: 'needs-attention',
    completedTasks: 11,
    totalTasks: 17,
    studyHours: 18,
    weakTopics: ['Dynamic Programming', 'Graph Algorithms', 'AVL Trees'],
    strongTopics: ['Arrays', 'Linked Lists', 'Sorting']
  },
  {
    id: '3',
    code: 'CS305',
    name: 'Software Engineering Principles',
    progress: 92,
    grade: 'A',
    gradePoints: 4.0,
    status: 'excellent',
    completedTasks: 12,
    totalTasks: 13,
    studyHours: 20,
    weakTopics: [],
    strongTopics: ['Requirements Analysis', 'UML', 'Agile', 'Testing']
  },
  {
    id: '4',
    code: 'CS350',
    name: 'Mobile Application Development',
    progress: 72,
    grade: 'B+',
    gradePoints: 3.3,
    status: 'on-track',
    completedTasks: 9,
    totalTasks: 12,
    studyHours: 22,
    weakTopics: ['State Management', 'Navigation'],
    strongTopics: ['React Native Basics', 'UI Components', 'Styling']
  },
  {
    id: '5',
    code: 'CS150',
    name: 'Web Development Fundamentals',
    progress: 88,
    grade: 'A',
    gradePoints: 4.0,
    status: 'excellent',
    completedTasks: 15,
    totalTasks: 17,
    studyHours: 26,
    weakTopics: ['Backend APIs'],
    strongTopics: ['HTML/CSS', 'JavaScript', 'React', 'Responsive Design']
  }
];

const weeklyActivity: WeeklyActivity[] = [
  { day: 'Mon', studyHours: 4.5, tasksCompleted: 3, quizzesTaken: 1 },
  { day: 'Tue', studyHours: 3.0, tasksCompleted: 2, quizzesTaken: 0 },
  { day: 'Wed', studyHours: 5.5, tasksCompleted: 4, quizzesTaken: 2 },
  { day: 'Thu', studyHours: 2.5, tasksCompleted: 1, quizzesTaken: 1 },
  { day: 'Fri', studyHours: 4.0, tasksCompleted: 3, quizzesTaken: 1 },
  { day: 'Sat', studyHours: 6.0, tasksCompleted: 5, quizzesTaken: 2 },
  { day: 'Sun', studyHours: 3.5, tasksCompleted: 2, quizzesTaken: 0 }
];

export function ProgressAnalytics() {
  const { t } = useLanguage();
  const { isDark } = useTheme();
  const [selectedCourse, setSelectedCourse] = useState<CourseProgress | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'semester'>('week');

  const totalStudyHours = weeklyActivity.reduce((sum, day) => sum + day.studyHours, 0);
  const totalTasksCompleted = weeklyActivity.reduce((sum, day) => sum + day.tasksCompleted, 0);
  const totalQuizzes = weeklyActivity.reduce((sum, day) => sum + day.quizzesTaken, 0);
  const avgGPA = courseProgress.reduce((sum, c) => sum + c.gradePoints, 0) / courseProgress.length;
  const maxHours = Math.max(...weeklyActivity.map(d => d.studyHours));

  const coursesNeedingAttention = courseProgress.filter(c => c.status === 'needs-attention');
  const excellentCourses = courseProgress.filter(c => c.status === 'excellent');

  const allWeakTopics = courseProgress.flatMap(c => c.weakTopics.map(t => ({ topic: t, course: c.code })));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'on-track':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'needs-attention':
        return 'text-amber-600 bg-amber-100 border-amber-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-100';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 85) return 'bg-green-500';
    if (progress >= 70) return 'bg-blue-500';
    if (progress >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#7C3AED] via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <BarChart3 className="w-8 h-8" />
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{t('analyticsDashboard')}</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">{t('progressAnalytics')}</h1>
        <p className="text-purple-100 text-lg">{t('trackPerformance')}</p>
        
        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-green-300" />
              <span className="text-sm text-purple-200">{t('currentGPA')}</span>
            </div>
            <p className="text-3xl font-bold">{avgGPA.toFixed(2)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-300" />
              <span className="text-sm text-purple-200">{t('studyHours')}</span>
            </div>
            <p className="text-3xl font-bold">{totalStudyHours}h</p>
            <p className="text-xs text-purple-300">{t('thisWeekLabel')}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-emerald-300" />
              <span className="text-sm text-purple-200">{t('tasksDone')}</span>
            </div>
            <p className="text-3xl font-bold">{totalTasksCompleted}</p>
            <p className="text-xs text-purple-300">{t('thisWeekLabel')}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-1">
              <Brain className="w-4 h-4 text-purple-300" />
              <span className="text-sm text-purple-200">{t('quizzes')}</span>
            </div>
            <p className="text-3xl font-bold">{totalQuizzes}</p>
            <p className="text-xs text-purple-300">{t('thisWeekLabel')}</p>
          </div>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="flex gap-2">
        {(['week', 'month', 'semester'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              timeRange === range
                ? 'bg-[#7C3AED]/10 text-[#7C3AED] border-2 border-[#7C3AED]/30'
                : `${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-600'} border-2 border-transparent ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`
            }`}
          >
            {{ week: t('thisWeek2'), month: t('thisMonth'), semester: t('thisSemester2') }[range]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Study Activity Chart */}
        <div className="glass lg:col-span-2 rounded-[2.5rem] overflow-hidden">
          <div className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}>
              <Activity className="w-5 h-5 text-[#7C3AED]" />
              {t('weeklyStudyActivity')}
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-end justify-between gap-2 h-48">
              {weeklyActivity.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full flex flex-col items-center gap-1">
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{day.studyHours}h</span>
                    <div 
                      className="w-full bg-gradient-to-t from-[#7C3AED] to-purple-500 rounded-t-lg transition-all hover:from-[#7C3AED] hover:to-purple-600"
                      style={{ height: `${(day.studyHours / maxHours) * 140}px` }}
                    />
                  </div>
                  <span className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{day.day}</span>
                </div>
              ))}
            </div>
            <div className={`mt-6 grid grid-cols-3 gap-4 pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#7C3AED]">{totalStudyHours}h</p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('totalHours')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{totalTasksCompleted}</p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('tasksCompleted')}</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{totalQuizzes}</p>
                <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('quizzesTaken')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Weak Topics Alert */}
        <div className="glass rounded-[2.5rem] overflow-hidden">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 border-b border-amber-200">
            <h3 className="font-semibold text-amber-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              {t('topicsToReview')}
            </h3>
          </div>
          <div className="p-4 space-y-3 max-h-[300px] overflow-y-auto">
            {allWeakTopics.length > 0 ? (
              allWeakTopics.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-amber-900">{item.topic}</p>
                    <p className="text-xs text-amber-700">{item.course}</p>
                  </div>
                  <button className="px-3 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded-lg hover:bg-amber-200 transition-all">
                    {t('study')}
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('noWeakTopics')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Course Progress */}
      <div className="glass rounded-[2.5rem] overflow-hidden">
        <div className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}>
            <BookOpen className="w-5 h-5 text-[#7C3AED]" />
            {t('courseProgressOverview')}
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courseProgress.map((course) => (
              <div
                key={course.id}
                className={`${isDark ? 'border-white/5' : 'border-slate-100'} border-2 rounded-xl p-4 hover:border-[#7C3AED]/50 hover:shadow-lg transition-all cursor-pointer`}
                onClick={() => setSelectedCourse(course)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-[#7C3AED]">{course.code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(course.status)}`}>
                        {course.status === 'needs-attention' ? t('needsWork') : course.status === 'excellent' ? t('excellent') : t('onTrack')}
                      </span>
                    </div>
                    <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{course.name}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{course.grade}</p>
                    <p className="text-xs text-slate-500">{course.gradePoints.toFixed(1)} GPA</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className={`flex justify-between text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-1`}>
                    <span>{t('progress')}</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className={`w-full ${isDark ? 'bg-white/10' : 'bg-slate-200'} rounded-full h-2`}>
                    <div 
                      className={`h-2 rounded-full transition-all ${getProgressColor(course.progress)}`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <CheckCircle className="w-3 h-3" />
                    <span>{course.completedTasks}/{course.totalTasks} {t('tasks')}</span>
                  </div>
                  <div className={`flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <Clock className="w-3 h-3" />
                    <span>{course.studyHours}h {t('studied')}</span>
                  </div>
                </div>

                {/* Weak Topics Preview */}
                {course.weakTopics.length > 0 && (
                  <div className={`mt-3 pt-3 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
                    <p className="text-xs text-amber-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />
                      {course.weakTopics.length} {t('topicsNeedReview')}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Courses Needing Attention */}
        <div className="glass rounded-[2.5rem] overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 p-4 border-b border-red-200">
            <h3 className="font-semibold text-red-900 flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              {t('needsImprovement')}
            </h3>
          </div>
          <div className="p-4">
            {coursesNeedingAttention.length > 0 ? (
              <div className="space-y-3">
                {coursesNeedingAttention.map((course) => (
                  <div key={course.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-red-900">{course.code} - {course.name}</p>
                        <p className="text-sm text-red-700">{t('currentGrade')}: {course.grade}</p>
                      </div>
                      <span className="text-lg font-bold text-red-600">{course.progress}%</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {course.weakTopics.map((topic, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs">
                          {topic}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('allOnTrack')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Excellent Performance */}
        <div className="glass rounded-[2.5rem] overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-green-200">
            <h3 className="font-semibold text-green-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              {t('excellentPerformance')}
            </h3>
          </div>
          <div className="p-4">
            {excellentCourses.length > 0 ? (
              <div className="space-y-3">
                {excellentCourses.map((course) => (
                  <div key={course.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-green-900">{course.code} - {course.name}</p>
                        <p className="text-sm text-green-700">{t('currentGrade')}: {course.grade}</p>
                      </div>
                      <span className="text-lg font-bold text-green-600">{course.progress}%</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {course.strongTopics.slice(0, 3).map((topic, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                          {topic}
                        </span>
                      ))}
                      {course.strongTopics.length > 3 && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                          +{course.strongTopics.length - 3} {t('more')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('keepWorking')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Study Recommendations */}
      <div className="glass rounded-[2.5rem] overflow-hidden">
        <div className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}>
            <Zap className="w-5 h-5 text-amber-500" />
            {t('aiStudyRecommendations')}
          </h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-[#7C3AED]/10 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <h4 className="font-medium text-blue-900">{t('optimalStudyTime')}</h4>
              </div>
              <p className="text-sm text-blue-700 mb-2">
                {t('optimalStudyDesc')} <strong>2 PM - 6 PM</strong>
              </p>
              <p className="text-xs text-blue-600">{t('scheduleDifficult')}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-purple-600" />
                <h4 className="font-medium text-purple-900">{t('focusPriority')}</h4>
              </div>
              <p className="text-sm text-purple-700 mb-2">
                {t('prioritizeDesc')} <strong>Data Structures & Algorithms</strong>
              </p>
              <p className="text-xs text-purple-600">{t('assignmentsDueWeak')}</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-5 h-5 text-green-600" />
                <h4 className="font-medium text-green-900">{t('keepItUp')}</h4>
              </div>
              <p className="text-sm text-green-700 mb-2">
                {t('streakDesc')} <strong>5 {t('dayStreak')}</strong> {t('meetingGoals')}
              </p>
              <p className="text-xs text-green-600">{t('maintainConsistency')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl`}>
            <div className={`p-6 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-sm font-bold text-[#7C3AED]">{selectedCourse.code}</span>
                  <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedCourse.name}</h2>
                </div>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className={`p-2 ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} rounded-lg transition-all`}
                >
                  <ChevronRight className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              {/* Grade & Progress */}
              <div className="grid grid-cols-3 gap-4">
                <div className={`text-center p-4 ${isDark ? 'bg-white/5' : 'bg-background-light'} rounded-xl`}>
                  <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>{selectedCourse.grade}</p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('currentGradeLabel')}</p>
                </div>
                <div className={`text-center p-4 ${isDark ? 'bg-white/5' : 'bg-background-light'} rounded-xl`}>
                  <p className="text-3xl font-bold text-[#7C3AED]">{selectedCourse.progress}%</p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('progress')}</p>
                </div>
                <div className={`text-center p-4 ${isDark ? 'bg-white/5' : 'bg-background-light'} rounded-xl`}>
                  <p className="text-3xl font-bold text-purple-600">{selectedCourse.studyHours}h</p>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('studyHours')}</p>
                </div>
              </div>

              {/* Strong Topics */}
              <div>
                <h4 className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'} mb-2 flex items-center gap-2`}>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {t('strongTopicsLabel')}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedCourse.strongTopics.map((topic, idx) => (
                    <span key={idx} className="px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Weak Topics */}
              {selectedCourse.weakTopics.length > 0 && (
                <div>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'} mb-2 flex items-center gap-2`}>
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    {t('topicsToReview')}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedCourse.weakTopics.map((topic, idx) => (
                      <span key={idx} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-sm">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => setSelectedCourse(null)}
                className="w-full px-4 py-3 bg-[#7C3AED] text-white rounded-xl hover:bg-[#6D28D9] transition-all font-medium"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressAnalytics;

import { useState } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  BarChart3,
  ChevronLeft,
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useApi } from '../../../hooks/useApi';
import { attendanceService } from '../../../services/api/attendanceService';
import { LoadingSkeleton } from '../../../components/shared';

interface CourseAttendance {
  id: number;
  courseName: string;
  courseCode: string;
  totalClasses: number;
  attended: number;
  absent: number;
  late: number;
  percentage: number;
  status: string;
  color: string;
  lastClass: string;
}

const COURSE_COLORS = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-purple-500', 'bg-cyan-500'];

const getAttendanceStatus = (rate: number) => {
  if (rate >= 90) return 'excellent';
  if (rate >= 80) return 'good';
  return 'warning';
};

export function AttendanceOverview() {
  const { t, isRTL } = useLanguage();
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { data: apiData, loading } = useApi(
    () => attendanceService.getMyAttendance(),
    []
  );
  const [selectedCourse, setSelectedCourse] = useState<CourseAttendance | null>(null);

  if (loading) {
    return <LoadingSkeleton variant="card" count={4} />;
  }

  // Map API response to component format — handles array or object with courses/records
  const rawCourses = Array.isArray(apiData) ? apiData : (apiData?.courses || apiData?.records || []);
  const attendanceData: CourseAttendance[] = rawCourses.map((item: any, index: number) => ({
    id: item.id || item.sectionId || item.courseId || index + 1,
    courseName: item.courseName || item.course?.name || `Course ${index + 1}`,
    courseCode: item.courseCode || item.course?.code || '',
    totalClasses: item.totalSessions || item.totalClasses || 0,
    attended: item.present ?? item.totalPresent ?? item.attended ?? 0,
    absent: item.absent ?? item.totalAbsent ?? 0,
    late: item.late ?? item.totalLate ?? 0,
    percentage: item.attendanceRate ?? item.attendancePercentage ?? item.percentage ?? 0,
    status: getAttendanceStatus(item.attendanceRate ?? item.attendancePercentage ?? item.percentage ?? 0),
    color: COURSE_COLORS[index % COURSE_COLORS.length],
    lastClass: item.lastDate || item.lastClass || '',
  }));

  // Daily records and recent activity are not available from summary API
  const courseDailyRecords: Record<number, { date: string; day: string; status: string }[]> = {};
  const recentAttendance: { date: string; course: string; status: string; time: string }[] = [];

  const totalClasses = attendanceData.reduce((sum, course) => sum + course.totalClasses, 0);
  const totalAttended = attendanceData.reduce((sum, course) => sum + course.attended, 0);
  const totalAbsent = attendanceData.reduce((sum, course) => sum + course.absent, 0);
  const totalLate = attendanceData.reduce((sum, course) => sum + course.late, 0);
  const overallPercentage = totalClasses > 0 ? ((totalAttended / totalClasses) * 100).toFixed(1) : '0.0';
  const lowestCourse = attendanceData.length > 0
    ? attendanceData.reduce((min, c) => c.percentage < min.percentage ? c : min)
    : null;

  const getStatusColor = (status: string) => {
    if (isDark) {
      switch (status) {
        case 'excellent':
          return 'text-green-400 bg-green-900/50 border-green-700';
        case 'good':
          return 'text-blue-400 bg-blue-900/50 border-blue-700';
        case 'warning':
          return 'text-orange-400 bg-orange-900/50 border-orange-700';
        default:
          return 'text-slate-500 bg-white/5 border-white/10';
      }
    }
    switch (status) {
      case 'excellent':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'good':
        return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'warning':
        return 'text-orange-700 bg-orange-50 border-orange-200';
      default:
        return 'text-slate-700 bg-background-light border-slate-100';
    }
  };

  const getAttendanceStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'absent':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'late':
        return <AlertCircle className="w-4 h-4 text-orange-600" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'present':
        return t('present');
      case 'absent':
        return t('absent');
      case 'late':
        return t('late');
      default:
        return status;
    }
  };

  const getRecordStatusStyle = (status: string) => {
    switch (status) {
      case 'present':
        return isDark ? 'text-green-400 bg-green-900/50' : 'text-green-700 bg-green-100';
      case 'absent':
        return isDark ? 'text-red-400 bg-red-900/50' : 'text-red-700 bg-red-100';
      case 'late':
        return isDark ? 'text-orange-400 bg-orange-900/50' : 'text-orange-700 bg-orange-100';
      default:
        return '';
    }
  };

  const getRecordStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'late':
        return <Clock className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  if (selectedCourse) {
    const dailyRecords = courseDailyRecords[selectedCourse.id] || [];
    return (
      <div className="space-y-6" dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Back Button */}
        <button
          onClick={() => setSelectedCourse(null)}
          className={`flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-colors ${
            isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          {isRTL ? 'العودة للنظرة العامة' : 'Back to Overview'}
        </button>

        {/* Course Info Header */}
        <div className="glass rounded-[2.5rem] overflow-hidden">
          <div className={`${selectedCourse.color} h-2`}></div>
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {selectedCourse.courseName}
                </h1>
                <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                  {selectedCourse.courseCode}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className={`text-3xl font-bold text-blue-600`}>{selectedCourse.percentage}%</p>
                  <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                    {t('overallAttendance')}
                  </p>
                </div>
                <div className={`grid grid-cols-3 gap-4 text-center`}>
                  <div>
                    <p
                      className={`text-lg font-bold ${isDark ? 'text-green-400' : 'text-green-700'}`}
                    >
                      {selectedCourse.attended}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                      {t('present')}
                    </p>
                  </div>
                  <div>
                    <p className={`text-lg font-bold ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                      {selectedCourse.absent}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                      {t('absent')}
                    </p>
                  </div>
                  <div>
                    <p
                      className={`text-lg font-bold ${isDark ? 'text-orange-400' : 'text-orange-700'}`}
                    >
                      {selectedCourse.late}
                    </p>
                    <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                      {t('late')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Day-by-Day Records */}
        <div>
          <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {isRTL ? 'سجلات الحضور اليومية' : 'Day-by-Day Attendance Records'}
          </h2>
          <div className="glass rounded-[2.5rem] overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {dailyRecords.map((record, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between px-6 py-4 ${
                    isDark ? 'border-white/5' : 'border-slate-100'
                  } ${idx !== dailyRecords.length - 1 ? (isDark ? 'border-b border-white/5' : 'border-b border-slate-100') : ''}`}
                >
                  <div className="flex items-center gap-4">
                    {getRecordStatusIcon(record.status)}
                    <div>
                      <p
                        className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
                      >
                        {record.day}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${getRecordStatusStyle(record.status)}`}
                  >
                    {getStatusText(record.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <BarChart3 size={20} className="text-white" />
        </div>
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {t('attendanceOverview')}
          </h1>
          <p className={isDark ? 'text-slate-500' : 'text-slate-600'}>
            {isRTL ? 'تتبع حضورك في جميع المقررات' : 'Track your attendance across all courses'}
          </p>
        </div>
      </div>

      {/* Overall Percentage Card */}
      <div className={`glass rounded-[2.5rem] p-8 shadow-sm`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2
              className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}
            >
              {t('overallAttendance')}
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
              {totalAttended} {t('attended')} {t('outOf')} {totalClasses} {t('totalClasses')}
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600 mb-3">{overallPercentage}%</div>
            <div
              className={`flex flex-col gap-2 text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
            >
              <span className="flex items-center justify-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                {totalAttended} {t('present')}
              </span>
              <span className="flex items-center justify-center gap-1">
                <XCircle className="w-4 h-4 text-red-600" />
                {totalAbsent} {t('absent')}
              </span>
              <span className="flex items-center justify-center gap-1">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                {totalLate} {t('late')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Attendance Details */}
        <div className="lg:col-span-2">
          <div className="mb-6">
            <h2
              className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}
            >
              {t('lectureAttendance')}
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
              {isRTL ? 'تفاصيل الحضور حسب المقرر' : 'Detailed attendance breakdown by course'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {attendanceData.map((course) => (
              <div
                key={course.id}
                onClick={() => setSelectedCourse(course)}
                className={`glass rounded-[2.5rem] overflow-hidden hover:shadow-md transition-shadow cursor-pointer`}
              >
                <div className={`${course.color} h-1`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3
                        className={`font-semibold text-base ${isDark ? 'text-white' : 'text-slate-800'}`}
                      >
                        {course.courseName}
                      </h3>
                      <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                        {course.courseCode}
                      </p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
                        course.status
                      )}`}
                    >
                      {course.percentage}%
                    </span>
                  </div>

                  {/* Stats Grid */}
                  <div
                    className={`grid grid-cols-4 gap-2 mb-4 pb-4 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}
                  >
                    <div className="text-center">
                      <p className={`text-xs mb-1 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                        {t('totalClasses')}
                      </p>
                      <p
                        className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}
                      >
                        {course.totalClasses}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs mb-1 ${isDark ? 'text-green-400' : 'text-green-700'}`}>
                        {t('present')}
                      </p>
                      <p
                        className={`text-base font-bold ${isDark ? 'text-green-400' : 'text-green-900'}`}
                      >
                        {course.attended}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs mb-1 ${isDark ? 'text-red-400' : 'text-red-700'}`}>
                        {t('absent')}
                      </p>
                      <p
                        className={`text-base font-bold ${isDark ? 'text-red-400' : 'text-red-900'}`}
                      >
                        {course.absent}
                      </p>
                    </div>
                    <div className="text-center">
                      <p
                        className={`text-xs mb-1 ${isDark ? 'text-orange-400' : 'text-orange-700'}`}
                      >
                        {t('late')}
                      </p>
                      <p
                        className={`text-base font-bold ${isDark ? 'text-orange-400' : 'text-orange-900'}`}
                      >
                        {course.late}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div
                    className={`w-full rounded-full h-2 mb-4 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}
                  >
                    <div
                      className={`${course.color} h-2 rounded-full transition-all`}
                      style={{ width: `${course.percentage}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span
                      className={`flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(course.lastClass).toLocaleDateString()}
                    </span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                      {course.percentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Attendance Activity */}
        <div>
          <div className="mb-6">
            <h2
              className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}
            >
              {t('recentActivity')}
            </h2>
            <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
              {isRTL ? 'آخر 6 سجلات حضور' : 'Last 6 attendance records'}
            </p>
          </div>

          <div className={`glass rounded-[2.5rem] p-6 mb-6`}>
            <div className="space-y-4">
              {recentAttendance.map((record, idx) => (
                <div
                  key={idx}
                  className={`pb-4 border-b last:border-0 last:pb-0 ${isDark ? 'border-white/5' : 'border-slate-100'}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getAttendanceStatusIcon(record.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <p
                          className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-slate-800'}`}
                        >
                          {record.course}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 whitespace-nowrap ${
                            record.status === 'present'
                              ? isDark
                                ? 'bg-green-900/50 text-green-400'
                                : 'bg-green-100 text-green-700'
                              : record.status === 'late'
                                ? isDark
                                  ? 'bg-orange-900/50 text-orange-400'
                                  : 'bg-orange-100 text-orange-700'
                                : isDark
                                  ? 'bg-red-900/50 text-red-400'
                                  : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {getStatusText(record.status)}
                        </span>
                      </div>
                      <div
                        className={`flex items-center gap-3 text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}
                      >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(record.date).toLocaleDateString()}</span>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{record.time}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Insights */}
          <div
            className={`rounded-lg p-6 border ${isDark ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-200'}`}
          >
            <h3
              className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-800'}`}
            >
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Key Insights
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className={isDark ? 'text-slate-400' : 'text-slate-700'}>
                  Your overall attendance rate is {overallPercentage}%, which is excellent!
                </p>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className={isDark ? 'text-slate-400' : 'text-slate-700'}>
                  {lowestCourse && lowestCourse.percentage < 90
                    ? `${lowestCourse.courseName} needs attention (${lowestCourse.percentage}%)`
                    : 'All courses have great attendance!'}
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className={isDark ? 'text-slate-400' : 'text-slate-700'}>
                  You've been late {totalLate} times this semester
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

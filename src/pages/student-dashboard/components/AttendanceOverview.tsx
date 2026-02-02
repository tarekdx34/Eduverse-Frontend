import { Calendar, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, Users, BarChart3 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const attendanceData = [
  {
    id: 1,
    courseName: 'Introduction to Computer Science',
    courseCode: 'CS101',
    totalClasses: 45,
    attended: 42,
    absent: 2,
    late: 1,
    percentage: 93.3,
    status: 'excellent',
    color: 'bg-blue-500',
    lastClass: '2024-12-02'
  },
  {
    id: 2,
    courseName: 'Data Structures & Algorithms',
    courseCode: 'CS201',
    totalClasses: 40,
    attended: 35,
    absent: 3,
    late: 2,
    percentage: 87.5,
    status: 'good',
    color: 'bg-purple-500',
    lastClass: '2024-12-01'
  },
  {
    id: 3,
    courseName: 'Web Development Fundamentals',
    courseCode: 'CS150',
    totalClasses: 38,
    attended: 37,
    absent: 1,
    late: 0,
    percentage: 97.4,
    status: 'excellent',
    color: 'bg-green-500',
    lastClass: '2024-12-03'
  },
  {
    id: 4,
    courseName: 'Database Management Systems',
    courseCode: 'CS220',
    totalClasses: 42,
    attended: 32,
    absent: 7,
    late: 3,
    percentage: 76.2,
    status: 'warning',
    color: 'bg-orange-500',
    lastClass: '2024-11-30'
  },
  {
    id: 5,
    courseName: 'Software Engineering Principles',
    courseCode: 'CS305',
    totalClasses: 44,
    attended: 43,
    absent: 0,
    late: 1,
    percentage: 97.7,
    status: 'excellent',
    color: 'bg-pink-500',
    lastClass: '2024-12-04'
  },
  {
    id: 6,
    courseName: 'Mobile Application Development',
    courseCode: 'CS350',
    totalClasses: 36,
    attended: 30,
    absent: 4,
    late: 2,
    percentage: 83.3,
    status: 'good',
    color: 'bg-indigo-500',
    lastClass: '2024-12-02'
  }
];

const recentAttendance = [
  { date: '2024-12-04', course: 'Software Engineering Principles', status: 'present', time: '11:00 AM' },
  { date: '2024-12-03', course: 'Web Development Fundamentals', status: 'present', time: '02:00 PM' },
  { date: '2024-12-02', course: 'Introduction to Computer Science', status: 'present', time: '08:30 AM' },
  { date: '2024-12-02', course: 'Mobile Application Development', status: 'late', time: '03:30 PM' },
  { date: '2024-12-01', course: 'Data Structures & Algorithms', status: 'present', time: '10:00 AM' },
  { date: '2024-11-30', course: 'Database Management Systems', status: 'absent', time: '01:30 PM' }
];

export function AttendanceOverview() {
  const { t, isRTL } = useLanguage();
  const { isDark } = useTheme();
  const totalClasses = attendanceData.reduce((sum, course) => sum + course.totalClasses, 0);
  const totalAttended = attendanceData.reduce((sum, course) => sum + course.attended, 0);
  const totalAbsent = attendanceData.reduce((sum, course) => sum + course.absent, 0);
  const totalLate = attendanceData.reduce((sum, course) => sum + course.late, 0);
  const overallPercentage = ((totalAttended / totalClasses) * 100).toFixed(1);

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
          return 'text-gray-400 bg-gray-700 border-gray-600';
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
        return 'text-gray-700 bg-gray-50 border-gray-200';
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
      case 'present': return t('present');
      case 'absent': return t('absent');
      case 'late': return t('late');
      default: return status;
    }
  };

  return (
    <div className="space-y-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <BarChart3 size={20} className="text-white" />
        </div>
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('attendanceOverview')}</h1>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{isRTL ? 'تتبع حضورك في جميع المقررات' : 'Track your attendance across all courses'}</p>
        </div>
      </div>

      {/* Overall Percentage Card */}
      <div className={`rounded-lg p-8 shadow-sm border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('overallAttendance')}</h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {totalAttended} {t('attended')} {t('outOf')} {totalClasses} {t('totalClasses')}
            </p>
          </div>
          <div className="text-center">
            <div className="text-5xl font-bold text-blue-600 mb-3">{overallPercentage}%</div>
            <div className={`flex flex-col gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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
            <h2 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('lectureAttendance')}</h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{isRTL ? 'تفاصيل الحضور حسب المقرر' : 'Detailed attendance breakdown by course'}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {attendanceData.map((course) => (
              <div
                key={course.id}
                className={`rounded-lg overflow-hidden hover:shadow-md transition-shadow border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
              >
                <div className={`${course.color} h-1`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`font-semibold text-base ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.courseName}</h3>
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{course.courseCode}</p>
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
                  <div className={`grid grid-cols-4 gap-2 mb-4 pb-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <div className="text-center">
                      <p className={`text-xs mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{t('totalClasses')}</p>
                      <p className={`text-base font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.totalClasses}</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs mb-1 ${isDark ? 'text-green-400' : 'text-green-700'}`}>{t('present')}</p>
                      <p className={`text-base font-bold ${isDark ? 'text-green-400' : 'text-green-900'}`}>{course.attended}</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs mb-1 ${isDark ? 'text-red-400' : 'text-red-700'}`}>{t('absent')}</p>
                      <p className={`text-base font-bold ${isDark ? 'text-red-400' : 'text-red-900'}`}>{course.absent}</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xs mb-1 ${isDark ? 'text-orange-400' : 'text-orange-700'}`}>{t('late')}</p>
                      <p className={`text-base font-bold ${isDark ? 'text-orange-400' : 'text-orange-900'}`}>{course.late}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className={`w-full rounded-full h-2 mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className={`${course.color} h-2 rounded-full transition-all`}
                      style={{ width: `${course.percentage}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(course.lastClass).toLocaleDateString()}
                    </span>
                    <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{course.percentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Attendance Activity */}
        <div>
          <div className="mb-6">
            <h2 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{t('recentActivity')}</h2>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{isRTL ? 'آخر 6 سجلات حضور' : 'Last 6 attendance records'}</p>
          </div>

          <div className={`rounded-lg p-6 mb-6 border ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="space-y-4">
              {recentAttendance.map((record, idx) => (
                <div key={idx} className={`pb-4 border-b last:border-0 last:pb-0 ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">{getAttendanceStatusIcon(record.status)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1 gap-2">
                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{record.course}</p>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 whitespace-nowrap ${
                            record.status === 'present'
                              ? isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-700'
                              : record.status === 'late'
                              ? isDark ? 'bg-orange-900/50 text-orange-400' : 'bg-orange-100 text-orange-700'
                              : isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {getStatusText(record.status)}
                        </span>
                      </div>
                      <div className={`flex items-center gap-3 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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
          <div className={`rounded-lg p-6 border ${isDark ? 'bg-blue-900/30 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
            <h3 className={`font-semibold mb-3 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Key Insights
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  Your overall attendance rate is {overallPercentage}%, which is excellent!
                </p>
              </div>
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                  Database Management Systems needs attention (76.2%)
                </p>
              </div>
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>You've been late {totalLate} times this semester</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

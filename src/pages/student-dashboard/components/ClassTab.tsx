import { MoreVertical, Clock, Users, BookOpen } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useApi } from '../../../hooks/useApi';
import { enrollmentService } from '../../../services/api/enrollmentService';
import { LoadingSkeleton } from '../../../components/shared';

interface Course {
  id: string;
  title: string;
  courseCode: string;
  instructor: string;
  instructorImage: string;
  schedule: string;
  nextClass: string;
  room: string;
  students: number;
  credits: number;
  progress: number;
  color: string;
  progressColor: string;
}

interface ClassTabProps {
  onViewCourse?: (courseId: string) => void;
}

const CourseCard= ({
  course,
  onViewCourse,
  isDark,
  t,
}: {
  course: Course;
  onViewCourse?: (courseId: string) => void;
  isDark: boolean;
  t: (key: string) => string;
}) => (
  <div className={`${isDark ? 'bg-card-dark border border-white/5' : 'glass'} rounded-[2.5rem] overflow-hidden hover:shadow-lg transition-shadow`}>
    {/* Color bar */}
    <div className="h-2" style={{ backgroundColor: course.progressColor }} />

    {/* Course header */}
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold mb-1 break-words ${isDark ? 'text-white' : 'text-slate-800'}`}>{course.title}</h3>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{course.courseCode}</p>
        </div>
        <button className={`transition-colors ${isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-500 hover:text-slate-600'}`}>
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Instructor */}
      <div className={`flex items-center gap-3 mb-4 pb-4 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <img
          src={course.instructorImage}
          alt={course.instructor}
          className="w-10 h-10 rounded-full object-cover"
          onError={(e) =>
            (e.currentTarget.src =
              'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2240%22 height=%2240%22%3E%3Crect fill=%22%23e5e7eb%22 width=%2240%22 height=%2240%22/%3E%3C/svg%3E')
          }
        />
        <div>
          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{course.instructor}</p>
          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{t('instructor')}</p>
        </div>
      </div>

      {/* Schedule info */}
      <div className={`space-y-2 mb-4 text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
        <div className="flex items-center gap-2">
          <Clock size={16} />
          <span>{course.schedule}</span>
        </div>
        <div className="flex items-center gap-2">
          <BookOpen size={16} />
          <span>{course.nextClass}</span>
        </div>
      </div>

      {/* Stats */}
      <div className={`flex justify-between items-center mb-4 pt-4 border-t text-sm ${isDark ? 'border-white/5' : 'border-slate-100'}`}>
        <div className={`flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
          <Users size={16} />
          <span>{course.students} {t('students')}</span>
        </div>
        <span className={isDark ? 'text-slate-500' : 'text-slate-600'}>{course.credits} {t('credits')}</span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{t('courseProgress')}</span>
          <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>{course.progress}%</span>
        </div>
        <div className={`w-full rounded-full h-2 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${course.progress}%`, backgroundColor: course.progressColor }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => onViewCourse?.(course.id)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors min-w-0"
        >
          {t('viewCourse')}
        </button>
        <button
          onClick={() => onViewCourse?.(course.id)}
          className={`flex-1 border font-medium py-2 px-4 rounded-lg transition-colors min-w-0 ${
          isDark 
            ? 'border-white/10 hover:bg-white/5 text-slate-400' 
            : 'border-slate-100 hover:bg-slate-50 text-slate-700'
        }`}>
          {t('materials')}
        </button>
      </div>
    </div>
  </div>
);

export default function ClassTab({
  onViewCourse,
}: ClassTabProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const { data: enrollments, loading } = useApi(
    () => enrollmentService.getMyEnrolledCourses(),
    []
  );

  const accentColors = ['#2b7fff', '#ad46ff', '#00c950', '#ff6900', '#f6339a', '#615fff'];
  const bgColors = ['#e0e7ff', '#fce7f3', '#dcfce7', '#fed7aa', '#f3e8ff', '#e0e7ff'];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const courses: Course[] = (enrollments || []).map((enrollment: any, index: number) => ({
    id: String(enrollment.id),
    title: enrollment.course?.name || 'Course',
    courseCode: enrollment.course?.code || '',
    instructor: enrollment.instructor
      ? `${enrollment.instructor.firstName} ${enrollment.instructor.lastName}`
      : enrollment.section?.instructor
        ? `${enrollment.section.instructor.firstName} ${enrollment.section.instructor.lastName}`
        : 'TBD',
    instructorImage: '',
    schedule: enrollment.section?.schedules?.[0]
      ? `${enrollment.section.schedules[0].dayOfWeek} - ${enrollment.section.schedules[0].startTime}`
      : 'TBD',
    nextClass: 'See schedule',
    room: enrollment.section?.location || enrollment.section?.schedules?.[0]?.room || 'TBD',
    students: enrollment.section?.currentEnrollment || 0,
    credits: enrollment.course?.credits || 3,
    progress: 0,
    color: bgColors[index % bgColors.length],
    progressColor: accentColors[index % accentColors.length],
  }));

  if (loading) {
    return <LoadingSkeleton variant="card" count={6} />;
  }

  return (
    <div className="space-y-6">
      {/* Enrolled Courses Section */}
      <div>
        <div className="mb-4">
          <h2 className={`text-xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>{t('enrolledCourses')}</h2>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>{t('enrolledCoursesDesc')}</p>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} onViewCourse={onViewCourse} isDark={isDark} t={t} />
          ))}
        </div>
      </div>
    </div>
  );
}

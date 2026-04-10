import { MoreVertical, Clock, Users, BookOpen, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useApi } from '../../../hooks/useApi';
import { enrollmentService, EnrolledCourse } from '../../../services/api/enrollmentService';

const COURSE_COLORS = [
  { bg: '#e0e7ff', accent: '#4f46e5' },
  { bg: '#dcfce7', accent: '#16a34a' },
  { bg: '#fef3c7', accent: '#d97706' },
  { bg: '#fce7f3', accent: '#db2777' },
  { bg: '#e0f2fe', accent: '#0284c7' },
  { bg: '#f3e8ff', accent: '#9333ea' },
];

interface Course {
  id: string;
  title: string;
  courseCode: string;
  status?: string;
  sectionNumber?: string;
  semesterName?: string;
  grade?: string;
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
  courses?: Course[];
  onViewCourse?: (courseId: string) => void;
}

const defaultCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Computer Science',
    courseCode: 'CS101',
    instructor: 'Dr. Sarah Johnson',
    instructorImage: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=random',
    schedule: 'Mon, Wed, Fri - 08:30 AM',
    nextClass: 'Next: Monday, 08:30 AM',
    room: 'Room 301',
    students: 45,
    credits: 3,
    progress: 75,
    color: '#e0e7ff',
    progressColor: '#2b7fff',
  },
  {
    id: '2',
    title: 'Data Structures & Algorithms',
    courseCode: 'CS201',
    instructor: 'Prof. Michael Chen',
    instructorImage: 'https://ui-avatars.com/api/?name=Michael+Chen&background=random',
    schedule: 'Tue, Thu - 10:00 AM',
    nextClass: 'Next: Tuesday, 10:00 AM',
    room: 'Lab 401',
    students: 38,
    credits: 4,
    progress: 60,
    color: '#fce7f3',
    progressColor: '#ad46ff',
  },
  {
    id: '3',
    title: 'Web Development Fundamentals',
    courseCode: 'CS150',
    instructor: 'Dr. Emily Roberts',
    instructorImage: 'https://ui-avatars.com/api/?name=Emily+Roberts&background=random',
    schedule: 'Mon, Wed - 02:00 PM',
    nextClass: 'Next: Monday, 02:00 PM',
    room: 'Lab 302',
    students: 42,
    credits: 3,
    progress: 85,
    color: '#dcfce7',
    progressColor: '#00c950',
  },
  {
    id: '4',
    title: 'Database Management Systems',
    courseCode: 'CS220',
    instructor: 'Dr. James Wilson',
    instructorImage: 'https://ui-avatars.com/api/?name=James+Wilson&background=random',
    schedule: 'Tue, Thu - 01:30 PM',
    nextClass: 'Next: Thursday, 01:30 PM',
    room: 'Room 201',
    students: 35,
    credits: 3,
    progress: 45,
    color: '#fed7aa',
    progressColor: '#ff6900',
  },
  {
    id: '5',
    title: 'Software Engineering Principles',
    courseCode: 'CS305',
    instructor: 'Prof. Lisa Anderson',
    instructorImage: 'https://ui-avatars.com/api/?name=Lisa+Anderson&background=random',
    schedule: 'Mon, Wed, Fri - 11:00 AM',
    nextClass: 'Next: Friday, 11:00 AM',
    room: 'Hall 1',
    students: 40,
    credits: 4,
    progress: 90,
    color: '#f3e8ff',
    progressColor: '#f6339a',
  },
  {
    id: '6',
    title: 'Mobile Application Development',
    courseCode: 'CS350',
    instructor: 'Dr. Robert Taylor',
    instructorImage: 'https://ui-avatars.com/api/?name=Robert+Taylor&background=random',
    schedule: 'Tue, Thu - 03:30 PM',
    nextClass: 'Next: Tuesday, 03:30 PM',
    room: 'Lab 303',
    students: 30,
    credits: 3,
    progress: 55,
    color: '#e0e7ff',
    progressColor: '#615fff',
  },
];

const CourseCard = ({
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
  <div
    className={`rounded-3xl border overflow-hidden transition-all duration-300 ${isDark ? 'bg-card-dark border-white/5 shadow-xl shadow-black/20 hover:border-white/10' : 'bg-white border-slate-200 shadow-sm hover:shadow-md'}`}
  >
    {/* Color bar */}
    <div className="h-2" style={{ backgroundColor: course.progressColor }} />

    {/* Course header */}
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold mb-1 wrap-break-word ${isDark ? 'text-white' : 'text-slate-800'}`}
          >
            {course.title}
          </h3>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
            {course.courseCode}
          </p>
        </div>
        <button
          className={`transition-colors ${isDark ? 'text-slate-500 hover:text-slate-400' : 'text-slate-500 hover:text-slate-600'}`}
        >
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Enrollment info */}
      <div
        className={`flex items-center gap-3 mb-4 pb-4 border-b ${isDark ? 'border-white/5' : 'border-slate-100'}`}
      >
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
          <p className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
            Section {course.sectionNumber || '-'} • {course.semesterName || '-'}
          </p>
          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
            {course.status || 'enrolled'}
          </p>
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
          <span>Grade: {course.grade || 'N/A'}</span>
        </div>
      </div>

      {/* Stats */}
      <div
        className={`flex justify-between items-center mb-4 pt-4 border-t text-sm ${isDark ? 'border-white/5' : 'border-slate-100'}`}
      >
        <div className={`flex items-center gap-1 ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
          <Users size={16} />
          <span>
            {course.students} {t('students')}
          </span>
        </div>
        <span className={isDark ? 'text-slate-500' : 'text-slate-600'}>
          {course.credits} {t('credits')}
        </span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
            {t('courseProgress')}
          </span>
          <span className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {course.progress}%
          </span>
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
          }`}
        >
          {t('materials')}
        </button>
      </div>
    </div>
  </div>
);

export default function ClassTab({ courses: propCourses, onViewCourse }: ClassTabProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const {
    data: enrollments,
    loading,
    error,
  } = useApi(async () => {
    try {
      return await enrollmentService.getMyCourses();
    } catch (err) {
      console.error('Failed to fetch my courses', err);
      throw err;
    }
  }, []);

  const apiCourses: Course[] =
    enrollments && enrollments.length > 0
      ? enrollments.map((e: EnrolledCourse, i: number) => {
          const color = COURSE_COLORS[i % COURSE_COLORS.length];
          const rawEnrollment = e as unknown as Record<string, unknown>;
          const rawGradeObject =
            (rawEnrollment.grade && typeof rawEnrollment.grade === 'object'
              ? (rawEnrollment.grade as Record<string, unknown>)
              : undefined) ??
            (rawEnrollment.gradeRecord && typeof rawEnrollment.gradeRecord === 'object'
              ? (rawEnrollment.gradeRecord as Record<string, unknown>)
              : undefined);

          const candidateGradeValues: unknown[] = [
            typeof e.grade === 'string' ? e.grade : undefined,
            rawEnrollment.finalGrade,
            rawEnrollment.letterGrade,
            rawEnrollment.gradeValue,
            rawEnrollment.gradeText,
            rawEnrollment.score,
            rawEnrollment.finalScore,
            rawGradeObject?.letterGrade,
            rawGradeObject?.grade,
            rawGradeObject?.gradeValue,
            rawGradeObject?.gradeText,
            rawGradeObject?.score,
            rawGradeObject?.finalScore,
            rawGradeObject?.pointsEarned,
          ];

          const resolvedGrade =
            candidateGradeValues.find(
              (value) => value !== null && value !== undefined && String(value).trim() !== ''
            ) ?? 'N/A';

          return {
            id: e.id,
            title: e.course.name,
            courseCode: e.course.code,
            status: e.status,
            sectionNumber: e.section.sectionNumber,
            semesterName: e.semester.name,
            grade: String(resolvedGrade),
            instructorImage: `https://ui-avatars.com/api/?name=${encodeURIComponent(e.course.name)}&background=random`,
            schedule: `Section ${e.section.sectionNumber}`,
            nextClass: e.semester.name,
            room: e.section.location || 'TBD',
            students: e.section.currentEnrollment,
            credits: e.course.credits,
            progress: 0,
            color: color.bg,
            progressColor: color.accent,
          };
        })
      : [];

  const courses = apiCourses.length > 0 ? apiCourses : (propCourses ?? defaultCourses);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`rounded-xl border p-4 ${isDark ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-red-200 bg-red-50 text-red-700'}`}
      >
        Failed to load my courses: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enrolled Courses Section */}
      <div>
        <div className="mb-4">
          <h2 className={`text-xl font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>
            {t('enrolledCourses')}
          </h2>
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
            {t('enrolledCoursesDesc')}
          </p>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course, index) => (
            <CourseCard
              key={course.id || course.courseCode || index}
              course={course}
              onViewCourse={onViewCourse}
              isDark={isDark}
              t={t}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

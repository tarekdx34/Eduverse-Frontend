import { MoreVertical, Clock, Users, BookOpen } from 'lucide-react';

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
  courses?: Course[];
  stats?: {
    totalCourses: number;
    completed: number;
    inProgress: number;
    totalCredits: number;
  };
  onViewCourse?: (courseId: string) => void;
}

const defaultCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Computer Science',
    courseCode: 'CS101',
    instructor: 'Dr. Sarah Johnson',
    instructorImage: 'http://localhost:3845/assets/56d9e68ccff12413f144bdf75269165f5e84005a.png',
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
    instructorImage: 'http://localhost:3845/assets/9bbdfb06a5eae3ca01387e38cee556cb0ba93eb3.png',
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
    instructorImage: 'http://localhost:3845/assets/6037748207f9c7910c91db1bd9b0f380e0225194.png',
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
    instructorImage: 'http://localhost:3845/assets/8f649ffb9509e27c1a5cfa2575f93e2a1f744127.png',
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
    instructorImage: 'http://localhost:3845/assets/c63835773a05453d6506aec39d7d54c0bc4571da.png',
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
    instructorImage: 'http://localhost:3845/assets/0d5da6ab018faf09b0940ac3e0ab4d6d514c431f.png',
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

const defaultStats = {
  totalCourses: 6,
  completed: 1,
  inProgress: 5,
  totalCredits: 20,
};

const StatCard = ({ label, value, icon: Icon, color }: any) => (
  <div className="bg-white border border-gray-200 rounded-lg p-6">
    <div className="flex items-start gap-3 mb-4">
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="text-sm text-gray-600 mb-2">{label}</div>
    <div className="text-3xl font-bold text-gray-900">{value}</div>
  </div>
);

const CourseCard = ({
  course,
  onViewCourse,
}: {
  course: Course;
  onViewCourse?: (courseId: string) => void;
}) => (
  <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
    {/* Color bar */}
    <div className="h-2" style={{ backgroundColor: course.progressColor }} />

    {/* Course header */}
    <div className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{course.title}</h3>
          <p className="text-sm text-gray-600">{course.courseCode}</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreVertical size={20} />
        </button>
      </div>

      {/* Instructor */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
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
          <p className="text-sm font-medium text-gray-900">{course.instructor}</p>
          <p className="text-xs text-gray-600">Instructor</p>
        </div>
      </div>

      {/* Schedule info */}
      <div className="space-y-2 mb-4 text-sm text-gray-600">
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
      <div className="flex justify-between items-center mb-4 pt-4 border-t border-gray-100 text-sm">
        <div className="flex items-center gap-1 text-gray-600">
          <Users size={16} />
          <span>{course.students} Students</span>
        </div>
        <span className="text-gray-600">{course.credits} Credits</span>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Course Progress</span>
          <span className="text-sm font-semibold text-gray-900">{course.progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-2 rounded-full transition-all"
            style={{ width: `${course.progress}%`, backgroundColor: course.progressColor }}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewCourse?.(course.id)}
          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          View Course
        </button>
        <button className="flex-1 border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors">
          Materials
        </button>
      </div>
    </div>
  </div>
);

export default function ClassTab({
  courses = defaultCourses,
  stats = defaultStats,
  onViewCourse,
}: ClassTabProps) {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          label="Total Courses"
          value={stats.totalCourses}
          icon={() => <BookOpen className="w-5 h-5" />}
          color="bg-indigo-100"
        />
        <StatCard
          label="Completed"
          value={stats.completed}
          icon={() => <div className="w-5 h-5">✓</div>}
          color="bg-green-100"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={() => <Clock className="w-5 h-5" />}
          color="bg-orange-100"
        />
        <StatCard
          label="Total Credits"
          value={stats.totalCredits}
          icon={() => <Users className="w-5 h-5" />}
          color="bg-purple-100"
        />
      </div>

      {/* Enrolled Courses Section */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">Enrolled Courses</h2>
          <p className="text-sm text-gray-600">All courses you are currently enrolled in</p>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} onViewCourse={onViewCourse} />
          ))}
        </div>
      </div>
    </div>
  );
}

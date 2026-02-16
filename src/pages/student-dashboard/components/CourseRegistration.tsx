import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Search,
  Filter,
  BookOpen,
  Clock,
  Users,
  Star,
  Calendar,
  MapPin,
  Plus,
  Check,
  X,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Award,
  Info
} from 'lucide-react';

interface Course {
  id: string;
  code: string;
  title: string;
  instructor: string;
  credits: number;
  schedule: string;
  room: string;
  capacity: number;
  enrolled: number;
  department: string;
  level: string;
  prerequisites: string[];
  description: string;
  rating: number;
  status: 'open' | 'waitlist' | 'closed';
}

interface RegisteredCourse {
  id: string;
  code: string;
  title: string;
  credits: number;
  schedule: string;
  status: 'registered' | 'waitlist';
}

const availableCourses: Course[] = [
  {
    id: '1',
    code: 'CS401',
    title: 'Machine Learning Fundamentals',
    instructor: 'Dr. Emily Zhang',
    credits: 4,
    schedule: 'Mon, Wed 10:00 AM - 11:30 AM',
    room: 'Lab 401',
    capacity: 35,
    enrolled: 28,
    department: 'Computer Science',
    level: 'Advanced',
    prerequisites: ['CS201', 'MATH301'],
    description: 'Introduction to machine learning algorithms, neural networks, and deep learning concepts.',
    rating: 4.8,
    status: 'open'
  },
  {
    id: '2',
    code: 'CS402',
    title: 'Cloud Computing & DevOps',
    instructor: 'Prof. Michael Brown',
    credits: 3,
    schedule: 'Tue, Thu 2:00 PM - 3:30 PM',
    room: 'Room 302',
    capacity: 40,
    enrolled: 40,
    department: 'Computer Science',
    level: 'Advanced',
    prerequisites: ['CS305'],
    description: 'Cloud infrastructure, containerization, CI/CD pipelines, and DevOps practices.',
    rating: 4.6,
    status: 'waitlist'
  },
  {
    id: '3',
    code: 'CS310',
    title: 'Cybersecurity Essentials',
    instructor: 'Dr. Sarah Miller',
    credits: 3,
    schedule: 'Mon, Wed, Fri 1:00 PM - 2:00 PM',
    room: 'Lab 205',
    capacity: 30,
    enrolled: 30,
    department: 'Computer Science',
    level: 'Intermediate',
    prerequisites: ['CS201'],
    description: 'Network security, cryptography, ethical hacking, and security protocols.',
    rating: 4.9,
    status: 'closed'
  },
  {
    id: '4',
    code: 'CS320',
    title: 'Computer Graphics',
    instructor: 'Dr. James Wilson',
    credits: 4,
    schedule: 'Tue, Thu 10:00 AM - 11:30 AM',
    room: 'Lab 303',
    capacity: 25,
    enrolled: 18,
    department: 'Computer Science',
    level: 'Intermediate',
    prerequisites: ['MATH201', 'CS150'],
    description: '3D graphics programming, OpenGL, shaders, and rendering techniques.',
    rating: 4.5,
    status: 'open'
  },
  {
    id: '5',
    code: 'MATH401',
    title: 'Linear Algebra for Data Science',
    instructor: 'Prof. Lisa Chen',
    credits: 3,
    schedule: 'Mon, Wed 3:00 PM - 4:30 PM',
    room: 'Room 201',
    capacity: 45,
    enrolled: 32,
    department: 'Mathematics',
    level: 'Advanced',
    prerequisites: ['MATH201'],
    description: 'Matrix operations, eigenvalues, SVD, and applications in data science.',
    rating: 4.7,
    status: 'open'
  },
  {
    id: '6',
    code: 'CS330',
    title: 'Natural Language Processing',
    instructor: 'Dr. Robert Taylor',
    credits: 3,
    schedule: 'Wed, Fri 9:00 AM - 10:30 AM',
    room: 'Lab 402',
    capacity: 30,
    enrolled: 25,
    department: 'Computer Science',
    level: 'Advanced',
    prerequisites: ['CS401', 'MATH301'],
    description: 'Text processing, sentiment analysis, transformers, and language models.',
    rating: 4.8,
    status: 'open'
  }
];

export function CourseRegistration() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [registeredCourses, setRegisteredCourses] = useState<RegisteredCourse[]>([
    { id: 'r1', code: 'CS101', title: 'Introduction to Computer Science', credits: 3, schedule: 'Mon, Wed, Fri 8:30 AM', status: 'registered' },
    { id: 'r2', code: 'CS201', title: 'Data Structures & Algorithms', credits: 4, schedule: 'Tue, Thu 10:00 AM', status: 'registered' },
  ]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [courseToRegister, setCourseToRegister] = useState<Course | null>(null);

  const totalCredits = registeredCourses.reduce((sum, c) => sum + c.credits, 0);
  const maxCredits = 21;

  const filteredCourses = availableCourses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment = selectedDepartment === 'all' || course.department === selectedDepartment;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    return matchesSearch && matchesDepartment && matchesLevel;
  });

  const handleRegister = (course: Course) => {
    setCourseToRegister(course);
    setShowConfirmModal(true);
  };

  const confirmRegistration = () => {
    if (!courseToRegister) return;
    
    const newCourse: RegisteredCourse = {
      id: `r${Date.now()}`,
      code: courseToRegister.code,
      title: courseToRegister.title,
      credits: courseToRegister.credits,
      schedule: courseToRegister.schedule,
      status: courseToRegister.status === 'waitlist' ? 'waitlist' : 'registered'
    };
    
    setRegisteredCourses([...registeredCourses, newCourse]);
    setShowConfirmModal(false);
    setCourseToRegister(null);
  };

  const handleDrop = (courseId: string) => {
    setRegisteredCourses(registeredCourses.filter(c => c.id !== courseId));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'waitlist':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'closed':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const isAlreadyRegistered = (courseCode: string) => {
    return registeredCourses.some(c => c.code === courseCode);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <GraduationCap className="w-8 h-8" />
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">{t('springRegistration')}</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">{t('courseRegistration')}</h1>
        <p className="text-indigo-100 text-lg">{t('browseCourses')}</p>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-sm text-indigo-200 mb-1">{t('creditsEnrolled')}</p>
            <p className="text-2xl font-bold">{totalCredits} / {maxCredits}</p>
            <div className="mt-2 w-full bg-white/20 rounded-full h-2">
              <div 
                className="bg-white h-2 rounded-full transition-all"
                style={{ width: `${(totalCredits / maxCredits) * 100}%` }}
              />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-sm text-indigo-200 mb-1">{t('coursesRegistered')}</p>
            <p className="text-2xl font-bold">{registeredCourses.filter(c => c.status === 'registered').length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-sm text-indigo-200 mb-1">{t('onWaitlist')}</p>
            <p className="text-2xl font-bold">{registeredCourses.filter(c => c.status === 'waitlist').length}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Catalog */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchCoursePlaceholder')}
                  className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="all">{t('allDepartments')}</option>
                <option value="Computer Science">{t('computerScience')}</option>
                <option value="Mathematics">{t('mathematics')}</option>
                <option value="Physics">{t('physics')}</option>
              </select>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="all">{t('allLevels')}</option>
                <option value="Beginner">{t('beginner')}</option>
                <option value="Intermediate">{t('intermediate')}</option>
                <option value="Advanced">{t('advanced')}</option>
              </select>
            </div>
          </div>

          {/* Course List */}
          <div className="space-y-3">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className={`bg-white rounded-xl border-2 p-5 transition-all hover:shadow-lg cursor-pointer ${
                  selectedCourse?.id === course.id ? 'border-indigo-500 shadow-md' : 'border-gray-200'
                }`}
                onClick={() => setSelectedCourse(course)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-indigo-600">{course.code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(course.status)}`}>
                        {course.status === 'open' ? t('open') : course.status === 'waitlist' ? t('waitlist') : t('closed')}
                      </span>
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                        {course.level}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{course.title}</h3>
                    <p className="text-sm text-gray-600">{course.instructor}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-500 mb-1">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium">{course.rating}</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">{course.credits} CR</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{course.schedule.split(' ').slice(0, 2).join(' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span>{course.room}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span>{course.enrolled}/{course.capacity} {t('enrolled2')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {course.prerequisites.length > 0 && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        {t('prerequisites')}: {course.prerequisites.join(', ')}
                      </span>
                    )}
                  </div>
                  {isAlreadyRegistered(course.code) ? (
                    <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                      <Check className="w-4 h-4" />
                      {t('registered')}
                    </span>
                  ) : course.status === 'closed' ? (
                    <span className="px-4 py-2 bg-gray-100 text-gray-500 rounded-lg text-sm font-medium cursor-not-allowed">
                      {t('closed')}
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegister(course);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      {course.status === 'waitlist' ? t('joinWaitlist') : t('register')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar - Registered Courses */}
        <div className="space-y-4">
          {/* Current Schedule */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                {t('mySchedule')}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{registeredCourses.length} {t('coursesCredits')} • {totalCredits} {t('credits')}</p>
            </div>
            <div className="p-4 space-y-3">
              {registeredCourses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600">{t('noCourses')}</p>
                  <p className="text-sm text-gray-500">{t('browseToAdd')}</p>
                </div>
              ) : (
                registeredCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-indigo-600">{course.code}</span>
                          {course.status === 'waitlist' && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                              {t('waitlist')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-900">{course.title}</p>
                      </div>
                      <span className="text-sm font-bold text-gray-600">{course.credits} CR</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{course.schedule}</span>
                      <button
                        onClick={() => handleDrop(course.id)}
                        className="text-red-600 hover:text-red-700 text-xs font-medium flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        {t('drop')}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Course Details */}
          {selectedCourse && (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">{t('courseDetails')}</h3>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <span className="text-sm font-bold text-indigo-600">{selectedCourse.code}</span>
                  <h4 className="text-lg font-semibold text-gray-900">{selectedCourse.title}</h4>
                  <p className="text-sm text-gray-600">{selectedCourse.instructor}</p>
                </div>
                <p className="text-sm text-gray-700 mb-4">{selectedCourse.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('schedule')}</span>
                    <span className="text-gray-900 font-medium">{selectedCourse.schedule}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('room')}</span>
                    <span className="text-gray-900 font-medium">{selectedCourse.room}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('credits')}</span>
                    <span className="text-gray-900 font-medium">{selectedCourse.credits}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">{t('capacity')}</span>
                    <span className="text-gray-900 font-medium">{selectedCourse.enrolled}/{selectedCourse.capacity}</span>
                  </div>
                </div>
                {selectedCourse.prerequisites.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-900 mb-2">{t('prerequisites')}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCourse.prerequisites.map((prereq, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          {prereq}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Registration Confirmation Modal */}
      {showConfirmModal && courseToRegister && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-indigo-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
              {courseToRegister.status === 'waitlist' ? t('joinWaitlistQuestion') : t('confirmRegistration')}
            </h2>
            <p className="text-gray-600 text-center mb-4">
              {courseToRegister.status === 'waitlist' 
                ? `${t('waitlistConfirmText')} ${courseToRegister.code} - ${courseToRegister.title}`
                : `${t('registerConfirmText')} ${courseToRegister.code} - ${courseToRegister.title}`
              }
            </p>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('credits')}</span>
                  <span className="text-gray-900 font-medium">{courseToRegister.credits}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('schedule')}</span>
                  <span className="text-gray-900 font-medium">{courseToRegister.schedule}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">{t('instructor')}</span>
                  <span className="text-gray-900 font-medium">{courseToRegister.instructor}</span>
                </div>
              </div>
            </div>

            {totalCredits + courseToRegister.credits > maxCredits && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="text-amber-900 text-sm font-medium">{t('creditLimitWarning')}</p>
                    <p className="text-amber-700 text-xs">
                      {t('creditLimitText')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setCourseToRegister(null);
                }}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all font-medium"
              >
                {t('cancel')}
              </button>
              <button
                onClick={confirmRegistration}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-xl hover:shadow-lg transition-all font-medium"
              >
                {courseToRegister.status === 'waitlist' ? t('joinWaitlist') : t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseRegistration;

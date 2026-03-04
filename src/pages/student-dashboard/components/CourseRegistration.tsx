import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  Search,
  BookOpen,
  Clock,
  Users,
  Calendar,
  MapPin,
  Plus,
  Check,
  X,
  AlertCircle,
  GraduationCap,
  Info,
  CheckCircle,
} from 'lucide-react';
import { CustomDropdown, LoadingSkeleton } from '../../../components/shared';
import { useApi, useMutation } from '../../../hooks/useApi';
import { enrollmentService } from '../../../services/api/enrollmentService';
import type { Course, CourseSection } from '../../../types/api';

function getFirstSection(course: Course): CourseSection | undefined {
  return course.sections?.[0];
}

function formatSchedule(section?: CourseSection): string {
  if (!section?.schedules?.length) return 'TBA';
  return section.schedules
    .map((s) => `${s.dayOfWeek} ${s.startTime}-${s.endTime}`)
    .join(', ');
}

function formatRoom(section?: CourseSection): string {
  if (!section?.schedules?.length) return 'TBA';
  const first = section.schedules[0];
  return [first.building, first.room].filter(Boolean).join(' ') || 'TBA';
}

function getSectionStatus(section?: CourseSection): 'open' | 'closed' {
  if (!section) return 'closed';
  if (section.status === 'closed' || section.currentEnrollment >= section.maxCapacity)
    return 'closed';
  return 'open';
}

export function CourseRegistration() {
  const { t } = useLanguage();
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showPrereqsFor, setShowPrereqsFor] = useState<number | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [courseToRegister, setCourseToRegister] = useState<Course | null>(null);

  const {
    data: availableCourses,
    loading: loadingCourses,
    refetch: refetchAvailable,
  } = useApi(() => enrollmentService.getAvailableCourses(), []);

  const {
    data: enrolledCourses,
    loading: loadingEnrollments,
    refetch: refetchEnrollments,
  } = useApi(() => enrollmentService.getMyEnrolledCourses(), []);

  const registerMutation = useMutation((sectionId: number) =>
    enrollmentService.registerForCourse(sectionId)
  );

  const dropMutation = useMutation((enrollmentId: number) =>
    enrollmentService.dropCourse(enrollmentId)
  );

  const courses = availableCourses || [];
  const registeredCourses = enrolledCourses || [];

  const totalCredits = registeredCourses.reduce((sum, e) => sum + (e.course?.credits || 0), 0);
  const maxCredits = 21;

  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      selectedDepartment === 'all' || String(course.departmentId) === selectedDepartment;
    const matchesLevel = selectedLevel === 'all' || String(course.level) === selectedLevel;
    return matchesSearch && matchesDepartment && matchesLevel;
  });

  const handleRegister = (course: Course) => {
    setCourseToRegister(course);
    setShowConfirmModal(true);
  };

  const confirmRegistration = async () => {
    if (!courseToRegister) return;
    const section = getFirstSection(courseToRegister);
    if (!section) return;
    try {
      await registerMutation.mutate(section.id);
      await Promise.all([refetchAvailable(), refetchEnrollments()]);
    } catch {
      // error handled by mutation
    }
    setShowConfirmModal(false);
    setCourseToRegister(null);
  };

  const handleDrop = async (enrollmentId: number) => {
    try {
      await dropMutation.mutate(enrollmentId);
      await Promise.all([refetchAvailable(), refetchEnrollments()]);
    } catch {
      // error handled by mutation
    }
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
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const isAlreadyRegistered = (courseCode: string) => {
    return registeredCourses.some((e) => e.course?.code === courseCode);
  };

  if (loadingCourses || loadingEnrollments) {
    return <LoadingSkeleton variant="card" count={4} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-[var(--accent-color)] via-blue-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
        <div className="flex items-center gap-3 mb-3">
          <GraduationCap className="w-8 h-8" />
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full">
            {t('springRegistration')}
          </span>
        </div>
        <h1 className="text-3xl font-bold mb-2">{t('courseRegistration')}</h1>
        <p className="text-blue-100 text-lg">{t('browseCourses')}</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-sm text-blue-200 mb-1">{t('creditsEnrolled')}</p>
            <p className="text-2xl font-bold">
              {totalCredits} / {maxCredits}
            </p>
            <div className="mt-2 w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all"
                style={{ width: `${(totalCredits / maxCredits) * 100}%` }}
              />
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-sm text-blue-200 mb-1">{t('coursesRegistered')}</p>
            <p className="text-2xl font-bold">
              {registeredCourses.filter((c) => c.status === 'registered').length}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <p className="text-sm text-blue-200 mb-1">{t('onWaitlist')}</p>
            <p className="text-2xl font-bold">
              {registeredCourses.filter((c) => c.status === 'waitlist').length}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Catalog */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filters */}
          <div className="glass rounded-[2.5rem] p-4">
            <div className="flex gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchCoursePlaceholder')}
                  className={`w-full pl-10 pr-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' : 'border-slate-100 text-gray-900 placeholder-gray-500'} border-2 rounded-lg focus:outline-none focus:border-[var(--accent-color)] transition-all`}
                />
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <CustomDropdown
                  label={t('department') || 'Department'}
                  options={[
                    { value: 'all', label: t('allDepartments') },
                    { value: 'Computer Science', label: t('computerScience') },
                    { value: 'Mathematics', label: t('mathematics') },
                    { value: 'Physics', label: t('physics') },
                  ]}
                  value={selectedDepartment}
                  onChange={setSelectedDepartment}
                  isDark={isDark}
                  accentColor={accentColor}
                />
              </div>
              <div className="flex-1">
                <CustomDropdown
                  label={t('level') || 'Level'}
                  options={[
                    { value: 'all', label: t('allLevels') },
                    { value: 'Beginner', label: t('beginner') },
                    { value: 'Intermediate', label: t('intermediate') },
                    { value: 'Advanced', label: t('advanced') },
                  ]}
                  value={selectedLevel}
                  onChange={setSelectedLevel}
                  isDark={isDark}
                  accentColor={accentColor}
                />
              </div>
            </div>
          </div>

          {/* Course List */}
          <div className="space-y-3">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-xl border-2 p-5 transition-all hover:shadow-lg cursor-pointer ${
                  selectedCourse?.id === course.id
                    ? 'border-[var(--accent-color)] shadow-md'
                    : `${isDark ? 'border-white/5' : 'border-slate-100'}`
                }`}
                onClick={() => setSelectedCourse(course)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-[var(--accent-color)]">{course.code}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(getSectionStatus(getFirstSection(course)))}`}
                      >
                        {getSectionStatus(getFirstSection(course)) === 'open'
                          ? t('open')
                          : t('closed')}
                      </span>
                      <span
                        className={`px-2 py-0.5 ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-600'} rounded-full text-xs`}
                      >
                        {course.level ?? ''}
                      </span>
                    </div>
                    <h3
                      className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}
                    >
                      {course.name}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}
                    >
                      {course.credits} CR
                    </span>
                  </div>
                </div>

                <div
                  className={`grid grid-cols-3 gap-4 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mb-4`}
                >
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    <span>{formatSchedule(getFirstSection(course))}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>{formatRoom(getFirstSection(course))}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>
                      {getFirstSection(course)?.currentEnrollment ?? 0}/{getFirstSection(course)?.maxCapacity ?? 0} {t('enrolled2')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(course.prerequisites?.length ?? 0) > 0 && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPrereqsFor(showPrereqsFor === course.id ? null : course.id);
                          }}
                          className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
                            isDark
                              ? 'bg-[var(--accent-color)]/20 hover:bg-[var(--accent-color)]/30 text-[#A78BFA]'
                              : 'bg-[var(--accent-color)]/10 hover:bg-[var(--accent-color)]/20 text-[#6D28D9]'
                          }`}
                        >
                          <Info className="w-3 h-3" />
                          {t('prerequisites')}
                        </button>
                        {showPrereqsFor === course.id && (
                          <div
                            className={`absolute bottom-full left-0 mb-2 p-2 rounded-lg shadow-lg text-xs z-10 w-max border ${
                              isDark
                                ? 'bg-gray-800 border-white/10 text-white'
                                : 'bg-white border-gray-200 text-gray-800'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold opacity-70">
                                {t('requiredCourses') || 'Required Courses'}:
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowPrereqsFor(null);
                                }}
                                className="p-0.5 hover:bg-gray-500/20 rounded"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {(course.prerequisites || []).map((prereq) => (
                                <span
                                  key={prereq.id}
                                  className={`px-2 py-0.5 rounded text-[10px] font-medium ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}
                                >
                                  {prereq.prerequisiteCourse?.code || `Course #${prereq.prerequisiteCourseId}`}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  {isAlreadyRegistered(course.code) ? (
                    <span className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                      <Check className="w-4 h-4" />
                      {t('registered')}
                    </span>
                  ) : getSectionStatus(getFirstSection(course)) === 'closed' ? (
                    <span
                      className={`px-4 py-2 ${isDark ? 'bg-white/5' : 'bg-slate-50'} text-slate-500 rounded-lg text-sm font-medium cursor-not-allowed`}
                    >
                      {t('closed')}
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegister(course);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      {t('register')}
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
          <div className="glass rounded-[2.5rem] overflow-hidden">
            <div
              className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}
            >
              <h3
                className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}
              >
                <Calendar className="w-5 h-5 text-[var(--accent-color)]" />
                {t('mySchedule')}
              </h3>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'} mt-1`}>
                {registeredCourses.length} {t('coursesCredits')} • {totalCredits} {t('credits')}
              </p>
            </div>
            <div className="p-4 space-y-3">
              {registeredCourses.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                  <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t('noCourses')}
                  </p>
                  <p className="text-sm text-slate-500">{t('browseToAdd')}</p>
                </div>
              ) : (
                registeredCourses.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className={`p-3 border ${isDark ? 'border-white/5' : 'border-slate-100'} rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-all`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-[var(--accent-color)]">{enrollment.course?.code}</span>
                          {enrollment.status === 'waitlist' && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                              {t('waitlist')}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
                        >
                          {enrollment.course?.name}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                      >
                        {enrollment.course?.credits ?? 0} CR
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{formatSchedule(enrollment.section)}</span>
                      <button
                        onClick={() => handleDrop(enrollment.id)}
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
            <div className="glass rounded-[2.5rem] overflow-hidden">
              <div
                className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-gradient-to-r from-background-light to-white border-b border-slate-100'} p-4`}
              >
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {t('courseDetails')}
                </h3>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <span className="text-sm font-bold text-[var(--accent-color)]">{selectedCourse.code}</span>
                  <h4
                    className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}
                  >
                    {selectedCourse.name}
                  </h4>
                </div>
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'} mb-4`}>
                  {selectedCourse.description}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {t('schedule')}
                    </span>
                    <span className={`${isDark ? 'text-white' : 'text-slate-800'} font-medium`}>
                      {formatSchedule(getFirstSection(selectedCourse))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {t('room')}
                    </span>
                    <span className={`${isDark ? 'text-white' : 'text-slate-800'} font-medium`}>
                      {formatRoom(getFirstSection(selectedCourse))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {t('credits')}
                    </span>
                    <span className={`${isDark ? 'text-white' : 'text-slate-800'} font-medium`}>
                      {selectedCourse.credits}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {t('capacity')}
                    </span>
                    <span className={`${isDark ? 'text-white' : 'text-slate-800'} font-medium`}>
                      {getFirstSection(selectedCourse)?.currentEnrollment ?? 0}/{getFirstSection(selectedCourse)?.maxCapacity ?? 0}
                    </span>
                  </div>
                </div>
                {(selectedCourse.prerequisites?.length ?? 0) > 0 && (
                  <div
                    className={`mt-4 pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}
                  >
                    <p
                      className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'} mb-2`}
                    >
                      {t('prerequisites')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(selectedCourse.prerequisites || []).map((prereq) => (
                        <span
                          key={prereq.id}
                          className={`px-2 py-1 ${isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-700'} rounded text-xs`}
                        >
                          {prereq.prerequisiteCourse?.code || `Course #${prereq.prerequisiteCourseId}`}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {/* What You Will Learn */}
                <div
                  className={`mt-4 pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}
                >
                  <p
                    className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'} mb-2`}
                  >
                    {t('whatYouWillLearn') || 'What You Will Learn'}
                  </p>
                  <ul className="space-y-2">
                    <li
                      className={`flex items-start gap-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>
                      Core concepts and fundamentals of {selectedCourse.name.toLowerCase()}
                      </span>
                    </li>
                    <li
                      className={`flex items-start gap-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Practical hands-on experience with real-world applications</span>
                    </li>
                    <li
                      className={`flex items-start gap-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Industry-standard tools and best practices</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Registration Confirmation Modal */}
      {showConfirmModal && courseToRegister && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div
            className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-2xl p-8 max-w-md w-full shadow-2xl`}
          >
            <div className="w-16 h-16 bg-[var(--accent-color)]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-[var(--accent-color)]" />
            </div>
            <h2
              className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-800'} text-center mb-2`}
            >
              {t('confirmRegistration')}
            </h2>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-center mb-4`}>
              {`${t('registerConfirmText')} ${courseToRegister.code} - ${courseToRegister.name}`}
            </p>

            <div className={`${isDark ? 'bg-white/5' : 'bg-background-light'} rounded-lg p-4 mb-6`}>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t('credits')}
                  </span>
                  <span className={`${isDark ? 'text-white' : 'text-slate-800'} font-medium`}>
                    {courseToRegister.credits}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {t('schedule')}
                  </span>
                  <span className={`${isDark ? 'text-white' : 'text-slate-800'} font-medium`}>
                    {formatSchedule(getFirstSection(courseToRegister))}
                  </span>
                </div>
              </div>
            </div>

            {totalCredits + courseToRegister.credits > maxCredits && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <div>
                    <p className="text-amber-900 text-sm font-medium">{t('creditLimitWarning')}</p>
                    <p className="text-amber-700 text-xs">{t('creditLimitText')}</p>
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
                className={`flex-1 px-4 py-3 border-2 ${isDark ? 'border-white/5 text-slate-300 hover:bg-white/5' : 'border-slate-100 text-slate-700 hover:bg-slate-50'} rounded-xl transition-all font-medium`}
              >
                {t('cancel')}
              </button>
              <button
                onClick={confirmRegistration}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-[var(--accent-color)] to-[var(--accent-color)] text-white rounded-xl hover:shadow-lg transition-all font-medium"
              >
                {t('confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseRegistration;

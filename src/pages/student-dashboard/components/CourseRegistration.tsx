import { useEffect, useMemo, useState } from 'react';
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
import { toast } from 'sonner';
import { CustomDropdown } from '../../../components/shared';
import { useApi } from '../../../hooks/useApi';
import {
  enrollmentService,
  AvailableCourse as ApiAvailableCourse,
  EnrolledCourse,
} from '../../../services/api/enrollmentService';

interface Course {
  id: string;
  code: string;
  title: string;
  enrollmentStatus: 'enrolled' | 'not_enrolled' | 'waitlisted';
  canEnroll: boolean;
  sections: ApiAvailableCourse['sections'];
  credits: number;
  scheduleLabel: string;
  roomLabel: string;
  capacity: number;
  enrolled: number;
  department: string;
  level: string;
  prerequisites: string[];
  description: string;
}

interface RegisteredCourse extends EnrolledCourse {
  id: string;
  code: string;
  title: string;
  scheduleLabel: string;
}

function CourseRegistrationSkeleton({ isDark }: { isDark: boolean }) {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className={`h-9 w-64 rounded-md ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
        <div className={`h-4 w-80 rounded-md ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className={`rounded-2xl p-5 border-2 ${isDark ? 'bg-card-dark border-white/5' : 'bg-white border-slate-50'}`}
          >
            <div className={`h-4 w-1/2 rounded mb-4 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
            <div className={`h-8 w-1/3 rounded ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className={`h-12 w-full rounded-xl ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className={`rounded-xl border-2 p-5 ${isDark ? 'bg-card-dark border-white/5' : 'bg-white border-slate-100'}`}
            >
              <div className={`h-5 w-2/3 rounded mb-3 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
              <div className={`h-4 w-1/3 rounded mb-4 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
              <div className={`h-10 w-full rounded ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
            </div>
          ))}
        </div>
        <div className={`rounded-[2.5rem] p-4 ${isDark ? 'bg-card-dark border border-white/5' : 'glass'}`}>
          <div className={`h-5 w-1/2 rounded mb-4 ${isDark ? 'bg-white/10' : 'bg-slate-200'}`} />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className={`h-16 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-100'}`} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function CourseRegistration() {
  const { t } = useLanguage();
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showPrereqsFor, setShowPrereqsFor] = useState<string | null>(null);
  const [availableCourses, setAvailableCourses] = useState<ApiAvailableCourse[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [courseToRegister, setCourseToRegister] = useState<Course | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [droppingId, setDroppingId] = useState<string | null>(null);
  const [enrollError, setEnrollError] = useState<string>('');

  const {
    data: apiAvailable,
    loading: availableLoading,
    error: availableError,
    refetch: refetchAvailable,
  } = useApi(async () => {
    try {
      return await enrollmentService.getAvailableCourses();
    } catch (error) {
      console.error('Failed to fetch available courses', error);
      throw error;
    }
  }, []);
  const {
    data: myCourses,
    loading: myCoursesLoading,
    error: myCoursesError,
    refetch: refetchMyCourses,
  } = useApi(async () => {
    try {
      return await enrollmentService.getMyCourses();
    } catch (error) {
      console.error('Failed to fetch enrolled courses', error);
      throw error;
    }
  }, []);

  useEffect(() => {
    if (apiAvailable) {
      setAvailableCourses(apiAvailable);
    }
  }, [apiAvailable]);

  const mappedApiCourses: Course[] = useMemo(
    () =>
      availableCourses.map((c) => {
        const section = c.sections?.[0];
        const seatsTaken = section?.currentEnrollment ?? 0;
        const capacity = section?.maxCapacity ?? 0;
        return {
          id: c.id,
          code: c.code,
          title: c.name,
          enrollmentStatus: c.enrollmentStatus,
          canEnroll: c.canEnroll,
          sections: c.sections ?? [],
          credits: c.credits,
          scheduleLabel: section ? `Section ${section.sectionNumber}` : 'TBD',
          roomLabel: section?.location || 'TBD',
          capacity,
          enrolled: seatsTaken,
          department: c.departmentName || 'Unknown',
          level: c.level ? c.level.charAt(0).toUpperCase() + c.level.slice(1) : 'Unknown',
          prerequisites: [],
          description: c.description || '',
        };
      }),
    [availableCourses]
  );

  const registeredCourses: RegisteredCourse[] = useMemo(
    () =>
      (myCourses || []).map((enrollment) => ({
        ...enrollment,
        code: enrollment.course.code,
        title: enrollment.course.name,
        scheduleLabel: `Section ${enrollment.section.sectionNumber} • ${enrollment.semester.name}`,
      })),
    [myCourses]
  );

  const totalCredits = registeredCourses.reduce((sum, c) => sum + c.course.credits, 0);
  const maxCredits = 21;

  const departmentOptions = useMemo(() => {
    const departments = Array.from(
      new Set(mappedApiCourses.map((c) => c.department).filter(Boolean))
    );
    return [{ value: 'all', label: t('allDepartments') || 'All Departments' }].concat(
      departments.map((department) => ({ value: department, label: department }))
    );
  }, [mappedApiCourses, t]);

  const levelOptions = useMemo(() => {
    const levels = Array.from(new Set(mappedApiCourses.map((c) => c.level).filter(Boolean)));
    return [{ value: 'all', label: t('allLevels') || 'All Levels' }].concat(
      levels.map((level) => ({ value: level, label: level }))
    );
  }, [mappedApiCourses, t]);

  const filteredCourses = mappedApiCourses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDepartment =
      selectedDepartment === 'all' || course.department === selectedDepartment;
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;
    return matchesSearch && matchesDepartment && matchesLevel;
  });

  const handleRegister = (course: Course) => {
    setCourseToRegister(course);
    setSelectedSectionId('');
    setEnrollError('');
    setShowConfirmModal(true);
  };

  const getApiErrorMessage = (error: unknown): string => {
    const err = error as { response?: { data?: { message?: string } }; message?: string };
    return err?.response?.data?.message || err?.message || 'Enrollment failed';
  };

  const confirmRegistration = async () => {
    if (!courseToRegister || !selectedSectionId) return;
    try {
      setSubmitting(true);
      setEnrollError('');
      await enrollmentService.enrollInSection(Number(selectedSectionId));
      await Promise.all([refetchAvailable(), refetchMyCourses()]);
      toast.success('Enrolled successfully');
      setShowConfirmModal(false);
      setCourseToRegister(null);
      setSelectedSectionId('');
    } catch (error) {
      console.error('Failed to enroll in section', error);
      const message = getApiErrorMessage(error);
      setEnrollError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDrop = async (enrollmentId: string) => {
    try {
      setDroppingId(enrollmentId);
      await enrollmentService.dropCourse(enrollmentId);
      await Promise.all([refetchAvailable(), refetchMyCourses()]);
      toast.success('Course dropped successfully');
    } catch (error) {
      console.error('Failed to drop course', error);
      toast.error(getApiErrorMessage(error));
    } finally {
      setDroppingId(null);
    }
  };

  const getStatusBadge = (status: Course['enrollmentStatus']) => {
    switch (status) {
      case 'enrolled':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'waitlisted':
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const isAlreadyRegistered = (courseCode: string) =>
    registeredCourses.some((c) => c.course.code === courseCode);

  const selectedCourseSections = courseToRegister?.sections || [];

  const selectedSection = selectedCourseSections.find(
    (section) => section.id === selectedSectionId
  );

  const isLoading = availableLoading || myCoursesLoading;
  const combinedError = availableError || myCoursesError;

  if (isLoading) {
    return <CourseRegistrationSkeleton isDark={isDark} />;
  }

  if (combinedError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        <p className="font-medium">Failed to load registration data</p>
        <p className="text-sm">{combinedError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-slate-900'} mb-2`}>
          {t('courseRegistration')}
        </h1>
        <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>{t('browseCourses')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div
          className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-2xl p-5 border-2 ${isDark ? 'border-white/5' : 'border-slate-50'} shadow-sm`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <GraduationCap className={`w-5 h-5 text-(--accent-color)`} />
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              {t('creditsEnrolled')}
            </p>
          </div>
          <div className="flex items-end gap-2 mb-3">
            <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
              {totalCredits}
            </p>
            <p className={`text-sm mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              / {maxCredits} CR
            </p>
          </div>
          <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-(--accent-color) h-full transition-all duration-500"
              style={{ width: `${(totalCredits / maxCredits) * 100}%` }}
            />
          </div>
        </div>

        <div
          className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-2xl p-5 border-2 ${isDark ? 'border-white/5' : 'border-slate-50'} shadow-sm`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <CheckCircle className={`w-5 h-5 text-emerald-500`} />
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              {t('coursesRegistered')}
            </p>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {registeredCourses.filter((c) => c.status === 'registered').length}
          </p>
        </div>

        <div
          className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-2xl p-5 border-2 ${isDark ? 'border-white/5' : 'border-slate-50'} shadow-sm`}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg ${isDark ? 'bg-white/5' : 'bg-slate-50'}`}>
              <Clock className={`w-5 h-5 text-amber-500`} />
            </div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              {t('onWaitlist')}
            </p>
          </div>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            {registeredCourses.filter((c) => c.status === 'waitlist').length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Course Catalog */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('searchCoursePlaceholder')}
                className={`w-full pl-10 pr-4 py-2.5 ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-400' : 'border-slate-100 text-gray-900 placeholder-gray-500'} border-2 rounded-lg focus:outline-none focus:border-(--accent-color) transition-all`}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex-1">
                <CustomDropdown
                  label={t('department') || 'Department'}
                  options={departmentOptions}
                  value={selectedDepartment}
                  onChange={setSelectedDepartment}
                  isDark={isDark}
                  accentColor={accentColor}
                />
              </div>
              <div className="flex-1">
                <CustomDropdown
                  label={t('level') || 'Level'}
                  options={levelOptions}
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
            {filteredCourses.map((course, index) => (
              <div
                key={course.id || course.code || index}
                className={`${isDark ? 'bg-card-dark' : 'bg-white'} rounded-xl border-2 p-5 transition-all hover:shadow-lg cursor-pointer ${
                  selectedCourse?.id === course.id
                    ? 'border-(--accent-color) shadow-md'
                    : `${isDark ? 'border-white/5' : 'border-slate-100'}`
                }`}
                onClick={() => setSelectedCourse(course)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-(--accent-color)">{course.code}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusBadge(course.enrollmentStatus)}`}
                      >
                        {course.enrollmentStatus === 'enrolled'
                          ? 'Enrolled'
                          : course.enrollmentStatus === 'waitlisted'
                            ? 'Waitlisted'
                            : 'Not Enrolled'}
                      </span>
                      <span
                        className={`px-2 py-0.5 ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-600'} rounded-full text-xs`}
                      >
                        {course.level}
                      </span>
                    </div>
                    <h3
                      className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}
                    >
                      {course.title}
                    </h3>
                    <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {course.department}
                    </p>
                  </div>
                  <div className="text-right">
                    <div
                      className={`flex items-center gap-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                    >
                      <Users className="w-4 h-4" />
                      <span>
                        {course.enrolled}/{course.capacity}
                      </span>
                    </div>
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
                    <span>{course.scheduleLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <span>{course.roomLabel}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-slate-500" />
                    <span>{course.sections.length} sections</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {course.prerequisites.length > 0 && (
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowPrereqsFor(showPrereqsFor === course.id ? null : course.id);
                          }}
                          className={`text-xs px-2 py-1 rounded-md flex items-center gap-1 transition-colors ${
                            isDark
                              ? 'bg-(--accent-color)/20 hover:bg-(--accent-color)/30 text-[#A78BFA]'
                              : 'bg-(--accent-color)/10 hover:bg-(--accent-color)/20 text-[#6D28D9]'
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
                              {course.prerequisites.map((prereq) => (
                                <span
                                  key={prereq}
                                  className={`px-2 py-0.5 rounded text-[10px] font-medium ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}
                                >
                                  {prereq}
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
                      Enrolled
                    </span>
                  ) : course.enrollmentStatus === 'not_enrolled' && !course.canEnroll ? (
                    <span
                      className={`px-4 py-2 ${isDark ? 'bg-white/5' : 'bg-slate-50'} text-slate-500 rounded-lg text-sm font-medium cursor-not-allowed`}
                    >
                      Prerequisites Required
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegister(course);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-(--accent-color) text-white rounded-lg hover:opacity-90 transition-all text-sm font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Enroll
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
              className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-slate-50 border-b border-slate-100'} p-4`}
            >
              <h3
                className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}
              >
                <Calendar className="w-5 h-5 text-(--accent-color)" />
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
                registeredCourses.map((course, index) => (
                  <div
                    key={course.id || course.sectionId || index}
                    className={`p-3 border ${isDark ? 'border-white/5' : 'border-slate-100'} rounded-lg ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'} transition-all`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-(--accent-color)">
                            {course.code}
                          </span>
                          {course.status === 'waitlisted' && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs">
                              {t('waitlist')}
                            </span>
                          )}
                        </div>
                        <p
                          className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
                        >
                          {course.title}
                        </p>
                      </div>
                      <span
                        className={`text-sm font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                      >
                        {course.credits} CR
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500">{course.scheduleLabel}</span>
                      <button
                        onClick={() => handleDrop(course.id)}
                        disabled={droppingId === course.id}
                        className="text-red-600 hover:text-red-700 text-xs font-medium flex items-center gap-1"
                      >
                        <X className="w-3 h-3" />
                        {droppingId === course.id ? 'Dropping...' : t('drop')}
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
                className={`${isDark ? 'bg-white/5 border-b border-white/5' : 'bg-slate-50 border-b border-slate-100'} p-4`}
              >
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                  {t('courseDetails')}
                </h3>
              </div>
              <div className="p-4">
                <div className="mb-4">
                  <span className="text-sm font-bold text-(--accent-color)">
                    {selectedCourse.code}
                  </span>
                  <h4
                    className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-slate-800'}`}
                  >
                    {selectedCourse.title}
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {selectedCourse.department}
                  </p>
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
                      {selectedCourse.scheduleLabel}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {t('room')}
                    </span>
                    <span className={`${isDark ? 'text-white' : 'text-slate-800'} font-medium`}>
                      {selectedCourse.roomLabel}
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
                      {selectedCourse.enrolled}/{selectedCourse.capacity}
                    </span>
                  </div>
                </div>
                {selectedCourse.prerequisites.length > 0 && (
                  <div
                    className={`mt-4 pt-4 border-t ${isDark ? 'border-white/5' : 'border-slate-100'}`}
                  >
                    <p
                      className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'} mb-2`}
                    >
                      {t('prerequisites')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedCourse.prerequisites.map((prereq, idx) => (
                        <span
                          key={idx}
                          className={`px-2 py-1 ${isDark ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-700'} rounded text-xs`}
                        >
                          {prereq}
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
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>
                        Core concepts and fundamentals of {selectedCourse.title.toLowerCase()}
                      </span>
                    </li>
                    <li
                      className={`flex items-start gap-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <span>Practical hands-on experience with real-world applications</span>
                    </li>
                    <li
                      className={`flex items-start gap-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
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
            <div className="w-16 h-16 bg-(--accent-color)/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-(--accent-color)" />
            </div>
            <h2
              className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-800'} text-center mb-2`}
            >
              {t('confirmRegistration')}
            </h2>
            <p className={`${isDark ? 'text-slate-400' : 'text-slate-600'} text-center mb-4`}>
              {`${t('registerConfirmText')} ${courseToRegister.code} - ${courseToRegister.title}`}
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
                    Sections
                  </span>
                  <span className={`${isDark ? 'text-white' : 'text-slate-800'} font-medium`}>
                    {selectedCourseSections.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Department
                  </span>
                  <span className={`${isDark ? 'text-white' : 'text-slate-800'} font-medium`}>
                    {courseToRegister.department}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-6 max-h-48 overflow-y-auto space-y-2">
              {selectedCourseSections.map((section, index) => {
                const isFull = section.availableSeats === 0;
                const isSelected = selectedSectionId === section.id;
                return (
                  <button
                    key={section.id || `${courseToRegister?.id || 'course'}-${index}`}
                    disabled={isFull}
                    onClick={() => setSelectedSectionId(section.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all ${
                      isSelected
                        ? 'border-(--accent-color) bg-(--accent-color)/10'
                        : isDark
                          ? 'border-white/10 bg-white/5'
                          : 'border-slate-200 bg-white'
                    } ${isFull ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                        Section {section.sectionNumber}
                      </span>
                      <span className="text-xs text-slate-500">
                        {section.availableSeats}/{section.maxCapacity} seats
                      </span>
                    </div>
                    <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {section.semesterName} • {section.location}
                    </p>
                  </button>
                );
              })}
            </div>

            {!selectedSection && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-amber-700 text-sm">
                Select a section to continue.
              </div>
            )}

            {totalCredits + courseToRegister.credits > maxCredits && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
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
                  setEnrollError('');
                }}
                className={`flex-1 px-4 py-3 border-2 ${isDark ? 'border-white/5 text-slate-300 hover:bg-white/5' : 'border-slate-100 text-slate-700 hover:bg-slate-50'} rounded-xl transition-all font-medium`}
              >
                {t('cancel')}
              </button>
              <button
                onClick={confirmRegistration}
                disabled={!selectedSectionId || submitting || selectedSection?.availableSeats === 0}
                className="flex-1 px-4 py-3 bg-(--accent-color) text-white rounded-xl hover:shadow-lg transition-all font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? 'Enrolling...' : t('confirm')}
              </button>
            </div>
            {enrollError && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {enrollError}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseRegistration;

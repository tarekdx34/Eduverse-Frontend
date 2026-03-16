import {
  ArrowLeft,
  Users,
  User,
  Clock,
  ChevronDown,
  File,
  Sparkles,
  FlaskConical,
  Loader2,
  BookOpen,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  CourseMaterial,
  CourseMaterialsResponse,
  CourseStructureResponse,
  materialService,
  structureService,
} from '../../../services/api/courseService';
import { enrollmentService, EnrolledCourse } from '../../../services/api/enrollmentService';

interface Lesson {
  id: string;
  title: string;
  duration: number;
  type: 'video' | 'resource' | 'quiz';
  completed: boolean;
  organizationType?: 'lecture' | 'lab' | 'section' | 'tutorial';
  materialId?: string | null;
}

interface CourseSection {
  id: string;
  title: string;
  lessons: Lesson[];
  duration: number;
}

interface MaterialListItem {
  materialId: string;
  title: string;
  materialType: CourseMaterial['materialType'];
  weekNumber?: number | null;
}

interface CourseViewPageProps {
  courseId: string;
  onBack: () => void;
}

export default function CourseViewPage({ courseId, onBack }: CourseViewPageProps) {
  const { enrollmentId: enrollmentIdParam, id: legacyIdParam } = useParams();
  const enrollmentId = enrollmentIdParam || legacyIdParam || courseId;
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<CourseMaterial | null>(null);
  const [enrollment, setEnrollment] = useState<EnrolledCourse | null>(null);
  const [structureResponse, setStructureResponse] = useState<CourseStructureResponse>({
    data: [],
    byWeek: {},
  });
  const [materialsResponse, setMaterialsResponse] = useState<CourseMaterialsResponse>({
    data: [],
    meta: {
      total: 0,
      page: 1,
      limit: 200,
      totalPages: 1,
    },
  });
  const [pageLoading, setPageLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';

  const formatDate = (value?: string | null) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'N/A';
    return parsed.toLocaleDateString();
  };

  useEffect(() => {
    let mounted = true;

    const loadCourseData = async () => {
      if (!enrollmentId) {
        setPageError('Course not found');
        return;
      }

      setPageLoading(true);
      setPageError(null);

      try {
        const enrollments = await enrollmentService.getMyCourses();
        const matchedEnrollment =
          enrollments.find((item) => String(item.id) === String(enrollmentId)) || null;

        if (!mounted) return;
        if (!matchedEnrollment) {
          setEnrollment(null);
          setPageError('Course not found');
          setStructureResponse({ data: [], byWeek: {} });
          setMaterialsResponse({
            data: [],
            meta: { total: 0, page: 1, limit: 200, totalPages: 1 },
          });
          return;
        }

        setEnrollment(matchedEnrollment);
        const resolvedCourseId = matchedEnrollment.course?.id;

        if (!resolvedCourseId) {
          setPageError('Course not found');
          return;
        }

        const [structure, materials] = await Promise.all([
          structureService.getStructure(resolvedCourseId),
          materialService.getMaterials(resolvedCourseId, { page: 1, limit: 200 }),
        ]);

        if (!mounted) return;

        const publishedMaterials = (materials?.data || []).filter((item) => item.isPublished === 1);
        const totalPublished =
          typeof materials?.meta?.total === 'number'
            ? materials.meta.total
            : publishedMaterials.length;

        setStructureResponse(structure || { data: [], byWeek: {} });
        setMaterialsResponse({
          ...(materials || { data: [] }),
          data: publishedMaterials,
          meta: {
            total: totalPublished,
            page: materials?.meta?.page || 1,
            limit: materials?.meta?.limit || 200,
            totalPages: materials?.meta?.totalPages || 1,
          },
        });

        const firstWeek = Object.keys(structure?.byWeek || {}).sort(
          (a, b) => Number(a) - Number(b)
        )[0];
        if (firstWeek) setExpandedSection(firstWeek);
        setSelectedLesson(null);
        setSelectedMaterial(null);
      } catch {
        if (!mounted) return;
        setPageError('Failed to load course data');
      } finally {
        if (mounted) setPageLoading(false);
      }
    };

    loadCourseData();
    return () => {
      mounted = false;
    };
  }, [courseId, enrollmentId]);

  const courseSections: CourseSection[] = useMemo(() => {
    const byWeek = structureResponse.byWeek || {};
    const weekKeys = Object.keys(byWeek).sort((a, b) => Number(a) - Number(b));

    return weekKeys.map((weekKey) => {
      const lessons: Lesson[] = (byWeek[weekKey] || [])
        .sort((a, b) => Number(a.orderIndex || 0) - Number(b.orderIndex || 0))
        .map((item) => {
          const lessonType: Lesson['type'] =
            item.organizationType === 'lecture' ? 'video' : 'resource';

          return {
            id: item.organizationId,
            title: item.title,
            duration: 0,
            type: lessonType,
            completed: false,
            organizationType: item.organizationType,
            materialId: item.materialId,
          };
        });

      return {
        id: weekKey,
        title: `Week ${weekKey}`,
        lessons,
        duration: 0,
      };
    });
  }, [structureResponse.byWeek]);

  const getOrganizationIcon = (organizationType?: string) => {
    if (organizationType === 'lecture') return <BookOpen size={18} />;
    if (organizationType === 'lab') return <FlaskConical size={18} />;
    if (organizationType === 'tutorial') return <User size={18} />;
    if (organizationType === 'section') return <Users size={18} />;
    return <File size={18} />;
  };

  const resolvedCourseId = enrollment?.course?.id || '';

  const handleMaterialClick = (materialId: string) => {
    const material = (materialsResponse.data || []).find((item) => item.materialId === materialId);
    if (!material) return;

    setSelectedMaterial(material);
    setSelectedLesson(materialId);

    if (resolvedCourseId) {
      materialService.trackView(resolvedCourseId, materialId).catch(() => {});
    }
  };

  const handleOpenLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson.id);
    if (!lesson.materialId) return;

    handleMaterialClick(lesson.materialId);
  };

  const handleDownloadMaterial = (material: CourseMaterial) => {
    if (!resolvedCourseId || !material.materialId) return;
    const downloadUrl = materialService.getDownloadUrl(resolvedCourseId, material.materialId);
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const materialsCount = materialsResponse.meta?.total || materialsResponse.data?.length || 0;
  const hasMaterials = (materialsResponse.data?.length || 0) > 0;
  const hasStructure = Object.keys(structureResponse.byWeek || {}).length > 0;

  const fallbackMaterialItems: MaterialListItem[] = useMemo(() => {
    return (materialsResponse.data || [])
      .filter((item) => item.isPublished === 1)
      .map((item) => ({
        materialId: item.materialId,
        title: item.title,
        materialType: item.materialType,
        weekNumber: item.weekNumber,
      }));
  }, [materialsResponse.data]);

  if (pageLoading) {
    return (
      <div
        className={`rounded-lg p-6 ${isDark ? 'bg-slate-900 border border-white/10' : 'bg-white border border-gray-200'}`}
      >
        <div className="animate-pulse space-y-4">
          <div className={`h-6 w-52 rounded ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
          <div className={`h-10 w-3/4 rounded ${isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
          <div className={`h-64 w-full rounded ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`} />
          <div className={`h-32 w-full rounded ${isDark ? 'bg-slate-800' : 'bg-gray-100'}`} />
        </div>
      </div>
    );
  }

  if (pageError && !enrollment) {
    return (
      <div
        className={`rounded-lg p-6 ${isDark ? 'bg-slate-900 border border-white/10' : 'bg-white border border-gray-200'}`}
      >
        <button
          onClick={onBack}
          className={`flex items-center gap-2 mb-4 transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <ArrowLeft size={20} />
          <span>Back to My Classes</span>
        </button>
        <p className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>Course not found</p>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg ${isDark ? 'bg-slate-900 border border-white/10' : 'bg-white'}`}
      style={{ '--accent-color': accentColor } as CSSProperties}
    >
      {/* Header with back button */}
      <div
        className={`border-b p-4 sm:p-6 ${isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'}`}
      >
        <button
          onClick={onBack}
          className={`flex items-center gap-2 mb-4 transition-colors ${isDark ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
        >
          <ArrowLeft size={20} />
          <span>Back to My Classes</span>
        </button>

        {/* Course Title and Meta */}
        <div className="mb-4">
          <h1
            className={`text-2xl sm:text-3xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {enrollment?.course?.name || 'Course'}
          </h1>
          <div className="flex flex-wrap gap-2 mb-4">
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              {enrollment?.course?.code || 'N/A'}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              {enrollment?.course?.credits ?? 0} Credits
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              {enrollment?.course?.level || 'N/A'}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              Section {enrollment?.section?.sectionNumber || 'N/A'}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              {enrollment?.semester?.name || 'N/A'}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${isDark ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-800'}`}
            >
              {enrollment?.status || 'N/A'}
            </span>
          </div>
          <div
            className={`flex flex-wrap gap-4 sm:gap-8 text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}
          >
            <div className="flex items-center gap-2">
              <Users size={16} />
              <span>{enrollment?.section?.currentEnrollment ?? 0} students enrolled</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>{materialsCount} materials</span>
            </div>
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{enrollment?.section?.location || 'No location provided'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} />
              <span>Enrolled on {formatDate(enrollment?.enrollmentDate)}</span>
            </div>
            {(enrollment?.course as any)?.updatedAt && (
              <div className="flex items-center gap-2">
                <Clock size={16} />
                <span>Last updated {formatDate((enrollment?.course as any)?.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col xl:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
        {/* Left Content Area */}
        <div className="flex-1">
          {/* Course Preview Video */}
          <div
            className={`border rounded-lg overflow-hidden mb-6 h-64 sm:h-80 xl:h-96 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
          >
            <div className="relative h-full">
              <button
                className={`absolute top-4 right-4 ${isDark ? 'bg-(--accent-color)/90' : 'bg-(--accent-color)'} hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-lg backdrop-blur-sm transition-all transform hover:scale-105 z-10`}
              >
                <Sparkles size={16} />
                Generate AI Notes
              </button>

              {!selectedMaterial && (
                <div className="h-full flex items-center justify-center px-6">
                  <div className="text-center max-w-2xl">
                    <h2
                      className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      Welcome to {enrollment?.course?.name || 'your course'}
                    </h2>
                    <p className={`${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                      {enrollment?.course?.description ||
                        'Select a course item from the content panel to begin.'}
                    </p>
                    <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      Select a material from the Course Content panel to get started
                    </p>
                  </div>
                </div>
              )}

              {selectedMaterial &&
                selectedMaterial.materialType === 'video' &&
                selectedMaterial.externalUrl && (
                  <div className="h-full overflow-auto p-4 sm:p-6">
                    <h3
                      className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {selectedMaterial.title}
                    </h3>
                    <iframe
                      src={selectedMaterial.externalUrl}
                      width="100%"
                      height="400"
                      allowFullScreen
                      title={selectedMaterial.title}
                      className="w-full rounded-lg border-0"
                    />
                    <p className={`mt-3 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                      {selectedMaterial.description || 'No description available.'}
                    </p>
                  </div>
                )}

              {selectedMaterial &&
                selectedMaterial.fileId &&
                selectedMaterial.materialType !== 'video' && (
                  <div className="h-full flex items-center justify-center px-6">
                    <div
                      className={`max-w-xl w-full rounded-lg p-6 border ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    >
                      <h3 className="text-lg font-semibold mb-2">{selectedMaterial.title}</h3>
                      <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                        {selectedMaterial.description ||
                          'Download this document to view its content.'}
                      </p>
                      <button
                        onClick={() => handleDownloadMaterial(selectedMaterial)}
                        className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                      >
                        Download {selectedMaterial.materialType}
                      </button>
                    </div>
                  </div>
                )}

              {selectedMaterial &&
                (selectedMaterial.materialType === 'lecture' ||
                  selectedMaterial.materialType === 'slide') && (
                  <div className="h-full flex items-center justify-center px-6">
                    <div
                      className={`max-w-xl w-full rounded-lg p-6 border ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    >
                      <h3 className="text-lg font-semibold mb-2">{selectedMaterial.title}</h3>
                      <p className={`${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                        {selectedMaterial.description || 'No additional description available.'}
                      </p>
                      <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {selectedMaterial.materialType} • Week{' '}
                        {selectedMaterial.weekNumber || 'General'}
                      </p>
                    </div>
                  </div>
                )}

              {selectedMaterial &&
                selectedMaterial.materialType !== 'video' &&
                selectedMaterial.materialType !== 'document' &&
                selectedMaterial.materialType !== 'lecture' &&
                selectedMaterial.materialType !== 'slide' && (
                  <div className="h-full flex items-center justify-center px-6">
                    <div
                      className={`max-w-xl w-full rounded-lg p-6 border ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                    >
                      <h3 className="text-lg font-semibold mb-2">{selectedMaterial.title}</h3>
                      <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                        {selectedMaterial.description || 'No additional description available.'}
                      </p>
                      <p className={`mb-4 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                        {selectedMaterial.materialType} • Week{' '}
                        {selectedMaterial.weekNumber || 'General'}
                      </p>
                      {selectedMaterial.externalUrl && (
                        <button
                          onClick={() =>
                            window.open(
                              selectedMaterial.externalUrl || '',
                              '_blank',
                              'noopener,noreferrer'
                            )
                          }
                          className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        >
                          Open Link
                        </button>
                      )}
                    </div>
                  </div>
                )}
            </div>
          </div>

          {/* Tabs */}
          <div className={`border-b mb-6 ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <div className="flex gap-4 sm:gap-8 overflow-x-auto">
              {['overview', 'notes', 'announcements', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-4 px-2 font-medium text-sm transition-colors relative capitalize ${
                    activeTab === tab
                      ? 'text-indigo-600 border-b-2 border-indigo-600'
                      : isDark
                        ? 'text-slate-400 hover:text-white'
                        : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  About This Course
                </h3>
                <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'} leading-relaxed`}>
                  {enrollment?.course?.description || 'No course description available.'}
                </p>
              </div>

              <div>
                <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Section Information
                </h3>
                <div
                  className={`rounded-lg border p-4 ${isDark ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
                >
                  Section {enrollment?.section?.sectionNumber || 'N/A'},{' '}
                  {enrollment?.section?.location || 'No location provided'}
                </div>
              </div>

              <div>
                <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Semester
                </h3>
                <div
                  className={`rounded-lg border p-4 ${isDark ? 'bg-white/5 border-white/10 text-slate-200' : 'bg-gray-50 border-gray-200 text-gray-700'}`}
                >
                  {enrollment?.semester?.name || 'N/A'} (
                  {formatDate(enrollment?.semester?.startDate)} -{' '}
                  {formatDate(enrollment?.semester?.endDate)})
                </div>
              </div>

              <div>
                <h3 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Prerequisites
                </h3>
                {Array.isArray(enrollment?.prerequisites) &&
                enrollment?.prerequisites.length > 0 ? (
                  <div className="space-y-2">
                    {enrollment.prerequisites.map((item: any, idx: number) => (
                      <div
                        key={`${item?.courseCode || 'prereq'}-${idx}`}
                        className={`rounded-lg border p-4 flex items-center justify-between ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                      >
                        <div>
                          <p className={`${isDark ? 'text-white' : 'text-gray-900'} font-medium`}>
                            {item?.courseCode || 'N/A'} -{' '}
                            {item?.courseName || 'Unnamed prerequisite'}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                            {item?.isMandatory ? 'Mandatory' : 'Optional'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {item?.studentCompleted ? (
                            <CheckCircle2 size={18} className="text-green-500" />
                          ) : (
                            <XCircle size={18} className="text-red-500" />
                          )}
                          <span
                            className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                          >
                            {item?.studentCompleted ? 'Completed' : 'Not completed'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    No prerequisites
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="text-gray-600">Course notes section coming soon</div>
          )}
          {activeTab === 'announcements' && (
            <div className="text-gray-600">Announcements section coming soon</div>
          )}
          {activeTab === 'reviews' && (
            <div className="text-gray-600">Reviews section coming soon</div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-full xl:w-96">
          {/* Progress Card */}
          <div className="bg-linear-to-br from-indigo-50 to-blue-50 border border-indigo-100 rounded-lg p-6 mb-6">
            <h3 className={`font-semibold mb-4 ${isDark ? 'text-slate-900' : 'text-gray-900'}`}>
              Course Content
            </h3>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700">Progress</span>
                <span className="bg-white border border-indigo-200 rounded-full px-3 py-1 text-sm text-indigo-600 font-semibold">
                  0 / {materialsCount} materials
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-linear-to-r from-blue-600 to-blue-600"
                  style={{ width: '0%' }}
                />
              </div>
            </div>
            {materialsCount === 0 && (
              <p className="text-sm text-gray-600">No materials available yet</p>
            )}
          </div>

          {/* Course Sections */}
          {pageLoading ? (
            <div
              className={`rounded-lg border p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
            >
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 size={16} className="animate-spin" />
                Loading course structure...
              </div>
            </div>
          ) : hasStructure ? (
            <div className="space-y-3">
              {courseSections.map((section) => (
                <div
                  key={section.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Section Header */}
                  <button
                    onClick={() =>
                      setExpandedSection(expandedSection === section.id ? null : section.id)
                    }
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1 text-left">
                      <ChevronDown
                        size={20}
                        className={`text-gray-600 transition-transform ${
                          expandedSection === section.id ? 'rotate-180' : ''
                        }`}
                      />
                      <div>
                        <h4 className="font-medium text-gray-900">{section.title}</h4>
                        <p className="text-xs text-gray-600">{section.lessons.length} items</p>
                      </div>
                    </div>
                    <div className="text-gray-400">
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded Lessons */}
                  {expandedSection === section.id && (
                    <div className="border-t border-gray-200 bg-gray-50">
                      <div className="space-y-2 p-4">
                        {section.lessons.map((lesson) => (
                          <button
                            key={lesson.id}
                            onClick={() => handleOpenLesson(lesson)}
                            disabled={!lesson.materialId}
                            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                              selectedLesson === lesson.id
                                ? 'bg-indigo-50 border border-indigo-200'
                                : 'bg-white border border-gray-200 hover:bg-white hover:border-indigo-200'
                            }`}
                          >
                            <div className="text-indigo-600 shrink-0">
                              {getOrganizationIcon(lesson.organizationType)}
                            </div>

                            <div className="flex-1 min-w-0">
                              <p
                                className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}
                              >
                                {lesson.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {lesson.organizationType || 'item'}
                                {lesson.materialId ? ' • linked material' : ' • no linked material'}
                              </p>
                            </div>

                            <div className="shrink-0">
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white border border-gray-200">
                                {lesson.type === 'video' && 'Video'}
                                {lesson.type === 'resource' && 'Resource'}
                                {lesson.type === 'quiz' && 'Quiz'}
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : hasMaterials ? (
            <div
              className={`rounded-lg border p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
            >
              <h4 className={`font-medium mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Course Materials
              </h4>
              <div className="space-y-2">
                {fallbackMaterialItems.map((material) => (
                  <button
                    key={material.materialId}
                    onClick={() => handleMaterialClick(material.materialId)}
                    className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg text-left border transition-colors ${
                      selectedMaterial?.materialId === material.materialId
                        ? 'bg-indigo-50 border-indigo-200'
                        : isDark
                          ? 'bg-slate-800 border-white/10 hover:border-blue-400'
                          : 'bg-gray-50 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-indigo-600 shrink-0">
                        {getOrganizationIcon(material.materialType)}
                      </span>
                      <span
                        className={`text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}
                      >
                        {material.title}
                      </span>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className={`text-xs ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                        {material.materialType}
                      </p>
                      {material.weekNumber ? (
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                          Week {material.weekNumber}
                        </p>
                      ) : null}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div
              className={`rounded-lg border p-4 ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-white border-gray-200 text-gray-700'}`}
            >
              No course content available yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

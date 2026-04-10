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
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import {
  CourseMaterial,
  CourseMaterialsResponse,
  CourseStructureResponse,
  getCourseMaterialPreviewUrl,
  materialService,
  structureService,
} from '../../../services/api/courseService';
import {
  enrollmentService,
  EnrolledCourse,
  type SectionStaffMember,
} from '../../../services/api/enrollmentService';
import { announcementService, type Announcement } from '../../../services/api/announcementService';
import { groupMaterialsIntoBundles, type MaterialBundle } from '../../../utils/materialBundles';

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
  const navigate = useNavigate();
  const enrollmentId = enrollmentIdParam || legacyIdParam || courseId;
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<CourseMaterial | null>(null);
  const [selectedBundleKey, setSelectedBundleKey] = useState<string | null>(null);
  const [selectedBundleDocumentId, setSelectedBundleDocumentId] = useState<string | null>(null);
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
  const [announcementsLoading, setAnnouncementsLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [courseAnnouncements, setCourseAnnouncements] = useState<Announcement[]>([]);
  const [expandedAnnouncementId, setExpandedAnnouncementId] = useState<string | null>(null);
  const [sectionInstructor, setSectionInstructor] = useState<SectionStaffMember | null>(null);
  const [sectionTAs, setSectionTAs] = useState<SectionStaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffError, setStaffError] = useState<string | null>(null);
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';

  const formatDate = (value?: string | null) => {
    if (!value) return 'N/A';
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return 'N/A';
    return parsed.toLocaleDateString();
  };

  const resolvedCourseId = enrollment?.course?.id || '';

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
          enrollments.find((item) => String(item.id) === String(enrollmentId) || String(item.course?.courseCode) === String(enrollmentId) || String(item.course?.code) === String(enrollmentId) || String(item.course?.id) === String(enrollmentId)) || null;

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
        setSelectedBundleKey(null);
        setSelectedBundleDocumentId(null);
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

  useEffect(() => {
    let mounted = true;

    const loadAnnouncements = async () => {
      if (!resolvedCourseId) return;
      try {
        setAnnouncementsLoading(true);
        const response = await announcementService.getAnnouncements({
          courseId: String(resolvedCourseId),
        });
        if (!mounted) return;
        const sorted = (Array.isArray(response) ? response : []).slice().sort((a, b) => {
          if ((a.isPinned ?? 0) === 1 && (b.isPinned ?? 0) !== 1) return -1;
          if ((a.isPinned ?? 0) !== 1 && (b.isPinned ?? 0) === 1) return 1;
          return (
            new Date(b.publishedAt ?? b.createdAt ?? 0).getTime() -
            new Date(a.publishedAt ?? a.createdAt ?? 0).getTime()
          );
        });
        setCourseAnnouncements(sorted);
      } catch {
        if (!mounted) return;
        setCourseAnnouncements([]);
      } finally {
        if (mounted) setAnnouncementsLoading(false);
      }
    };

    void loadAnnouncements();
    return () => {
      mounted = false;
    };
  }, [resolvedCourseId]);

  useEffect(() => {
    let mounted = true;

    const loadSectionStaff = async () => {
      if (!enrollment?.section?.id) {
        if (mounted) {
          setSectionInstructor(null);
          setSectionTAs([]);
          setStaffError(null);
        }
        return;
      }

      try {
        setStaffLoading(true);
        setStaffError(null);
        const [instructorResponse, tas] = await Promise.all([
          enrollmentService.getSectionInstructor(enrollment.section.id),
          enrollmentService.getSectionTAs(enrollment.section.id),
        ]);

        if (!mounted) return;

        const instructor = instructorResponse?.instructor;
        const instructorId = instructor?.userId ?? instructorResponse?.instructorId ?? null;

        setSectionInstructor(
          instructor && instructorId
            ? {
                id: instructorId,
                fullName: instructor.fullName || 'Unknown Instructor',
                email: instructor.email || '',
                role: 'INSTRUCTOR',
              }
            : null
        );

        setSectionTAs(
          (tas || []).map((ta) => ({
            id: ta.userId,
            fullName: ta.fullName || 'Unknown TA',
            email: ta.email || '',
            role: 'TA',
          }))
        );
      } catch {
        if (!mounted) return;
        setSectionInstructor(null);
        setSectionTAs([]);
        setStaffError('Unable to load course team details right now.');
      } finally {
        if (mounted) setStaffLoading(false);
      }
    };

    void loadSectionStaff();
    return () => {
      mounted = false;
    };
  }, [enrollment?.section?.id]);

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

  const bundleData = useMemo(
    () => groupMaterialsIntoBundles(materialsResponse.data || []),
    [materialsResponse.data]
  );
  const bundleByMaterialId = bundleData.bundleByMaterialId;
  const bundleByKey = useMemo(
    () =>
      bundleData.bundles.reduce<Record<string, MaterialBundle>>((acc, bundle) => {
        acc[bundle.key] = bundle;
        return acc;
      }, {}),
    [bundleData.bundles]
  );

  const getOrganizationIcon = (organizationType?: string) => {
    if (organizationType === 'lecture') return <BookOpen size={18} />;
    if (organizationType === 'lab') return <FlaskConical size={18} />;
    if (organizationType === 'tutorial') return <User size={18} />;
    if (organizationType === 'section') return <Users size={18} />;
    return <File size={18} />;
  };

  const handleMaterialClick = (materialId: string) => {
    const material = (materialsResponse.data || []).find((item) => item.materialId === materialId);
    if (!material) return;

    const bundle = bundleByMaterialId[material.materialId];
    if (bundle) {
      setSelectedBundleKey(bundle.key);
      setSelectedBundleDocumentId(bundle.documents[0]?.materialId || null);
      setSelectedMaterial(bundle.video || bundle.documents[0] || material);
      setSelectedLesson(`bundle:${bundle.key}`);
    } else {
      setSelectedBundleKey(null);
      setSelectedBundleDocumentId(null);
      setSelectedMaterial(material);
      setSelectedLesson(materialId);
    }

    if (resolvedCourseId) {
      materialService.trackView(resolvedCourseId, materialId).catch(() => {});
    }
  };

  const handleOpenLesson = (lesson: Lesson) => {
    if (!lesson.materialId) return;

    handleMaterialClick(lesson.materialId);
  };

  const materialsCount = materialsResponse.meta?.total || materialsResponse.data?.length || 0;
  const hasMaterials = (materialsResponse.data?.length || 0) > 0;
  const hasStructure = Object.keys(structureResponse.byWeek || {}).length > 0;
  const selectedMaterialPreviewUrl = useMemo(
    () => (selectedMaterial ? getCourseMaterialPreviewUrl(selectedMaterial) : null),
    [selectedMaterial]
  );
  const selectedBundle = selectedBundleKey ? bundleByKey[selectedBundleKey] || null : null;
  const selectedBundleDocument = useMemo(() => {
    if (!selectedBundle) return null;
    return (
      selectedBundle.documents.find((doc) => doc.materialId === selectedBundleDocumentId) ||
      selectedBundle.documents[0] ||
      null
    );
  }, [selectedBundle, selectedBundleDocumentId]);
  const selectedBundleDocumentPreviewUrl = useMemo(
    () => (selectedBundleDocument ? getCourseMaterialPreviewUrl(selectedBundleDocument) : null),
    [selectedBundleDocument]
  );
  const hasLargePreviewViewer = Boolean(
    selectedBundle ||
      (selectedMaterial &&
        (selectedMaterial.materialType === 'video' ||
          (selectedMaterial.materialType !== 'link' &&
            selectedMaterial.materialType !== 'other' &&
            selectedMaterialPreviewUrl)))
  );

  const fallbackMaterialItems: MaterialListItem[] = useMemo(() => {
    const seenBundles = new Set<string>();
    return (materialsResponse.data || [])
      .filter((item) => item.isPublished === 1)
      .filter((item) => {
        const bundle = bundleByMaterialId[item.materialId];
        if (!bundle) return true;
        if (seenBundles.has(bundle.key)) return false;
        seenBundles.add(bundle.key);
        return true;
      })
      .map((item) => {
        const bundle = bundleByMaterialId[item.materialId];
        return {
          materialId: item.materialId,
          title: bundle ? bundle.baseTitle : item.title,
          materialType: bundle ? 'lecture' : item.materialType,
          weekNumber: item.weekNumber,
        } as MaterialListItem;
      });
  }, [bundleByMaterialId, materialsResponse.data]);

  const handleOpenStaffProfile = (staff: SectionStaffMember) => {
    navigate(`/studentdashboard/profile/${staff.id}`, {
      state: {
        staff,
        course: {
          id: enrollment?.course?.id,
          name: enrollment?.course?.name,
          code: enrollment?.course?.code,
        },
      },
    });
  };

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
            className={`border rounded-lg overflow-hidden mb-6 ${hasLargePreviewViewer ? 'h-[70vh] min-h-[520px] xl:h-[76vh]' : 'h-64 sm:h-80 xl:h-96'} ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
          >
            <div className="relative h-full">
              <button
                className={`absolute top-4 right-4 ${isDark ? 'bg-(--accent-color)/90' : 'bg-(--accent-color)'} hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium shadow-lg backdrop-blur-sm transition-all transform hover:scale-105 z-10`}
              >
                <Sparkles size={16} />
                Generate AI Notes
              </button>

              {!selectedMaterial && !selectedBundle && (
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

              {selectedBundle && (
                <div className="h-full overflow-auto p-4 sm:p-6 space-y-4">
                  <h3
                    className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                  >
                    {selectedBundle.baseTitle}
                  </h3>

                  {selectedBundle.video?.externalUrl && (
                    <iframe
                      src={selectedBundle.video.externalUrl}
                      allowFullScreen
                      title={selectedBundle.baseTitle}
                      className="w-full h-[44vh] min-h-[340px] rounded-lg border-0"
                    />
                  )}

                  <div
                    className={`rounded-lg border p-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <h4
                      className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      Instructions
                    </h4>
                    <p
                      className={`text-sm whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                    >
                      {selectedBundle.instructions || 'No instructions available for this lecture.'}
                    </p>
                  </div>

                  <div
                    className={`rounded-lg border p-3 ${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <h4
                      className={`text-sm font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      Lecture Files
                    </h4>
                    {selectedBundle.documents.length === 0 ? (
                      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                        No lecture files attached.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedBundle.documents.map((doc) => (
                          <div
                            key={doc.materialId}
                            className={`flex flex-wrap items-center justify-between gap-2 p-2 rounded border ${
                              selectedBundleDocument?.materialId === doc.materialId
                                ? 'border-indigo-300 bg-indigo-50'
                                : isDark
                                  ? 'border-white/10 bg-white/5'
                                  : 'border-gray-200 bg-white'
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedBundleDocumentId(doc.materialId)}
                              className={`text-left text-sm flex-1 min-w-0 truncate ${
                                isDark ? 'text-slate-200' : 'text-gray-800'
                              }`}
                              title={doc.title}
                            >
                              {doc.title}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const downloadUrl = materialService.getDownloadUrl(
                                  resolvedCourseId,
                                  doc.materialId
                                );
                                window.open(downloadUrl, '_blank', 'noopener,noreferrer');
                              }}
                              className="text-xs px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                            >
                              Open
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {selectedBundleDocumentPreviewUrl && (
                    <iframe
                      src={selectedBundleDocumentPreviewUrl}
                      title={selectedBundleDocument?.title || selectedBundle.baseTitle}
                      className="w-full h-[44vh] min-h-[340px] rounded-lg border-0"
                    />
                  )}
                </div>
              )}

              {selectedMaterial &&
                !selectedBundle &&
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
                      allowFullScreen
                      title={selectedMaterial.title}
                      className="w-full h-[52vh] min-h-[420px] rounded-lg border-0"
                    />
                    <p className={`mt-3 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                      {selectedMaterial.description || 'No description available.'}
                    </p>
                  </div>
                )}

              {selectedMaterial &&
                !selectedBundle &&
                selectedMaterial.materialType !== 'video' &&
                selectedMaterial.materialType !== 'link' &&
                selectedMaterial.materialType !== 'other' && (
                  <div className="h-full overflow-auto p-4 sm:p-6">
                    <h3
                      className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
                    >
                      {selectedMaterial.title}
                    </h3>
                    {selectedMaterialPreviewUrl ? (
                      <iframe
                        src={selectedMaterialPreviewUrl}
                        title={selectedMaterial.title}
                        className="w-full h-[52vh] min-h-[420px] rounded-lg border-0"
                      />
                    ) : (
                      <div
                        className={`max-w-xl w-full rounded-lg p-6 border ${isDark ? 'bg-slate-800 border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900'}`}
                      >
                        <p className={`${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                          Preview is unavailable for this material.
                        </p>
                      </div>
                    )}
                    <p className={`mt-3 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}>
                      {selectedMaterial.description || 'No description available.'}
                    </p>
                    <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                      {selectedMaterial.materialType} • Week{' '}
                      {selectedMaterial.weekNumber || 'General'}
                    </p>
                  </div>
                )}

              {selectedMaterial &&
                !selectedBundle &&
                (selectedMaterial.materialType === 'link' ||
                  selectedMaterial.materialType === 'other') && (
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
                  Course Team
                </h3>
                {staffLoading ? (
                  <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    Loading staff...
                  </p>
                ) : staffError ? (
                  <p className={`${isDark ? 'text-amber-300' : 'text-amber-700'}`}>{staffError}</p>
                ) : sectionInstructor || sectionTAs.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {sectionInstructor && (
                      <button
                        type="button"
                        onClick={() => handleOpenStaffProfile(sectionInstructor)}
                        className={`text-left rounded-lg border p-4 transition-colors ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-white'}`}
                      >
                        <p
                          className={`text-xs uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                        >
                          Instructor
                        </p>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {sectionInstructor.fullName || 'Unknown Instructor'}
                        </p>
                        <p
                          className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}
                        >
                          {sectionInstructor.email || 'No academic email available'}
                        </p>
                      </button>
                    )}

                    {sectionTAs.map((ta) => (
                      <button
                        key={ta.id}
                        type="button"
                        onClick={() => handleOpenStaffProfile(ta)}
                        className={`text-left rounded-lg border p-4 transition-colors ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-gray-50 border-gray-200 hover:bg-white'}`}
                      >
                        <p
                          className={`text-xs uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}
                        >
                          TA
                        </p>
                        <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {ta.fullName || 'Unknown TA'}
                        </p>
                        <p
                          className={`text-sm mt-1 ${isDark ? 'text-slate-300' : 'text-gray-600'}`}
                        >
                          {ta.email || 'No academic email available'}
                        </p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className={`${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
                    No instructor or TA assigned yet.
                  </p>
                )}
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
            <div className="space-y-4">
              {announcementsLoading ? (
                <div className="text-gray-600">Loading announcements...</div>
              ) : courseAnnouncements.length === 0 ? (
                <div className="text-gray-600">No announcements for this course yet</div>
              ) : (
                courseAnnouncements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`rounded-lg border p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <h3
                        className={`text-base font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
                      >
                        {announcement.title}
                      </h3>
                      {announcement.isPinned === 1 && <span className="text-amber-500">📌</span>}
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          announcement.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : announcement.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {announcement.priority ?? 'low'}
                      </span>
                    </div>
                    <p
                      className={`text-sm ${isDark ? 'text-slate-300' : 'text-gray-700'} ${
                        expandedAnnouncementId !== announcement.id ? 'line-clamp-3' : ''
                      }`}
                    >
                      {announcement.content}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedAnnouncementId((prev) =>
                          prev === announcement.id ? null : announcement.id
                        )
                      }
                      className="mt-1 text-xs text-blue-600"
                    >
                      {expandedAnnouncementId === announcement.id ? 'Show less' : 'Read more'}
                    </button>
                    <div className="mt-2 text-xs text-slate-500 flex flex-wrap gap-3">
                      <span>
                        {announcement.course?.name ? announcement.course.name : 'Campus-wide'}
                      </span>
                      <span>
                        {`${announcement.author?.firstName ?? ''} ${announcement.author?.lastName ?? ''}`.trim() ||
                          announcement.author?.email ||
                          'System'}
                      </span>
                      <span>
                        {new Date(
                          announcement.publishedAt ?? announcement.createdAt ?? Date.now()
                        ).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
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
                        {(() => {
                          const seenBundleKeys = new Set<string>();
                          const displayedLessons = section.lessons.filter((lesson) => {
                            if (!lesson.materialId) return true;
                            const bundle = bundleByMaterialId[lesson.materialId];
                            if (!bundle) return true;
                            if (seenBundleKeys.has(bundle.key)) return false;
                            seenBundleKeys.add(bundle.key);
                            return true;
                          });

                          return displayedLessons.map((lesson) => {
                            const bundle = lesson.materialId
                              ? bundleByMaterialId[lesson.materialId]
                              : undefined;
                            const lessonKey = bundle ? `bundle:${bundle.key}` : lesson.id;

                            return (
                              <button
                                key={lessonKey}
                                onClick={() => handleOpenLesson(lesson)}
                                disabled={!lesson.materialId}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                                  selectedLesson === lessonKey
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
                                    {bundle ? bundle.baseTitle : lesson.title}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {bundle
                                      ? `lecture bundle • ${bundle.items.length} materials`
                                      : `${lesson.organizationType || 'item'}${lesson.materialId ? ' • linked material' : ' • no linked material'}`}
                                  </p>
                                </div>

                                <div className="shrink-0">
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white border border-gray-200">
                                    {bundle
                                      ? 'Bundle'
                                      : lesson.type === 'video'
                                        ? 'Video'
                                        : lesson.type === 'resource'
                                          ? 'Resource'
                                          : 'Quiz'}
                                  </span>
                                </div>
                              </button>
                            );
                          });
                        })()}
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
                {fallbackMaterialItems.map((material) => {
                  const bundle = bundleByMaterialId[material.materialId];
                  const rowKey = bundle ? `bundle:${bundle.key}` : material.materialId;
                  return (
                    <button
                      key={material.materialId}
                      onClick={() => handleMaterialClick(material.materialId)}
                      className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg text-left border transition-colors ${
                        selectedLesson === rowKey
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
                          {bundle ? 'bundle' : material.materialType}
                        </p>
                        {material.weekNumber ? (
                          <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
                            Week {material.weekNumber}
                          </p>
                        ) : null}
                      </div>
                    </button>
                  );
                })}
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

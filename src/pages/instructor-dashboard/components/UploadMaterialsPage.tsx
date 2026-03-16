import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { CleanSelect } from '../../../components/shared';
import {
  Upload,
  Search,
  X,
  Trash2,
  Edit,
  Download,
  Eye,
  EyeOff,
  CheckCircle,
  Loader2,
  Video,
  FileText,
  Presentation,
  Link as LinkIcon,
  BookOpen,
} from 'lucide-react';
import { EnrollmentService } from '../../../services/api/enrollmentService';
import {
  CourseMaterial,
  CourseMaterialsResponse,
  CourseStructureResponse,
  materialService,
  structureService,
} from '../../../services/api/courseService';
import { toast } from 'sonner';

type UploadMaterialsPageProps = {
  courseId?: string;
};

type MaterialFormState = {
  title: string;
  materialType: 'document' | 'video' | 'lecture' | 'slide' | 'link';
  description: string;
  weekNumber: string;
  isPublished: boolean;
};

type ActivityItem = {
  id: number;
  title: string;
  status: 'completed' | 'processing';
  time: string;
};

const defaultFormState: MaterialFormState = {
  title: '',
  materialType: 'document',
  description: '',
  weekNumber: '',
  isPublished: false,
};

const materialBadgeClasses: Record<string, string> = {
  video: 'bg-blue-100 text-blue-700',
  document: 'bg-green-100 text-green-700',
  lecture: 'bg-purple-100 text-purple-700',
  slide: 'bg-orange-100 text-orange-700',
  link: 'bg-slate-100 text-slate-700',
};

const materialTypeOptions = [
  { value: 'all', label: 'All Types' },
  { value: 'document', label: 'Document' },
  { value: 'video', label: 'Video' },
  { value: 'lecture', label: 'Lecture' },
  { value: 'slide', label: 'Slide' },
  { value: 'link', label: 'Link' },
];

const materialIcon = (type: string) => {
  switch (type) {
    case 'video':
      return <Video size={18} className="text-blue-500" />;
    case 'slide':
      return <Presentation size={18} className="text-orange-500" />;
    case 'lecture':
      return <BookOpen size={18} className="text-purple-500" />;
    case 'link':
      return <LinkIcon size={18} className="text-slate-500" />;
    default:
      return <FileText size={18} className="text-green-500" />;
  }
};

const parseWeekNumber = (value: string): number | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const uploaderName = (material: CourseMaterial): string => {
  if (material.uploader?.firstName || material.uploader?.lastName) {
    return `${material.uploader?.firstName || ''} ${material.uploader?.lastName || ''}`.trim();
  }
  return 'Unknown';
};

export function UploadMaterialsPage({ courseId }: UploadMaterialsPageProps) {
  const { id: routeId } = useParams();
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;
  const { isRTL } = useLanguage();

  const [activeTab, setActiveTab] = useState<'queue' | 'library'>('library');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<CourseMaterial | null>(null);

  const [createForm, setCreateForm] = useState<MaterialFormState>(defaultFormState);
  const [editForm, setEditForm] = useState<MaterialFormState>(defaultFormState);

  const [materialsResponse, setMaterialsResponse] = useState<CourseMaterialsResponse>({ data: [] });
  const [structureResponse, setStructureResponse] = useState<CourseStructureResponse>({
    data: [],
    byWeek: {},
  });
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);

  const [courseOptions, setCourseOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseId || routeId || '');

  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [weekFilter, setWeekFilter] = useState('all');

  const [embedUrls, setEmbedUrls] = useState<Record<string, string>>({});
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const activeCourseId = selectedCourseId || courseId || routeId || '';

  const addActivity = useCallback((title: string, status: 'completed' | 'processing') => {
    setActivities((prev) =>
      [{ id: Date.now(), title, status, time: new Date().toLocaleTimeString() }, ...prev].slice(
        0,
        8
      )
    );
  }, []);

  const loadCourseOptions = useCallback(async () => {
    try {
      const teaching = await EnrollmentService.getTeachingCourses();
      const mapped = (Array.isArray(teaching) ? teaching : [])
        .map((c: any) => {
          const value = String(c.courseId || c.id || c.sectionId || '');
          const name = c.course?.name || c.courseName || c.name || 'Course';
          const code = c.course?.code || c.courseCode || '';
          return value ? { value, label: code ? `${code} - ${name}` : name } : null;
        })
        .filter(Boolean) as Array<{ value: string; label: string }>;

      setCourseOptions(mapped);
      if (!selectedCourseId && mapped.length > 0) {
        setSelectedCourseId(mapped[0].value);
      }
    } catch {
      setCourseOptions([]);
    }
  }, [selectedCourseId]);

  const loadStructure = useCallback(async (targetCourseId: string) => {
    const response = await structureService.getStructure(targetCourseId);
    setStructureResponse(response || { data: [], byWeek: {} });
  }, []);

  const loadMaterials = useCallback(
    async (targetCourseId: string) => {
      const params: {
        materialType?: string;
        weekNumber?: number;
        search?: string;
        page?: number;
        limit?: number;
      } = {
        page: 1,
        limit: 100,
      };

      if (typeFilter !== 'all') params.materialType = typeFilter;
      if (weekFilter !== 'all') params.weekNumber = Number(weekFilter);
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const response = await materialService.getMaterials(targetCourseId, params);
      setMaterialsResponse(response || { data: [] });
    },
    [searchQuery, typeFilter, weekFilter]
  );

  const refetchAll = useCallback(async () => {
    if (!activeCourseId) return;
    setLoading(true);
    try {
      await Promise.all([loadMaterials(activeCourseId), loadStructure(activeCourseId)]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load materials';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [activeCourseId, loadMaterials, loadStructure]);

  useEffect(() => {
    loadCourseOptions();
  }, [loadCourseOptions]);

  useEffect(() => {
    refetchAll();
  }, [refetchAll]);

  const weekOptions = useMemo(() => {
    const dynamic = Object.keys(structureResponse.byWeek || {})
      .sort((a, b) => Number(a) - Number(b))
      .map((week) => ({ value: week, label: `Week ${week}` }));
    return [{ value: 'all', label: 'All Weeks' }, ...dynamic];
  }, [structureResponse.byWeek]);

  const groupedMaterials = useMemo(() => {
    const groups: Record<string, CourseMaterial[]> = {};

    for (const material of materialsResponse.data || []) {
      const key = material.weekNumber == null ? 'general' : String(material.weekNumber);
      if (!groups[key]) groups[key] = [];
      groups[key].push(material);
    }

    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => Number(a.orderIndex || 0) - Number(b.orderIndex || 0));
    });

    return groups;
  }, [materialsResponse.data]);

  const openCreateModal = () => {
    setCreateForm(defaultFormState);
    setShowCreateModal(true);
  };

  const openEditModal = (material: CourseMaterial) => {
    setSelectedMaterial(material);
    setEditForm({
      title: material.title || '',
      materialType: (material.materialType || 'document') as MaterialFormState['materialType'],
      description: material.description || '',
      weekNumber: material.weekNumber == null ? '' : String(material.weekNumber),
      isPublished: material.isPublished === 1,
    });
    setShowEditModal(true);
  };

  const onCreateMaterial = async () => {
    if (!activeCourseId || !createForm.title.trim()) return;
    setMutating(true);
    addActivity(`Creating: ${createForm.title}`, 'processing');
    try {
      await materialService.createMaterial(activeCourseId, {
        title: createForm.title.trim(),
        materialType: createForm.materialType,
        description: createForm.description || undefined,
        weekNumber: parseWeekNumber(createForm.weekNumber),
        isPublished: createForm.isPublished,
      });
      toast.success('Material created');
      addActivity(`Created: ${createForm.title}`, 'completed');
      setShowCreateModal(false);
      await loadMaterials(activeCourseId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create material';
      toast.error(message);
    } finally {
      setMutating(false);
    }
  };

  const onUpdateMaterial = async () => {
    if (!activeCourseId || !selectedMaterial) return;
    setMutating(true);
    try {
      await materialService.updateMaterial(activeCourseId, selectedMaterial.materialId, {
        title: editForm.title.trim(),
        description: editForm.description || undefined,
        weekNumber: parseWeekNumber(editForm.weekNumber),
        isPublished: editForm.isPublished,
      });
      toast.success('Material updated');
      setShowEditModal(false);
      await loadMaterials(activeCourseId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update material';
      toast.error(message);
    } finally {
      setMutating(false);
    }
  };

  const onDeleteMaterial = async () => {
    if (!activeCourseId || !selectedMaterial) return;
    setMutating(true);
    try {
      await materialService.deleteMaterial(activeCourseId, selectedMaterial.materialId);
      toast.success('Material deleted');
      setShowDeleteDialog(false);
      await loadMaterials(activeCourseId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete material';
      toast.error(message);
    } finally {
      setMutating(false);
    }
  };

  const onToggleVisibility = async (material: CourseMaterial) => {
    if (!activeCourseId) return;
    try {
      await materialService.toggleVisibility(
        activeCourseId,
        material.materialId,
        material.isPublished !== 1
      );
      await loadMaterials(activeCourseId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update visibility';
      toast.error(message);
    }
  };

  const onLoadEmbed = async (material: CourseMaterial) => {
    if (!activeCourseId) return;
    try {
      const embed = await materialService.getEmbed(activeCourseId, material.materialId);
      if (embed?.embedUrl) {
        setEmbedUrls((prev) => ({ ...prev, [material.materialId]: embed.embedUrl }));
      }
    } catch {
      // Keep UI quiet for optional embed loading.
    }
  };

  const onDownload = (material: CourseMaterial) => {
    if (!activeCourseId || !material.fileId) return;
    const url = materialService.getDownloadUrl(activeCourseId, material.materialId);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const renderMaterialCard = (material: CourseMaterial) => {
    const badgeClass = materialBadgeClasses[material.materialType] || materialBadgeClasses.document;
    const videoSrc = embedUrls[material.materialId] || material.externalUrl || '';

    return (
      <div
        key={material.materialId}
        className={`rounded-xl p-4 border shadow-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}
          >
            {materialIcon(material.materialType)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {material.title}
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                {material.materialType}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${material.isPublished === 1 ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}
              >
                {material.isPublished === 1 ? 'Published' : 'Draft'}
              </span>
            </div>

            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {material.description || 'No description'}
            </p>

            <div
              className={`mt-2 text-xs flex flex-wrap gap-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
            >
              <span>{material.weekNumber == null ? 'General' : `Week ${material.weekNumber}`}</span>
              <span>{material.viewCount || 0} views</span>
              <span>{material.downloadCount || 0} downloads</span>
              <span>Uploader: {uploaderName(material)}</span>
            </div>

            {material.materialType === 'video' && videoSrc && (
              <div className="mt-3 rounded-lg overflow-hidden border border-slate-200">
                <iframe
                  src={videoSrc}
                  width="100%"
                  height="315"
                  allowFullScreen
                  title={`video-${material.materialId}`}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            {material.materialType === 'video' && !videoSrc && (
              <button
                onClick={() => onLoadEmbed(material)}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
                title="Load embed"
              >
                <Eye size={16} />
              </button>
            )}

            <button
              onClick={() => onToggleVisibility(material)}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
              title="Toggle visibility"
            >
              {material.isPublished === 1 ? (
                <Eye size={16} className="text-green-500" />
              ) : (
                <EyeOff size={16} className="text-slate-500" />
              )}
            </button>

            <button
              onClick={() => openEditModal(material)}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
              title="Edit"
            >
              <Edit size={16} />
            </button>

            <button
              onClick={() => {
                setSelectedMaterial(material);
                setShowDeleteDialog(true);
              }}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-red-300' : 'hover:bg-red-50 text-red-600'}`}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>

            {material.fileId && (
              <button
                onClick={() => onDownload(material)}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
                title="Download"
              >
                <Download size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1
              className={`text-3xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              <Upload size={28} />
              Upload Materials
            </h1>
            <p className={`mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              Manage course materials and resources
            </p>
          </div>
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: primaryHex }}
          >
            <Upload size={20} />
            Add Material
          </button>
        </div>

        <div className="flex items-center gap-2 border-b border-slate-200/60">
          {[
            {
              key: 'library' as const,
              label: 'Materials Library',
              count: materialsResponse.meta?.total ?? materialsResponse.data.length,
            },
            { key: 'queue' as const, label: 'Activity', count: activities.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 font-medium text-sm transition-colors flex items-center gap-2 ${activeTab === tab.key ? 'border-b-2' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
              style={
                activeTab === tab.key ? { color: primaryHex, borderColor: primaryHex } : undefined
              }
            >
              {tab.label}
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${activeTab === tab.key ? '' : isDark ? 'bg-white/10 text-slate-400' : 'bg-slate-100 text-slate-600'}`}
                style={
                  activeTab === tab.key
                    ? { backgroundColor: `${primaryHex}20`, color: primaryHex }
                    : undefined
                }
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {activeTab === 'library' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <CleanSelect
                value={activeCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className={`px-3 py-2 border rounded-lg text-sm ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-300'}`}
              >
                {courseOptions.length === 0 && <option value="">Select Course</option>}
                {courseOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </CleanSelect>

              <CleanSelect
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className={`px-3 py-2 border rounded-lg text-sm ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-300'}`}
              >
                {materialTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </CleanSelect>

              <CleanSelect
                value={weekFilter}
                onChange={(e) => setWeekFilter(e.target.value)}
                className={`px-3 py-2 border rounded-lg text-sm ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-300'}`}
              >
                {weekOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </CleanSelect>

              <div className="relative">
                <Search
                  className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                  size={18}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by title"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg text-sm ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-300'}`}
                />
              </div>
            </div>

            {loading ? (
              <div
                className={`rounded-xl p-8 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}
              >
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 size={16} className="animate-spin" />
                  Loading materials...
                </div>
              </div>
            ) : Object.keys(groupedMaterials).length === 0 ? (
              <div
                className={`rounded-xl p-12 border text-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
              >
                <h3
                  className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
                >
                  No materials found
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Try adjusting filters or create a new material.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedMaterials)
                  .sort(([a], [b]) => {
                    if (a === 'general') return -1;
                    if (b === 'general') return 1;
                    return Number(a) - Number(b);
                  })
                  .map(([week, items]) => (
                    <section key={week} className="space-y-3">
                      <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {week === 'general' ? 'General / No Week' : `Week ${week}`}
                      </h3>
                      {items.map(renderMaterialCard)}
                    </section>
                  ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'queue' && (
          <div
            className={`rounded-xl p-4 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}
          >
            {activities.length === 0 ? (
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                No recent activity yet.
              </p>
            ) : (
              <div className="space-y-3">
                {activities.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {item.status === 'completed' ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <Loader2 size={16} className="text-blue-500 animate-spin" />
                      )}
                      <span className={`${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        {item.title}
                      </span>
                    </div>
                    <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {item.time}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className={`w-full max-w-lg rounded-xl p-6 shadow-xl ${isDark ? 'bg-slate-800 border border-white/10' : 'bg-white'}`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {showCreateModal ? 'Add Material' : 'Edit Material'}
              </h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className={`p-2 rounded-lg ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {(() => {
                const form = showCreateModal ? createForm : editForm;
                const setForm = showCreateModal ? setCreateForm : setEditForm;
                return (
                  <>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Title"
                      className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-300'}`}
                    />

                    <CleanSelect
                      value={form.materialType}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          materialType: e.target.value as MaterialFormState['materialType'],
                        }))
                      }
                      className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-300'}`}
                    >
                      {materialTypeOptions
                        .filter((o) => o.value !== 'all')
                        .map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                    </CleanSelect>

                    <input
                      type="number"
                      value={form.weekNumber}
                      onChange={(e) => setForm((prev) => ({ ...prev, weekNumber: e.target.value }))}
                      placeholder="Week Number (optional)"
                      className={`w-full px-3 py-2 border rounded-lg ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-300'}`}
                    />

                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Description"
                      className={`w-full px-3 py-2 border rounded-lg resize-none ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-300'}`}
                    />

                    <label
                      className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                    >
                      <input
                        type="checkbox"
                        checked={form.isPublished}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, isPublished: e.target.checked }))
                        }
                      />
                      Publish immediately
                    </label>
                  </>
                );
              })()}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className={`px-4 py-2 rounded-lg ${isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                Cancel
              </button>
              <button
                disabled={mutating}
                onClick={showCreateModal ? onCreateMaterial : onUpdateMaterial}
                className="px-4 py-2 text-white rounded-lg disabled:opacity-60"
                style={{ backgroundColor: primaryHex }}
              >
                {mutating ? 'Saving...' : showCreateModal ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteDialog && selectedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className={`w-full max-w-sm rounded-xl p-6 shadow-xl ${isDark ? 'bg-slate-800 border border-white/10' : 'bg-white'}`}
          >
            <h3
              className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              Delete material?
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {selectedMaterial.title}
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className={`px-4 py-2 rounded-lg ${isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                Cancel
              </button>
              <button
                disabled={mutating}
                onClick={onDeleteMaterial}
                className="px-4 py-2 rounded-lg bg-red-600 text-white disabled:opacity-60"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadMaterialsPage;

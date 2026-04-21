import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  Film,
  FolderOpen,
  Youtube,
  AlertTriangle,
  Package,
  Database,
} from 'lucide-react';
import { Skeleton } from '../../../components/ui/skeleton';
import { EnrollmentService } from '../../../services/api/enrollmentService';
import {
  CourseMaterial,
  CourseMaterialsResponse,
  CourseStructureResponse,
  getCourseMaterialPreviewUrl,
  materialService,
  structureService,
} from '../../../services/api/courseService';
import { toast } from 'sonner';
import {
  getBundleSuffix,
  groupMaterialsIntoBundles,
  type MaterialBundle,
} from '../../../utils/materialBundles';

type UploadMaterialsPageProps = {
  courseId?: string;
  isMockMode?: boolean;
  courses?: Array<{ id?: string | number; courseId?: string | number; name?: string; courseName?: string; courseCode?: string }>;
};

type UploadType = 'text' | 'file' | 'video' | 'bundle';

type MaterialFormState = {
  title: string;
  materialType: 'document' | 'video' | 'lecture' | 'slide' | 'link' | 'reading' | 'other';
  description: string;
  weekNumber: string;
  isPublished: boolean;
  externalUrl: string;
};

type ActivityItem = {
  id: number;
  title: string;
  status: 'completed' | 'processing';
  time: string;
};

type WeekMaterialEntry =
  | { kind: 'bundle'; bundle: MaterialBundle }
  | { kind: 'single'; material: CourseMaterial };

const defaultFormState: MaterialFormState = {
  title: '',
  materialType: 'document',
  description: '',
  weekNumber: '',
  isPublished: false,
  externalUrl: '',
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
  { value: 'reading', label: 'Reading' },
  { value: 'link', label: 'Link' },
];

const MAX_DOCUMENT_SIZE = 50 * 1024 * 1024;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const documentMimeTypes = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/markdown',
  'application/zip',
]);
const imageMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]);
const documentExtensions = new Set(['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'md', 'zip']);
const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']);

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

const validateDocumentUpload = (file: File): string | null => {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const categoryFromType = imageMimeTypes.has(file.type)
    ? 'image'
    : documentMimeTypes.has(file.type)
      ? 'document'
      : null;
  const categoryFromExt = imageExtensions.has(ext)
    ? 'image'
    : documentExtensions.has(ext)
      ? 'document'
      : null;

  if (!categoryFromType || !categoryFromExt || categoryFromType !== categoryFromExt) {
    return 'Unsupported file type. Upload PDF, Office files, TXT/MD, ZIP, or image files only.';
  }

  const maxSize = categoryFromType === 'image' ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE;
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return `File size exceeds ${maxSizeMB}MB limit.`;
  }

  return null;
};

const uploaderName = (material: CourseMaterial): string => {
  if (material.uploader?.firstName || material.uploader?.lastName) {
    return `${material.uploader?.firstName || ''} ${material.uploader?.lastName || ''}`.trim();
  }
  return 'Unknown';
};

export function UploadMaterialsPage({ courseId, isMockMode = false, courses = [] }: UploadMaterialsPageProps) {
  const { id: routeId } = useParams();
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;
  const { isRTL } = useLanguage();

  const [activeTab, setActiveTab] = useState<'queue' | 'library'>('library');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<CourseMaterial | null>(null);
  const [editingBundle, setEditingBundle] = useState<MaterialBundle | null>(null);
  const [deletingBundle, setDeletingBundle] = useState<MaterialBundle | null>(null);
  const [expandedBundleKey, setExpandedBundleKey] = useState<string | null>(null);
  const [selectedBundleDocumentId, setSelectedBundleDocumentId] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<MaterialFormState>(defaultFormState);
  const [editForm, setEditForm] = useState<MaterialFormState>(defaultFormState);

  // Upload-specific state
  const [uploadType, setUploadType] = useState<UploadType>('text');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [youtubeAuthUrl, setYoutubeAuthUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Smart URL detection
  useEffect(() => {
    if (showCreateModal && uploadType === 'text' && createForm.externalUrl) {
      const url = createForm.externalUrl.trim();
      
      // YouTube detection
      const youtubeId = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/i)?.[1] || 
                        url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i)?.[1];
      
      if (youtubeId) {
        setCreateForm(prev => ({ 
          ...prev, 
          materialType: 'video' 
        }));
        return;
      }

      // Google Drive detection
      if (url.includes('drive.google.com')) {
        setCreateForm(prev => ({ 
          ...prev, 
          materialType: 'document' 
        }));
        return;
      }

      // Default to link if URL present but not recognized as video/drive
      if (url.startsWith('http')) {
        setCreateForm(prev => ({ 
          ...prev, 
          materialType: 'link' 
        }));
      }
    }
  }, [createForm.externalUrl, showCreateModal, uploadType]);

  // Bundle upload state
  const [bundleVideo, setBundleVideo] = useState<File | null>(null);
  const [bundleDocuments, setBundleDocuments] = useState<File[]>([]);
  const [bundleUploadStatus, setBundleUploadStatus] = useState<'idle' | 'uploading' | 'done'>('idle');
  const [bundleUploadStep, setBundleUploadStep] = useState<string>('');
  const bundleVideoInputRef = useRef<HTMLInputElement>(null);
  const bundleDocInputRef = useRef<HTMLInputElement>(null);

  const [materialsResponse, setMaterialsResponse] = useState<CourseMaterialsResponse>({ data: [] });
  const [structureResponse, setStructureResponse] = useState<CourseStructureResponse>({
    data: [],
    byWeek: {},
  });
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);

  const [courseOptions, setCourseOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courseId || routeId || '');

  // Sync selectedCourseId when courseId prop or routeId changes
  useEffect(() => {
    const newCourseId = courseId || routeId || '';
    if (newCourseId && selectedCourseId !== newCourseId) {
      setSelectedCourseId(newCourseId);
    }
  }, [courseId, routeId]);

  const [searchQuery, setSearchQuery] = useState('');
  const [courseSearchQuery, setCourseSearchQuery] = useState('');
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

  const createMockMaterial = useCallback(
    (overrides: Partial<CourseMaterial> = {}): CourseMaterial => ({
      materialId: overrides.materialId || `mock-material-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      courseId: overrides.courseId || activeCourseId || '101',
      materialType: overrides.materialType || 'document',
      title: overrides.title || 'Mock Material',
      description: overrides.description ?? '',
      externalUrl: overrides.externalUrl ?? null,
      driveViewUrl: overrides.driveViewUrl ?? null,
      driveDownloadUrl: overrides.driveDownloadUrl ?? null,
      fileName: overrides.fileName ?? null,
      youtubeVideoId: overrides.youtubeVideoId ?? null,
      orderIndex: overrides.orderIndex ?? 0,
      weekNumber: overrides.weekNumber ?? null,
      viewCount: overrides.viewCount ?? 0,
      downloadCount: overrides.downloadCount ?? 0,
      uploader: overrides.uploader ?? {
        userId: 1,
        firstName: 'Instructor',
        lastName: 'Mock',
        email: 'instructor.mock@eduverse.local',
      },
      isPublished: overrides.isPublished ?? 1,
      createdAt: overrides.createdAt || new Date().toISOString(),
      updatedAt: overrides.updatedAt || new Date().toISOString(),
    }),
    [activeCourseId]
  );

  const loadCourseOptions = useCallback(async () => {
    if (isMockMode) {
      const mapped = courses
        .map((c) => {
          const value = String(c.courseId ?? c.id ?? '');
          const name = c.courseName || c.name || 'Course';
          const code = c.courseCode || '';
          return value ? { value, label: code ? `${code} - ${name}` : name } : null;
        })
        .filter(Boolean) as Array<{ value: string; label: string }>;
      setCourseOptions(mapped);
      if (!selectedCourseId && mapped.length > 0) setSelectedCourseId(mapped[0].value);
      return;
    }

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
  }, [selectedCourseId, isMockMode, courses]);

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
    if (isMockMode) return;
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
  }, [activeCourseId, loadMaterials, loadStructure, isMockMode]);

  useEffect(() => {
    loadCourseOptions();
  }, [loadCourseOptions]);

  useEffect(() => {
    refetchAll();
  }, [refetchAll]);

  useEffect(() => {
    if (!isMockMode || !activeCourseId) return;
    const now = new Date();
    const seed = [
      createMockMaterial({
        materialId: `mock-${activeCourseId}-mat-1`,
        courseId: activeCourseId,
        title: 'Week 1 Lecture Slides',
        materialType: 'slide',
        weekNumber: 1,
        isPublished: 1,
        createdAt: now.toISOString(),
      }),
      createMockMaterial({
        materialId: `mock-${activeCourseId}-mat-2`,
        courseId: activeCourseId,
        title: 'Week 2 Lab Instructions',
        materialType: 'document',
        weekNumber: 2,
        isPublished: 1,
        createdAt: now.toISOString(),
      }),
      createMockMaterial({
        materialId: `mock-${activeCourseId}-mat-3`,
        courseId: activeCourseId,
        title: 'Course Orientation Video',
        materialType: 'video',
        weekNumber: 1,
        isPublished: 0,
        externalUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      }),
    ];
    setMaterialsResponse({ data: seed, meta: { total: seed.length, page: 1, limit: 100, totalPages: 1 } });
  }, [isMockMode, activeCourseId, createMockMaterial]);

  useEffect(() => {
    if (!isMockMode) return;
    const byWeek: Record<string, any[]> = {};
    (materialsResponse.data || []).forEach((item) => {
      if (item.weekNumber == null) return;
      const key = String(item.weekNumber);
      if (!byWeek[key]) byWeek[key] = [];
      byWeek[key].push({
        organizationId: `mock-org-${item.materialId}`,
        courseId: item.courseId,
        materialId: item.materialId,
        material: item,
        organizationType: 'lecture',
        title: item.title,
        weekNumber: item.weekNumber,
        orderIndex: item.orderIndex || 0,
      });
    });
    setStructureResponse({ data: Object.values(byWeek).flat(), byWeek });
  }, [isMockMode, materialsResponse.data]);

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
    setUploadType('text');
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadError('');
    setYoutubeAuthUrl('');
    setBundleVideo(null);
    setBundleDocuments([]);
    setBundleUploadStatus('idle');
    setBundleUploadStep('');
    setExpandedBundleKey(null);
    setSelectedBundleDocumentId(null);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    if (mutating) return; // prevent close during upload
    setShowCreateModal(false);
  };

  const openEditModal = (material: CourseMaterial) => {
    setEditingBundle(null);
    setSelectedBundleDocumentId(null);
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

  const openBundleEditModal = (bundle: MaterialBundle) => {
    setEditingBundle(bundle);
    setSelectedBundleDocumentId(bundle.documents[0]?.materialId || null);
    setSelectedMaterial(bundle.items[0] || null);
    setEditForm({
      title: bundle.baseTitle,
      materialType: 'lecture',
      description: bundle.instructions || '',
      weekNumber: bundle.weekNumber == null ? '' : String(bundle.weekNumber),
      isPublished: bundle.isPublished,
    });
    setShowEditModal(true);
  };

  const openBundleDeleteDialog = (bundle: MaterialBundle) => {
    setSelectedMaterial(null);
    setDeletingBundle(bundle);
    setShowDeleteDialog(true);
  };

  const onCreateMaterial = async () => {
    if (!activeCourseId || !createForm.title.trim()) return;

    if (isMockMode) {
      const weekNumber = parseWeekNumber(createForm.weekNumber) ?? null;
      const basePayload = {
        courseId: activeCourseId,
        title: createForm.title.trim(),
        description: createForm.description || '',
        weekNumber,
        isPublished: createForm.isPublished ? 1 : 0,
      } as Partial<CourseMaterial>;

      if (uploadType === 'bundle') {
        const items: CourseMaterial[] = [];
        if (bundleVideo) {
          items.push(
            createMockMaterial({
              ...basePayload,
              title: `${createForm.title.trim()} - Video`,
              materialType: 'video',
              fileName: bundleVideo.name,
              externalUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
            })
          );
        }
        bundleDocuments.forEach((file, index) => {
          items.push(
            createMockMaterial({
              ...basePayload,
              title: `${createForm.title.trim()} - ${file.name.replace(/\.[^.]+$/, '')}`,
              materialType: createForm.materialType,
              fileName: file.name,
              orderIndex: index + 1,
            })
          );
        });
        if (items.length === 0) {
          setUploadError('Please add a video or at least one document.');
          return;
        }
        setMaterialsResponse((prev) => ({ ...prev, data: [...items, ...(prev.data || [])] }));
      } else {
        const one = createMockMaterial({
          ...basePayload,
          materialType: uploadType === 'video' ? 'video' : createForm.materialType,
          fileName: selectedFile?.name || null,
          externalUrl: uploadType === 'video' ? 'https://www.youtube.com/embed/dQw4w9WgXcQ' : null,
        });
        setMaterialsResponse((prev) => ({ ...prev, data: [one, ...(prev.data || [])] }));
      }

      addActivity(`Created: ${createForm.title}`, 'completed');
      toast.success('Mock material created');
      setShowCreateModal(false);
      setSelectedFile(null);
      setBundleVideo(null);
      setBundleDocuments([]);
      setUploadProgress(0);
      setUploadError('');
      return;
    }

    // --- Lecture Bundle Upload ---
    if (uploadType === 'bundle') {
      if (!bundleVideo && bundleDocuments.length === 0) {
        setUploadError('Please add a video or at least one document.');
        return;
      }

      const invalidDocument = bundleDocuments.find((file) => validateDocumentUpload(file));
      if (invalidDocument) {
        const validationError = validateDocumentUpload(invalidDocument);
        if (validationError) setUploadError(validationError);
        return;
      }

      setMutating(true);
      setUploadError('');
      setUploadProgress(0);
      setBundleUploadStatus('uploading');
      addActivity(`Uploading lecture bundle: ${createForm.title}`, 'processing');

      const totalItems = (bundleVideo ? 1 : 0) + bundleDocuments.length;
      let completedItems = 0;
      const baseTitle = createForm.title.trim();
      const payload = {
        description: createForm.description || undefined,
        weekNumber: parseWeekNumber(createForm.weekNumber),
        isPublished: createForm.isPublished,
      };
      const updateOverallProgress = (itemProgress: number) => {
        if (totalItems <= 0) return;
        const overall = Math.round(((completedItems + itemProgress / 100) / totalItems) * 100);
        setUploadProgress(Math.min(100, Math.max(0, overall)));
      };

      try {
        if (bundleVideo) {
          setBundleUploadStep(`Uploading video: ${bundleVideo.name}`);
          await materialService.uploadVideo(
            activeCourseId,
            bundleVideo,
            {
              title: `${baseTitle} - Video`,
              ...payload,
            },
            (pct) => updateOverallProgress(pct)
          );
          completedItems += 1;
          updateOverallProgress(0);
        }

        for (let i = 0; i < bundleDocuments.length; i += 1) {
          const file = bundleDocuments[i];
          const fileBaseName = file.name.replace(/\.[^.]+$/, '');
          setBundleUploadStep(`Uploading file ${i + 1}/${bundleDocuments.length}: ${file.name}`);
          await materialService.uploadFile(
            activeCourseId,
            file,
            {
              title: `${baseTitle} - ${fileBaseName}`,
              materialType: createForm.materialType as
                | 'document'
                | 'lecture'
                | 'slide'
                | 'reading',
              ...payload,
            },
            (pct) => updateOverallProgress(pct)
          );
          completedItems += 1;
          updateOverallProgress(0);
        }

        setBundleUploadStatus('done');
        setBundleUploadStep('Bundle uploaded successfully');
        toast.success('Lecture bundle uploaded successfully');
        addActivity(`Bundle uploaded: ${createForm.title}`, 'completed');
        setShowCreateModal(false);
        await loadMaterials(activeCourseId);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to upload lecture bundle';
        const isOAuthError = /oauth|token|authoriz/i.test(message);
        setUploadError(
          isOAuthError
            ? 'YouTube not authorized. Please contact admin to set up YouTube integration.'
            : message
        );
        setBundleUploadStatus('idle');
        setBundleUploadStep('');
        addActivity(`Bundle failed: ${createForm.title}`, 'completed');
      } finally {
        setMutating(false);
      }
      return;
    }

    // --- File Upload ---
    if (uploadType === 'file') {
      if (!selectedFile) {
        setUploadError('Please select a file to upload.');
        return;
      }
      const validationError = validateDocumentUpload(selectedFile);
      if (validationError) {
        setUploadError(validationError);
        return;
      }
      setMutating(true);
      setUploadError('');
      setUploadProgress(0);
      addActivity(`Uploading file: ${createForm.title}`, 'processing');
      try {
        await materialService.uploadFile(
          activeCourseId,
          selectedFile,
          {
            title: createForm.title.trim(),
            materialType: createForm.materialType as
              | 'document'
              | 'lecture'
              | 'slide'
              | 'reading',
            description: createForm.description || undefined,
            weekNumber: parseWeekNumber(createForm.weekNumber),
            isPublished: createForm.isPublished,
          },
          (pct) => setUploadProgress(pct)
        );
        toast.success('File uploaded successfully');
        addActivity(`Uploaded: ${createForm.title}`, 'completed');
        setShowCreateModal(false);
        await loadMaterials(activeCourseId);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to upload file';
        setUploadError(message);
        addActivity(`Failed: ${createForm.title}`, 'completed');
      } finally {
        setMutating(false);
      }
      return;
    }

    // --- YouTube Video Upload ---
    if (uploadType === 'video') {
      if (!selectedFile) {
        setUploadError('Please select a video file to upload.');
        return;
      }
      setMutating(true);
      setUploadError('');
      setUploadProgress(0);
      addActivity(`Uploading to YouTube: ${createForm.title}`, 'processing');
      try {
        // Check YouTube is configured
        try {
          const authData = await materialService.getYouTubeAuthUrl();
          if (authData?.authUrl) setYoutubeAuthUrl(authData.authUrl);
        } catch {
          // Not fatal — proceed and let the upload fail with a clear message
        }

        await materialService.uploadVideo(
          activeCourseId,
          selectedFile,
          {
            title: createForm.title.trim(),
            description: createForm.description || undefined,
            weekNumber: parseWeekNumber(createForm.weekNumber),
            isPublished: createForm.isPublished,
          },
          (pct) => setUploadProgress(pct)
        );
        toast.success('Video uploaded to YouTube successfully');
        addActivity(`YouTube upload done: ${createForm.title}`, 'completed');
        setShowCreateModal(false);
        await loadMaterials(activeCourseId);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to upload video';
        const isOAuthError = /oauth|token|authoriz/i.test(message);
        setUploadError(
          isOAuthError
            ? 'YouTube not authorized. Please contact admin to set up YouTube integration.'
            : message
        );
        addActivity(`Failed: ${createForm.title}`, 'completed');
      } finally {
        setMutating(false);
      }
      return;
    }

    // --- Text / Link (existing) ---
    setMutating(true);
    addActivity(`Creating: ${createForm.title}`, 'processing');
    try {
      await materialService.createMaterial(activeCourseId, {
        title: createForm.title.trim(),
        materialType: createForm.materialType,
        description: createForm.description || undefined,
        weekNumber: parseWeekNumber(createForm.weekNumber),
        isPublished: createForm.isPublished,
        externalUrl: createForm.externalUrl || undefined,
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
    if (!activeCourseId) return;
    if (isMockMode) {
      if (editingBundle && editingBundle.items.length > 0) {
        const ids = new Set(editingBundle.items.map((i) => i.materialId));
        setMaterialsResponse((prev) => ({
          ...prev,
          data: (prev.data || []).map((item) =>
            ids.has(item.materialId)
              ? {
                  ...item,
                  title: `${editForm.title.trim()} - ${getBundleSuffix(item, editingBundle.baseTitle)}`,
                  description: editForm.description || '',
                  weekNumber: parseWeekNumber(editForm.weekNumber) ?? null,
                  isPublished: editForm.isPublished ? 1 : 0,
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
        }));
      } else if (selectedMaterial) {
        setMaterialsResponse((prev) => ({
          ...prev,
          data: (prev.data || []).map((item) =>
            item.materialId === selectedMaterial.materialId
              ? {
                  ...item,
                  title: editForm.title.trim(),
                  description: editForm.description || '',
                  weekNumber: parseWeekNumber(editForm.weekNumber) ?? null,
                  isPublished: editForm.isPublished ? 1 : 0,
                  updatedAt: new Date().toISOString(),
                }
              : item
          ),
        }));
      }
      toast.success('Mock material updated');
      setShowEditModal(false);
      setEditingBundle(null);
      return;
    }
    setMutating(true);
    try {
      if (editingBundle && editingBundle.items.length > 0) {
        const nextBaseTitle = editForm.title.trim();
        await Promise.all(
          editingBundle.items.map((material) =>
            materialService.updateMaterial(activeCourseId, material.materialId, {
              title: `${nextBaseTitle} - ${getBundleSuffix(material, editingBundle.baseTitle)}`,
              description: editForm.description || undefined,
              weekNumber: parseWeekNumber(editForm.weekNumber),
              isPublished: editForm.isPublished,
            })
          )
        );
        toast.success('Lecture bundle updated');
        setEditingBundle(null);
        setSelectedBundleDocumentId(null);
      } else if (selectedMaterial) {
        await materialService.updateMaterial(activeCourseId, selectedMaterial.materialId, {
          title: editForm.title.trim(),
          description: editForm.description || undefined,
          weekNumber: parseWeekNumber(editForm.weekNumber),
          isPublished: editForm.isPublished,
          externalUrl: editForm.externalUrl || undefined,
        });
        toast.success('Material updated');
      } else {
        return;
      }

      setShowEditModal(false);
      setEditingBundle(null);
      await loadMaterials(activeCourseId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update material';
      toast.error(message);
    } finally {
      setMutating(false);
    }
  };

  const onDeleteMaterial = async () => {
    if (!activeCourseId) return;
    if (isMockMode) {
      if (deletingBundle && deletingBundle.items.length > 0) {
        const ids = new Set(deletingBundle.items.map((m) => m.materialId));
        setMaterialsResponse((prev) => ({
          ...prev,
          data: (prev.data || []).filter((m) => !ids.has(m.materialId)),
        }));
        toast.success('Mock lecture bundle deleted');
      } else if (selectedMaterial) {
        setMaterialsResponse((prev) => ({
          ...prev,
          data: (prev.data || []).filter((m) => m.materialId !== selectedMaterial.materialId),
        }));
        toast.success('Mock material deleted');
      }
      setShowDeleteDialog(false);
      setDeletingBundle(null);
      setSelectedMaterial(null);
      return;
    }
    setMutating(true);
    try {
      if (deletingBundle && deletingBundle.items.length > 0) {
        await Promise.all(
          deletingBundle.items.map((material) =>
            materialService.deleteMaterial(activeCourseId, material.materialId)
          )
        );
        toast.success('Lecture bundle deleted');
        if (expandedBundleKey === deletingBundle.key) {
          setExpandedBundleKey(null);
          setSelectedBundleDocumentId(null);
        }
      } else if (selectedMaterial) {
        await materialService.deleteMaterial(activeCourseId, selectedMaterial.materialId);
        toast.success('Material deleted');
      } else {
        return;
      }

      setShowDeleteDialog(false);
      setDeletingBundle(null);
      setSelectedMaterial(null);
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
    if (isMockMode) {
      setMaterialsResponse((prev) => ({
        ...prev,
        data: (prev.data || []).map((m) =>
          m.materialId === material.materialId ? { ...m, isPublished: m.isPublished === 1 ? 0 : 1 } : m
        ),
      }));
      return;
    }
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

  const onToggleBundleVisibility = async (bundle: MaterialBundle) => {
    if (!activeCourseId) return;
    if (isMockMode) {
      const ids = new Set(bundle.items.map((i) => i.materialId));
      const nextVisibleState = bundle.items.some((item) => item.isPublished !== 1) ? 1 : 0;
      setMaterialsResponse((prev) => ({
        ...prev,
        data: (prev.data || []).map((m) => (ids.has(m.materialId) ? { ...m, isPublished: nextVisibleState } : m)),
      }));
      return;
    }
    const nextVisibleState = bundle.items.some((item) => item.isPublished !== 1);
    try {
      await Promise.all(
        bundle.items.map((item) =>
          materialService.toggleVisibility(activeCourseId, item.materialId, nextVisibleState)
        )
      );
      await loadMaterials(activeCourseId);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update bundle visibility';
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
    if (!activeCourseId || !material.materialId) return;
    const url = materialService.getDownloadUrl(activeCourseId, material.materialId);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const toggleBundlePreview = (bundle: MaterialBundle) => {
    setExpandedBundleKey((prev) => (prev === bundle.key ? null : bundle.key));
    setSelectedBundleDocumentId((prev) => {
      if (prev && bundle.documents.some((doc) => doc.materialId === prev)) return prev;
      return bundle.documents[0]?.materialId || null;
    });
  };

  const renderBundlePreviewContent = (bundle: MaterialBundle) => {
    const selectedDocument =
      bundle.documents.find((doc) => doc.materialId === selectedBundleDocumentId) ||
      bundle.documents[0] ||
      null;
    const selectedDocumentPreviewUrl = selectedDocument
      ? getCourseMaterialPreviewUrl(selectedDocument)
      : null;
    const bundleVideoSrc = bundle.video
      ? embedUrls[bundle.video.materialId] || bundle.video.externalUrl || ''
      : '';

    return (
      <div className="mt-3 space-y-3">
        {bundle.video && (
          <div className={`rounded-lg border p-3 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <p className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Lecture Video
              </p>
              {!bundleVideoSrc && (
                <button
                  type="button"
                  onClick={() => onLoadEmbed(bundle.video!)}
                  className={`text-xs px-2 py-1 rounded ${isDark ? 'text-slate-200 bg-white/10 hover:bg-white/20' : 'text-slate-700 bg-slate-200 hover:bg-slate-300'}`}
                >
                  Load video
                </button>
              )}
            </div>
            {bundleVideoSrc ? (
              <iframe
                src={bundleVideoSrc}
                width="100%"
                height="260"
                allowFullScreen
                title={`bundle-video-${bundle.key}`}
                className="rounded"
              />
            ) : (
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Video preview is unavailable.
              </p>
            )}
          </div>
        )}

        <div className={`rounded-lg border p-3 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
          <p className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Bundle Files
          </p>
          {bundle.documents.length === 0 ? (
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              No files in this bundle.
            </p>
          ) : (
            <div className="space-y-2">
              {bundle.documents.map((doc) => (
                <div
                  key={doc.materialId}
                  className={`flex flex-wrap items-center justify-between gap-2 p-2 rounded border ${selectedDocument?.materialId === doc.materialId
                    ? 'border-indigo-300 bg-indigo-50'
                    : isDark
                      ? 'border-white/10 bg-white/5'
                      : 'border-slate-200 bg-white'
                    }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedBundleDocumentId(doc.materialId)}
                    className={`text-left text-sm flex-1 min-w-0 truncate ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
                    title={doc.title}
                  >
                    {doc.title}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDownload(doc)}
                    className="text-xs px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700"
                  >
                    Open
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedDocumentPreviewUrl && (
          <div className="rounded-lg overflow-hidden border border-slate-200">
            <iframe
              src={selectedDocumentPreviewUrl}
              width="100%"
              height="360"
              title={`bundle-document-${selectedDocument?.materialId || bundle.key}`}
            />
          </div>
        )}
      </div>
    );
  };

  const renderMaterialCard = (material: CourseMaterial) => {
    const badgeClass = materialBadgeClasses[material.materialType] || materialBadgeClasses.document;
    const videoIdFromUrl = material.externalUrl ? 
      (material.externalUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/i)?.[1] || 
       material.externalUrl.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/i)?.[1]) : null;
    
    const effectiveYoutubeId = material.youtubeVideoId || videoIdFromUrl;

    const videoSrc = embedUrls[material.materialId] || 
                    (effectiveYoutubeId ? `https://www.youtube.com/embed/${effectiveYoutubeId}` : material.externalUrl) || 
                    '';
    const documentPreviewSrc = getCourseMaterialPreviewUrl(material);
    const canInlinePreview = !!documentPreviewSrc;

    const ytThumb = effectiveYoutubeId
      ? `https://img.youtube.com/vi/${effectiveYoutubeId}/mqdefault.jpg`
      : null;

    return (
      <div
        key={material.materialId}
        className={`rounded-xl p-4 border shadow-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
      >
        <div className="flex items-start gap-3">
          {/* YouTube thumbnail or icon */}
          {ytThumb ? (
            <div className="w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 relative">
              <img src={ytThumb} alt={material.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Youtube size={16} className="text-white" />
              </div>
            </div>
          ) : (
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}
            >
              {materialIcon(material.materialType)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {material.title}
              </h4>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badgeClass}`}>
                {material.materialType}
              </span>
              {material.youtubeVideoId && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                  <Youtube size={10} /> YouTube
                </span>
              )}
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

            {canInlinePreview ? (
              <div className="mt-3 rounded-lg overflow-hidden border border-slate-200">
                <iframe
                  src={documentPreviewSrc || ''}
                  width="100%"
                  height={effectiveYoutubeId ? "315" : "380"}
                  allowFullScreen
                  title={`material-preview-${material.materialId}`}
                />
              </div>
            ) : (material.materialType === 'document' ||
                material.materialType === 'lecture' ||
                material.materialType === 'slide' ||
                material.materialType === 'reading') && (
                <p className={`mt-3 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Preview is unavailable for this file.
                </p>
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
                setDeletingBundle(null);
                setSelectedMaterial(material);
                setShowDeleteDialog(true);
              }}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-red-300' : 'hover:bg-red-50 text-red-600'}`}
              title="Delete"
            >
              <Trash2 size={16} />
            </button>

            {material.externalUrl && (
              <a
                href={material.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-indigo-400' : 'hover:bg-indigo-50 text-indigo-600'}`}
                title="Open Link"
              >
                <LinkIcon size={16} />
              </a>
            )}

            {material.materialType !== 'video' && material.materialType !== 'link' && (
              <button
                onClick={() => onDownload(material)}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
                title="Download file"
              >
                <Download size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const getWeekMaterialEntries = (items: CourseMaterial[]): WeekMaterialEntry[] => {
    const { bundles, singles } = groupMaterialsIntoBundles(items);

    const entries: Array<WeekMaterialEntry & { orderIndex: number }> = [
      ...bundles.map((bundle) => ({
        kind: 'bundle' as const,
        bundle,
        orderIndex: Math.min(...bundle.items.map((item) => Number(item.orderIndex || 0))),
      })),
      ...singles.map((material) => ({
        kind: 'single' as const,
        material,
        orderIndex: Number(material.orderIndex || 0),
      })),
    ];

    return entries
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(({ orderIndex: _orderIndex, ...entry }) => entry);
  };

  const renderBundleCard = (bundle: MaterialBundle) => {
    const hasVideo = Boolean(bundle.video);
    const isExpanded = expandedBundleKey === bundle.key;

    return (
      <div
        key={bundle.key}
        className={`rounded-xl p-4 border shadow-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200'}`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}
          >
            <Package size={18} className="text-indigo-500" />
          </div>

          <button
            type="button"
            onClick={() => toggleBundlePreview(bundle)}
            className="flex-1 min-w-0 text-left"
          >
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {bundle.baseTitle}
              </h4>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
                Lecture Bundle
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${bundle.isPublished ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}
              >
                {bundle.isPublished ? 'Published' : 'Draft'}
              </span>
            </div>

            <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {bundle.instructions || 'No instructions'}
            </p>

            <div className={`mt-2 text-xs flex flex-wrap gap-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <span>{bundle.weekNumber == null ? 'General' : `Week ${bundle.weekNumber}`}</span>
              <span>{hasVideo ? '1 video' : 'No video'}</span>
              <span>{bundle.documents.length} files</span>
            </div>

            <p className={`mt-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {isExpanded ? 'Click to collapse' : 'Click to view full bundle content'}
            </p>
          </button>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onToggleBundleVisibility(bundle)}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'}`}
              title="Toggle bundle visibility"
            >
              {bundle.isPublished ? (
                <Eye size={16} className="text-green-500" />
              ) : (
                <EyeOff size={16} className="text-slate-500" />
              )}
            </button>

            <button
              onClick={() => openBundleEditModal(bundle)}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
              title="Edit lecture bundle"
            >
              <Edit size={16} />
            </button>

            <button
              onClick={() => openBundleDeleteDialog(bundle)}
              className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-white/10 text-red-300' : 'hover:bg-red-50 text-red-600'}`}
              title="Delete lecture bundle"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        {isExpanded && renderBundlePreviewContent(bundle)}
      </div>
    );
  };

  const renderWeekMaterialEntry = (entry: WeekMaterialEntry) =>
    entry.kind === 'bundle' ? renderBundleCard(entry.bundle) : renderMaterialCard(entry.material);

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
            {/* Course Selector Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className={`text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Select Course
                </h2>
                {courseOptions.length > 5 && (
                  <div className="relative w-48">
                    <Search
                      className={`absolute left-2 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
                      size={14}
                    />
                    <input
                      type="text"
                      value={courseSearchQuery}
                      onChange={(e) => setCourseSearchQuery(e.target.value)}
                      placeholder="Filter courses..."
                      className={`w-full pl-8 pr-2 py-1 text-xs border rounded-lg ${isDark ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-500' : 'bg-white border-slate-300'}`}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {courseOptions
                  .filter((opt) =>
                    opt.label.toLowerCase().includes(courseSearchQuery.toLowerCase())
                  )
                  .map((opt) => {
                    const isActive = activeCourseId === opt.value;
                    const [code, ...nameParts] = opt.label.split(' - ');
                    const name = nameParts.join(' - ');

                    return (
                      <button
                        key={opt.value}
                        onClick={() => setSelectedCourseId(opt.value)}
                        className={`flex-shrink-0 w-48 p-4 rounded-xl border text-left transition-all ${
                          isActive
                            ? 'ring-2 ring-indigo-500 border-transparent shadow-lg scale-[1.02]'
                            : isDark
                              ? 'bg-white/5 border-white/10 hover:border-white/20'
                              : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                        style={isActive ? { backgroundColor: `${primaryHex}10` } : {}}
                      >
                        <div
                          className={`text-lg font-bold mb-1 ${isActive ? '' : isDark ? 'text-white' : 'text-slate-900'}`}
                          style={isActive ? { color: primaryHex } : {}}
                        >
                          {code}
                        </div>
                        <div
                          className={`text-xs truncate ${isActive ? 'text-indigo-600 dark:text-indigo-400' : isDark ? 'text-slate-400' : 'text-slate-500'}`}
                          title={name}
                        >
                          {name}
                        </div>
                        {isActive && (
                          <div
                            className="mt-2 h-1 w-8 rounded-full"
                            style={{ backgroundColor: primaryHex }}
                          />
                        )}
                      </button>
                    );
                  })}
                {courseOptions.length === 0 && (
                  <div className={`p-4 rounded-xl border border-dashed ${isDark ? 'border-white/10 text-slate-500' : 'border-slate-300 text-slate-400'}`}>
                    No courses available
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

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
              <div className="space-y-4">
                <div
                  className={`rounded-xl p-6 border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}
                >
                  <div className="space-y-3">
                    <Skeleton className="h-5 w-44" />
                    <Skeleton className="h-4 w-72" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      <Skeleton className="h-28 w-full" />
                      <Skeleton className="h-28 w-full" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
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
                      {getWeekMaterialEntries(items).map(renderWeekMaterialEntry)}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            className={`w-full max-w-lg rounded-xl p-6 shadow-xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-slate-800 border border-white/10' : 'bg-white'}`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {showCreateModal
                  ? 'Add Material'
                  : editingBundle
                    ? 'Edit Lecture Bundle'
                    : 'Edit Material'}
              </h2>
              <button
                onClick={
                  showCreateModal
                    ? closeCreateModal
                    : () => {
                      setEditingBundle(null);
                      setSelectedBundleDocumentId(null);
                      setShowEditModal(false);
                    }
                }
                disabled={mutating}
                className={`p-2 rounded-lg disabled:opacity-40 ${isDark ? 'hover:bg-white/10 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
              >
                <X size={18} />
              </button>
            </div>

            {/* Upload Type Selector — Create mode only */}
            {showCreateModal && (
              <div className="flex gap-2 mb-4">
                {[
                  {
                    type: 'text' as UploadType,
                    icon: <FileText size={15} />,
                    label: 'Text / Link',
                  },
                  {
                    type: 'file' as UploadType,
                    icon: <FolderOpen size={15} />,
                    label: 'File Upload',
                  },
                  { type: 'video' as UploadType, icon: <Film size={15} />, label: 'YouTube Video' },
                  { type: 'bundle' as UploadType, icon: <Package size={15} />, label: 'Lecture Bundle' },
                ].map(({ type, icon, label }) => (
                  <button
                    key={type}
                    disabled={mutating}
                    onClick={() => {
                      setUploadType(type);
                      setSelectedFile(null);
                      setUploadError('');
                      setUploadProgress(0);
                      setBundleVideo(null);
                      setBundleDocuments([]);
                      setBundleUploadStatus('idle');
                      setBundleUploadStep('');
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-xs font-medium border transition-all disabled:opacity-40 ${uploadType === type
                      ? 'text-white border-transparent'
                      : isDark
                        ? 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    style={
                      uploadType === type
                        ? { backgroundColor: primaryHex, borderColor: primaryHex }
                        : {}
                    }
                  >
                    {icon} {label}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-3">
              {(() => {
                const form = showCreateModal ? createForm : editForm;
                const setForm = showCreateModal ? setCreateForm : setEditForm;
                const isFileMode = showCreateModal && uploadType === 'file';
                const isVideoMode = showCreateModal && uploadType === 'video';
                const isBundleMode = showCreateModal && uploadType === 'bundle';

                const commonFields = (
                  <>
                    {/* Title */}
                    <input
                      type="text"
                      value={form.title}
                      onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                      placeholder="Title *"
                      disabled={mutating}
                      className={`w-full px-3 py-2 border rounded-lg disabled:opacity-60 ${isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-400'
                        : 'bg-white border-slate-300 text-black placeholder:text-slate-500'
                        }`} />

                    {/* Material type dropdown — hide for video mode (type fixed to 'video') */}
                    {!isVideoMode && (
                      <CleanSelect
                        value={form.materialType}
                        disabled={mutating}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            materialType: e.target.value as MaterialFormState['materialType'],
                          }))
                        }
                        className={`w-full px-3 py-2 border rounded-lg disabled:opacity-60 ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-300'}`}
                      >
                        {(isFileMode || isBundleMode
                          ? ['document', 'lecture', 'slide', 'reading']
                          : materialTypeOptions.filter((o) => o.value !== 'all').map((o) => o.value)
                        ).map((v) => (
                          <option key={v} value={v}>
                            {v.charAt(0).toUpperCase() + v.slice(1)}
                          </option>
                        ))}
                      </CleanSelect>
                    )}

                    {/* Week number */}
                    <input
                      type="number"
                      value={form.weekNumber}
                      onChange={(e) => setForm((prev) => ({ ...prev, weekNumber: e.target.value }))}
                      placeholder="Week Number (optional)"
                      disabled={mutating}
                      className={`w-full px-3 py-2 border rounded-lg disabled:opacity-60 ${isDark
                        ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-400'
                        : 'bg-white border-slate-300 text-black placeholder:text-slate-500'
                        }`} />

                    {/* Description */}
                    <textarea
                      rows={2}
                      value={form.description}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, description: e.target.value }))
                      }
                      placeholder="Description (optional)"
                      disabled={mutating}
                      className={`w-full px-3 py-2 border rounded-lg disabled:opacity-60 ${isDark
                          ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-400'
                          : 'bg-white border-slate-300 text-black placeholder:text-slate-500'
                        }`} />

                    {/* External URL (For Text/Link mode) */}
                    {uploadType === 'text' && (
                      <div className="space-y-2">
                        <div className="relative">
                          <LinkIcon
                            size={16}
                            className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                          />
                          <input
                            type="url"
                            value={form.externalUrl}
                            onChange={(e) =>
                              setForm((prev) => ({ ...prev, externalUrl: e.target.value }))
                            }
                            placeholder="External Link (YouTube, Drive, Web...)"
                            disabled={mutating}
                            className={`w-full pl-10 pr-3 py-2 border rounded-lg disabled:opacity-60 ${isDark
                              ? 'bg-white/5 border-white/10 text-white placeholder:text-slate-400'
                              : 'bg-white border-slate-300 text-black placeholder:text-slate-500'
                              }`}
                          />
                        </div>
                        {form.externalUrl && (
                          <div className={`p-3 rounded-xl border text-xs flex items-center gap-3 ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
                            {form.materialType === 'video' ? (
                              <>
                                <Youtube size={24} className="text-red-500" />
                                <div>
                                  <p className="font-bold">YouTube Video Detected</p>
                                  <p className="opacity-70">Will be embedded in the platform</p>
                                </div>
                              </>
                            ) : form.externalUrl.includes('drive.google.com') ? (
                              <>
                                <Database size={24} className="text-blue-500" />
                                <div>
                                  <p className="font-bold">Google Drive Detected</p>
                                  <p className="opacity-70">Will be shown as an interactive preview</p>
                                </div>
                              </>
                            ) : (
                              <>
                                <LinkIcon size={24} className="text-indigo-500" />
                                <div>
                                  <p className="font-bold">Web Link Detected</p>
                                  <p className="opacity-70">{new URL(form.externalUrl).hostname}</p>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Publish toggle */}
                    <label
                      className={`flex items-center gap-2 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}
                    >
                      <input
                        type="checkbox"
                        checked={form.isPublished}
                        disabled={mutating}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, isPublished: e.target.checked }))
                        }
                      />
                      Publish immediately
                    </label>
                  </>
                );

                // ── File Upload mode ──────────────────────────────────────
                if (isFileMode)
                  return (
                    <>
                      {commonFields}

                      {/* File dropzone */}
                      <div
                        onClick={() => !mutating && fileInputRef.current?.click()}
                        className={`mt-1 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${mutating
                          ? 'opacity-50 cursor-not-allowed'
                          : isDark
                            ? 'border-white/20 hover:border-white/40 text-slate-400'
                            : 'border-slate-300 hover:border-slate-400 text-slate-500'
                          }`}
                      >
                        <FolderOpen size={28} className="mx-auto mb-2 opacity-60" />
                        {selectedFile ? (
                          <p
                            className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
                          >
                            📄 {selectedFile.name}
                          </p>
                        ) : (
                          <>
                            <p className="text-sm font-medium">Click to select a file</p>
                            <p className="text-xs mt-1 opacity-70">
                              PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT
                            </p>
                          </>
                        )}
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.zip,.jpg,.jpeg,.png,.gif,.webp,.svg"
                        className="hidden"
                        onChange={(e) => {
                          const nextFile = e.target.files?.[0] ?? null;
                          if (nextFile) {
                            const validationError = validateDocumentUpload(nextFile);
                            if (validationError) {
                              setSelectedFile(null);
                              setUploadError(validationError);
                              return;
                            }
                          }
                          setSelectedFile(nextFile);
                          setUploadError('');
                        }}
                      />

                      {/* Progress bar */}
                      {uploadProgress > 0 && (
                        <div>
                          <div
                            className={`w-full rounded-full h-2 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}
                          >
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%`, backgroundColor: primaryHex }}
                            />
                          </div>
                          <p
                            className={`text-xs mt-1 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                          >
                            Uploading... {uploadProgress}%
                          </p>
                        </div>
                      )}

                      {/* Inline error */}
                      {uploadError && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertTriangle size={14} /> {uploadError}
                        </p>
                      )}
                    </>
                  );

                // ── YouTube Video mode ────────────────────────────────────
                if (isVideoMode)
                  return (
                    <>
                      {commonFields}

                      {/* Warning banner */}
                      <div
                        className={`flex items-start gap-2 p-3 rounded-lg text-sm ${isDark ? 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}
                      >
                        <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
                        <span>
                          Video will be uploaded to YouTube. This may take several minutes depending
                          on file size.
                        </span>
                      </div>

                      {/* Video dropzone */}
                      <div
                        onClick={() => !mutating && videoInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${mutating
                          ? 'opacity-50 cursor-not-allowed'
                          : isDark
                            ? 'border-white/20 hover:border-white/40 text-slate-400'
                            : 'border-slate-300 hover:border-slate-400 text-slate-500'
                          }`}
                      >
                        <Film size={28} className="mx-auto mb-2 opacity-60" />
                        {selectedFile ? (
                          <>
                            <p
                              className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
                            >
                              🎬 {selectedFile.name}
                            </p>
                            <p className="text-xs mt-1 opacity-70">
                              {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          </>
                        ) : (
                          <>
                            <p className="text-sm font-medium">Click to select a video file</p>
                            <p className="text-xs mt-1 opacity-70">MP4, MOV, AVI, MKV, WebM</p>
                          </>
                        )}
                      </div>
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept=".mp4,.mov,.avi,.mkv,.webm,video/*"
                        className="hidden"
                        onChange={(e) => {
                          setSelectedFile(e.target.files?.[0] ?? null);
                          setUploadError('');
                        }}
                      />

                      {/* Progress bar */}
                      {uploadProgress > 0 && (
                        <div>
                          <div
                            className={`w-full rounded-full h-2 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}
                          >
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%`, backgroundColor: '#ef4444' }}
                            />
                          </div>
                          <p className="text-xs mt-1 text-center text-red-500">
                            Uploading to YouTube... {uploadProgress}%
                          </p>
                        </div>
                      )}

                      {/* Inline error */}
                      {uploadError && (
                        <div className="text-sm text-red-500">
                          <p className="flex items-center gap-1">
                            <AlertTriangle size={14} /> {uploadError}
                          </p>
                          {youtubeAuthUrl && (
                            <a
                              href={youtubeAuthUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-1 inline-block text-blue-500 underline text-xs"
                            >
                              Open YouTube OAuth Authorization →
                            </a>
                          )}
                        </div>
                      )}
                    </>
                  );

                // ── Lecture Bundle mode ─────────────────────────────────────
                if (isBundleMode)
                  return (
                    <>
                      {commonFields}

                      <div
                        className={`flex items-start gap-2 p-3 rounded-lg text-sm ${isDark ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}
                      >
                        <Package size={16} className="flex-shrink-0 mt-0.5" />
                        <span>Upload one lecture video and multiple lecture files together.</span>
                      </div>

                      <div
                        onClick={() => !mutating && bundleVideoInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${mutating
                          ? 'opacity-50 cursor-not-allowed'
                          : isDark
                            ? 'border-white/20 hover:border-white/40 text-slate-400'
                            : 'border-slate-300 hover:border-slate-400 text-slate-500'
                          }`}
                      >
                        <Film size={24} className="mx-auto mb-2 opacity-60" />
                        {bundleVideo ? (
                          <p
                            className={`text-sm font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}
                          >
                            🎬 {bundleVideo.name}
                          </p>
                        ) : (
                          <p className="text-sm font-medium">Select lecture video (optional)</p>
                        )}
                      </div>
                      <input
                        ref={bundleVideoInputRef}
                        type="file"
                        accept=".mp4,.mov,.avi,.mkv,.webm,video/*"
                        className="hidden"
                        onChange={(e) => {
                          setBundleVideo(e.target.files?.[0] ?? null);
                          setUploadError('');
                        }}
                      />

                      <div
                        onClick={() => !mutating && bundleDocInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${mutating
                          ? 'opacity-50 cursor-not-allowed'
                          : isDark
                            ? 'border-white/20 hover:border-white/40 text-slate-400'
                            : 'border-slate-300 hover:border-slate-400 text-slate-500'
                          }`}
                      >
                        <FolderOpen size={24} className="mx-auto mb-2 opacity-60" />
                        <p className="text-sm font-medium">Select lecture files (multiple)</p>
                        <p className="text-xs mt-1 opacity-70">
                          PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, TXT, MD, ZIP, images
                        </p>
                      </div>
                      <input
                        ref={bundleDocInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.md,.zip,.jpg,.jpeg,.png,.gif,.webp,.svg"
                        className="hidden"
                        onChange={(e) => {
                          const selected = Array.from(e.target.files || []);
                          if (selected.length === 0) return;
                          const invalid = selected.find((file) => validateDocumentUpload(file));
                          if (invalid) {
                            const validationError = validateDocumentUpload(invalid);
                            if (validationError) setUploadError(validationError);
                            return;
                          }
                          setBundleDocuments((prev) => {
                            const existingKeys = new Set(
                              prev.map((f) => `${f.name}-${f.size}-${f.lastModified}`)
                            );
                            const next = [...prev];
                            for (const file of selected) {
                              const key = `${file.name}-${file.size}-${file.lastModified}`;
                              if (!existingKeys.has(key)) {
                                next.push(file);
                                existingKeys.add(key);
                              }
                            }
                            return next;
                          });
                          e.target.value = '';
                          setUploadError('');
                        }}
                      />

                      {bundleDocuments.length > 0 && (
                        <div
                          className={`rounded-lg border p-3 space-y-2 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}
                        >
                          <p className={`text-xs font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                            Selected files ({bundleDocuments.length})
                          </p>
                          {bundleDocuments.map((file, index) => (
                            <div key={`${file.name}-${file.size}-${file.lastModified}`} className="flex items-center justify-between gap-2">
                              <p
                                className={`text-sm truncate ${isDark ? 'text-slate-200' : 'text-slate-700'}`}
                                title={file.name}
                              >
                                {index + 1}. {file.name}
                              </p>
                              <button
                                type="button"
                                disabled={mutating}
                                onClick={() =>
                                  setBundleDocuments((prev) =>
                                    prev.filter((_, docIndex) => docIndex !== index)
                                  )
                                }
                                className={`p-1 rounded ${isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-200'} disabled:opacity-40`}
                                aria-label={`Remove ${file.name}`}
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {uploadProgress > 0 && (
                        <div>
                          <div
                            className={`w-full rounded-full h-2 ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}
                          >
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%`, backgroundColor: primaryHex }}
                            />
                          </div>
                          <p
                            className={`text-xs mt-1 text-center ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                          >
                            {bundleUploadStatus === 'uploading'
                              ? `Uploading bundle... ${uploadProgress}%`
                              : `Progress: ${uploadProgress}%`}
                          </p>
                        </div>
                      )}

                      {bundleUploadStep && (
                        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {bundleUploadStep}
                        </p>
                      )}

                      {uploadError && (
                        <p className="text-sm text-red-500 flex items-center gap-1">
                          <AlertTriangle size={14} /> {uploadError}
                        </p>
                      )}
                    </>
                  );

                if (!showCreateModal && editingBundle) {
                  return (
                    <>
                      {commonFields}
                      {renderBundlePreviewContent(editingBundle)}
                    </>
                  );
                }

                // ── Text / Link mode (default) ────────────────────────────
                return commonFields;
              })()}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                disabled={mutating}
                onClick={
                  showCreateModal
                    ? closeCreateModal
                    : () => {
                      setEditingBundle(null);
                      setSelectedBundleDocumentId(null);
                      setShowEditModal(false);
                    }
                }
                className={`px-4 py-2 rounded-lg disabled:opacity-40 ${isDark ? 'text-slate-300 hover:bg-white/10' : 'text-slate-700 hover:bg-slate-100'}`}
              >
                Cancel
              </button>
              <button
                disabled={mutating}
                onClick={showCreateModal ? onCreateMaterial : onUpdateMaterial}
                className="px-4 py-2 text-white rounded-lg disabled:opacity-60 flex items-center gap-2"
                style={{ backgroundColor: primaryHex }}
              >
                {mutating && <Loader2 size={15} className="animate-spin" />}
                {mutating
                  ? uploadType === 'video'
                    ? `Uploading ${uploadProgress}%`
                    : uploadType === 'file'
                      ? `Uploading ${uploadProgress}%`
                      : uploadType === 'bundle'
                        ? `Uploading ${uploadProgress}%`
                        : 'Saving...'
                  : showCreateModal
                    ? 'Create'
                    : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteDialog && (selectedMaterial || deletingBundle) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div
            className={`w-full max-w-sm rounded-xl p-6 shadow-xl ${isDark ? 'bg-slate-800 border border-white/10' : 'bg-white'}`}
          >
            <h3
              className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}
            >
              {deletingBundle ? 'Delete lecture bundle?' : 'Delete material?'}
            </h3>
            <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              {deletingBundle ? deletingBundle.baseTitle : selectedMaterial?.title}
            </p>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeletingBundle(null);
                }}
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

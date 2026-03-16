import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useApi } from '../../../hooks/useApi';
import { enrollmentService } from '../../../services/api/enrollmentService';
import {
  CourseMaterial,
  CourseMaterialsResponse,
  CourseStructureResponse,
  materialService,
  structureService,
} from '../../../services/api/courseService';
import { CleanSelect } from '../../../components/shared';
import { BookOpen, ChevronDown, Download, Eye, FileText, Loader2, PlayCircle } from 'lucide-react';

type WeekGroup = {
  key: string;
  label: string;
  materials: CourseMaterial[];
};

const groupLabel = (key: string) => (key === 'general' ? 'General / No Week' : `Week ${key}`);

export function LabInstructions() {
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [materialsResponse, setMaterialsResponse] = useState<CourseMaterialsResponse>({ data: [] });
  const [structureResponse, setStructureResponse] = useState<CourseStructureResponse>({
    data: [],
    byWeek: {},
  });
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [embedUrls, setEmbedUrls] = useState<Record<string, string>>({});

  const {
    data: enrolledCourses,
    loading: loadingCourses,
    error: coursesError,
  } = useApi(() => enrollmentService.getMyCourses(), []);

  useEffect(() => {
    if (!selectedCourseId && enrolledCourses?.length) {
      const first = enrolledCourses[0];
      setSelectedCourseId(String(first.course?.id || ''));
    }
  }, [enrolledCourses, selectedCourseId]);

  const fetchMaterialsAndStructure = useCallback(async (courseId: string) => {
    if (!courseId) return;
    setLoadingMaterials(true);
    try {
      const [materials, structure] = await Promise.all([
        materialService.getMaterials(courseId, { page: 1, limit: 100 }),
        structureService.getStructure(courseId),
      ]);
      setMaterialsResponse(materials || { data: [] });
      setStructureResponse(structure || { data: [], byWeek: {} });

      const initialExpanded: Record<string, boolean> = {};
      Object.keys(structure?.byWeek || {}).forEach((week) => {
        initialExpanded[week] = true;
      });
      initialExpanded.general = true;
      setExpandedWeeks(initialExpanded);
    } finally {
      setLoadingMaterials(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedCourseId) return;
    fetchMaterialsAndStructure(selectedCourseId);
  }, [selectedCourseId, fetchMaterialsAndStructure]);

  const publishedMaterials = useMemo(
    () => (materialsResponse.data || []).filter((material) => material.isPublished === 1),
    [materialsResponse.data]
  );

  const groupedByWeek = useMemo<WeekGroup[]>(() => {
    const byWeek = structureResponse.byWeek || {};
    const weekKeys = Object.keys(byWeek).sort((a, b) => Number(a) - Number(b));

    const groups: WeekGroup[] = weekKeys.map((weekKey) => {
      const weekNumber = Number(weekKey);
      const materials = publishedMaterials
        .filter((material) => {
          if (material.weekNumber === weekNumber) return true;
          const linkedIds = new Set(
            (byWeek[weekKey] || []).map((item) => item.materialId).filter(Boolean)
          );
          return linkedIds.has(material.materialId);
        })
        .sort((a, b) => Number(a.orderIndex || 0) - Number(b.orderIndex || 0));

      return { key: weekKey, label: groupLabel(weekKey), materials };
    });

    const generalMaterials = publishedMaterials
      .filter((material) => material.weekNumber == null)
      .sort((a, b) => Number(a.orderIndex || 0) - Number(b.orderIndex || 0));

    if (generalMaterials.length > 0) {
      groups.unshift({ key: 'general', label: groupLabel('general'), materials: generalMaterials });
    }

    return groups.filter((group) => group.materials.length > 0);
  }, [publishedMaterials, structureResponse.byWeek]);

  const handleTrackView = (materialId: string) => {
    if (!selectedCourseId) return;
    void materialService.trackView(selectedCourseId, materialId);
  };

  const handleDownload = (material: CourseMaterial) => {
    if (!selectedCourseId || !material.fileId) return;
    handleTrackView(material.materialId);
    const downloadUrl = materialService.getDownloadUrl(selectedCourseId, material.materialId);
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  const handleLoadEmbed = async (material: CourseMaterial) => {
    if (!selectedCourseId) return;
    handleTrackView(material.materialId);
    if (material.externalUrl) {
      setEmbedUrls((prev) => ({ ...prev, [material.materialId]: material.externalUrl || '' }));
      return;
    }

    try {
      const embed = await materialService.getEmbed(selectedCourseId, material.materialId);
      if (embed?.embedUrl) {
        setEmbedUrls((prev) => ({ ...prev, [material.materialId]: embed.embedUrl }));
      }
    } catch {
      // Keep silent for non-video material or missing embed.
    }
  };

  if (loadingCourses) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (coursesError) {
    return (
      <div
        className={`rounded-xl border p-4 ${isDark ? 'border-red-500/30 bg-red-500/10 text-red-200' : 'border-red-200 bg-red-50 text-red-700'}`}
      >
        Failed to load courses: {coursesError}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        className={`rounded-2xl border p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}
      >
        <div className="flex items-center justify-between gap-3">
          <h2 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Course Materials
          </h2>
          <CleanSelect
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className={`px-3 py-2 border rounded-lg ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-300'}`}
          >
            {(enrolledCourses || []).map((course) => {
              const value = String(course.course?.id || '');
              const label = `${course.course?.code || 'COURSE'} - ${course.course?.name || 'Course'}`;
              return (
                <option key={value} value={value}>
                  {label}
                </option>
              );
            })}
          </CleanSelect>
        </div>
        <p className={`text-sm mt-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Published materials are grouped by week. Open any item to track views.
        </p>
      </div>

      {loadingMaterials ? (
        <div
          className={`rounded-xl border p-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}
        >
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 size={16} className="animate-spin" />
            Loading materials...
          </div>
        </div>
      ) : groupedByWeek.length === 0 ? (
        <div
          className={`rounded-xl border p-8 text-center ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-white border-slate-200 text-slate-600'}`}
        >
          No published materials available for this course.
        </div>
      ) : (
        <div className="space-y-4">
          {groupedByWeek.map((group) => (
            <div
              key={group.key}
              className={`rounded-2xl border overflow-hidden ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}
            >
              <button
                onClick={() =>
                  setExpandedWeeks((prev) => ({ ...prev, [group.key]: !prev[group.key] }))
                }
                className={`w-full px-4 py-3 flex items-center justify-between ${isDark ? 'hover:bg-white/5 text-white' : 'hover:bg-slate-50 text-slate-900'}`}
              >
                <span className="font-semibold">{group.label}</span>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-600'}`}
                  >
                    {group.materials.length}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`${expandedWeeks[group.key] ? 'rotate-180' : ''} transition-transform`}
                  />
                </div>
              </button>

              {expandedWeeks[group.key] && (
                <div className="p-4 space-y-3">
                  {group.materials.map((material) => {
                    const videoSrc = embedUrls[material.materialId] || material.externalUrl || '';
                    return (
                      <div
                        key={material.materialId}
                        className={`rounded-xl border p-4 ${isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50/50'}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h4
                              className={`font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}
                            >
                              {material.title}
                            </h4>
                            <p
                              className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
                            >
                              {material.description || 'No description'}
                            </p>
                            <div
                              className={`flex items-center gap-3 mt-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                            >
                              <span>{material.materialType}</span>
                              <span>{material.viewCount || 0} views</span>
                              <span>{material.downloadCount || 0} downloads</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {material.materialType === 'video' && (
                              <button
                                onClick={() => handleLoadEmbed(material)}
                                className="px-3 py-1.5 rounded-lg text-white text-sm"
                                style={{ backgroundColor: accentColor }}
                              >
                                <span className="inline-flex items-center gap-1">
                                  <PlayCircle size={14} />
                                  View
                                </span>
                              </button>
                            )}

                            {material.fileId && (
                              <button
                                onClick={() => handleDownload(material)}
                                className={`px-3 py-1.5 rounded-lg text-sm ${isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
                              >
                                <span className="inline-flex items-center gap-1">
                                  <Download size={14} />
                                  Download
                                </span>
                              </button>
                            )}

                            {!material.fileId && material.materialType !== 'video' && (
                              <button
                                onClick={() => handleTrackView(material.materialId)}
                                className={`px-3 py-1.5 rounded-lg text-sm ${isDark ? 'bg-white/10 text-white hover:bg-white/15' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
                              >
                                <span className="inline-flex items-center gap-1">
                                  <Eye size={14} />
                                  Open
                                </span>
                              </button>
                            )}
                          </div>
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
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div
        className={`rounded-xl border p-4 ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}
      >
        <h3 className={`font-semibold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          <span className="inline-flex items-center gap-2">
            <BookOpen size={16} />
            Quick Tips
          </span>
        </h3>
        <ul className={`text-sm space-y-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          <li>1. Materials are grouped by week according to course structure.</li>
          <li>2. Only published items are shown in this view.</li>
          <li>3. Views are tracked automatically when you open material content.</li>
        </ul>
      </div>
    </div>
  );
}

export default LabInstructions;

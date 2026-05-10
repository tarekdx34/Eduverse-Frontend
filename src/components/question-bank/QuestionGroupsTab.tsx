import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { 
  Plus, 
  MoreVertical, 
  Trash2, 
  Eye, 
  Pencil, 
  AlertCircle, 
  RotateCw,
  Search,
  BookOpen,
  LayoutGrid,
  FileText,
  Files,
  Image as ImageIcon,
  MousePointer2,
  Layers,
} from 'lucide-react';
import QuestionGroupService from '../../services/api/questionGroupService';
import ChapterService, { CourseChapter } from '../../services/api/chapterService';
import { ConfirmDialog, EmptyState, LoadingSkeleton, StatusBadge } from '../shared/index';
import { GroupFormModal } from './GroupFormModal';
import { GroupDetailModal } from './GroupDetailModal';
import { useTheme } from '../../pages/instructor-dashboard/contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface QuestionGroupsTabProps {
  courses: Array<{ value: string; label: string }>;
  selectedCourse: string;
}

interface QuestionGroup {
  id: number;
  title: string;
  groupType: string;
  chapterId?: number;
  chapter?: { id: number; name: string };
  questionCount: number;
  createdAt: string;
  sharedImageFileId?: number;
}

const GROUP_TYPE_OPTIONS = [
  { value: 'passage', label: 'Passage' },
  { value: 'case_study', label: 'Case Study' },
  { value: 'image_set', label: 'Image Set' },
  { value: 'multipart', label: 'Multipart' },
  { value: 'other', label: 'Other' },
];

export function QuestionGroupsTab({ courses, selectedCourse }: QuestionGroupsTabProps) {
  const [groups, setGroups] = useState<QuestionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupTypes, setSelectedGroupTypes] = useState<Set<string>>(new Set());
  const [selectedChapterId, setSelectedChapterId] = useState<number | undefined>(undefined);
  const [chapters, setChapters] = useState<CourseChapter[]>([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalGroups, setTotalGroups] = useState(0);
  const pageSize = 20;

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [selectedDetailGroupId, setSelectedDetailGroupId] = useState<number | null>(null);

  const [editingGroup, setEditingGroup] = useState<QuestionGroup | null>(null);
  const [openEditModal, setOpenEditModal] = useState(false);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  const { isDark, primaryHex } = useTheme();
  const headingClass = isDark ? 'text-white' : 'text-gray-900';
  const subTextClass = isDark ? 'text-slate-400' : 'text-gray-500';
  const cardClass = isDark ? 'bg-[#1e293b] border-white/10' : 'bg-white border-gray-200';
  const innerCardClass = isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200';
  const secondaryButtonClass = isDark 
    ? 'border-white/10 text-slate-300 hover:bg-white/10' 
    : 'border-gray-300 text-gray-700 hover:bg-gray-100';

  const courseId = selectedCourse ? Number(selectedCourse) : undefined;

  const loadGroups = useCallback(async () => {
    if (!courseId) return;

    try {
      setIsLoading(true);
      setError(null);

      const groupTypeFilter =
        selectedGroupTypes.size > 0 ? Array.from(selectedGroupTypes).join(',') : undefined;

      const response = await QuestionGroupService.list({
        courseId,
        chapterId: selectedChapterId,
        page: currentPage,
        limit: pageSize,
        search: searchQuery || undefined,
        groupType: groupTypeFilter as any,
      }) as any;

      const data = Array.isArray(response) ? response : (response?.data ?? []);
      const total = response?.total ?? data.length;

      setGroups(data as QuestionGroup[]);
      setTotalGroups(total);
    } catch (err) {
      console.error('Failed to load groups:', err);
      setError('Failed to load question groups');
    } finally {
      setIsLoading(false);
    }
  }, [courseId, currentPage, searchQuery, selectedGroupTypes, selectedChapterId]);

  useEffect(() => {
    if (!courseId) {
      setChapters([]);
      return;
    }
    setIsLoadingChapters(true);
    ChapterService.listByCourse(courseId)
      .then(data => setChapters(Array.isArray(data) ? data : []))
      .catch(() => setChapters([]))
      .finally(() => setIsLoadingChapters(false));
  }, [courseId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCourse, searchQuery, selectedGroupTypes, selectedChapterId]);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  const handleDeleteGroup = async () => {
    if (confirmDeleteId === null) return;

    try {
      await QuestionGroupService.delete(confirmDeleteId);
      toast.success('Group deleted successfully');
      setConfirmDeleteId(null);
      loadGroups();
    } catch (err) {
      console.error('Failed to delete group:', err);
      toast.error('Failed to delete group');
    }
  };

  const handleOpenDetail = (groupId: number) => {
    setSelectedDetailGroupId(groupId);
    setOpenDetailModal(true);
    setOpenMenuId(null);
  };

  const handleOpenEdit = (group: QuestionGroup) => {
    setEditingGroup(group);
    setOpenEditModal(true);
    setOpenMenuId(null);
  };

  const toggleGroupType = (type: string) => {
    const newSet = new Set(selectedGroupTypes);
    if (newSet.has(type)) {
      newSet.delete(type);
    } else {
      newSet.add(type);
    }
    setSelectedGroupTypes(newSet);
  };

  const getGroupTypeBadgeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      passage: isDark 
        ? 'border-blue-500/30 bg-blue-500/10 text-blue-400' 
        : 'border-blue-200 bg-blue-50 text-blue-700',
      case_study: isDark 
        ? 'border-purple-500/30 bg-purple-500/10 text-purple-400' 
        : 'border-purple-200 bg-purple-50 text-purple-700',
      image_set: isDark 
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-400' 
        : 'border-amber-200 bg-amber-50 text-amber-700',
      multipart: isDark 
        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400' 
        : 'border-emerald-200 bg-emerald-50 text-emerald-700',
      other: isDark
        ? 'border-slate-500/30 bg-slate-500/10 text-slate-300'
        : 'border-slate-200 bg-slate-50 text-slate-700',
    };
    return colorMap[type] || (isDark ? 'border-white/10 bg-white/5 text-slate-400' : 'border-gray-200 bg-gray-50 text-gray-600');
  };

  const getGroupTypeIcon = (type: string) => {
    switch (type) {
      case 'passage': return <FileText size={12} />;
      case 'case_study': return <BookOpen size={12} />;
      case 'image_set': return <ImageIcon size={12} />;
      case 'multipart': return <Files size={12} />;
      case 'other': return <Layers size={12} />;
      default: return <LayoutGrid size={12} />;
    }
  };

  const formatEnumLabel = (value?: string) => {
    if (!value) return 'N/A';
    if (value.toLowerCase() === 'mcq') return 'MCQ';
    return value.split('_').filter(Boolean).map((p) => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join(' ');
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(startIndex + pageSize - 1, totalGroups);

  if (!courseId) {
    return (
      <div className={`p-12 text-center rounded-xl border-2 border-dashed ${isDark ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-gray-50/30'}`}>
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${isDark ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
          <MousePointer2 size={32} />
        </div>
        <h3 className={`text-lg font-semibold mb-2 ${headingClass}`}>No Course Selected</h3>
        <p className={`max-w-xs mx-auto text-sm leading-relaxed ${subTextClass}`}>
          Please choose a course from the selector above to manage its question groups.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpenCreateModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-sm"
            style={{ backgroundColor: primaryHex }}
          >
            <Plus size={16} />
            Create Group
          </button>
          
          <div className="h-8 w-px bg-gray-200 dark:bg-white/10 hidden sm:block" />
          
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
            {GROUP_TYPE_OPTIONS.map((option) => {
              const active = selectedGroupTypes.has(option.value);
              return (
                <button
                  key={option.value}
                  onClick={() => toggleGroupType(option.value)}
                  className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    active
                      ? 'bg-white dark:bg-white/10 shadow-sm text-gray-900 dark:text-white'
                      : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedChapterId ?? ''}
            onChange={(e) => setSelectedChapterId(e.target.value ? Number(e.target.value) : undefined)}
            disabled={isLoadingChapters || chapters.length === 0}
            className={`w-full sm:w-48 px-3 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 ${
              isDark 
                ? 'bg-white/5 border-white/10 text-slate-200 focus:ring-white/20' 
                : 'bg-white border-gray-300 text-gray-700 focus:ring-blue-500/20'
            }`}
          >
            <option value="">All Chapters</option>
            {chapters.map((ch) => (
              <option key={ch.id} value={ch.id}>
                {ch.name}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-64">
            <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${subTextClass}`} size={16} />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full pl-9 pr-4 py-2 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 ${
                isDark 
                  ? 'bg-white/5 border-white/10 text-white placeholder-slate-500 focus:ring-white/20' 
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-blue-500/20'
              }`}
            />
          </div>
        </div>
      </section>

      {/* Content */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-500/30">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium text-red-900 dark:text-red-200">{error}</p>
            <button
              onClick={loadGroups}
              className="text-sm text-red-700 dark:text-red-300 hover:underline mt-2 flex items-center gap-1"
            >
              <RotateCw size={14} />
              Try Again
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : groups.length === 0 ? (
        <EmptyState
          title="No question groups yet"
          description="Create a new group to organize your questions into passages, case studies, or multipart sets"
          action={
            <button
              onClick={() => setOpenCreateModal(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600"
            >
              Create Group
            </button>
          }
        />
      ) : (
        <>
          {/* Table */}
          <div className={`overflow-hidden rounded-xl border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50/50'}`}>
                  <th className={`text-left py-4 px-4 font-bold uppercase tracking-widest text-[10px] ${subTextClass} w-12`}>#</th>
                  <th className={`text-left py-4 px-4 font-bold uppercase tracking-widest text-[10px] ${subTextClass} min-w-48`}>
                    Title
                  </th>
                  <th className={`text-left py-4 px-4 font-bold uppercase tracking-widest text-[10px] ${subTextClass}`}>Type</th>
                  <th className={`text-left py-4 px-4 font-bold uppercase tracking-widest text-[10px] ${subTextClass}`}>Chapter</th>
                  <th className={`text-center py-4 px-4 font-bold uppercase tracking-widest text-[10px] ${subTextClass}`}>
                    Questions
                  </th>
                  <th className={`text-left py-4 px-4 font-bold uppercase tracking-widest text-[10px] ${subTextClass}`}>Created</th>
                  <th className={`text-right py-4 px-4 font-bold uppercase tracking-widest text-[10px] ${subTextClass}`}>Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-gray-100'}`}>
                {groups.map((group, idx) => (
                  <tr
                    key={group.id}
                    className={`transition-colors hover:bg-gray-50/50 dark:hover:bg-white/5`}
                  >
                    <td className={`py-4 px-4 ${subTextClass} font-medium`}>
                      {startIndex + idx}
                    </td>
                    <td className="py-4 px-4">
                      <p className={`font-semibold ${headingClass}`}>{group.title}</p>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${getGroupTypeBadgeColor(
                          group.groupType,
                        )}`}
                      >
                        {getGroupTypeIcon(group.groupType)}
                        {formatEnumLabel(group.groupType)}
                      </span>
                    </td>
                    <td className={`py-4 px-4 ${subTextClass}`}>
                      {group.chapter?.name || <span className="opacity-50">—</span>}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center justify-center min-w-[2rem] px-2 py-1 rounded-lg text-xs font-bold border ${innerCardClass} ${headingClass}`}>
                        {group.questionCount}
                      </span>
                    </td>
                    <td className={`py-4 px-4 ${subTextClass}`}>
                      {formatDate(group.createdAt)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className={`p-2 rounded-lg border transition-colors ${secondaryButtonClass}`}
                          >
                            <MoreVertical size={16} />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleOpenDetail(group.id)}>
                            <Eye size={14} className="mr-2" />
                            View / Edit Questions
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleOpenEdit(group)}>
                            <Pencil size={14} className="mr-2" />
                            Edit Group
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setConfirmDeleteId(group.id)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10"
                          >
                            <Trash2 size={14} className="mr-2" />
                            Delete Group
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Info */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 px-4">
            <p>
              Showing {startIndex}–{endIndex} of {totalGroups} groups
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1.5">
                Page {currentPage} of {Math.ceil(totalGroups / pageSize)}
              </span>
              <button
                onClick={() =>
                  setCurrentPage(
                    Math.min(Math.ceil(totalGroups / pageSize), currentPage + 1),
                  )
                }
                disabled={currentPage >= Math.ceil(totalGroups / pageSize)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      <GroupFormModal
        open={openCreateModal}
        onOpenChange={setOpenCreateModal}
        courseId={courseId}
        onSuccess={loadGroups}
      />

      {openEditModal && editingGroup && (
        <GroupFormModal
          open={openEditModal}
          onOpenChange={setOpenEditModal}
          courseId={courseId}
          group={editingGroup}
          onSuccess={loadGroups}
        />
      )}

      {openDetailModal && selectedDetailGroupId !== null && (
        <GroupDetailModal
          open={openDetailModal}
          onOpenChange={setOpenDetailModal}
          groupId={selectedDetailGroupId}
          courseId={courseId}
          onGroupUpdated={loadGroups}
        />
      )}

      {confirmDeleteId !== null && (
        <ConfirmDialog
          open={confirmDeleteId !== null}
          onOpenChange={(open) => !open && setConfirmDeleteId(null)}
          title="Delete Group"
          message="Deleting this group keeps all questions in the question bank. Are you sure?"
          onConfirm={handleDeleteGroup}
          danger={true}
        />
      )}
    </div>
  );
}

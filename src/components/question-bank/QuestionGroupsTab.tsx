import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Plus, MoreVertical, Trash2, Eye, Pencil, AlertCircle, RotateCw } from 'lucide-react';
import QuestionGroupService from '../../services/api/questionGroupService';
import { SearchInput, ConfirmDialog, EmptyState, LoadingSkeleton, StatusBadge } from '../shared/index';
import { GroupFormModal } from './GroupFormModal';
import { GroupDetailModal } from './GroupDetailModal';

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
];

export function QuestionGroupsTab({ courses, selectedCourse }: QuestionGroupsTabProps) {
  const [groups, setGroups] = useState<QuestionGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupTypes, setSelectedGroupTypes] = useState<Set<string>>(new Set());
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
  }, [courseId, currentPage, searchQuery, selectedGroupTypes]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCourse, searchQuery, selectedGroupTypes]);

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
      passage: 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
      case_study: 'bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300',
      image_set: 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
      multipart: 'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-300';
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
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <p>Please select a course to view question groups</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          onClick={() => setOpenCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 self-start"
        >
          <Plus size={18} />
          Create Group
        </button>

        <SearchInput
          placeholder="Search by group title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </section>

      {/* Filter Chips */}
      <section className="flex flex-wrap gap-2">
        {GROUP_TYPE_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => toggleGroupType(option.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedGroupTypes.has(option.value)
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {option.label}
          </button>
        ))}
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
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 w-12">#</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 min-w-48">
                    Title
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Chapter</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-center">
                    Questions
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Created</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group, idx) => (
                  <tr
                    key={group.id}
                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {startIndex + idx}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{group.title}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${getGroupTypeBadgeColor(
                          group.groupType,
                        )}`}
                      >
                        {group.groupType.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {group.chapter?.name || 'N/A'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                        {group.questionCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                      {formatDate(group.createdAt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="relative inline-block">
                        <button
                          onClick={() =>
                            setOpenMenuId(openMenuId === group.id ? null : group.id)
                          }
                          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          <MoreVertical size={16} className="text-gray-600 dark:text-gray-400" />
                        </button>

                        {openMenuId === group.id && (
                          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 min-w-40">
                            <button
                              onClick={() => handleOpenDetail(group.id)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                            >
                              <Eye size={14} />
                              View / Edit Questions
                            </button>
                            <button
                              onClick={() => handleOpenEdit(group)}
                              className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 text-gray-700 dark:text-gray-300"
                            >
                              <Pencil size={14} />
                              Edit Group
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(group.id)}
                              className="w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 text-red-600 dark:text-red-400"
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
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

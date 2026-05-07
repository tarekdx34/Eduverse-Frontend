import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { X, Upload, Trash2 } from 'lucide-react';
import QuestionGroupService from '../../services/api/questionGroupService';
import ChapterService, { CourseChapter } from '../../services/api/chapterService';
import { AccessibleModal } from '../shared/AccessibleModal';

interface GroupFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId?: number;
  group?: any;
  onSuccess: () => void;
}

type GroupFormData = {
  title: string;
  description: string;
  groupType: 'passage' | 'case_study' | 'image_set' | 'multipart';
  chapterId?: number;
};

const GROUP_TYPE_OPTIONS = [
  { value: 'passage', label: 'Passage' },
  { value: 'case_study', label: 'Case Study' },
  { value: 'image_set', label: 'Image Set' },
  { value: 'multipart', label: 'Multipart' },
];

export function GroupFormModal({ open, onOpenChange, courseId, group, onSuccess }: GroupFormModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    reset,
    setValue,
  } = useForm<GroupFormData>({
    defaultValues: {
      title: '',
      description: '',
      groupType: 'passage',
      chapterId: undefined,
    },
  });

  const [chapters, setChapters] = useState<CourseChapter[]>([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [sharedImageFileId, setSharedImageFileId] = useState<number | null>(null);
  const [sharedImagePreview, setSharedImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const descriptionValue = watch('description');

  useEffect(() => {
    if (open && courseId) {
      loadChapters();
    }
  }, [open, courseId]);

  useEffect(() => {
    if (open && group) {
      reset({
        title: group.title || '',
        description: group.description || '',
        groupType: group.groupType || 'passage',
        chapterId: group.chapterId,
      });
      if (group.sharedImageFileId) {
        setSharedImageFileId(group.sharedImageFileId);
        loadImagePreview(group.sharedImageFileId);
      }
    } else if (open) {
      reset({
        title: '',
        description: '',
        groupType: 'passage',
        chapterId: undefined,
      });
      setSharedImageFileId(null);
      setSharedImagePreview(null);
    }
  }, [open, group, reset]);

  const loadChapters = async () => {
    if (!courseId) return;
    try {
      setIsLoadingChapters(true);
      const data = await ChapterService.listByCourse(courseId);
      setChapters(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load chapters:', error);
      toast.error('Failed to load chapters');
    } finally {
      setIsLoadingChapters(false);
    }
  };

  const loadImagePreview = async (fileId: number) => {
    try {
      const blob = await QuestionGroupService.downloadGroupImage(fileId);
      if (blob) {
        const url = URL.createObjectURL(blob);
        setSharedImagePreview(url);
      }
    } catch (error) {
      console.error('Failed to load image preview:', error);
    }
  };

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (event) => {
      setSharedImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload the image
    try {
      setIsUploadingImage(true);
      const result = await QuestionGroupService.uploadGroupImage(file);
      setSharedImageFileId(result.fileId);
      setImageFile(file);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Failed to upload image:', error);
      toast.error('Failed to upload image');
      setSharedImagePreview(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setSharedImageFileId(null);
    setSharedImagePreview(null);
    setImageFile(null);
  };

  const onSubmit = async (data: GroupFormData) => {
    try {
      const payload = {
        title: data.title,
        description: data.description,
        groupType: data.groupType,
        chapterId: data.chapterId ? Number(data.chapterId) : undefined,
        sharedImageFileId: sharedImageFileId || undefined,
      };

      if (group?.id) {
        // Edit mode
        await QuestionGroupService.update(group.id, payload);
        toast.success('Group updated successfully');
      } else {
        // Create mode
        if (!courseId) {
          toast.error('Course ID is required');
          return;
        }
        const createPayload = { ...payload, courseId };
        await QuestionGroupService.create(createPayload);
        toast.success('Group created successfully');
      }

      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error('Failed to save group:', error);
      toast.error(group?.id ? 'Failed to update group' : 'Failed to create group');
    }
  };

  return (
    <AccessibleModal isOpen={open} onClose={() => onOpenChange(false)} title={group?.id ? 'Edit Question Group' : 'Create Question Group'}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 3, message: 'Title must be at least 3 characters' },
            })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Physics Chapter 5 Passage"
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        {/* Group Type */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Group Type <span className="text-red-500">*</span>
          </label>
          <select
            {...register('groupType')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {GROUP_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Chapter */}
        {courseId && (
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
              Chapter
            </label>
            <select
              {...register('chapterId')}
              disabled={isLoadingChapters}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
            >
              <option value="">Select a chapter (optional)</option>
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Description / Shared Passage */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Description / Shared Passage
          </label>
          <textarea
            {...register('description')}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter the shared passage, case study, or description..."
            rows={6}
          />
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {descriptionValue.length} characters
          </div>
        </div>

        {/* Shared Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
            Shared Image
          </label>
          {sharedImagePreview ? (
            <div className="space-y-3">
              <div className="relative inline-block">
                <img
                  src={sharedImagePreview}
                  alt="Shared group image"
                  className="max-w-sm h-auto rounded-lg border border-gray-300 dark:border-gray-600"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                  disabled={isUploadingImage}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={isUploadingImage}
                  className="text-sm text-gray-500 dark:text-gray-400 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 dark:file:bg-blue-500/20 dark:file:text-blue-300 hover:file:bg-blue-100 disabled:opacity-50"
                />
              </label>
            </div>
          ) : (
            <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-gray-500">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={isUploadingImage}
                className="hidden"
              />
              <div className="flex flex-col items-center">
                <Upload size={24} className="text-gray-400 dark:text-gray-500 mb-2" />
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {isUploadingImage ? 'Uploading...' : 'Click to upload image'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG or GIF</p>
              </div>
            </label>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploadingImage}
            className="px-4 py-2 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : group?.id ? 'Update Group' : 'Create Group'}
          </button>
        </div>
      </form>
    </AccessibleModal>
  );
}

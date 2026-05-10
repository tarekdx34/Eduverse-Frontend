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
  sharedPrompt: string;
  sharedFileCaption: string;
  sharedFileAltText: string;
  groupType: 'passage' | 'case_study' | 'image_set' | 'multipart' | 'other';
  chapterId?: number;
};

const GROUP_TYPE_OPTIONS = [
  { value: 'passage', label: 'Passage' },
  { value: 'case_study', label: 'Case Study' },
  { value: 'image_set', label: 'Image Set' },
  { value: 'multipart', label: 'Multipart' },
  { value: 'other', label: 'Other' },
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
      sharedPrompt: '',
      sharedFileCaption: '',
      sharedFileAltText: '',
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

  const sharedPromptValue = watch('sharedPrompt');

  useEffect(() => {
    if (open && courseId) {
      loadChapters();
    }
  }, [open, courseId]);

  useEffect(() => {
    if (open && group) {
      reset({
        title: group.title || '',
        sharedPrompt: group.sharedPrompt || group.description || '',
        sharedFileCaption: group.sharedFileCaption || '',
        sharedFileAltText: group.sharedFileAltText || '',
        groupType: group.groupType || 'passage',
        chapterId: group.chapterId,
      });
      const sharedFileId = group.sharedFileId || group.sharedImageFileId;
      if (sharedFileId) {
        setSharedImageFileId(sharedFileId);
        loadImagePreview(sharedFileId);
      }
    } else if (open) {
      reset({
        title: '',
        sharedPrompt: '',
        sharedFileCaption: '',
        sharedFileAltText: '',
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

  const isDark = document.documentElement.classList.contains('dark');
  const headingClass = isDark ? 'text-slate-100' : 'text-slate-900';
  const subTextClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderColor = isDark ? 'border-white/10' : 'border-slate-200';
  const bgSoft = isDark ? 'bg-white/5' : 'bg-slate-50';
  const inputClass = `w-full px-4 py-2.5 rounded-xl border transition-all focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none ${
    isDark ? 'bg-white/5 border-white/10 text-slate-100 placeholder:text-slate-600' : 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400'
  }`;

  const onSubmit = async (data: GroupFormData) => {
    try {
      const payload = {
        title: data.title,
        sharedPrompt: data.sharedPrompt,
        sharedFileCaption: data.sharedFileCaption || undefined,
        sharedFileAltText: data.sharedFileAltText || undefined,
        groupType: data.groupType,
        chapterId: data.chapterId ? Number(data.chapterId) : undefined,
        sharedFileId: sharedImageFileId || undefined,
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
        {/* Title */}
        <div className="space-y-2">
          <label className={`block text-xs font-bold uppercase tracking-widest ${subTextClass}`}>
            Group Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            {...register('title', {
              required: 'Title is required',
              minLength: { value: 3, message: 'Title must be at least 3 characters' },
            })}
            className={inputClass}
            placeholder="e.g., Physics Chapter 5 Passage"
          />
          {errors.title && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Group Type */}
          <div className="space-y-2">
            <label className={`block text-xs font-bold uppercase tracking-widest ${subTextClass}`}>
              Structure Type <span className="text-rose-500">*</span>
            </label>
            <select
              {...register('groupType')}
              className={inputClass}
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
            <div className="space-y-2">
              <label className={`block text-xs font-bold uppercase tracking-widest ${subTextClass}`}>
                Link to Chapter
              </label>
              <select
                {...register('chapterId')}
                disabled={isLoadingChapters}
                className={inputClass}
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
        </div>

        {/* Description / Shared Passage */}
        <div className="space-y-2">
          <label className={`block text-xs font-bold uppercase tracking-widest ${subTextClass}`}>
            Content / Shared Passage
          </label>
          <textarea
            {...register('sharedPrompt')}
            className={`${inputClass} min-h-[160px] resize-none`}
            placeholder="Enter the shared passage, case study, or group description..."
          />
          <div className={`text-[10px] font-bold uppercase tracking-widest flex justify-end ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            {sharedPromptValue.length} characters
          </div>
        </div>

        {/* Shared Image Upload */}
        <div className="space-y-2">
          <label className={`block text-xs font-bold uppercase tracking-widest ${subTextClass}`}>
            Shared Visual Asset
          </label>
          {sharedImagePreview ? (
            <div className="space-y-4">
              <div className={`relative inline-block p-1 rounded-2xl border ${borderColor} ${bgSoft}`}>
                <img
                  src={sharedImagePreview}
                  alt="Shared group image"
                  className="max-w-md h-auto rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 p-1.5 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-transform hover:scale-110"
                  disabled={isUploadingImage}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={isUploadingImage}
                  className={`text-xs ${subTextClass} file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-widest ${
                    isDark ? 'file:bg-white/5 file:text-slate-300' : 'file:bg-slate-100 file:text-slate-700'
                  } hover:file:opacity-80 transition-all`}
                />
              </label>
            </div>
          ) : (
            <label className={`flex items-center justify-center w-full min-h-[120px] border-2 border-dashed rounded-2xl cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] ${
              isDark ? 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]' : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100'
            }`}>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                disabled={isUploadingImage}
                className="hidden"
              />
              <div className="flex flex-col items-center py-6">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
                  <Upload size={20} />
                </div>
                <p className={`text-sm font-semibold ${headingClass}`}>
                  {isUploadingImage ? 'Uploading asset...' : 'Upload group image'}
                </p>
                <p className={`text-[10px] font-bold uppercase tracking-widest mt-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  PNG, JPG or GIF (max 5MB)
                </p>
              </div>
            </label>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className={`block text-xs font-bold uppercase tracking-widest ${subTextClass}`}>
              Image Caption
            </label>
            <input
              type="text"
              {...register('sharedFileCaption')}
              className={inputClass}
              placeholder="Optional caption shown with the shared visual"
            />
          </div>
          <div className="space-y-2">
            <label className={`block text-xs font-bold uppercase tracking-widest ${subTextClass}`}>
              Image Alt Text
            </label>
            <input
              type="text"
              {...register('sharedFileAltText')}
              className={inputClass}
              placeholder="Describe the image for accessibility"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className={`flex gap-3 justify-end pt-6 border-t ${borderColor}`}>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
              isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-50'
            }`}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || isUploadingImage}
            className={`px-8 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 ${
              isDark ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
            }`}
          >
            {isSubmitting ? 'Saving...' : group?.id ? 'Update Group' : 'Create Group'}
          </button>
        </div>
      </form>
    </AccessibleModal>
  );
}

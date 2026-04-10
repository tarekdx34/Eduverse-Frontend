import React, { useState, useEffect } from 'react';
import { X, Save, FileText } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'sonner';
import { LabFormData, DEFAULT_LAB_FORM, LabStatus } from './types';

interface Course {
  id: string;
  name: string;
  code: string;
}

interface LabCreateProps {
  isOpen: boolean;
  courses: Course[];
  onSave: (data: LabFormData, instructionFiles?: File[]) => Promise<void>;
  onClose: () => void;
}

export function LabCreate({ isOpen, courses, onSave, onClose }: LabCreateProps) {
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<LabFormData>(DEFAULT_LAB_FORM);
  const [pendingInstructionFiles, setPendingInstructionFiles] = useState<File[]>([]);

  useEffect(() => {
    if (isOpen) {
      setFormData(DEFAULT_LAB_FORM);
      setPendingInstructionFiles([]);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.courseId.trim()) {
      toast.error(t('courseRequired') || 'Please select a course');
      return;
    }

    if (!formData.title.trim()) {
      toast.error(t('titleRequired') || 'Title is required');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...formData,
        dueDate: formData.dueDate || '',
        availableFrom: formData.availableFrom || '',
      }, pendingInstructionFiles);
      onClose();
    } catch (error) {
      console.error('Error saving lab:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    field: keyof LabFormData,
    value: string | number
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleInstructionFilesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    if (selected.length === 0) return;

    setPendingInstructionFiles((prev) => {
      const existingKeys = new Set(prev.map((file) => `${file.name}-${file.size}-${file.lastModified}`));
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

    event.target.value = '';
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-colors ${
        isDark
          ? 'bg-slate-950/45 backdrop-blur-[2px]'
          : 'bg-slate-900/20 backdrop-blur-sm'
      }`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="lab-create-modal-title"
    >
      <div
        className={`w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg ${
          isDark ? 'bg-slate-900' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}
        >
          <h2
            id="lab-create-modal-title"
            className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {t('createNewLab') || 'Create New Lab'}
          </h2>
          <button
            onClick={onClose}
            aria-label={t('close') || 'Close'}
            className={`p-1 rounded hover:bg-opacity-20 transition-colors ${
              isDark ? 'text-slate-400 hover:bg-white' : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Course Selection */}
          <div>
            <label
              htmlFor="lab-course"
              className={`block text-sm font-medium mb-1 ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}
            >
              {t('course') || 'Course'} *
            </label>
            <select
              id="lab-course"
              value={formData.courseId}
              onChange={(e) => handleChange('courseId', e.target.value)}
              required
              aria-required="true"
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/40'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
            >
              <option value="">{t('selectCourse') || 'Select a course...'}</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label
              htmlFor="lab-title"
              className={`block text-sm font-medium mb-1 ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}
            >
              {t('title') || 'Title'} *
            </label>
            <input
              id="lab-title"
              type="text"
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
              aria-required="true"
              placeholder={t('enterLabTitle') || 'Enter lab title'}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/40'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="lab-description"
              className={`block text-sm font-medium mb-1 ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}
            >
              {t('description') || 'Description'}
            </label>
            <textarea
              id="lab-description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={3}
              placeholder={t('enterLabDescription') || 'Enter lab description...'}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors resize-none ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white placeholder-white/40'
                  : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
              }`}
            />
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="lab-available-from"
                className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}
              >
                {t('availableFrom') || 'Available From'}
              </label>
              <input
                id="lab-available-from"
                type="datetime-local"
                value={formData.availableFrom}
                onChange={(e) => handleChange('availableFrom', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="lab-due-date"
                className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}
              >
                {t('dueDate') || 'Due Date'}
              </label>
              <input
                id="lab-due-date"
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => handleChange('dueDate', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Score & Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="lab-max-score"
                className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}
              >
                {t('maxScore') || 'Max Score'}
              </label>
              <input
                id="lab-max-score"
                type="number"
                min="0"
                value={formData.maxScore}
                onChange={(e) => handleChange('maxScore', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
            </div>
            <div>
              <label
                htmlFor="lab-weight"
                className={`block text-sm font-medium mb-1 ${
                  isDark ? 'text-slate-300' : 'text-gray-700'
                }`}
              >
                {t('weight') || 'Weight'}
              </label>
              <input
                id="lab-weight"
                type="number"
                min="0"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'border-gray-300 bg-white text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label
              htmlFor="lab-status"
              className={`block text-sm font-medium mb-1 ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}
            >
              {t('status') || 'Status'}
            </label>
            <select
              id="lab-status"
              value={formData.status}
              onChange={(e) => handleChange('status', e.target.value as LabStatus)}
              aria-label={t('status') || 'Status'}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'border-gray-300 bg-white text-gray-900'
              }`}
            >
              <option value="draft">{t('draft') || 'Draft'}</option>
              <option value="published">{t('published') || 'Published'}</option>
              <option value="closed">{t('closed') || 'Closed'}</option>
            </select>
          </div>

          {/* Instruction Files */}
          <div
            className={`rounded-lg border p-4 ${
              isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <FileText className={`w-4 h-4 ${isDark ? 'text-slate-300' : 'text-gray-700'}`} />
              <h3 className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-gray-800'}`}>
                {t('uploadInstructions') || 'Instruction Files'}
              </h3>
            </div>

            <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
              Files selected here will upload automatically after the lab is created.
            </p>

            <input
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
              onChange={handleInstructionFilesChange}
              className={`w-full text-sm file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:text-white file:cursor-pointer ${
                isDark
                  ? 'text-slate-300 file:bg-slate-600'
                  : 'text-gray-700 file:bg-indigo-600'
              }`}
            />

            {pendingInstructionFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {pendingInstructionFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg ${
                      isDark ? 'bg-white/5' : 'bg-white'
                    }`}
                  >
                    <span
                      className={`text-sm truncate ${isDark ? 'text-slate-200' : 'text-gray-700'}`}
                      title={file.name}
                    >
                      {index + 1}. {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingInstructionFiles((prev) =>
                          prev.filter((_, fileIndex) => fileIndex !== index)
                        )
                      }
                      className={`p-1 rounded ${
                        isDark
                          ? 'text-slate-400 hover:bg-white/10'
                          : 'text-gray-500 hover:bg-gray-200'
                      }`}
                      aria-label={`Remove ${file.name}`}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark
                  ? 'text-slate-300 hover:bg-white/10'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t('cancel') || 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors hover:opacity-90 disabled:opacity-70"
              style={{ backgroundColor: primaryHex }}
            >
              <Save className="w-4 h-4" />
              {saving ? t('saving') || 'Saving...' : t('save') || 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

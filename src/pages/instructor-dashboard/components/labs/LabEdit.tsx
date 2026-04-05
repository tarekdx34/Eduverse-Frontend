import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { toast } from 'sonner';
import { Lab, LabFormData, LabStatus } from './types';

interface Course {
  id: string;
  name: string;
  code: string;
}

interface LabEditProps {
  isOpen: boolean;
  lab: Lab | null;
  courses: Course[];
  onSave: (data: Partial<Lab>) => Promise<void>;
  onClose: () => void;
}

export function LabEdit({ isOpen, lab, courses, onSave, onClose }: LabEditProps) {
  const { isDark, primaryHex = '#3b82f6' } = useTheme() as any;
  const { t } = useLanguage();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<LabFormData>({
    courseId: '',
    title: '',
    description: '',
    dueDate: '',
    availableFrom: '',
    maxScore: '100',
    weight: '10',
    status: 'draft',
  });

  // Update form data when lab changes
  useEffect(() => {
    if (lab && isOpen) {
      setFormData({
        courseId: lab.courseId || '',
        title: lab.title || '',
        description: lab.description || '',
        dueDate: lab.dueDate ? lab.dueDate.slice(0, 16) : '',
        availableFrom: lab.availableFrom ? lab.availableFrom.slice(0, 16) : '',
        maxScore: lab.maxScore || '100',
        weight: lab.weight || '10',
        status: lab.status || 'draft',
      });
    }
  }, [lab, isOpen]);

  if (!isOpen || !lab) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error(t('titleRequired') || 'Title is required');
      return;
    }

    setSaving(true);
    try {
      await onSave({
        ...formData,
        dueDate: formData.dueDate || null,
        availableFrom: formData.availableFrom || null,
      });
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

  const currentCourse = courses.find((c) => c.id === formData.courseId);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="lab-edit-modal-title"
    >
      <div className={`rounded-lg max-w-lg w-full ${isDark ? 'bg-slate-900' : 'bg-white'}`}>
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDark ? 'border-white/10' : 'border-gray-200'
          }`}
        >
          <h2
            id="lab-edit-modal-title"
            className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}
          >
            {t('editLab') || 'Edit Lab'}
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
          {/* Course Info - Read Only */}
          <div>
            <label
              htmlFor="lab-course-readonly"
              className={`block text-sm font-medium mb-1 ${
                isDark ? 'text-slate-300' : 'text-gray-700'
              }`}
            >
              {t('course') || 'Course'}
            </label>
            <div
              id="lab-course-readonly"
              className={`w-full px-3 py-2 border rounded-lg ${
                isDark
                  ? 'bg-white/5 border-white/10 text-slate-400'
                  : 'border-gray-300 bg-gray-50 text-gray-600'
              }`}
            >
              {currentCourse ? `${currentCourse.code} - ${currentCourse.name}` : 'Unknown Course'}
            </div>
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

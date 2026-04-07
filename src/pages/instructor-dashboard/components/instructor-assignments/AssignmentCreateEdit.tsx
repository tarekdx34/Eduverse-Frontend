import React, { useState, useEffect, useMemo } from 'react';
import { X, FileText, AlertCircle, ExternalLink, Download } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import type { Assignment, AssignmentStatus } from '../../../../services/api/assignmentService';
import { InstructionUpload } from './InstructionUpload';

export interface AssignmentFormData {
  id?: string;
  title: string;
  description: string;
  instructions: string;
  dueDate: string;
  maxScore: number;
  weight: number;
  status: AssignmentStatus;
  submissionType: 'text' | 'file' | 'link' | 'any';
  maxFileSize?: number;
  allowedFileTypes: string[];
  latePenalty?: number;
}

interface AssignmentCreateEditProps {
  open: boolean;
  assignment: Assignment | null;
  courseId: string;
  onClose: () => void;
  onSave: (data: AssignmentFormData) => Promise<Assignment | void>;
  onUploadInstructions?: (assignmentId: string, file: File) => Promise<void>;
}

const FILE_SIZE_UNITS = [
  { value: 1024 * 1024, label: 'MB' },
  { value: 1024 * 1024 * 1024, label: 'GB' },
];

export function AssignmentCreateEdit({
  open,
  assignment,
  courseId,
  onClose,
  onSave,
  onUploadInstructions,
}: AssignmentCreateEditProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const { primaryHex = '#4f46e5' } = useTheme() as any;

  const [formData, setFormData] = useState<AssignmentFormData>({
    title: '',
    description: '',
    instructions: '',
    dueDate: '',
    maxScore: 100,
    weight: 10,
    status: 'draft',
    submissionType: 'file',
    maxFileSize: 10 * 1024 * 1024, // 10MB default
    allowedFileTypes: [],
    latePenalty: 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileTypeInput, setFileTypeInput] = useState('');
  const [pendingInstructionFiles, setPendingInstructionFiles] = useState<File[]>([]);
  const [selectedInstructionDriveId, setSelectedInstructionDriveId] = useState<string | null>(null);

  useEffect(() => {
    if (assignment) {
      setFormData({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description || '',
        instructions: assignment.instructions || '',
        dueDate: assignment.dueDate
          ? new Date(assignment.dueDate).toISOString().slice(0, 16)
          : '',
        maxScore: Number(assignment.maxScore) || 100,
        weight: Number(assignment.weight) || 10,
        status: assignment.status,
        submissionType: assignment.submissionType || 'file',
        maxFileSize: assignment.maxFileSize || 10 * 1024 * 1024,
        allowedFileTypes: assignment.allowedFileTypes || [],
        latePenalty: assignment.latePenalty || 0,
      });
      setFileTypeInput(assignment.allowedFileTypes?.join(', ') || '');
      setSelectedInstructionDriveId(assignment.instructionFiles?.[0]?.driveId || null);
    } else {
      // Reset for new assignment
      setFormData({
        title: '',
        description: '',
        instructions: '',
        dueDate: '',
        maxScore: 100,
        weight: 10,
        status: 'draft',
        submissionType: 'file',
        maxFileSize: 10 * 1024 * 1024,
        allowedFileTypes: [],
        latePenalty: 0,
      });
      setFileTypeInput('');
      setSelectedInstructionDriveId(null);
    }
    setErrors({});
    setPendingInstructionFiles([]);
  }, [assignment, open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }

    if (formData.maxScore <= 0) {
      newErrors.maxScore = 'Max score must be greater than 0';
    }

    if (formData.latePenalty !== undefined && (formData.latePenalty < 0 || formData.latePenalty > 100)) {
      newErrors.latePenalty = 'Late penalty must be between 0 and 100';
    }

    if (formData.submissionType === 'file' && formData.maxFileSize && formData.maxFileSize <= 0) {
      newErrors.maxFileSize = 'Max file size must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Parse file types from comma-separated input
      const allowedFileTypes = fileTypeInput
        .split(',')
        .map((type) => type.trim().toLowerCase())
        .filter((type) => type.length > 0);

      const savedAssignment = await onSave({ ...formData, allowedFileTypes });

      if (!assignment && pendingInstructionFiles.length > 0 && onUploadInstructions) {
        const assignmentId = savedAssignment?.id;
        if (!assignmentId) {
          throw new Error('Assignment was created but no assignment ID was returned.');
        }

        for (const file of pendingInstructionFiles) {
          await onUploadInstructions(assignmentId, file);
        }
      }

      onClose();
    } catch (error) {
      console.error('Error saving assignment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileTypesChange = (value: string) => {
    setFileTypeInput(value);
  };

  const selectedInstructionFile = useMemo(() => {
    if (!assignment?.instructionFiles?.length) return null;
    return (
      assignment.instructionFiles.find((file) => file.driveId === selectedInstructionDriveId) ||
      assignment.instructionFiles[0]
    );
  }, [assignment?.instructionFiles, selectedInstructionDriveId]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div
        className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-xl ${
          isDark ? 'bg-slate-900 border border-white/10' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 z-10 flex items-center justify-between p-6 border-b ${
            isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-gray-200'
          }`}
        >
          <div>
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {assignment ? 'Edit Assignment' : 'Create Assignment'}
            </h2>
            <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {assignment ? 'Update assignment details' : 'Create a new assignment for your course'}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
            >
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } ${errors.title ? 'border-red-500' : ''}`}
              placeholder="e.g., Research Paper on AI Ethics"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                <AlertCircle size={14} />
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
            >
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="Brief description of the assignment"
            />
          </div>

          {/* Instructions */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
            >
              Instructions (Markdown supported)
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
              rows={6}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              }`}
              placeholder="## Requirements&#10;- Write a 10-page paper&#10;- Use APA format&#10;- Include at least 5 references"
            />
          </div>

          {/* Instruction File Upload */}
          {assignment && Array.isArray(assignment.instructionFiles) && assignment.instructionFiles.length > 0 && (
            <div
              className={`border rounded-lg p-4 ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <FileText size={18} className={isDark ? 'text-slate-400' : 'text-gray-600'} />
                <h3 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Uploaded Instruction Files
                </h3>
              </div>
              <div className="space-y-2">
                {assignment.instructionFiles.map((file) => (
                  <div
                    key={file.driveId}
                    className={`flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-lg ${
                      isDark ? 'bg-white/5' : 'bg-white'
                    }`}
                  >
                    <span
                      className={`text-sm truncate ${isDark ? 'text-slate-200' : 'text-gray-700'}`}
                      title={file.fileName}
                    >
                      {file.fileName}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedInstructionDriveId(file.driveId)}
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                          selectedInstructionFile?.driveId === file.driveId
                            ? isDark
                              ? 'text-indigo-200 bg-indigo-500/30'
                              : 'text-indigo-700 bg-indigo-200'
                            : isDark
                              ? 'text-indigo-300 bg-indigo-500/20 hover:bg-indigo-500/30'
                              : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'
                        }`}
                      >
                        <FileText size={12} />
                        Preview
                      </button>
                      <a
                        href={file.webViewLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                          isDark
                            ? 'text-blue-300 bg-blue-500/20 hover:bg-blue-500/30'
                            : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
                        }`}
                      >
                        <ExternalLink size={12} />
                        Open
                      </a>
                      <a
                        href={file.downloadUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded ${
                          isDark
                            ? 'text-emerald-300 bg-emerald-500/20 hover:bg-emerald-500/30'
                            : 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                        }`}
                      >
                        <Download size={12} />
                        Download
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {selectedInstructionFile && (
                <div className="mt-3 rounded-lg overflow-hidden border border-slate-200">
                  <iframe
                    src={selectedInstructionFile.iframeUrl}
                    width="100%"
                    height="360"
                    title={`assignment-instruction-${selectedInstructionFile.driveId}`}
                  />
                </div>
              )}
            </div>
          )}

          {assignment && onUploadInstructions && (
            <InstructionUpload
              assignmentId={assignment.id}
              onUpload={onUploadInstructions}
            />
          )}

          {!assignment && onUploadInstructions && (
            <div
              className={`border rounded-lg p-4 ${
                isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <FileText size={18} className={isDark ? 'text-slate-400' : 'text-gray-600'} />
                <h3 className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
                  Instruction Files
                </h3>
              </div>

              <p className={`text-xs mb-3 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                Select files now; they will upload automatically after the assignment is created.
              </p>

              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
                onChange={(e) => {
                  const selected = Array.from(e.target.files || []);
                  if (selected.length === 0) return;

                  setPendingInstructionFiles((prev) => {
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
                }}
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
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Due Date, Max Score, Weight */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
              >
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } ${errors.dueDate ? 'border-red-500' : ''}`}
              />
              {errors.dueDate && (
                <p className="mt-1 text-sm text-red-500">{errors.dueDate}</p>
              )}
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
              >
                Max Score <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.maxScore}
                onChange={(e) => setFormData({ ...formData, maxScore: Number(e.target.value) })}
                min="0"
                step="1"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } ${errors.maxScore ? 'border-red-500' : ''}`}
              />
              {errors.maxScore && (
                <p className="mt-1 text-sm text-red-500">{errors.maxScore}</p>
              )}
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
              >
                Weight (%)
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: Number(e.target.value) })}
                min="0"
                step="1"
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark
                    ? 'bg-white/5 border-white/10 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                }`}
              />
            </div>
          </div>

          {/* Submission Type */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
            >
              Submission Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['text', 'file', 'link', 'any'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData({ ...formData, submissionType: type })}
                  className={`px-4 py-3 border rounded-lg text-sm font-medium transition-all ${
                    formData.submissionType === type
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                      : isDark
                        ? 'border-white/10 hover:bg-white/5'
                        : 'border-gray-300 hover:bg-gray-50'
                  } ${isDark ? 'text-white' : 'text-gray-900'}`}
                  style={
                    formData.submissionType === type
                      ? { backgroundColor: `${primaryHex}20`, borderColor: primaryHex }
                      : {}
                  }
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* File Settings (if file submission) */}
          {(formData.submissionType === 'file' || formData.submissionType === 'any') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                >
                  Max File Size (MB)
                </label>
                <input
                  type="number"
                  value={(formData.maxFileSize || 0) / (1024 * 1024)}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxFileSize: Number(e.target.value) * 1024 * 1024,
                    })
                  }
                  min="1"
                  step="1"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
                >
                  Allowed File Types
                </label>
                <input
                  type="text"
                  value={fileTypeInput}
                  onChange={(e) => handleFileTypesChange(e.target.value)}
                  placeholder="pdf, docx, txt"
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-white border-gray-300 text-gray-900'
                  }`}
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
                  Comma-separated list (e.g., pdf, docx, txt)
                </p>
              </div>
            </div>
          )}

          {/* Late Penalty */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
            >
              Late Penalty (% per day)
            </label>
            <input
              type="number"
              value={formData.latePenalty || 0}
              onChange={(e) => setFormData({ ...formData, latePenalty: Number(e.target.value) })}
              min="0"
              max="100"
              step="1"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark
                  ? 'bg-white/5 border-white/10 text-white'
                  : 'bg-white border-gray-300 text-gray-900'
              } ${errors.latePenalty ? 'border-red-500' : ''}`}
            />
            {errors.latePenalty && (
              <p className="mt-1 text-sm text-red-500">{errors.latePenalty}</p>
            )}
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
              Percentage deducted from the score per day late (0-100)
            </p>
          </div>

          {/* Status */}
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-gray-700'}`}
            >
              Status
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(['draft', 'published', 'closed', 'archived'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData({ ...formData, status })}
                  className={`px-4 py-3 border rounded-lg text-sm font-medium transition-all ${
                    formData.status === status
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                      : isDark
                        ? 'border-white/10 hover:bg-white/5'
                        : 'border-gray-300 hover:bg-gray-50'
                  } ${isDark ? 'text-white' : 'text-gray-900'}`}
                  style={
                    formData.status === status
                      ? { backgroundColor: `${primaryHex}20`, borderColor: primaryHex }
                      : {}
                  }
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div
            className={`flex items-center justify-end gap-3 pt-6 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}
          >
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-white/5 text-slate-300 hover:bg-white/10'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-lg font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryHex }}
            >
              {isSubmitting ? 'Saving...' : assignment ? 'Update Assignment' : 'Create Assignment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AssignmentCreateEdit;

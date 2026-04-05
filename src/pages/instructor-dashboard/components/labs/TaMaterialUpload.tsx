import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { LabService } from '../../../../services/api/labService';
import { Lab } from './types';
import { toast } from 'sonner';

export interface TaMaterialUploadProps {
  isOpen: boolean;
  lab: Lab;
  onClose: () => void;
  onUploadComplete: () => void;
}

export function TaMaterialUpload({
  isOpen,
  lab,
  onClose,
  onUploadComplete,
}: TaMaterialUploadProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Handle drag events
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  // Validate and set selected file
  const handleFileSelection = (file: File) => {
    // Validate file size (max 50MB)
    const maxSizeMB = 50;
    const maxSizeBytes = maxSizeMB * 1024 * 1024;

    if (file.size > maxSizeBytes) {
      toast.error(
        t('ta_material_file_too_large', {
          max: maxSizeMB,
        }) || `File is too large. Maximum size is ${maxSizeMB}MB`
      );
      return;
    }

    // Validate file type (allow common document and archive types)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain',
      'text/csv',
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
    ];

    if (!allowedTypes.includes(file.type)) {
      toast.error(
        t('ta_material_invalid_file_type') ||
          'File type not allowed. Please upload documents, images, or archives.'
      );
      return;
    }

    setSelectedFile(file);
  };

  // Format file size for display
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error(t('ta_material_no_file_selected') || 'Please select a file first');
      return;
    }

    setUploading(true);
    try {
      await LabService.uploadTaMaterial(lab.id, selectedFile);
      toast.success(
        t('ta_material_uploaded_successfully') || 'TA material uploaded successfully'
      );
      setSelectedFile(null);
      onUploadComplete();
      onClose();
    } catch (error) {
      console.error('Failed to upload TA material:', error);
      toast.error(
        t('ta_material_upload_failed') ||
          'Failed to upload TA material. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  // Reset file selection
  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle modal close
  const handleClose = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="presentation"
    >
      <div
        className={`rounded-xl max-w-md w-full shadow-xl ${
          isDark ? 'bg-slate-900' : 'bg-white'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ta-material-title"
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDark ? 'border-slate-700' : 'border-slate-200'
          }`}
        >
          <h2
            id="ta-material-title"
            className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-slate-900'}`}
          >
            {t('ta_material_upload') || 'Upload TA Material'}
          </h2>
          <button
            onClick={handleClose}
            className={`p-1 rounded-lg transition-colors ${
              isDark
                ? 'hover:bg-slate-800 text-slate-400 hover:text-white'
                : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
            }`}
            aria-label={t('common_close') || 'Close dialog'}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info text about TA-only visibility */}
          <div
            className={`p-4 rounded-lg flex gap-3 ${
              isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
            }`}
            role="status"
            aria-live="polite"
          >
            <AlertCircle
              size={20}
              className={`flex-shrink-0 mt-0.5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`}
            />
            <p className={`text-sm ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              {t('ta_material_visibility_info') ||
                'These materials will only be visible to TAs and instructors. Students will not have access to these files.'}
            </p>
          </div>

          {/* Drop zone or file preview */}
          {!selectedFile ? (
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
                dragActive
                  ? isDark
                    ? 'border-blue-400 bg-blue-900/20'
                    : 'border-blue-500 bg-blue-50'
                  : isDark
                    ? 'border-slate-600 bg-slate-800/50 hover:bg-slate-800'
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100'
              }`}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              aria-label={
                t('ta_material_drag_drop_label') ||
                'Drag and drop a file here or click to browse'
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  fileInputRef.current?.click();
                }
              }}
            >
              <div className="flex flex-col items-center gap-3">
                <div
                  className={`p-3 rounded-lg ${
                    isDark ? 'bg-slate-700' : 'bg-slate-200'
                  }`}
                >
                  <Upload
                    size={28}
                    className={isDark ? 'text-blue-400' : 'text-blue-600'}
                  />
                </div>
                <div className="text-center">
                  <p
                    className={`font-medium ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {t('ta_material_drag_and_drop') ||
                      'Drag and drop your file here'}
                  </p>
                  <p
                    className={`text-sm ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {t('ta_material_or_click') || 'or click to browse'}
                  </p>
                </div>
                <p
                  className={`text-xs ${
                    isDark ? 'text-slate-500' : 'text-slate-500'
                  }`}
                >
                  {t('ta_material_max_size') || 'Maximum file size: 50MB'}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileInputChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z,.jpg,.jpeg,.png,.gif,.webp"
                aria-label={
                  t('ta_material_file_input') || 'Select file to upload'
                }
              />
            </div>
          ) : (
            /* Selected file preview */
            <div
              className={`border-2 rounded-lg p-6 ${
                isDark
                  ? 'border-slate-600 bg-slate-800/50'
                  : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`p-3 rounded-lg flex-shrink-0 ${
                    isDark ? 'bg-slate-700' : 'bg-slate-200'
                  }`}
                >
                  <FileText
                    size={24}
                    className={isDark ? 'text-blue-400' : 'text-blue-600'}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3
                    className={`font-medium truncate ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}
                    title={selectedFile.name}
                  >
                    {selectedFile.name}
                  </h3>
                  <p
                    className={`text-sm ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}
                  >
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <button
                  onClick={handleClearFile}
                  disabled={uploading}
                  className={`p-1 rounded transition-colors ${
                    uploading
                      ? isDark
                        ? 'text-slate-500 cursor-not-allowed'
                        : 'text-slate-400 cursor-not-allowed'
                      : isDark
                        ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                  }`}
                  aria-label={t('common_remove') || 'Remove file'}
                >
                  <X size={20} />
                </button>
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className={`mt-4 w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  uploading
                    ? isDark
                      ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    : isDark
                      ? 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                }`}
              >
                {t('ta_material_choose_different') || 'Choose Different File'}
              </button>
            </div>
          )}

          {/* Upload button */}
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className={`w-full px-4 py-3 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
              !selectedFile || uploading
                ? isDark
                  ? 'bg-blue-900 text-blue-400 cursor-not-allowed'
                  : 'bg-blue-100 text-blue-500 cursor-not-allowed'
                : isDark
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            aria-busy={uploading}
          >
            {uploading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {t('ta_material_uploading') || 'Uploading...'}
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                {t('ta_material_upload_button') || 'Upload Material'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

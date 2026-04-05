import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { toast } from 'sonner';

interface InstructionUploadProps {
  assignmentId: string;
  onUpload: (assignmentId: string, file: File) => Promise<void>;
}

export function InstructionUpload({ assignmentId, onUpload }: InstructionUploadProps) {
  const { isDark } = useTheme();
  const { primaryHex = '#4f46e5' } = useTheme() as any;
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      await onUpload(assignmentId, selectedFile);
      setUploadSuccess(true);
      toast.success('Instruction file uploaded successfully');
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      toast.error(error?.message || 'Failed to upload instruction file');
      setUploadSuccess(false);
    } finally {
      setUploading(false);
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
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

      <p className={`text-xs mb-4 ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
        Upload instruction files (PDF, DOCX, etc.) to Google Drive for students to download
      </p>

      {/* File Input */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.txt,.ppt,.pptx"
            className="hidden"
            id={`instruction-upload-${assignmentId}`}
          />
          <label
            htmlFor={`instruction-upload-${assignmentId}`}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
              isDark
                ? 'border-white/20 hover:border-white/30 hover:bg-white/5'
                : 'border-gray-300 hover:border-gray-400 hover:bg-gray-100'
            }`}
          >
            <Upload size={18} className={isDark ? 'text-slate-400' : 'text-gray-500'} />
            <span className={`text-sm ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>
              {selectedFile ? selectedFile.name : 'Choose file to upload'}
            </span>
          </label>

          {selectedFile && !uploadSuccess && (
            <button
              onClick={handleClearFile}
              className={`p-2 rounded-lg transition-colors ${
                isDark
                  ? 'text-slate-400 hover:bg-white/10'
                  : 'text-gray-500 hover:bg-gray-200'
              }`}
              title="Clear file"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Upload Button */}
        {selectedFile && !uploadSuccess && (
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="w-full px-4 py-2 rounded-lg text-white font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: primaryHex }}
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Uploading to Google Drive...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Upload size={16} />
                Upload to Google Drive
              </span>
            )}
          </button>
        )}

        {/* Success Message */}
        {uploadSuccess && (
          <div
            className={`flex items-center gap-2 p-3 rounded-lg ${
              isDark
                ? 'bg-green-500/20 border border-green-500/30'
                : 'bg-green-50 border border-green-200'
            }`}
          >
            <CheckCircle
              size={18}
              className={isDark ? 'text-green-300' : 'text-green-600'}
            />
            <span
              className={`text-sm font-medium ${isDark ? 'text-green-300' : 'text-green-700'}`}
            >
              File uploaded successfully to Google Drive
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default InstructionUpload;

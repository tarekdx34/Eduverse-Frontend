import React, { useState, useCallback } from 'react';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';

interface FileUploadZoneProps {
  onFileSelect: (file: File) => void;
  acceptedTypes?: string;
  maxSizeMB?: number;
  label?: string;
  description?: string;
  icon?: 'document' | 'image';
}

export function FileUploadZone({
  onFileSelect,
  acceptedTypes = '.pdf,.doc,.docx,.ppt,.pptx',
  maxSizeMB = 10,
  label = 'Upload File',
  description = 'Drag and drop or click to browse',
  icon = 'document',
}: FileUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');

  const validateFile = (file: File): boolean => {
    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024;
    if (file.size > maxSize) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return false;
    }

    // Check file type
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    const acceptedExtensions = acceptedTypes.split(',').map((ext) => ext.trim().toLowerCase());

    if (!acceptedExtensions.includes(fileExtension)) {
      setError(`File type not supported. Accepted: ${acceptedTypes}`);
      return false;
    }

    setError('');
    return true;
  };

  const handleFileChange = useCallback(
    (file: File) => {
      if (validateFile(file)) {
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileChange(file);
      }
    },
    [handleFileChange]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setError('');
  };

  const IconComponent = icon === 'image' ? ImageIcon : FileText;

  return (
    <div className="w-full">
      {!selectedFile ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50'
              : error
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
          }`}
        >
          <input
            type="file"
            accept={acceptedTypes}
            onChange={handleInputChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          <div className="flex flex-col items-center gap-3">
            <div className={`p-4 rounded-full ${error ? 'bg-red-100' : 'bg-indigo-100'}`}>
              {error ? (
                <X className="text-red-600" size={32} />
              ) : (
                <Upload className="text-indigo-600" size={32} />
              )}
            </div>

            <div>
              <p className="text-lg font-semibold text-gray-900">{label}</p>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
              <p className="text-xs text-gray-400 mt-2">
                Max size: {maxSizeMB}MB • Formats: {acceptedTypes}
              </p>
            </div>

            {error && (
              <div className="mt-2 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="border-2 border-green-300 bg-green-50 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <IconComponent className="text-green-600" size={24} />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={handleRemove}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
            >
              <X className="text-red-600" size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileUploadZone;

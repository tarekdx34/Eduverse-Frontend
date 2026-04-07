# Frontend Guide: Course Materials Upload (Google Drive Integration)

## Overview

This guide explains how to integrate the course materials upload functionality in the frontend. The backend supports uploading documents (PDF, Word, PowerPoint, images) to Google Drive and videos to YouTube.

## 📋 Table of Contents

- [Authentication](#authentication)
- [Upload Documents to Google Drive](#upload-documents-to-google-drive)
- [Upload Videos to YouTube](#upload-videos-to-youtube)
- [File Validation Rules](#file-validation-rules)
- [Error Handling](#error-handling)
- [React Examples](#react-examples)
- [Response Structure](#response-structure)

---

## 🔐 Authentication

All upload endpoints require:
- **Bearer Token**: JWT token in Authorization header
- **Roles**: INSTRUCTOR, TA, ADMIN, or IT_ADMIN
- **Course Assignment**: User must be assigned to the course (unless admin)

```javascript
const token = localStorage.getItem('accessToken');
headers: {
  'Authorization': `Bearer ${token}`
}
```

---

## 📄 Upload Documents to Google Drive

### Endpoint
```
POST /api/courses/:courseId/materials/document
```

### Supported File Types

| Category | MIME Type | Extensions | Max Size |
|----------|-----------|------------|----------|
| **PDF** | `application/pdf` | `.pdf` | 50MB |
| **Word** | `application/msword`<br>`application/vnd.openxmlformats-officedocument.wordprocessingml.document` | `.doc`<br>`.docx` | 50MB |
| **PowerPoint** | `application/vnd.ms-powerpoint`<br>`application/vnd.openxmlformats-officedocument.presentationml.presentation` | `.ppt`<br>`.pptx` | 50MB |
| **Excel** | `application/vnd.ms-excel`<br>`application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` | `.xls`<br>`.xlsx` | 50MB |
| **Images** | `image/jpeg`<br>`image/png`<br>`image/gif`<br>`image/webp`<br>`image/svg+xml` | `.jpg`, `.jpeg`<br>`.png`<br>`.gif`<br>`.webp`<br>`.svg` | 10MB |
| **Text** | `text/plain`<br>`text/markdown` | `.txt`<br>`.md` | 50MB |
| **Archive** | `application/zip` | `.zip` | 50MB |

### Form Data Fields

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `document` | File | ✅ Yes | The file to upload | `file.pdf` |
| `title` | String | ✅ Yes | Material title (max 255 chars) | `"Week 1: Introduction to Data Structures"` |
| `description` | String | ❌ No | Material description | `"Lecture notes covering basics"` |
| `materialType` | Enum | ❌ No | Type: `lecture`, `slide`, `reading`, `document` (default: `document`) | `"lecture"` |
| `weekNumber` | Number | ❌ No | Week number (1-52) | `1` |
| `orderIndex` | Number | ❌ No | Sort order (default: 0) | `0` |
| `isPublished` | Boolean | ❌ No | Publish immediately (default: false) | `false` |

### Example: Fetch API

```javascript
async function uploadDocument(courseId, file, metadata) {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('title', metadata.title);
  
  // Optional fields
  if (metadata.description) formData.append('description', metadata.description);
  if (metadata.materialType) formData.append('materialType', metadata.materialType);
  if (metadata.weekNumber) formData.append('weekNumber', metadata.weekNumber);
  if (metadata.orderIndex !== undefined) formData.append('orderIndex', metadata.orderIndex);
  if (metadata.isPublished !== undefined) formData.append('isPublished', metadata.isPublished);

  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`/api/courses/${courseId}/materials/document`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      // Do NOT set Content-Type - browser sets it automatically with boundary
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  return await response.json();
}
```

### Example: Axios

```javascript
import axios from 'axios';

async function uploadDocument(courseId, file, metadata) {
  const formData = new FormData();
  formData.append('document', file);
  formData.append('title', metadata.title);
  
  // Optional fields
  if (metadata.description) formData.append('description', metadata.description);
  if (metadata.materialType) formData.append('materialType', metadata.materialType);
  if (metadata.weekNumber) formData.append('weekNumber', metadata.weekNumber.toString());
  if (metadata.orderIndex !== undefined) formData.append('orderIndex', metadata.orderIndex.toString());
  if (metadata.isPublished !== undefined) formData.append('isPublished', metadata.isPublished.toString());

  const token = localStorage.getItem('accessToken');

  try {
    const response = await axios.post(
      `/api/courses/${courseId}/materials/document`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Upload failed');
  }
}
```

---

## 🎥 Upload Videos to YouTube

### Endpoint
```
POST /api/courses/:courseId/materials/video
```

### Supported Video Formats
- **Extensions**: `.mp4`, `.avi`, `.mov`, `.webm`, `.mkv`, `.flv`, `.wmv`
- **Max Size**: Depends on YouTube limits (typically 128GB)

### Form Data Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `video` | File | ✅ Yes | Video file to upload |
| `title` | String | ✅ Yes | Video title |
| `description` | String | ❌ No | Video description |
| `tags` | Array[String] | ❌ No | Tags for the video |
| `weekNumber` | Number | ❌ No | Week number (1-52) |
| `orderIndex` | Number | ❌ No | Sort order |
| `isPublished` | Boolean | ❌ No | Publish immediately |

### Example

```javascript
async function uploadVideo(courseId, file, metadata) {
  const formData = new FormData();
  formData.append('video', file);
  formData.append('title', metadata.title);
  
  if (metadata.description) formData.append('description', metadata.description);
  if (metadata.tags) {
    // Tags can be sent as JSON array or comma-separated
    metadata.tags.forEach(tag => formData.append('tags[]', tag));
  }
  if (metadata.weekNumber) formData.append('weekNumber', metadata.weekNumber);
  if (metadata.orderIndex !== undefined) formData.append('orderIndex', metadata.orderIndex);
  if (metadata.isPublished !== undefined) formData.append('isPublished', metadata.isPublished);

  const token = localStorage.getItem('accessToken');
  
  const response = await fetch(`/api/courses/${courseId}/materials/video`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Video upload failed');
  }

  return await response.json();
}
```

---

## ✅ File Validation Rules

### Client-Side Validation (Recommended)

```javascript
const FILE_VALIDATION = {
  documents: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/markdown',
      'application/zip'
    ],
    allowedExtensions: ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'md', 'zip']
  },
  images: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
    allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg']
  }
};

function validateFile(file) {
  const isImage = file.type.startsWith('image/');
  const config = isImage ? FILE_VALIDATION.images : FILE_VALIDATION.documents;
  
  // Check file size
  if (file.size > config.maxSize) {
    const maxSizeMB = config.maxSize / (1024 * 1024);
    throw new Error(`File size exceeds ${maxSizeMB}MB limit. Current size: ${(file.size / (1024 * 1024)).toFixed(2)}MB`);
  }
  
  // Check MIME type
  if (!config.allowedTypes.includes(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
  
  // Check file extension
  const ext = file.name.split('.').pop()?.toLowerCase();
  if (!ext || !config.allowedExtensions.includes(ext)) {
    throw new Error(`Unsupported file extension: .${ext}`);
  }
  
  return true;
}
```

---

## ❌ Error Handling

### Common Error Responses

```javascript
// 400 Bad Request - File validation error
{
  "statusCode": 400,
  "message": "File size exceeds maximum allowed size of 50MB. Current size: 65.23MB",
  "error": "Bad Request"
}

// 400 Bad Request - Unsupported file type
{
  "statusCode": 400,
  "message": "Unsupported file type: application/exe. Supported types: PDF, Word (doc/docx), PowerPoint (ppt/pptx), ...",
  "error": "Bad Request"
}

// 400 Bad Request - Missing file
{
  "statusCode": 400,
  "message": "Document file is required. Please select a file to upload.",
  "error": "Bad Request"
}

// 403 Forbidden - Not assigned to course
{
  "statusCode": 403,
  "message": "You are not assigned to course ID 1 and cannot add materials. Only instructors, TAs, or admins assigned to this course can upload materials.",
  "error": "Forbidden"
}

// 400 Bad Request - Drive integration error
{
  "statusCode": 400,
  "message": "Failed to upload document to Google Drive. Authentication error - please check Google Drive credentials.",
  "error": "Bad Request"
}
```

### Error Handling Example

```javascript
try {
  // Validate file on client side first
  validateFile(file);
  
  // Upload file
  const result = await uploadDocument(courseId, file, metadata);
  
  console.log('Upload successful!', result);
  // Handle success (show notification, update UI, etc.)
  
} catch (error) {
  // Handle error
  console.error('Upload failed:', error.message);
  
  // Show user-friendly error message
  if (error.message.includes('File size exceeds')) {
    alert('The file is too large. Please select a smaller file.');
  } else if (error.message.includes('Unsupported file type')) {
    alert('This file type is not supported. Please upload a PDF, Word, or PowerPoint file.');
  } else if (error.message.includes('not assigned to course')) {
    alert('You do not have permission to upload materials to this course.');
  } else if (error.message.includes('Drive')) {
    alert('There was an error uploading to Google Drive. Please try again later.');
  } else {
    alert('Upload failed. Please try again.');
  }
}
```

---

## ⚛️ React Examples

### React Hook for Document Upload

```javascript
import { useState } from 'react';

export function useDocumentUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const uploadDocument = async (courseId, file, metadata) => {
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Validate file
      validateFile(file);

      const formData = new FormData();
      formData.append('document', file);
      formData.append('title', metadata.title);
      
      if (metadata.description) formData.append('description', metadata.description);
      if (metadata.materialType) formData.append('materialType', metadata.materialType);
      if (metadata.weekNumber) formData.append('weekNumber', metadata.weekNumber);
      if (metadata.orderIndex !== undefined) formData.append('orderIndex', metadata.orderIndex);
      if (metadata.isPublished !== undefined) formData.append('isPublished', metadata.isPublished);

      const token = localStorage.getItem('accessToken');

      const response = await fetch(`/api/courses/${courseId}/materials/document`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      setProgress(100);
      return result;

    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  return { uploadDocument, uploading, progress, error };
}
```

### React Component Example

```javascript
import React, { useState } from 'react';
import { useDocumentUpload } from './hooks/useDocumentUpload';

export function DocumentUploadForm({ courseId, onSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [materialType, setMaterialType] = useState('document');
  const [weekNumber, setWeekNumber] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const { uploadDocument, uploading, error } = useDocumentUpload();

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Auto-populate title from filename if empty
      if (!title) {
        const name = selectedFile.name.replace(/\.[^/.]+$/, '');
        setTitle(name);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    if (!title.trim()) {
      alert('Please enter a title');
      return;
    }

    try {
      const result = await uploadDocument(courseId, file, {
        title: title.trim(),
        description: description.trim() || undefined,
        materialType,
        weekNumber: weekNumber ? parseInt(weekNumber) : undefined,
        orderIndex: 0,
        isPublished
      });

      // Success!
      alert('Document uploaded successfully!');
      onSuccess?.(result);
      
      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setWeekNumber('');
      setIsPublished(false);
      e.target.reset();

    } catch (err) {
      // Error already handled by hook
      console.error('Upload error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Document File *
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.webp,.txt,.md,.zip"
          disabled={uploading}
          className="mt-1 block w-full"
          required
        />
        {file && (
          <p className="mt-1 text-sm text-gray-500">
            Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Title *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={255}
          disabled={uploading}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          disabled={uploading}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Material Type
        </label>
        <select
          value={materialType}
          onChange={(e) => setMaterialType(e.target.value)}
          disabled={uploading}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        >
          <option value="document">Document</option>
          <option value="lecture">Lecture</option>
          <option value="slide">Slide</option>
          <option value="reading">Reading</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Week Number (Optional)
        </label>
        <input
          type="number"
          value={weekNumber}
          onChange={(e) => setWeekNumber(e.target.value)}
          min="1"
          max="52"
          disabled={uploading}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        />
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="isPublished"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          disabled={uploading}
          className="h-4 w-4 text-blue-600 rounded"
        />
        <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
          Publish immediately (visible to students)
        </label>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={uploading || !file}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
      >
        {uploading ? 'Uploading...' : 'Upload Document'}
      </button>
    </form>
  );
}
```

---

## 📦 Response Structure

### Successful Document Upload Response

```json
{
  "materialId": 123,
  "courseId": 1,
  "title": "Week 1 Lecture Notes",
  "description": "Introduction to the course",
  "materialType": "lecture",
  "externalUrl": "https://drive.google.com/file/d/1abc...xyz/view",
  "driveFileId": 45,
  "uploadedBy": 5,
  "isPublished": false,
  "publishedAt": null,
  "weekNumber": 1,
  "orderIndex": 0,
  "viewCount": 0,
  "downloadCount": 0,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z",
  "driveId": "1abc...xyz",
  "driveViewUrl": "https://drive.google.com/file/d/1abc...xyz/view",
  "driveDownloadUrl": "https://drive.google.com/uc?id=1abc...xyz&export=download",
  "fileName": "Week01_Introduction_v1.pdf"
}
```

### Successful Video Upload Response

```json
{
  "materialId": 124,
  "courseId": 1,
  "title": "Lecture 1: Introduction",
  "materialType": "video",
  "externalUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ",
  "youtubeVideoId": "dQw4w9WgXcQ",
  "weekNumber": 1,
  "orderIndex": 0,
  "isPublished": false,
  "youtubeUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "embedUrl": "https://www.youtube.com/embed/dQw4w9WgXcQ"
}
```

---

## 🎯 Key Points

1. **Always use FormData** for file uploads - not JSON
2. **Do NOT set Content-Type header** manually - let the browser set it with boundary
3. **Validate files on client side** before uploading to provide immediate feedback
4. **Handle errors gracefully** with user-friendly messages
5. **Show upload progress** if possible for better UX
6. **Documents go to Google Drive**, videos go to YouTube
7. **Materials are saved as drafts by default** - set `isPublished: true` to publish immediately
8. **File size limits**: 50MB for documents, 10MB for images
9. **MIME type and extension must match** to prevent file spoofing

---

## 🔗 Related Endpoints

- `GET /api/courses/:courseId/materials` - List all materials
- `GET /api/courses/:courseId/materials/:id` - Get material details
- `PATCH /api/courses/:courseId/materials/:id` - Update material
- `DELETE /api/courses/:courseId/materials/:id` - Delete material
- `POST /api/courses/:courseId/materials/:id/publish` - Toggle publish status

---

## 📝 Notes

- Google Drive OAuth credentials must be configured on the backend
- YouTube OAuth credentials must be configured for video uploads
- Files are automatically organized into folders based on material type
- Drive folder hierarchy: `EduVerse/{Department}/{Year}/{Semester}/{Course}/{Lectures|General}`
- Videos are uploaded as "unlisted" on YouTube by default

---

**Last Updated**: 2024-01-15
**Backend Version**: 1.0.0

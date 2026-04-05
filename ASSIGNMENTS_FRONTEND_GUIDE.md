# Assignments Frontend Integration Guide

> Complete API reference and integration guide for building assignment functionality in the EduVerse frontend.

---

## Table of Contents

1. [Overview](#overview)
2. [User Stories](#user-stories)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Flow Diagrams](#flow-diagrams)
6. [Component Structure](#component-structure)
7. [Code Examples](#code-examples)

---

## Overview

The Assignments module supports:
- **Submission Types**: Text, file upload, link, or Google Drive file
- **File Management**: Local upload or Google Drive integration
- **Late Submissions**: Configurable late penalty percentage
- **Status**: draft → published → closed → archived
- **Grading**: Manual grading with score and feedback

---

## User Stories

### Instructor

| Story | Description |
|-------|-------------|
| **Create Assignment** | Create assignment with title, description, due date, max score |
| **Add Instructions** | Upload instruction files to Google Drive |
| **Set Requirements** | Configure submission type, file limits, late penalty |
| **Publish** | Change status to make visible to students |
| **View Submissions** | See all student submissions with timestamps |
| **Grade** | Assign score and feedback to submissions |
| **Download Files** | Download/view student submitted files |

### Student

| Story | Description |
|-------|-------------|
| **View Assignments** | See all assignments for enrolled courses |
| **View Details** | Read instructions and requirements |
| **Submit** | Submit text, upload file, paste link, or select Drive file |
| **Check Status** | See if submission is on time or late |
| **View Grade** | See score and feedback after grading |
| **Resubmit** | Submit again if allowed (increments attempt number) |

---

## API Endpoints

### Assignment CRUD

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `GET` | `/api/assignments` | List assignments (with filters) | All authenticated |
| `GET` | `/api/assignments/:id` | Get assignment details | All authenticated |
| `POST` | `/api/assignments` | Create assignment | INSTRUCTOR, TA, ADMIN |
| `PATCH` | `/api/assignments/:id` | Update assignment | INSTRUCTOR, TA, ADMIN |
| `DELETE` | `/api/assignments/:id` | Delete assignment | INSTRUCTOR, ADMIN |
| `PATCH` | `/api/assignments/:id/status` | Change status | INSTRUCTOR, TA, ADMIN |

### Instructions (Google Drive)

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `POST` | `/api/assignments/:id/instructions/upload` | Upload instruction file | INSTRUCTOR, TA, ADMIN |

### Submissions

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `GET` | `/api/assignments/:id/submissions` | List all submissions | INSTRUCTOR, TA |
| `GET` | `/api/assignments/:id/submissions/my` | Get my submission | STUDENT |
| `POST` | `/api/assignments/:id/submit` | Submit assignment | STUDENT |
| `POST` | `/api/assignments/:id/submissions/upload` | Upload file to Drive | STUDENT |

### Grading

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `PATCH` | `/api/assignments/:id/submissions/:subId/grade` | Grade submission | INSTRUCTOR, TA |

---

## Data Models

### Assignment

```typescript
interface Assignment {
  assignmentId: number;
  courseId: number;
  title: string;
  description?: string;
  instructions?: string;  // Markdown text
  dueDate?: Date;
  maxScore: number;
  weight?: number;
  status: 'draft' | 'published' | 'closed' | 'archived';
  submissionType: 'text' | 'file' | 'link' | 'any';
  maxFileSize?: number;   // in bytes
  allowedFileTypes?: string[];  // e.g., ['pdf', 'docx']
  latePenalty?: number;   // percentage per day
  createdAt: Date;
  updatedAt: Date;
}
```

### AssignmentSubmission

```typescript
interface AssignmentSubmission {
  submissionId: number;
  assignmentId: number;
  userId: number;
  user?: User;
  submissionText?: string;
  submissionLink?: string;
  fileId?: number;        // Drive file ID
  file?: DriveFile;
  score?: number;
  feedback?: string;
  gradedBy?: number;
  gradedAt?: Date;
  isLate: boolean;
  attemptNumber: number;
  submittedAt: Date;
}
```

---

## Flow Diagrams

### Assignment Submission Flow

```
┌─────────────────┐
│ Student Views   │
│ Assignment      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Read Instructions│
│ & Requirements  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ Choose Submission Type:             │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────────┐│
│ │Text │ │File │ │Link │ │Drive    ││
│ └──┬──┘ └──┬──┘ └──┬──┘ └────┬────┘│
└────┼───────┼───────┼─────────┼─────┘
     │       │       │         │
     └───────┴───────┴─────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ POST /submit    │
        │ (with content)  │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Check Due Date  │
        │ → isLate flag   │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │ Submission      │
        │ Created         │
        └────────┬────────┘
                 │
         Wait for Grading
                 │
                 ▼
        ┌─────────────────┐
        │ View Grade &    │
        │ Feedback        │
        └─────────────────┘
```

### Assignment Creation Flow

```
┌─────────────────┐
│ Instructor      │
│ Creates         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ POST /assignments│
│ (status: draft) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Upload Instruction│
│ Files (optional)│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Configure       │
│ Settings        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ PATCH /status   │
│ → "published"   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Students Can    │
│ Submit          │
└─────────────────┘
```

---

## Component Structure

```
AssignmentModule/
├── instructor/
│   ├── AssignmentList.tsx      # List with filters/sorting
│   ├── AssignmentCreate.tsx    # Create form
│   ├── AssignmentEdit.tsx      # Edit settings
│   ├── InstructionUpload.tsx   # Upload instruction files
│   ├── SubmissionList.tsx      # View all submissions
│   └── GradingPanel.tsx        # Grade with score/feedback
├── student/
│   ├── AssignmentList.tsx      # View available assignments
│   ├── AssignmentView.tsx      # View details/instructions
│   ├── SubmissionForm.tsx      # Submit assignment
│   ├── FileUpload.tsx          # Upload file component
│   └── MySubmission.tsx        # View submission & grade
└── shared/
    ├── DueDateBadge.tsx        # Due date with countdown
    ├── LateBadge.tsx           # Late submission indicator
    ├── StatusBadge.tsx         # Assignment status
    └── FilePreviewer.tsx       # Preview uploaded files
```

---

## Code Examples

### Create Assignment

```typescript
// POST /api/assignments
const createAssignment = async (data: CreateAssignmentDto): Promise<Assignment> => {
  const response = await fetch('/api/assignments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      courseId: 1,
      title: 'Research Paper',
      description: 'Write a 10-page research paper on a topic of your choice.',
      instructions: '## Requirements\n- 10 pages minimum\n- APA format\n- Include references',
      dueDate: '2025-03-01T23:59:59Z',
      maxScore: 100,
      weight: 20,
      submissionType: 'file',
      maxFileSize: 10485760,  // 10MB
      allowedFileTypes: ['pdf', 'docx'],
      latePenalty: 10,  // 10% per day
    }),
  });
  return response.json();
};
```

### Upload Instruction File

```typescript
// POST /api/assignments/:id/instructions/upload
const uploadInstructions = async (assignmentId: number, file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);

  await fetch(`/api/assignments/${assignmentId}/instructions/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
};
```

### Change Assignment Status

```typescript
// PATCH /api/assignments/:id/status
const publishAssignment = async (assignmentId: number): Promise<Assignment> => {
  const response = await fetch(`/api/assignments/${assignmentId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ status: 'published' }),
  });
  return response.json();
};
```

### Submit Assignment (Text)

```typescript
// POST /api/assignments/:id/submit
const submitText = async (assignmentId: number, text: string): Promise<AssignmentSubmission> => {
  const response = await fetch(`/api/assignments/${assignmentId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ submissionText: text }),
  });
  return response.json();
};
```

### Submit Assignment (File Upload)

```typescript
// Step 1: Upload file to Drive
// POST /api/assignments/:id/submissions/upload
const uploadFile = async (assignmentId: number, file: File): Promise<{ fileId: number }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/assignments/${assignmentId}/submissions/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  return response.json();
};

// Step 2: Submit with file ID
// POST /api/assignments/:id/submit
const submitWithFile = async (assignmentId: number, fileId: number): Promise<AssignmentSubmission> => {
  const response = await fetch(`/api/assignments/${assignmentId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ fileId }),
  });
  return response.json();
};
```

### Submit Assignment (Link)

```typescript
// POST /api/assignments/:id/submit
const submitLink = async (assignmentId: number, link: string): Promise<AssignmentSubmission> => {
  const response = await fetch(`/api/assignments/${assignmentId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ submissionLink: link }),
  });
  return response.json();
};
```

### Grade Submission

```typescript
// PATCH /api/assignments/:id/submissions/:subId/grade
const gradeSubmission = async (
  assignmentId: number,
  submissionId: number,
  score: number,
  feedback: string
): Promise<AssignmentSubmission> => {
  const response = await fetch(
    `/api/assignments/${assignmentId}/submissions/${submissionId}/grade`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ score, feedback }),
    }
  );
  return response.json();
};
```

### Get My Submission

```typescript
// GET /api/assignments/:id/submissions/my
const getMySubmission = async (assignmentId: number): Promise<AssignmentSubmission | null> => {
  const response = await fetch(`/api/assignments/${assignmentId}/submissions/my`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  if (response.status === 404) {
    return null;  // No submission yet
  }
  
  return response.json();
};
```

### Due Date Badge Component

```typescript
// components/DueDateBadge.tsx
import { useMemo } from 'react';

interface DueDateBadgeProps {
  dueDate: Date;
}

export function DueDateBadge({ dueDate }: DueDateBadgeProps) {
  const { status, text } = useMemo(() => {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (diff < 0) {
      return { status: 'overdue', text: 'Overdue' };
    } else if (days === 0) {
      return { status: 'today', text: 'Due Today' };
    } else if (days === 1) {
      return { status: 'soon', text: 'Due Tomorrow' };
    } else if (days <= 3) {
      return { status: 'soon', text: `Due in ${days} days` };
    } else {
      return { status: 'normal', text: due.toLocaleDateString() };
    }
  }, [dueDate]);

  return (
    <span className={`badge badge-${status}`}>
      {text}
    </span>
  );
}
```

---

## Error Handling

| Error | Status | Message | UI Action |
|-------|--------|---------|-----------|
| Assignment not found | 404 | Assignment not found | Show error, redirect |
| Not enrolled | 403 | Not enrolled in course | Show enrollment prompt |
| Assignment closed | 400 | Assignment is closed | Disable submit button |
| File too large | 400 | File exceeds max size | Show size limit |
| Invalid file type | 400 | File type not allowed | Show allowed types |
| Already submitted | 400 | Submission exists | Show resubmit option |

---

## Best Practices

1. **Auto-save drafts** - Save text drafts to localStorage
2. **File validation** - Check file size/type before upload
3. **Progress indicator** - Show upload progress for large files
4. **Confirmation** - Confirm before final submission
5. **Late warning** - Show warning if submitting after due date
6. **Offline queue** - Queue submissions if offline

---

## Related Modules

- [Grades Module](/api/grades) - Assignment scores saved to grades table
- [Google Drive Module](/api/google-drive) - File storage
- [Courses Module](/api/courses) - Assignments belong to courses
- [Notifications Module](/api/notifications) - Due date reminders

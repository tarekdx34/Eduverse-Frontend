# Labs Frontend Integration Guide

> Complete API reference and integration guide for building lab functionality in the EduVerse frontend.

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

The Labs module supports:
- **Step-by-step Instructions**: Ordered instruction cards with text and files
- **TA Materials**: Private materials (answer keys, rubrics) visible only to TAs/instructors
- **Attendance Tracking**: Mark students as present/absent/late/excused
- **Submissions**: Text or file upload via Google Drive
- **Status**: draft → published → closed → archived
- **Grading**: Manual grading with score and feedback

---

## User Stories

### Instructor

| Story | Description |
|-------|-------------|
| **Create Lab** | Create lab with title, description, due date, max score |
| **Add Instructions** | Add step-by-step instructions with text and/or files |
| **Upload TA Materials** | Upload answer keys, rubrics (private to TAs) |
| **Publish** | Change status to make visible to students |
| **View Submissions** | See all student submissions |
| **Grade** | Assign score and feedback |
| **View Attendance** | See attendance report for lab session |

### Teaching Assistant

| Story | Description |
|-------|-------------|
| **Mark Attendance** | Mark individual student attendance (present/absent/late/excused) |
| **View TA Materials** | Access answer keys and rubrics |
| **Grade Submissions** | Grade assigned student submissions |
| **View Instructions** | View all lab instructions |

### Student

| Story | Description |
|-------|-------------|
| **View Labs** | See all labs for enrolled courses |
| **View Instructions** | See step-by-step lab instructions |
| **Submit Work** | Submit text or upload file |
| **Check Attendance** | See my attendance status |
| **View Grade** | See score and feedback after grading |

---

## API Endpoints

### Lab CRUD

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `GET` | `/api/labs` | List labs (with filters) | All authenticated |
| `GET` | `/api/labs/:id` | Get lab details | All authenticated |
| `POST` | `/api/labs` | Create lab | INSTRUCTOR, ADMIN |
| `PUT` | `/api/labs/:id` | Update lab | INSTRUCTOR, ADMIN |
| `DELETE` | `/api/labs/:id` | Delete lab | INSTRUCTOR, ADMIN |
| `PATCH` | `/api/labs/:id/status` | Change status | INSTRUCTOR, TA, ADMIN |

### Instructions

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `GET` | `/api/labs/:id/instructions` | Get all instructions | All authenticated |
| `POST` | `/api/labs/:id/instructions` | Add instruction | INSTRUCTOR, TA, ADMIN |
| `POST` | `/api/labs/:id/instructions/upload` | Upload instruction file | INSTRUCTOR, TA, ADMIN |

### TA Materials

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `POST` | `/api/labs/:id/ta-materials/upload` | Upload TA material | INSTRUCTOR, TA, ADMIN |

### Submissions

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `GET` | `/api/labs/:id/submissions` | List all submissions | INSTRUCTOR, TA |
| `GET` | `/api/labs/:id/submissions/my` | Get my submission | STUDENT |
| `POST` | `/api/labs/:id/submit` | Submit lab work | STUDENT |
| `POST` | `/api/labs/:id/submissions/upload` | Upload file to Drive | STUDENT |

### Grading

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `PATCH` | `/api/labs/:id/submissions/:subId/grade` | Grade submission | INSTRUCTOR, TA |

### Attendance

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `GET` | `/api/labs/:id/attendance` | Get attendance list | INSTRUCTOR, TA |
| `POST` | `/api/labs/:id/attendance` | Mark attendance | INSTRUCTOR, TA |

---

## Data Models

### Lab

```typescript
interface Lab {
  labId: number;
  courseId: number;
  title: string;
  description?: string;
  dueDate?: Date;
  maxScore: number;
  weight?: number;
  status: 'draft' | 'published' | 'closed' | 'archived';
  instructions?: LabInstruction[];
  createdAt: Date;
  updatedAt: Date;
}
```

### LabInstruction

```typescript
interface LabInstruction {
  instructionId: number;
  labId: number;
  instructionText?: string;  // Markdown supported
  fileId?: number;           // Drive file ID
  file?: DriveFile;
  orderIndex: number;
  createdAt: Date;
}
```

### LabSubmission

```typescript
interface LabSubmission {
  submissionId: number;
  labId: number;
  userId: number;
  user?: User;
  submissionText?: string;
  fileId?: number;
  file?: DriveFile;
  status: 'submitted' | 'graded' | 'returned' | 'resubmit';
  score?: number;
  feedback?: string;
  gradedBy?: number;
  gradedAt?: Date;
  isLate: boolean;
  submittedAt: Date;
}
```

### LabAttendance

```typescript
interface LabAttendance {
  attendanceId: number;
  labId: number;
  userId: number;
  user?: User;
  status: 'present' | 'absent' | 'excused' | 'late';
  notes?: string;
  markedBy: number;
  markedAt: Date;
}
```

---

## Flow Diagrams

### Lab Session Flow

```
┌─────────────────┐
│ Instructor      │
│ Creates Lab     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Add Instructions│
│ (Step by Step)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Upload TA       │
│ Materials       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ PATCH /status   │
│ → "published"   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│            LAB SESSION              │
│  ┌──────────┐      ┌──────────────┐│
│  │   TA     │      │   Students   ││
│  │          │      │              ││
│  │ Mark     │      │ Follow       ││
│  │ Attend.  │      │ Instructions ││
│  │          │      │              ││
│  │ View TA  │      │ Submit Work  ││
│  │ Materials│      │              ││
│  │          │      │ Check Grade  ││
│  │ Grade    │      │              ││
│  └──────────┘      └──────────────┘│
└─────────────────────────────────────┘
```

### Submission & Grading Flow

```
┌─────────────────┐
│ Student Views   │
│ Lab Instructions│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Complete Lab    │
│ Work            │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│ Submit:                     │
│ ┌───────────┐ ┌───────────┐│
│ │ Text      │ │ File      ││
│ │ (markdown)│ │ (upload)  ││
│ └─────┬─────┘ └─────┬─────┘│
└───────┼─────────────┼──────┘
        └──────┬──────┘
               │
               ▼
      ┌─────────────────┐
      │ POST /submit    │
      └────────┬────────┘
               │
               ▼
      ┌─────────────────┐
      │ status:         │
      │ "submitted"     │
      └────────┬────────┘
               │
          TA Grades
               │
               ▼
      ┌─────────────────┐
      │ PATCH /grade    │
      │ score + feedback│
      └────────┬────────┘
               │
               ▼
      ┌─────────────────┐
      │ status: "graded"│
      │ → grades table  │
      └─────────────────┘
```

---

## Component Structure

```
LabModule/
├── instructor/
│   ├── LabList.tsx             # List all labs
│   ├── LabCreate.tsx           # Create lab form
│   ├── LabEdit.tsx             # Edit lab settings
│   ├── InstructionEditor.tsx   # Add/edit instructions
│   ├── TaMaterialUpload.tsx    # Upload answer keys
│   ├── SubmissionList.tsx      # View all submissions
│   └── AttendanceSheet.tsx     # Full attendance grid
├── ta/
│   ├── AttendanceMarker.tsx    # Mark individual attendance
│   ├── SubmissionGrader.tsx    # Grade submissions
│   ├── TaMaterials.tsx         # View answer keys/rubrics
│   └── MyAssignedLabs.tsx      # Labs assigned to TA
├── student/
│   ├── LabList.tsx             # View available labs
│   ├── LabView.tsx             # View lab details
│   ├── InstructionViewer.tsx   # Step-through instructions
│   ├── SubmissionForm.tsx      # Submit work
│   └── MySubmission.tsx        # View grade/feedback
└── shared/
    ├── InstructionCard.tsx     # Single instruction display
    ├── AttendanceBadge.tsx     # Present/absent/late badge
    ├── LabStatusBadge.tsx      # Draft/published/closed
    └── StepProgress.tsx        # Instruction step progress
```

---

## Code Examples

### Create Lab

```typescript
// POST /api/labs
const createLab = async (data: CreateLabDto): Promise<Lab> => {
  const response = await fetch('/api/labs', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      courseId: 1,
      title: 'Lab 1: Introduction to React',
      description: 'Hands-on introduction to React components and hooks.',
      dueDate: '2025-02-15T17:00:00Z',
      maxScore: 50,
      weight: 10,
    }),
  });
  return response.json();
};
```

### Add Instruction

```typescript
// POST /api/labs/:id/instructions
const addInstruction = async (labId: number, text: string, orderIndex: number): Promise<LabInstruction> => {
  const response = await fetch(`/api/labs/${labId}/instructions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      instructionText: text,
      orderIndex,
    }),
  });
  return response.json();
};
```

### Upload Instruction File

```typescript
// POST /api/labs/:id/instructions/upload
const uploadInstructionFile = async (labId: number, file: File): Promise<LabInstruction> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/labs/${labId}/instructions/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  return response.json();
};
```

### Upload TA Material

```typescript
// POST /api/labs/:id/ta-materials/upload
const uploadTaMaterial = async (labId: number, file: File): Promise<void> => {
  const formData = new FormData();
  formData.append('file', file);

  await fetch(`/api/labs/${labId}/ta-materials/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
};
```

### Change Lab Status

```typescript
// PATCH /api/labs/:id/status
const publishLab = async (labId: number): Promise<Lab> => {
  const response = await fetch(`/api/labs/${labId}/status`, {
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

### Mark Attendance

```typescript
// POST /api/labs/:id/attendance
const markAttendance = async (
  labId: number,
  userId: number,
  status: 'present' | 'absent' | 'excused' | 'late',
  notes?: string
): Promise<LabAttendance> => {
  const response = await fetch(`/api/labs/${labId}/attendance`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ userId, status, notes }),
  });
  return response.json();
};
```

### Submit Lab Work

```typescript
// POST /api/labs/:id/submit
const submitLab = async (labId: number, text: string): Promise<LabSubmission> => {
  const response = await fetch(`/api/labs/${labId}/submit`, {
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

### Upload Submission File

```typescript
// POST /api/labs/:id/submissions/upload
const uploadSubmissionFile = async (labId: number, file: File): Promise<{ fileId: number }> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/labs/${labId}/submissions/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  return response.json();
};
```

### Grade Submission

```typescript
// PATCH /api/labs/:id/submissions/:subId/grade
const gradeSubmission = async (
  labId: number,
  submissionId: number,
  score: number,
  feedback: string
): Promise<LabSubmission> => {
  const response = await fetch(
    `/api/labs/${labId}/submissions/${submissionId}/grade`,
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

### Instruction Viewer Component

```typescript
// components/InstructionViewer.tsx
import { useState } from 'react';

interface InstructionViewerProps {
  instructions: LabInstruction[];
}

export function InstructionViewer({ instructions }: InstructionViewerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const sorted = [...instructions].sort((a, b) => a.orderIndex - b.orderIndex);

  const current = sorted[currentStep];
  const canGoPrev = currentStep > 0;
  const canGoNext = currentStep < sorted.length - 1;

  return (
    <div className="instruction-viewer">
      {/* Progress */}
      <div className="step-progress">
        {sorted.map((_, idx) => (
          <div
            key={idx}
            className={`step ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
            onClick={() => setCurrentStep(idx)}
          />
        ))}
      </div>

      {/* Current Instruction */}
      <div className="instruction-card">
        <h3>Step {currentStep + 1} of {sorted.length}</h3>
        
        {current.instructionText && (
          <div className="instruction-text" 
               dangerouslySetInnerHTML={{ __html: renderMarkdown(current.instructionText) }} />
        )}
        
        {current.file && (
          <a href={current.file.webViewLink} target="_blank" rel="noopener noreferrer">
            📎 {current.file.fileName}
          </a>
        )}
      </div>

      {/* Navigation */}
      <div className="navigation">
        <button disabled={!canGoPrev} onClick={() => setCurrentStep(s => s - 1)}>
          ← Previous
        </button>
        <button disabled={!canGoNext} onClick={() => setCurrentStep(s => s + 1)}>
          Next →
        </button>
      </div>
    </div>
  );
}
```

### Attendance Marker Component

```typescript
// components/AttendanceMarker.tsx
import { useState } from 'react';

interface AttendanceMarkerProps {
  labId: number;
  students: User[];
  attendance: LabAttendance[];
  onMark: (userId: number, status: string, notes?: string) => Promise<void>;
}

export function AttendanceMarker({ labId, students, attendance, onMark }: AttendanceMarkerProps) {
  const getStatus = (userId: number) => {
    const record = attendance.find(a => a.userId === userId);
    return record?.status || 'not_marked';
  };

  const statusOptions = ['present', 'absent', 'late', 'excused'];

  return (
    <div className="attendance-marker">
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Status</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {students.map(student => (
            <tr key={student.userId}>
              <td>{student.firstName} {student.lastName}</td>
              <td>
                <select
                  value={getStatus(student.userId)}
                  onChange={(e) => onMark(student.userId, e.target.value)}
                >
                  <option value="not_marked">-- Select --</option>
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </td>
              <td>
                <input
                  type="text"
                  placeholder="Optional notes"
                  onBlur={(e) => {
                    if (e.target.value) {
                      onMark(student.userId, getStatus(student.userId), e.target.value);
                    }
                  }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Error Handling

| Error | Status | Message | UI Action |
|-------|--------|---------|-----------|
| Lab not found | 404 | Lab not found | Show error, redirect |
| Not enrolled | 403 | Not enrolled in course | Show enrollment prompt |
| Lab closed | 400 | Lab is closed | Disable submit |
| Already submitted | 400 | Submission exists | Show resubmit option |
| File too large | 400 | File exceeds max size | Show size limit |
| Attendance exists | 400 | Attendance already marked | Show update option |

---

## Best Practices

1. **Step progress persistence** - Save current step to localStorage
2. **Auto-save drafts** - Save submission drafts
3. **Attendance confirmation** - Confirm before marking absent
4. **File preview** - Preview files before submission
5. **Offline support** - Queue attendance marks if offline
6. **Real-time updates** - Use WebSocket for live attendance status

---

## Related Modules

- [Grades Module](/api/grades) - Lab scores saved to grades table
- [Google Drive Module](/api/google-drive) - File storage
- [Courses Module](/api/courses) - Labs belong to courses
- [Users Module](/api/users) - Student/TA info for attendance

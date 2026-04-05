# Data Model: Wire Dashboard Modules

**Feature Branch**: `001-wire-dashboard-modules`  
**Date**: 2026-03-18

## Entity Overview

```
┌─────────────┐       ┌─────────────────────┐
│   Course    │───────│     Assignment      │
└─────────────┘       └─────────────────────┘
      │                         │
      │               ┌─────────┴─────────┐
      │               │                   │
      ▼               ▼                   ▼
┌─────────────┐  ┌─────────────┐   ┌─────────────┐
│    Quiz     │  │  Submission │   │    User     │
└─────────────┘  └─────────────┘   └─────────────┘
      │                                   │
      │                                   │
      ▼                                   │
┌─────────────┐                           │
│  Question   │                           │
└─────────────┘                           │
      │                                   │
      ▼                                   │
┌─────────────┐       ┌─────────────┐     │
│   Attempt   │◄──────│   Answer    │◄────┘
└─────────────┘       └─────────────┘

┌─────────────┐       ┌─────────────────────┐
│   Course    │───────│       Lab           │
└─────────────┘       └─────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
             ┌─────────────┐     ┌─────────────┐
             │ Instruction │     │ Submission  │
             └─────────────┘     └─────────────┘
```

---

## Entities

### Assignment

Coursework item with due date, scoring, and submission options.

| Field            | Type             | Constraints       | Description                      |
| ---------------- | ---------------- | ----------------- | -------------------------------- | ----------- | --------- | ------ |
| `id`             | string (UUID)    | PK                | Unique identifier                |
| `courseId`       | string (UUID)    | FK → Course       | Parent course                    |
| `title`          | string           | Required, max 255 | Assignment title                 |
| `description`    | string           | Nullable          | Instructions and details         |
| `dueDate`        | ISO 8601 string  | Nullable          | Submission deadline              |
| `maxScore`       | string (decimal) | Required          | Maximum points (e.g., "100.00")  |
| `weight`         | string (decimal) | Required          | Grade weight percentage          |
| `status`         | enum             | Required          | `'draft'                         | 'published' | 'closed'` |
| `submissionType` | enum             | Required          | `'text'                          | 'file'      | 'link'    | 'any'` |
| `latePenalty`    | number           | Nullable          | Percentage deducted per day late |
| `course`         | Course           | Nested            | Course details (read operations) |
| `createdAt`      | ISO 8601         | Auto              | Creation timestamp               |
| `updatedAt`      | ISO 8601         | Auto              | Last modification timestamp      |

**State Transitions:**

```
draft → published → closed
  │         │
  └─────────┘ (can revert to draft if no submissions)
```

---

### AssignmentSubmission

Student's submitted work for an assignment.

| Field              | Type             | Constraints         | Description             |
| ------------------ | ---------------- | ------------------- | ----------------------- | ----------- | --------- |
| `id`               | string (UUID)    | PK                  | Unique identifier       |
| `assignmentId`     | string (UUID)    | FK → Assignment     | Parent assignment       |
| `userId`           | number           | FK → User           | Submitting student      |
| `submissionText`   | string           | Nullable            | Text content            |
| `fileId`           | number           | FK → File, Nullable | Uploaded file reference |
| `submissionStatus` | enum             | Required            | `'pending'              | 'submitted' | 'graded'` |
| `submittedAt`      | ISO 8601         | Auto                | Submission timestamp    |
| `isLate`           | boolean          | Computed            | After dueDate           |
| `score`            | string (decimal) | Nullable            | Assigned grade          |
| `feedback`         | string           | Nullable            | Instructor comments     |
| `gradedBy`         | number           | FK → User, Nullable | Grading user            |
| `gradedAt`         | ISO 8601         | Nullable            | Grading timestamp       |

**State Transitions:**

```
pending → submitted → graded
            │            │
            └────────────┘ (resubmit if allowed)
```

---

### Quiz

Timed assessment with configurable attempts and question types.

| Field              | Type             | Constraints       | Description                        |
| ------------------ | ---------------- | ----------------- | ---------------------------------- | ------------ | --------- | ----------- |
| `id`               | string (UUID)    | PK                | Unique identifier                  |
| `courseId`         | string (UUID)    | FK → Course       | Parent course                      |
| `title`            | string           | Required, max 255 | Quiz title                         |
| `description`      | string           | Nullable          | Quiz instructions                  |
| `quizType`         | enum             | Required          | `'practice'                        | 'graded'`    |
| `timeLimit`        | number           | Nullable          | Minutes allowed (null = unlimited) |
| `maxAttempts`      | number           | Default: 1        | Maximum attempts allowed           |
| `maxScore`         | string (decimal) | Required          | Total possible points              |
| `passingScore`     | string (decimal) | Nullable          | Minimum to pass                    |
| `status`           | enum             | Required          | `'draft'                           | 'published'  | 'closed'` |
| `showAnswersAfter` | enum             | Required          | `'never'                           | 'submission' | 'grading' | 'due_date'` |
| `shuffleQuestions` | boolean          | Default: false    | Randomize question order           |
| `availableFrom`    | ISO 8601         | Nullable          | Start availability window          |
| `availableUntil`   | ISO 8601         | Nullable          | End availability window            |
| `questions`        | QuizQuestion[]   | Nested            | Quiz questions (read)              |

**State Transitions:**

```
draft → published → closed
```

---

### QuizQuestion

Individual question within a quiz.

| Field           | Type             | Constraints | Description                 |
| --------------- | ---------------- | ----------- | --------------------------- | ------------ | -------------- | ------- | ----------- |
| `id`            | string (UUID)    | PK          | Unique identifier           |
| `quizId`        | string (UUID)    | FK → Quiz   | Parent quiz                 |
| `questionType`  | enum             | Required    | `'mcq'                      | 'true_false' | 'short_answer' | 'essay' | 'matching'` |
| `questionText`  | string           | Required    | Question prompt             |
| `points`        | string (decimal) | Required    | Points for correct answer   |
| `order`         | number           | Required    | Display sequence            |
| `options`       | QuestionOption[] | Nullable    | MCQ/matching options        |
| `correctAnswer` | string           | Nullable    | For auto-grading (MCQ, T/F) |
| `explanation`   | string           | Nullable    | Shown after grading         |
| `difficulty`    | enum             | Nullable    | `'easy'                     | 'medium'     | 'hard'`        |

**Question Type Rules:**

- `mcq`: Requires `options` with one `isCorrect: true`
- `true_false`: `correctAnswer` is `'true'` or `'false'`
- `short_answer`: `correctAnswer` for auto-grading or manual
- `essay`: Always manual grading, no `correctAnswer`
- `matching`: `options` with pairs

---

### QuizAttempt

Student's quiz session with timer tracking.

| Field               | Type             | Constraints | Description                 |
| ------------------- | ---------------- | ----------- | --------------------------- | ----------- | --------- |
| `id`                | string (UUID)    | PK          | Unique identifier           |
| `quizId`            | string (UUID)    | FK → Quiz   | Parent quiz                 |
| `userId`            | number           | FK → User   | Attempting student          |
| `status`            | enum             | Required    | `'in_progress'              | 'submitted' | 'graded'` |
| `startedAt`         | ISO 8601         | Auto        | Attempt start time          |
| `submittedAt`       | ISO 8601         | Nullable    | Submission time             |
| `expiresAt`         | ISO 8601         | Computed    | `startedAt + timeLimit`     |
| `score`             | string (decimal) | Nullable    | Total score (after grading) |
| `answers`           | AttemptAnswer[]  | Nested      | Submitted answers           |
| `autoGradedScore`   | string           | Nullable    | Auto-graded portion         |
| `manualGradedScore` | string           | Nullable    | Manually graded portion     |

**State Transitions:**

```
in_progress → submitted → graded
     │
     └─► expired (auto-submit when expiresAt reached)
```

---

### AttemptAnswer

Individual answer within an attempt.

| Field             | Type             | Constraints       | Description           |
| ----------------- | ---------------- | ----------------- | --------------------- |
| `id`              | string (UUID)    | PK                | Unique identifier     |
| `attemptId`       | string (UUID)    | FK → QuizAttempt  | Parent attempt        |
| `questionId`      | string (UUID)    | FK → QuizQuestion | Answered question     |
| `answer`          | string           | Nullable          | Student's response    |
| `selectedOptions` | string[]         | Nullable          | For MCQ/matching      |
| `isCorrect`       | boolean          | Nullable          | Auto-graded result    |
| `score`           | string (decimal) | Nullable          | Assigned points       |
| `feedback`        | string           | Nullable          | Per-question feedback |
| `savedAt`         | ISO 8601         | Auto              | Last auto-save time   |

---

### Lab

Practical assignment with step-by-step instructions.

| Field               | Type             | Constraints       | Description         |
| ------------------- | ---------------- | ----------------- | ------------------- | ----------- | --------- |
| `id`                | string (UUID)    | PK                | Unique identifier   |
| `courseId`          | string (UUID)    | FK → Course       | Parent course       |
| `title`             | string           | Required, max 255 | Lab title           |
| `description`       | string           | Nullable          | Lab overview        |
| `dueDate`           | ISO 8601         | Nullable          | Submission deadline |
| `maxScore`          | string (decimal) | Required          | Maximum points      |
| `status`            | enum             | Required          | `'draft'            | 'published' | 'closed'` |
| `instructions`      | LabInstruction[] | Nested            | Ordered steps       |
| `estimatedDuration` | number           | Nullable          | Minutes to complete |
| `equipmentRequired` | string           | Nullable          | Required materials  |
| `safetyNotes`       | string           | Nullable          | Safety instructions |

---

### LabInstruction

Single step within a lab.

| Field     | Type          | Constraints         | Description             |
| --------- | ------------- | ------------------- | ----------------------- |
| `id`      | string (UUID) | PK                  | Unique identifier       |
| `labId`   | string (UUID) | FK → Lab            | Parent lab              |
| `order`   | number        | Required            | Step sequence (1-based) |
| `content` | string        | Required            | Step instructions       |
| `fileId`  | number        | FK → File, Nullable | Attached resource       |

---

### LabSubmission

Student's submitted lab work.

| Field              | Type             | Constraints         | Description          |
| ------------------ | ---------------- | ------------------- | -------------------- | ----------- | --------- |
| `id`               | string (UUID)    | PK                  | Unique identifier    |
| `labId`            | string (UUID)    | FK → Lab            | Parent lab           |
| `userId`           | number           | FK → User           | Submitting student   |
| `submissionText`   | string           | Nullable            | Lab report text      |
| `fileId`           | number           | FK → File, Nullable | Uploaded file        |
| `submissionStatus` | enum             | Required            | `'pending'           | 'submitted' | 'graded'` |
| `submittedAt`      | ISO 8601         | Auto                | Submission timestamp |
| `score`            | string (decimal) | Nullable            | Assigned grade       |
| `feedback`         | string           | Nullable            | Instructor comments  |

---

## Validation Rules

### Assignment

- `title`: 1-255 characters
- `maxScore`: Positive decimal
- `dueDate`: Must be future date when creating
- `latePenalty`: 0-100 if set

### Quiz

- `timeLimit`: Positive integer if set
- `maxAttempts`: Positive integer, default 1
- `passingScore`: Must be ≤ maxScore
- `availableFrom` < `availableUntil` if both set

### QuizQuestion

- `points`: Positive decimal
- `order`: Unique within quiz
- MCQ: At least 2 options, exactly 1 correct

### Submission (all types)

- Cannot submit after `status: 'closed'` on parent
- Cannot submit if `maxAttempts` exhausted (quiz)
- File: ≤ 10MB, allowed extensions only

---

## TypeScript Definitions

```typescript
// src/types/api.ts

export type AssignmentStatus = 'draft' | 'published' | 'closed';
export type SubmissionStatus = 'pending' | 'submitted' | 'graded';
export type QuizType = 'practice' | 'graded';
export type QuestionType = 'mcq' | 'true_false' | 'short_answer' | 'essay' | 'matching';
export type ShowAnswersAfter = 'never' | 'submission' | 'grading' | 'due_date';
export type AttemptStatus = 'in_progress' | 'submitted' | 'graded';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  maxScore: string;
  weight: string;
  status: AssignmentStatus;
  submissionType?: 'text' | 'file' | 'link' | 'any';
  latePenalty?: number | null;
  course?: { id: string; name: string; code: string };
  createdAt?: string;
  updatedAt?: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  userId: number;
  submissionText: string | null;
  fileId: number | null;
  submissionStatus: SubmissionStatus;
  submittedAt: string;
  isLate?: boolean;
  score?: string | null;
  feedback?: string | null;
  gradedBy?: number | null;
  gradedAt?: string | null;
}

export interface Quiz {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  quizType: QuizType;
  timeLimit: number | null;
  maxAttempts: number;
  maxScore: string;
  passingScore?: string | null;
  status: AssignmentStatus;
  showAnswersAfter: ShowAnswersAfter;
  shuffleQuestions?: boolean;
  availableFrom?: string | null;
  availableUntil?: string | null;
  questions?: QuizQuestion[];
}

export interface QuizQuestion {
  id: string;
  quizId: string;
  questionType: QuestionType;
  questionText: string;
  points: string;
  order: number;
  options?: QuestionOption[] | null;
  correctAnswer?: string | null;
  explanation?: string | null;
  difficulty?: Difficulty | null;
}

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  matchWith?: string; // For matching questions
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: number;
  status: AttemptStatus;
  startedAt: string;
  submittedAt?: string | null;
  expiresAt?: string | null;
  score?: string | null;
  autoGradedScore?: string | null;
  manualGradedScore?: string | null;
  answers?: AttemptAnswer[];
}

export interface AttemptAnswer {
  id: string;
  attemptId: string;
  questionId: string;
  answer?: string | null;
  selectedOptions?: string[] | null;
  isCorrect?: boolean | null;
  score?: string | null;
  feedback?: string | null;
  savedAt?: string;
}

export interface Lab {
  id: string;
  courseId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  maxScore: string;
  status: AssignmentStatus;
  instructions?: LabInstruction[];
  estimatedDuration?: number | null;
  equipmentRequired?: string | null;
  safetyNotes?: string | null;
}

export interface LabInstruction {
  id: string;
  labId: string;
  order: number;
  content: string;
  fileId?: number | null;
}

export interface LabSubmission {
  id: string;
  labId: string;
  userId: number;
  submissionText: string | null;
  fileId: number | null;
  submissionStatus: SubmissionStatus;
  submittedAt: string;
  score?: string | null;
  feedback?: string | null;
}

// Utility types
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiError {
  statusCode: number;
  message: string;
  error?: string;
}
```

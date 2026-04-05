# Quizzes Frontend Integration Guide

> Complete API reference and integration guide for building quiz functionality in the EduVerse frontend.

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

The Quizzes module supports:
- **Question Types**: MCQ, True/False, Short Answer, Essay, Matching
- **Auto-grading**: MCQ, True/False, Short Answer (exact match)
- **Manual grading**: Essay, Short Answer (flexible grading)
- **Settings**: Time limits, max attempts, randomization, passing score
- **Status**: draft → published → closed → archived

---

## User Stories

### Instructor

| Story | Description |
|-------|-------------|
| **Create Quiz** | Create a quiz with title, description, settings (time limit, max attempts, passing score) |
| **Add Questions** | Add questions with types: MCQ, true/false, short answer, essay, matching |
| **Reorder Questions** | Drag-and-drop to reorder questions |
| **Publish/Unpublish** | Change quiz status (draft/published/closed/archived) |
| **View Attempts** | See all student attempts with scores |
| **Manual Grade** | Grade essay/short answer questions with points and feedback |
| **View Statistics** | See quiz analytics (avg score, pass rate, question analysis) |

### Student

| Story | Description |
|-------|-------------|
| **View Quizzes** | See available quizzes for enrolled courses |
| **Start Quiz** | Begin a new attempt (if attempts remaining) |
| **Answer Questions** | Answer questions with timer countdown |
| **Submit Quiz** | Submit answers and see immediate results (auto-graded) |
| **View Results** | See detailed results with correct answers (after submission) |
| **View History** | See all past attempts with scores |

---

## API Endpoints

### Quiz CRUD

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `GET` | `/api/quizzes` | List quizzes (with filters) | All authenticated |
| `GET` | `/api/quizzes/:id` | Get quiz details | All authenticated |
| `POST` | `/api/quizzes` | Create quiz | INSTRUCTOR, TA, ADMIN |
| `PUT` | `/api/quizzes/:id` | Update quiz | INSTRUCTOR, TA, ADMIN |
| `DELETE` | `/api/quizzes/:id` | Delete quiz | INSTRUCTOR, TA, ADMIN |
| `PATCH` | `/api/quizzes/:id/status` | Change status | INSTRUCTOR, TA, ADMIN |

### Questions

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `POST` | `/api/quizzes/:quizId/questions` | Add question | INSTRUCTOR, TA, ADMIN |
| `PUT` | `/api/quizzes/:quizId/questions/:questionId` | Update question | INSTRUCTOR, TA, ADMIN |
| `DELETE` | `/api/quizzes/:quizId/questions/:questionId` | Delete question | INSTRUCTOR, TA, ADMIN |
| `PUT` | `/api/quizzes/:quizId/questions/reorder` | Reorder questions | INSTRUCTOR, TA, ADMIN |

### Student Attempts

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `POST` | `/api/quizzes/:quizId/attempts/start` | Start new attempt | STUDENT |
| `POST` | `/api/quizzes/attempts/:attemptId/submit` | Submit answers | STUDENT |
| `GET` | `/api/quizzes/attempts/:attemptId` | Get attempt details | STUDENT (own), INSTRUCTOR |
| `GET` | `/api/quizzes/my-attempts` | List my attempts | STUDENT |

### Grading

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `GET` | `/api/quizzes/attempts/:attemptId/pending-grading` | Get pending questions | INSTRUCTOR, TA |
| `POST` | `/api/quizzes/attempts/:attemptId/grade` | Apply manual grades | INSTRUCTOR, TA |

### Statistics

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| `GET` | `/api/quizzes/:quizId/statistics` | Quiz analytics | INSTRUCTOR, TA, ADMIN |
| `GET` | `/api/quizzes/:quizId/progress/:studentId` | Student progress | INSTRUCTOR, TA |

---

## Data Models

### Quiz

```typescript
interface Quiz {
  quizId: number;
  courseId: number;
  title: string;
  description?: string;
  status: 'draft' | 'published' | 'closed' | 'archived';
  timeLimitMinutes?: number;
  maxAttempts?: number;
  passingScore?: number;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showCorrectAnswers: boolean;
  availableFrom?: Date;
  availableUntil?: Date;
  questions?: QuizQuestion[];
  createdAt: Date;
  updatedAt: Date;
}
```

### QuizQuestion

```typescript
interface QuizQuestion {
  questionId: number;
  quizId: number;
  questionType: 'mcq' | 'true_false' | 'short_answer' | 'essay' | 'matching';
  questionText: string;
  options?: string[];      // For MCQ: ["Option A", "Option B", ...]
  correctAnswer?: string;  // For MCQ: "A" | For true/false: "true"/"false"
  matchingPairs?: { left: string; right: string }[];
  points: number;
  orderIndex: number;
  difficultyLevel?: QuizDifficultyLevel;
}
```

### QuizAttempt

```typescript
interface QuizAttempt {
  attemptId: number;
  quizId: number;
  userId: number;
  status: 'in_progress' | 'submitted' | 'graded' | 'abandoned';
  startTime: Date;
  submitTime?: Date;
  score?: number;
  maxScore?: number;
  percentage?: number;
  passed?: boolean;
  answers?: QuizAnswer[];
}
```

### QuizAnswer

```typescript
interface QuizAnswer {
  answerId: number;
  attemptId: number;
  questionId: number;
  answerText?: string;
  selectedOptions?: string[];
  matchingAnswers?: { left: string; right: string }[];
  isCorrect?: boolean;
  pointsEarned?: number;
  feedback?: string;
}
```

---

## Flow Diagrams

### Quiz Taking Flow

```
┌─────────────────┐
│ Student Views   │
│ Available Quiz  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ POST /attempts  │
│     /start      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Quiz In Progress│
│ Timer Running   │◄──────┐
└────────┬────────┘       │
         │                │
    Navigate         Save Progress
    Questions            │
         │                │
         ▼                │
┌─────────────────┐       │
│ Answer Question │───────┘
└────────┬────────┘
         │
    Time Up / Submit
         │
         ▼
┌─────────────────┐
│ POST /attempts  │
│    /submit      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Auto-Grade MCQ, │
│ True/False      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Show Results    │
│ (partial if     │
│ essays pending) │
└─────────────────┘
```

### Quiz Creation Flow

```
┌─────────────────┐
│ Instructor      │
│ Creates Quiz    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ POST /quizzes   │
│ (status: draft) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Add Questions   │
│ POST /questions │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Reorder/Edit    │
│ Questions       │
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
│ Take Quiz       │
└─────────────────┘
```

---

## Component Structure

```
QuizModule/
├── instructor/
│   ├── QuizList.tsx           # List all quizzes with filters
│   ├── QuizCreate.tsx         # Create new quiz form
│   ├── QuizEdit.tsx           # Edit quiz settings
│   ├── QuestionEditor.tsx     # Add/edit questions
│   ├── QuestionReorder.tsx    # Drag-drop reorder
│   ├── AttemptsList.tsx       # View student attempts
│   ├── GradingQueue.tsx       # Manual grading UI
│   └── QuizStatistics.tsx     # Analytics dashboard
├── student/
│   ├── AvailableQuizzes.tsx   # View available quizzes
│   ├── QuizTaker.tsx          # Take quiz with timer
│   ├── QuestionDisplay.tsx    # Render question by type
│   ├── QuizResults.tsx        # View results after submit
│   └── AttemptHistory.tsx     # Past attempts
└── shared/
    ├── Timer.tsx              # Countdown timer
    ├── ProgressBar.tsx        # Question progress
    └── QuestionTypeIcon.tsx   # Icon by question type
```

---

## Code Examples

### Create Quiz

```typescript
// POST /api/quizzes
const createQuiz = async (data: CreateQuizDto): Promise<Quiz> => {
  const response = await fetch('/api/quizzes', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      courseId: 1,
      title: 'Midterm Quiz',
      description: 'Covers chapters 1-5',
      timeLimitMinutes: 60,
      maxAttempts: 2,
      passingScore: 70,
      randomizeQuestions: true,
      randomizeOptions: true,
      showCorrectAnswers: true,
      availableFrom: '2025-02-01T08:00:00Z',
      availableUntil: '2025-02-15T23:59:59Z',
    }),
  });
  return response.json();
};
```

### Add MCQ Question

```typescript
// POST /api/quizzes/:quizId/questions
const addQuestion = async (quizId: number): Promise<QuizQuestion> => {
  const response = await fetch(`/api/quizzes/${quizId}/questions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      questionType: 'mcq',
      questionText: 'What is the capital of France?',
      options: ['London', 'Paris', 'Berlin', 'Madrid'],
      correctAnswer: 'B',
      points: 10,
    }),
  });
  return response.json();
};
```

### Change Quiz Status

```typescript
// PATCH /api/quizzes/:id/status
const publishQuiz = async (quizId: number): Promise<Quiz> => {
  const response = await fetch(`/api/quizzes/${quizId}/status`, {
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

### Start Quiz Attempt

```typescript
// POST /api/quizzes/:quizId/attempts/start
const startAttempt = async (quizId: number): Promise<QuizAttempt> => {
  const response = await fetch(`/api/quizzes/${quizId}/attempts/start`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};
```

### Submit Quiz

```typescript
// POST /api/quizzes/attempts/:attemptId/submit
const submitQuiz = async (attemptId: number, answers: SubmitAnswerDto[]): Promise<QuizAttempt> => {
  const response = await fetch(`/api/quizzes/attempts/${attemptId}/submit`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ answers }),
  });
  return response.json();
};

// Example answers array
const answers: SubmitAnswerDto[] = [
  { questionId: 1, answerText: 'B' },           // MCQ
  { questionId: 2, answerText: 'true' },        // True/False
  { questionId: 3, answerText: 'Photosynthesis' }, // Short answer
  { questionId: 4, answerText: 'Essay response...' }, // Essay
];
```

### Manual Grading

```typescript
// POST /api/quizzes/attempts/:attemptId/grade
const gradeEssay = async (attemptId: number, grades: ManualGradeDto[]): Promise<void> => {
  await fetch(`/api/quizzes/attempts/${attemptId}/grade`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      grades: [
        {
          questionId: 4,
          pointsEarned: 8,
          feedback: 'Good analysis but missing conclusion.',
        },
      ],
    }),
  });
};
```

### Timer Component

```typescript
// components/Timer.tsx
import { useEffect, useState } from 'react';

interface TimerProps {
  endTime: Date;
  onTimeUp: () => void;
}

export function Timer({ endTime, onTimeUp }: TimerProps) {
  const [remaining, setRemaining] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      
      setRemaining(diff);
      
      if (diff === 0) {
        clearInterval(interval);
        onTimeUp();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime, onTimeUp]);

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <div className={`timer ${remaining < 300 ? 'warning' : ''}`}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
}
```

---

## Error Handling

| Error | Status | Message | UI Action |
|-------|--------|---------|-----------|
| Quiz not found | 404 | Quiz not found | Show error, redirect to list |
| Max attempts exceeded | 400 | Maximum attempts exceeded | Show message, disable start |
| Quiz closed | 400 | Quiz is closed | Show message |
| Time expired | 400 | Quiz time limit exceeded | Auto-submit, show results |
| Not enrolled | 403 | Not enrolled in course | Show enrollment prompt |

---

## Best Practices

1. **Auto-save answers** - Save answers to localStorage during quiz to prevent data loss
2. **Confirm submit** - Show confirmation dialog before final submit
3. **Handle timer edge cases** - Auto-submit when timer reaches 0
4. **Offline handling** - Queue answer submissions and retry on reconnect
5. **Accessibility** - Ensure all question types are keyboard navigable
6. **Progress indication** - Show which questions are answered vs unanswered

---

## Related Modules

- [Grades Module](/api/grades) - Quiz scores are saved to grades table
- [Courses Module](/api/courses) - Quizzes belong to courses
- [Notifications Module](/api/notifications) - Quiz deadline reminders

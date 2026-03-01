# Phase 1: Core Academic Operations

> **Priority**: 🔴 Critical  
> **Modules**: 5  
> **Reason**: Every dashboard (Admin, Instructor, Student, TA) depends on these modules for core LMS functionality.

---

## 1.1 Assignments Module

### Database Tables
| Table | Description |
|-------|-------------|
| `assignments` | Assignment definitions with due dates, points, course linkage |
| `assignment_submissions` | Student assignment submissions with files, grades, feedback |

### Entity Definitions

#### Assignment Entity
```typescript
@Entity('assignments')
export class Assignment {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  assignmentId: number;

  @Column({ type: 'bigint', unsigned: true })
  sectionId: number;

  @ManyToOne(() => CourseSection)
  @JoinColumn({ name: 'section_id' })
  section: CourseSection;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['homework', 'project', 'essay', 'presentation', 'other'] })
  assignmentType: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  maxScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  availableFrom: Date;

  @Column({ type: 'timestamp', nullable: true })
  availableUntil: Date;

  @Column({ type: 'tinyint', default: 1 })
  maxAttempts: number;

  @Column({ type: 'tinyint', default: 0 })
  allowLateSubmission: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  latePenaltyPercent: number;

  @Column({ type: 'text', nullable: true })
  instructions: string;

  @Column({ type: 'json', nullable: true })
  attachments: any;

  @Column({ type: 'json', nullable: true })
  rubricCriteria: any;

  @Column({ type: 'enum', enum: ['draft', 'published', 'closed', 'archived'], default: 'draft' })
  status: string;

  @Column({ type: 'bigint', unsigned: true })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => AssignmentSubmission, sub => sub.assignment)
  submissions: AssignmentSubmission[];
}
```

#### AssignmentSubmission Entity
```typescript
@Entity('assignment_submissions')
export class AssignmentSubmission {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  submissionId: number;

  @Column({ type: 'bigint', unsigned: true })
  assignmentId: number;

  @ManyToOne(() => Assignment, a => a.submissions)
  @JoinColumn({ name: 'assignment_id' })
  assignment: Assignment;

  @Column({ type: 'bigint', unsigned: true })
  studentId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ type: 'text', nullable: true })
  submissionText: string;

  @Column({ type: 'json', nullable: true })
  submissionFiles: any;

  @Column({ type: 'enum', enum: ['submitted', 'late', 'graded', 'returned', 'resubmitted'], default: 'submitted' })
  status: string;

  @Column({ type: 'int', default: 1 })
  attemptNumber: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  gradedBy: number;

  @Column({ type: 'timestamp', nullable: true })
  gradedAt: Date;

  @Column({ type: 'timestamp' })
  submittedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### DTOs

#### CreateAssignmentDto
```typescript
export class CreateAssignmentDto {
  @IsNumber()
  sectionId: number;

  @IsString()
  @Length(3, 200)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(['homework', 'project', 'essay', 'presentation', 'other'])
  assignmentType: string;

  @IsNumber()
  @Min(0)
  @Max(1000)
  maxScore: number;

  @IsNumber()
  @IsOptional()
  weight?: number;

  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @IsDateString()
  @IsOptional()
  availableFrom?: string;

  @IsDateString()
  @IsOptional()
  availableUntil?: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  @IsOptional()
  maxAttempts?: number;

  @IsBoolean()
  @IsOptional()
  allowLateSubmission?: boolean;

  @IsNumber()
  @IsOptional()
  latePenaltyPercent?: number;

  @IsString()
  @IsOptional()
  instructions?: string;

  @IsOptional()
  attachments?: any;

  @IsOptional()
  rubricCriteria?: any;

  @IsEnum(['draft', 'published'])
  @IsOptional()
  status?: string;
}
```

#### SubmitAssignmentDto
```typescript
export class SubmitAssignmentDto {
  @IsString()
  @IsOptional()
  submissionText?: string;

  @IsOptional()
  submissionFiles?: any;
}
```

#### GradeSubmissionDto
```typescript
export class GradeSubmissionDto {
  @IsNumber()
  @Min(0)
  score: number;

  @IsString()
  @IsOptional()
  feedback?: string;
}
```

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/assignments` | List assignments (filter by section, course, status) | ALL |
| POST | `/api/assignments` | Create assignment | INSTRUCTOR, ADMIN |
| GET | `/api/assignments/:id` | Get assignment details | ALL |
| PATCH | `/api/assignments/:id` | Update assignment | INSTRUCTOR, ADMIN |
| DELETE | `/api/assignments/:id` | Delete assignment | INSTRUCTOR, ADMIN |
| PATCH | `/api/assignments/:id/status` | Change assignment status (publish/close) | INSTRUCTOR, ADMIN |
| POST | `/api/assignments/:id/submit` | Submit assignment (student) | STUDENT |
| GET | `/api/assignments/:id/submissions` | List all submissions for assignment | INSTRUCTOR, TA, ADMIN |
| GET | `/api/assignments/:id/submissions/my` | Get student's own submission | STUDENT |
| PATCH | `/api/assignments/:id/submissions/:subId/grade` | Grade a submission | INSTRUCTOR, TA |

### Query Parameters (GET /api/assignments)
```typescript
interface QueryAssignmentsDto {
  sectionId?: number;
  courseId?: number;
  status?: 'draft' | 'published' | 'closed' | 'archived';
  assignmentType?: string;
  dueBefore?: string;    // ISO date
  dueAfter?: string;     // ISO date
  search?: string;       // search in title
  page?: number;
  limit?: number;
  sortBy?: 'dueDate' | 'createdAt' | 'title';
  sortOrder?: 'ASC' | 'DESC';
}
```

### Business Logic
1. **Late submission handling**: If `allowLateSubmission` is true and submission is after `dueDate`, mark status as `late` and apply `latePenaltyPercent` to score.
2. **Max attempts**: Reject submissions exceeding `maxAttempts`. Track `attemptNumber`.
3. **Availability window**: Reject submissions outside `availableFrom` - `availableUntil`.
4. **Status transitions**: `draft` → `published` → `closed` → `archived`.
5. **Cascade**: When assignment is deleted, soft-delete submissions.

### Frontend Components Using This Module
- **Instructor**: AssignmentsList.tsx, AssignmentModal.tsx, CourseDetail.tsx
- **Student**: Assignments.tsx, AssignmentDetails.tsx
- **TA**: GradingPage.tsx
- **Admin**: CourseManagementPage.tsx

---

## 1.2 Grades Module

### Database Tables
| Table | Description |
|-------|-------------|
| `grades` | Individual grades for assignments, quizzes, labs |
| `grade_components` | Breakdown of grades by rubric criteria |
| `rubrics` | Grading rubrics with scoring criteria |
| `ai_grading_results` | AI-generated grades and feedback |
| `collaborative_grading` | Multi-rater grading records |

### Entity Definitions

#### Grade Entity
```typescript
@Entity('grades')
export class Grade {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  gradeId: number;

  @Column({ type: 'bigint', unsigned: true })
  enrollmentId: number;

  @ManyToOne(() => CourseEnrollment)
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: CourseEnrollment;

  @Column({ type: 'enum', enum: ['assignment', 'quiz', 'lab', 'midterm', 'final', 'participation', 'project', 'other'] })
  gradeType: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  referenceId: number;   // assignment_id, quiz_id, or lab_id

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  score: number;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  maxScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'varchar', length: 5, nullable: true })
  letterGrade: string;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  gradedBy: number;

  @Column({ type: 'timestamp', nullable: true })
  gradedAt: Date;

  @Column({ type: 'tinyint', default: 0 })
  isFinalized: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### Rubric Entity
```typescript
@Entity('rubrics')
export class Rubric {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  rubricId: number;

  @Column({ type: 'bigint', unsigned: true })
  sectionId: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'json' })
  criteria: any;  // Array of { name, description, maxPoints, levels[] }

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  totalPoints: number;

  @Column({ type: 'bigint', unsigned: true })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/grades` | List grades (filter by student, course, section, type) | INSTRUCTOR, TA, ADMIN |
| GET | `/api/grades/my` | Get current student's grades | STUDENT |
| PUT | `/api/grades/:id` | Update a grade | INSTRUCTOR, TA |
| PATCH | `/api/grades/:id/finalize` | Finalize grade (no more changes) | INSTRUCTOR |
| GET | `/api/grades/transcript/:studentId` | Full transcript for student | STUDENT (own), ADMIN |
| GET | `/api/grades/gpa/:studentId` | Calculate GPA | STUDENT (own), ADMIN |
| GET | `/api/grades/distribution/:sectionId` | Grade distribution for section | INSTRUCTOR, TA, ADMIN |
| GET | `/api/rubrics` | List rubrics for a section | INSTRUCTOR, TA |
| POST | `/api/rubrics` | Create rubric | INSTRUCTOR |
| PUT | `/api/rubrics/:id` | Update rubric | INSTRUCTOR |
| DELETE | `/api/rubrics/:id` | Delete rubric | INSTRUCTOR |

### Business Logic
1. **GPA Calculation**: Use weighted grade points based on credits.
   - A=4.0, A-=3.7, B+=3.3, B=3.0, B-=2.7, C+=2.3, C=2.0, C-=1.7, D+=1.3, D=1.0, F=0.0
   - GPA = Σ(grade_point × credits) / Σ(credits)
2. **Letter Grade Auto-Assignment**: Based on score percentage.
   - 93-100=A, 90-92=A-, 87-89=B+, 83-86=B, 80-82=B-, etc.
3. **Grade Finalization**: Once finalized, grades cannot be changed without admin override.
4. **Transcript**: Group grades by semester, include cumulative GPA.

### Frontend Components Using This Module
- **Instructor**: GradesTable.tsx, GradeModal.tsx, CourseDetail.tsx
- **Student**: GradesTranscript.tsx, GradeAnalysis.tsx, GpaChart.tsx
- **TA**: GradingPage.tsx
- ~~**Admin**: AnalyticsReportsPage.tsx~~ *(Not in Admin sidebar — deleted)*

---

## 1.3 Attendance Module

### Database Tables
| Table | Description |
|-------|-------------|
| `attendance_sessions` | Class session records for attendance |
| `attendance_records` | Individual student attendance marks |
| `attendance_photos` | Photos uploaded for face recognition |
| `ai_attendance_processing` | AI face recognition processing results |
| `face_recognition_data` | Face encoding data for students |

### Entity Definitions

#### AttendanceSession Entity
```typescript
@Entity('attendance_sessions')
export class AttendanceSession {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  sessionId: number;

  @Column({ type: 'bigint', unsigned: true })
  sectionId: number;

  @ManyToOne(() => CourseSection)
  @JoinColumn({ name: 'section_id' })
  section: CourseSection;

  @Column({ type: 'date' })
  sessionDate: string;

  @Column({ type: 'time', nullable: true })
  startTime: string;

  @Column({ type: 'time', nullable: true })
  endTime: string;

  @Column({ type: 'enum', enum: ['lecture', 'lab', 'tutorial', 'exam', 'other'], default: 'lecture' })
  sessionType: string;

  @Column({ type: 'enum', enum: ['scheduled', 'in_progress', 'completed', 'cancelled'], default: 'scheduled' })
  status: string;

  @Column({ type: 'bigint', unsigned: true })
  createdBy: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => AttendanceRecord, record => record.session)
  records: AttendanceRecord[];
}
```

#### AttendanceRecord Entity
```typescript
@Entity('attendance_records')
export class AttendanceRecord {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  recordId: number;

  @Column({ type: 'bigint', unsigned: true })
  sessionId: number;

  @ManyToOne(() => AttendanceSession, session => session.records)
  @JoinColumn({ name: 'session_id' })
  session: AttendanceSession;

  @Column({ type: 'bigint', unsigned: true })
  studentId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ type: 'enum', enum: ['present', 'absent', 'late', 'excused'], default: 'absent' })
  status: string;

  @Column({ type: 'time', nullable: true })
  checkInTime: string;

  @Column({ type: 'time', nullable: true })
  checkOutTime: string;

  @Column({ type: 'enum', enum: ['manual', 'qr_code', 'face_recognition', 'auto'], default: 'manual' })
  verificationMethod: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  markedBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/attendance/sessions` | List attendance sessions (filter by section, date range) | ALL |
| POST | `/api/attendance/sessions` | Create attendance session | INSTRUCTOR, TA |
| GET | `/api/attendance/sessions/:id` | Get session with records | ALL |
| PUT | `/api/attendance/sessions/:id` | Update session | INSTRUCTOR, TA |
| DELETE | `/api/attendance/sessions/:id` | Delete session | INSTRUCTOR |
| GET | `/api/attendance/sessions/:id/records` | Get attendance records for session | INSTRUCTOR, TA, ADMIN |
| POST | `/api/attendance/sessions/:id/records` | Mark attendance (bulk) | INSTRUCTOR, TA |
| PUT | `/api/attendance/records/:id` | Update individual record | INSTRUCTOR, TA |
| GET | `/api/attendance/summary/:sectionId` | Attendance summary for section | INSTRUCTOR, TA, ADMIN |
| GET | `/api/attendance/student/:studentId` | Student's attendance across courses | STUDENT (own), INSTRUCTOR, ADMIN |
| GET | `/api/attendance/trends/:sectionId` | Weekly attendance trends | INSTRUCTOR, TA, ADMIN |
| POST | `/api/attendance/photos` | Upload attendance photo (AI processing) | INSTRUCTOR, TA |

### Business Logic
1. **Attendance Summary**: Calculate present/absent/late percentages per student per course.
2. **Risk Detection**: Flag students with attendance < 75% as at-risk.
3. **Bulk Marking**: Allow marking multiple students at once.
4. **Auto-calculation**: When a session is created, auto-create records for all enrolled students (default: absent).
5. **Trend Analysis**: Calculate weekly attendance rates.

### Frontend Components Using This Module
- **Instructor**: AttendanceTable.tsx, AttendanceModal.tsx
- **Student**: AttendanceOverview.tsx
- ~~**TA**: AttendancePage.tsx~~ *(Removed from TA sidebar — task T7; attendance now integrated into course tab per T4)*
- ~~**Admin**: AttendanceManagementPage.tsx~~ *(Not in Admin sidebar — deleted)*

---

## 1.4 Quizzes Module

### Database Tables
| Table | Description |
|-------|-------------|
| `quizzes` | Quiz definitions and configuration |
| `quiz_questions` | Individual quiz questions (MCQ, true/false, short answer) |
| `quiz_attempts` | Student quiz attempts |
| `quiz_answers` | Individual answers within quiz attempts |
| `quiz_difficulty_levels` | Difficulty classifications |

### Entity Definitions

#### Quiz Entity
```typescript
@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  quizId: number;

  @Column({ type: 'bigint', unsigned: true })
  sectionId: number;

  @ManyToOne(() => CourseSection)
  @JoinColumn({ name: 'section_id' })
  section: CourseSection;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['practice', 'graded', 'survey'], default: 'graded' })
  quizType: string;

  @Column({ type: 'int', nullable: true })
  timeLimitMinutes: number;

  @Column({ type: 'int', default: 1 })
  maxAttempts: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  totalPoints: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  passingScore: number;

  @Column({ type: 'tinyint', default: 1 })
  shuffleQuestions: boolean;

  @Column({ type: 'tinyint', default: 1 })
  shuffleOptions: boolean;

  @Column({ type: 'tinyint', default: 0 })
  showCorrectAnswers: boolean;

  @Column({ type: 'tinyint', default: 0 })
  showScoreImmediately: boolean;

  @Column({ type: 'timestamp', nullable: true })
  availableFrom: Date;

  @Column({ type: 'timestamp', nullable: true })
  availableUntil: Date;

  @Column({ type: 'enum', enum: ['draft', 'published', 'closed', 'archived'], default: 'draft' })
  status: string;

  @Column({ type: 'bigint', unsigned: true })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => QuizQuestion, q => q.quiz)
  questions: QuizQuestion[];

  @OneToMany(() => QuizAttempt, a => a.quiz)
  attempts: QuizAttempt[];
}
```

#### QuizQuestion Entity
```typescript
@Entity('quiz_questions')
export class QuizQuestion {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  questionId: number;

  @Column({ type: 'bigint', unsigned: true })
  quizId: number;

  @ManyToOne(() => Quiz, quiz => quiz.questions)
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @Column({ type: 'text' })
  questionText: string;

  @Column({ type: 'enum', enum: ['multiple_choice', 'true_false', 'short_answer', 'essay', 'matching', 'fill_blank'] })
  questionType: string;

  @Column({ type: 'json', nullable: true })
  options: any;  // Array of { text, isCorrect }

  @Column({ type: 'text', nullable: true })
  correctAnswer: string;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  points: number;

  @Column({ type: 'int', default: 0 })
  orderIndex: number;

  @Column({ type: 'text', nullable: true })
  explanation: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  difficultyLevelId: number;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### QuizAttempt Entity
```typescript
@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  attemptId: number;

  @Column({ type: 'bigint', unsigned: true })
  quizId: number;

  @ManyToOne(() => Quiz, quiz => quiz.attempts)
  @JoinColumn({ name: 'quiz_id' })
  quiz: Quiz;

  @Column({ type: 'bigint', unsigned: true })
  studentId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @Column({ type: 'int', default: 1 })
  attemptNumber: number;

  @Column({ type: 'timestamp' })
  startedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  score: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  percentage: number;

  @Column({ type: 'tinyint', nullable: true })
  passed: boolean;

  @Column({ type: 'enum', enum: ['in_progress', 'completed', 'timed_out', 'abandoned'], default: 'in_progress' })
  status: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => QuizAnswer, a => a.attempt)
  answers: QuizAnswer[];
}
```

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/quizzes` | List quizzes (filter by section, status) | ALL |
| POST | `/api/quizzes` | Create quiz | INSTRUCTOR, TA |
| GET | `/api/quizzes/:id` | Get quiz details (with questions for instructor) | ALL |
| PUT | `/api/quizzes/:id` | Update quiz | INSTRUCTOR, TA |
| DELETE | `/api/quizzes/:id` | Delete quiz | INSTRUCTOR |
| PATCH | `/api/quizzes/:id/status` | Change quiz status | INSTRUCTOR |
| GET | `/api/quizzes/:id/questions` | Get questions (instructor view with answers) | INSTRUCTOR, TA |
| POST | `/api/quizzes/:id/questions` | Add question to quiz | INSTRUCTOR, TA |
| PUT | `/api/quizzes/:id/questions/:qId` | Update question | INSTRUCTOR, TA |
| DELETE | `/api/quizzes/:id/questions/:qId` | Delete question | INSTRUCTOR, TA |
| POST | `/api/quizzes/:id/attempt` | Start quiz attempt (student) | STUDENT |
| POST | `/api/quizzes/:id/submit` | Submit quiz answers | STUDENT |
| GET | `/api/quizzes/:id/attempts` | List all attempts (instructor view) | INSTRUCTOR, TA, ADMIN |
| GET | `/api/quizzes/:id/my-attempts` | Get student's own attempts | STUDENT |
| GET | `/api/quizzes/:id/results` | Quiz analytics (avg score, pass rate) | INSTRUCTOR, TA |
| POST | `/api/quizzes/generate` | AI-generate quiz from content | INSTRUCTOR, TA |

### Business Logic
1. **Time Limit**: Track start time. Auto-submit when time expires. Mark as `timed_out`.
2. **Max Attempts**: Reject new attempts if `maxAttempts` reached.
3. **Auto-Grading**: MCQ and true/false auto-graded on submit. Short answer/essay requires manual grading.
4. **Question Shuffling**: Randomize question order and option order per attempt.
5. **Score Calculation**: Sum points for correct answers. Calculate percentage.
6. **Pass/Fail**: Compare score against `passingScore`.
7. **Student View**: Never expose `correctAnswer` or `isCorrect` until quiz allows it.

### Frontend Components Using This Module
- **Instructor**: QuizzesPage.tsx
- **Student**: QuizTaking.tsx
- **TA**: QuizzesPage.tsx

---

## 1.5 Labs Module

### Database Tables
| Table | Description |
|-------|-------------|
| `labs` | Lab assignment definitions |
| `lab_submissions` | Lab submission records |
| `lab_instructions` | Step-by-step lab instructions |
| `lab_attendance` | Lab session attendance tracking |

### Entity Definitions

#### Lab Entity
```typescript
@Entity('labs')
export class Lab {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  labId: number;

  @Column({ type: 'bigint', unsigned: true })
  sectionId: number;

  @ManyToOne(() => CourseSection)
  @JoinColumn({ name: 'section_id' })
  section: CourseSection;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  labNumber: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 100 })
  maxScore: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  weight: number;

  @Column({ type: 'timestamp', nullable: true })
  dueDate: Date;

  @Column({ type: 'text', nullable: true })
  objectives: string;

  @Column({ type: 'json', nullable: true })
  resources: any;

  @Column({ type: 'enum', enum: ['draft', 'published', 'closed', 'archived'], default: 'draft' })
  status: string;

  @Column({ type: 'bigint', unsigned: true })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/labs` | List labs (filter by section, status) | ALL |
| POST | `/api/labs` | Create lab | INSTRUCTOR, TA |
| GET | `/api/labs/:id` | Get lab details with instructions | ALL |
| PUT | `/api/labs/:id` | Update lab | INSTRUCTOR, TA |
| DELETE | `/api/labs/:id` | Delete lab | INSTRUCTOR |
| GET | `/api/labs/:id/instructions` | Get lab instructions | ALL |
| POST | `/api/labs/:id/instructions` | Add/update instructions | INSTRUCTOR, TA |
| POST | `/api/labs/:id/submit` | Submit lab work | STUDENT |
| GET | `/api/labs/:id/submissions` | List submissions | INSTRUCTOR, TA |
| PATCH | `/api/labs/:id/submissions/:subId/grade` | Grade submission | INSTRUCTOR, TA |
| POST | `/api/labs/:id/attendance` | Mark lab attendance | INSTRUCTOR, TA |
| GET | `/api/labs/:id/attendance` | Get lab attendance | INSTRUCTOR, TA |

### Frontend Components Using This Module
- ~~**Instructor**: LabsPage.tsx~~ *(Removed from Instructor sidebar — task I11)*
- **Student**: LabInstructions.tsx
- **TA**: LabsPage.tsx, LabResourcesPage.tsx

---

## Module Structure (All Phase 1 Modules)

```
src/modules/
├── assignments/
│   ├── assignments.module.ts
│   ├── entities/
│   │   ├── assignment.entity.ts
│   │   └── assignment-submission.entity.ts
│   ├── dto/
│   │   ├── create-assignment.dto.ts
│   │   ├── update-assignment.dto.ts
│   │   ├── submit-assignment.dto.ts
│   │   ├── grade-submission.dto.ts
│   │   └── query-assignments.dto.ts
│   ├── enums/
│   │   ├── assignment-type.enum.ts
│   │   └── assignment-status.enum.ts
│   ├── controllers/
│   │   └── assignments.controller.ts
│   ├── services/
│   │   └── assignments.service.ts
│   └── exceptions/
│       ├── assignment-not-found.exception.ts
│       └── submission-deadline-passed.exception.ts
├── grades/
│   ├── grades.module.ts
│   ├── entities/
│   │   ├── grade.entity.ts
│   │   ├── grade-component.entity.ts
│   │   └── rubric.entity.ts
│   ├── dto/
│   ├── controllers/
│   ├── services/
│   └── exceptions/
├── attendance/
│   ├── attendance.module.ts
│   ├── entities/
│   │   ├── attendance-session.entity.ts
│   │   ├── attendance-record.entity.ts
│   │   └── attendance-photo.entity.ts
│   ├── dto/
│   ├── controllers/
│   ├── services/
│   └── exceptions/
├── quizzes/
│   ├── quizzes.module.ts
│   ├── entities/
│   │   ├── quiz.entity.ts
│   │   ├── quiz-question.entity.ts
│   │   ├── quiz-attempt.entity.ts
│   │   └── quiz-answer.entity.ts
│   ├── dto/
│   ├── controllers/
│   ├── services/
│   └── exceptions/
└── labs/
    ├── labs.module.ts
    ├── entities/
    │   ├── lab.entity.ts
    │   ├── lab-submission.entity.ts
    │   ├── lab-instruction.entity.ts
    │   └── lab-attendance.entity.ts
    ├── dto/
    ├── controllers/
    ├── services/
    └── exceptions/
```

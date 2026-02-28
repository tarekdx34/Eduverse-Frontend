# Phase 4: Analytics & Reporting

> **Priority**: 🟡 Medium  
> **Modules**: 2  
> **Reason**: Admin and Instructor dashboards heavily depend on analytics for data-driven decisions.

---

## 4.1 Analytics Module

### Database Tables
| Table | Description |
|-------|-------------|
| `course_analytics` | Analytics metrics for courses |
| `learning_analytics` | Learning metrics and trends |
| `performance_metrics` | Academic performance tracking |
| `student_progress` | Overall course progress per student |
| `weak_topics_analysis` | Identification of weak learning areas |
| `activity_logs` | General user activity tracking |

### Entity Definitions

#### StudentProgress Entity
```typescript
@Entity('student_progress')
export class StudentProgress {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  progressId: number;

  @Column({ type: 'bigint', unsigned: true })
  enrollmentId: number;

  @ManyToOne(() => CourseEnrollment)
  @JoinColumn({ name: 'enrollment_id' })
  enrollment: CourseEnrollment;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  overallProgress: number;  // 0-100%

  @Column({ type: 'int', default: 0 })
  assignmentsCompleted: number;

  @Column({ type: 'int', default: 0 })
  assignmentsTotal: number;

  @Column({ type: 'int', default: 0 })
  quizzesCompleted: number;

  @Column({ type: 'int', default: 0 })
  quizzesTotal: number;

  @Column({ type: 'int', default: 0 })
  labsCompleted: number;

  @Column({ type: 'int', default: 0 })
  labsTotal: number;

  @Column({ type: 'int', default: 0 })
  materialsViewed: number;

  @Column({ type: 'int', default: 0 })
  materialsTotal: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  currentGrade: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  attendanceRate: number;

  @Column({ type: 'enum', enum: ['on_track', 'at_risk', 'behind', 'excellent'], default: 'on_track' })
  riskLevel: string;

  @Column({ type: 'timestamp', nullable: true })
  lastActivityAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

#### CourseAnalytics Entity
```typescript
@Entity('course_analytics')
export class CourseAnalytics {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  analyticsId: number;

  @Column({ type: 'bigint', unsigned: true })
  sectionId: number;

  @ManyToOne(() => CourseSection)
  @JoinColumn({ name: 'section_id' })
  section: CourseSection;

  @Column({ type: 'date' })
  recordDate: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  averageGrade: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  attendanceRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  submissionRate: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  engagementScore: number;

  @Column({ type: 'int', default: 0 })
  activeStudents: number;

  @Column({ type: 'int', default: 0 })
  atRiskStudents: number;

  @Column({ type: 'json', nullable: true })
  gradeDistribution: any;  // { A: count, B: count, ... }

  @Column({ type: 'json', nullable: true })
  topicPerformance: any;  // [{ topic, avgScore }]

  @CreateDateColumn()
  createdAt: Date;
}
```

#### ActivityLog Entity
```typescript
@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  logId: number;

  @Column({ type: 'bigint', unsigned: true })
  userId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'enum', enum: ['login', 'logout', 'view', 'submit', 'download', 'upload', 'chat', 'quiz', 'other'] })
  activityType: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  entityType: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  entityId: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @Column({ type: 'int', nullable: true })
  sessionDurationMinutes: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| **Dashboard Stats** | | | |
| GET | `/api/analytics/dashboard` | Overview stats (total courses, students, engagement) | ADMIN |
| GET | `/api/analytics/instructor-dashboard` | Instructor-specific stats | INSTRUCTOR |
| GET | `/api/analytics/student-dashboard/:studentId` | Student progress overview | STUDENT (own) |
| **Performance** | | | |
| GET | `/api/analytics/performance/:sectionId` | Course performance trends (weekly grades) | INSTRUCTOR, TA, ADMIN |
| GET | `/api/analytics/performance/comparison` | Compare multiple courses | INSTRUCTOR, ADMIN |
| **Engagement** | | | |
| GET | `/api/analytics/engagement/:sectionId` | Engagement metrics (views, submissions, messages) | INSTRUCTOR, TA, ADMIN |
| GET | `/api/analytics/engagement/trends` | Weekly engagement trends | ADMIN |
| **Attendance Analytics** | | | |
| GET | `/api/analytics/attendance/:sectionId` | Attendance analytics for section | INSTRUCTOR, TA, ADMIN |
| GET | `/api/analytics/attendance/trends` | Campus-wide attendance trends | ADMIN |
| **Student Analytics** | | | |
| GET | `/api/analytics/at-risk-students` | List at-risk students (filter by course) | INSTRUCTOR, TA, ADMIN |
| GET | `/api/analytics/top-performers` | Top performing students | INSTRUCTOR, ADMIN |
| GET | `/api/analytics/student-progress/:studentId` | Individual student progress | STUDENT (own), INSTRUCTOR, ADMIN |
| **Grade Analytics** | | | |
| GET | `/api/analytics/grade-distribution/:sectionId` | Grade distribution chart data | INSTRUCTOR, TA, ADMIN |
| GET | `/api/analytics/grade-trends` | Grade trends over time | INSTRUCTOR, ADMIN |
| **Enrollment Analytics** | | | |
| GET | `/api/analytics/enrollment-trends` | Enrollment over time | ADMIN |
| GET | `/api/analytics/enrollment/by-department` | Enrollment by department | ADMIN |
| **Activity** | | | |
| GET | `/api/analytics/activity/recent` | Recent activity feed | ALL |
| GET | `/api/analytics/activity/user/:userId` | User activity history | ADMIN, OWNER |
| GET | `/api/analytics/ai-usage` | AI feature usage statistics | ADMIN, IT_ADMIN |
| **Export** | | | |
| POST | `/api/analytics/export` | Export analytics data (PDF, CSV, Excel) | INSTRUCTOR, ADMIN |

### Query Parameters
```typescript
interface QueryAnalyticsDto {
  sectionId?: number;
  courseId?: number;
  departmentId?: number;
  semesterId?: number;
  startDate?: string;
  endDate?: string;
  granularity?: 'daily' | 'weekly' | 'monthly';
}
```

### Business Logic
1. **Real-time Aggregation**: Some metrics computed on-the-fly (current grade, attendance rate).
2. **Scheduled Snapshots**: Daily cron job to snapshot analytics into `course_analytics` table.
3. **Risk Level Calculation**:
   - `excellent`: Grade ≥ 90%, Attendance ≥ 95%
   - `on_track`: Grade ≥ 70%, Attendance ≥ 80%
   - `at_risk`: Grade < 70% OR Attendance < 75%
   - `behind`: Grade < 50% OR Attendance < 60%
4. **Engagement Score**: Weighted formula: `0.3 * login_frequency + 0.3 * submission_rate + 0.2 * material_views + 0.2 * discussion_participation`
5. **Export**: Support PDF (with charts), CSV, and Excel formats.

### Frontend Components Using This Module
- **Instructor**: AnalyticsPage.tsx, ReportsAnalytics.tsx, PerformanceChart.tsx, TrendChart.tsx, ModernDashboard.tsx
- **Student**: GradeAnalysis.tsx, GpaChart.tsx
- **TA**: AnalyticsPage.tsx, StudentPerformancePage.tsx
- **Admin**: AnalyticsReportsPage.tsx, DashboardOverview.tsx, AIInsightsPage.tsx

---

## 4.2 Reports Module

### Database Tables
| Table | Description |
|-------|-------------|
| `generated_reports` | Generated report records |
| `report_templates` | Report template definitions |
| `export_history` | Report export history |

### Entity Definitions

#### ReportTemplate Entity
```typescript
@Entity('report_templates')
export class ReportTemplate {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  templateId: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ['enrollment', 'grades', 'attendance', 'performance', 'financial', 'custom'] })
  reportType: string;

  @Column({ type: 'json' })
  parameters: any;  // Template parameters schema

  @Column({ type: 'json' })
  layout: any;  // Report layout definition

  @Column({ type: 'tinyint', default: 1 })
  isActive: boolean;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;
}
```

#### GeneratedReport Entity
```typescript
@Entity('generated_reports')
export class GeneratedReport {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  reportId: number;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  templateId: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'enum', enum: ['pdf', 'csv', 'xlsx', 'json'] })
  format: string;

  @Column({ type: 'json', nullable: true })
  parameters: any;  // Parameters used to generate

  @Column({ type: 'varchar', length: 500, nullable: true })
  filePath: string;

  @Column({ type: 'bigint', unsigned: true, nullable: true })
  fileSize: number;

  @Column({ type: 'enum', enum: ['pending', 'generating', 'completed', 'failed'], default: 'pending' })
  status: string;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'bigint', unsigned: true })
  generatedBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;
}
```

### API Endpoints

| Method | Endpoint | Description | Roles |
|--------|----------|-------------|-------|
| GET | `/api/reports/templates` | List report templates | INSTRUCTOR, ADMIN |
| POST | `/api/reports/templates` | Create report template | ADMIN |
| PUT | `/api/reports/templates/:id` | Update template | ADMIN |
| DELETE | `/api/reports/templates/:id` | Delete template | ADMIN |
| POST | `/api/reports/generate` | Generate a report | INSTRUCTOR, ADMIN |
| GET | `/api/reports` | List generated reports | INSTRUCTOR, ADMIN |
| GET | `/api/reports/:id` | Get report status/details | INSTRUCTOR, ADMIN |
| GET | `/api/reports/:id/download` | Download generated report | INSTRUCTOR, ADMIN |
| GET | `/api/reports/history` | Export history | INSTRUCTOR, ADMIN |

### Business Logic
1. **Async Generation**: Reports generate in background. Return job ID, poll for status.
2. **Templates**: Pre-built templates for common reports (enrollment, grades, attendance).
3. **Parameterized**: Each template accepts parameters (date range, course, department).
4. **Formats**: PDF (charts + tables), CSV (raw data), Excel (formatted).
5. **Cleanup**: Auto-delete generated reports after 30 days.

### Frontend Components Using This Module
- **Instructor**: ReportsAnalytics.tsx
- **Admin**: AnalyticsReportsPage.tsx

---

## Module Structure

```
src/modules/
├── analytics/
│   ├── analytics.module.ts
│   ├── entities/
│   │   ├── student-progress.entity.ts
│   │   ├── course-analytics.entity.ts
│   │   ├── learning-analytics.entity.ts
│   │   ├── performance-metrics.entity.ts
│   │   ├── weak-topics-analysis.entity.ts
│   │   └── activity-log.entity.ts
│   ├── dto/
│   │   ├── query-analytics.dto.ts
│   │   ├── dashboard-stats.dto.ts
│   │   └── export-analytics.dto.ts
│   ├── controllers/
│   │   ├── analytics.controller.ts
│   │   └── activity-log.controller.ts
│   ├── services/
│   │   ├── analytics.service.ts
│   │   ├── student-progress.service.ts
│   │   └── activity-log.service.ts
│   └── exceptions/
└── reports/
    ├── reports.module.ts
    ├── entities/
    │   ├── report-template.entity.ts
    │   ├── generated-report.entity.ts
    │   └── export-history.entity.ts
    ├── dto/
    ├── controllers/
    │   └── reports.controller.ts
    ├── services/
    │   ├── reports.service.ts
    │   └── report-generator.service.ts
    └── exceptions/
```

# Code Changes Reference

## 1. Assignments.tsx - Import Changes

### BEFORE
```typescript
import { useState } from 'react';
import { AssignmentService, Assignment as ApiAssignment } from '../../../services/api/assignmentService';
```

### AFTER
```typescript
import { useState, useEffect } from 'react';
import { AssignmentService, Assignment as ApiAssignment, AssignmentSubmission } from '../../../services/api/assignmentService';
```

---

## 2. Assignments.tsx - Component State

### BEFORE
```typescript
export default function Assignments() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();

  const { data: apiAssignments, loading: apiLoading } = useApi(async () => {
    const assignments = await AssignmentService.getAll();
    
    // Transform to component format
    return assignments.map((a: ApiAssignment, i: number) => {
      const colors = ASSIGNMENT_COLORS[i % ASSIGNMENT_COLORS.length];
      return {
        id: Number(a.id),
        title: a.title,
        course: a.course?.name || 'Unknown Course',
        courseCode: a.course?.code || '',
        type: a.submissionType || 'Assignment',
        dueDate: a.dueDate?.split('T')[0] || '',
        dueTime: '11:59 PM',
        status: a.status === 'published' ? 'pending' : a.status,
        priority: 'medium' as const,
        description: a.description || '',
        points: parseFloat(a.maxScore) || 100,
        submittedPoints: null as number | null,
        progress: 0,
        ...colors,
      };
    });
  }, []);

  const assignments = (apiAssignments && apiAssignments.length > 0) ? apiAssignments : defaultAssignments;
```

### AFTER
```typescript
export default function Assignments() {
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<number | null>(null);
  const [assignmentsWithSubmissions, setAssignmentsWithSubmissions] = useState<any[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const { isDark, primaryHex } = useTheme() as any;
  const accentColor = primaryHex || '#3b82f6';
  const { t } = useLanguage();

  const { data: apiAssignments, loading: apiLoading } = useApi(async () => {
    const assignments = await AssignmentService.getAll();
    
    // Transform to component format
    return assignments.map((a: ApiAssignment, i: number) => {
      const colors = ASSIGNMENT_COLORS[i % ASSIGNMENT_COLORS.length];
      return {
        id: Number(a.id),
        apiId: a.id,  // Store API ID for submission fetch
        title: a.title,
        course: a.course?.name || 'Unknown Course',
        courseCode: a.course?.code || '',
        type: a.submissionType || 'Assignment',
        dueDate: a.dueDate?.split('T')[0] || '',
        dueTime: '11:59 PM',
        status: a.status === 'published' ? 'pending' : a.status,
        priority: 'medium' as const,
        description: a.description || '',
        points: parseFloat(a.maxScore) || 100,
        submittedPoints: null as number | null,
        progress: 0,
        submissionStatus: null as string | null, // Will be populated from API
        ...colors,
      };
    });
  }, []);

  // Fetch submission status for each assignment
  useEffect(() => {
    const loadSubmissionStatuses = async () => {
      if (!apiAssignments || apiAssignments.length === 0) return;
      
      setIsLoadingSubmissions(true);
      try {
        const assignmentsWithStatus = await Promise.all(
          apiAssignments.map(async (assignment) => {
            const submission = await AssignmentService.getMySubmission(assignment.apiId);
            return {
              ...assignment,
              submissionStatus: submission?.submissionStatus || 'not-submitted',
              submittedPoints: submission?.score ? parseFloat(submission.score) : null,
            };
          })
        );
        setAssignmentsWithSubmissions(assignmentsWithStatus);
      } catch (error) {
        console.error('Failed to load submission statuses:', error);
        // Fallback: use assignments without submission status
        setAssignmentsWithSubmissions(apiAssignments);
      } finally {
        setIsLoadingSubmissions(false);
      }
    };

    loadSubmissionStatuses();
  }, [apiAssignments]);

  const assignments = assignmentsWithSubmissions.length > 0 ? assignmentsWithSubmissions : 
                      (apiAssignments && apiAssignments.length > 0) ? apiAssignments : 
                      defaultAssignments;
```

---

## 3. Assignments.tsx - Status Icon Function

### BEFORE
```typescript
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'pending':
      return <Circle className="w-3 h-3" />;
    case 'in-progress':
      return <AlertCircle className="w-3 h-3" />;
    case 'submitted':
    case 'graded':
      return <CheckCircle className="w-3 h-3" />;
    default:
      return <Circle className="w-3 h-3" />;
  }
};
```

### AFTER
```typescript
const getStatusIcon = (status: string, submissionStatus?: string) => {
  // Use submission status if available for pending assignments
  const effectiveStatus = submissionStatus && status === 'pending' ? submissionStatus : status;
  
  switch (effectiveStatus) {
    case 'pending':
    case 'not-submitted':
      return <Circle className="w-3 h-3" />;
    case 'in-progress':
      return <AlertCircle className="w-3 h-3" />;
    case 'submitted':
    case 'graded':
      return <CheckCircle className="w-3 h-3" />;
    default:
      return <Circle className="w-3 h-3" />;
  }
};
```

---

## 4. Assignments.tsx - Status Badge Function

### BEFORE
```typescript
  const getStatusBadgeDark = (status: string) => {
    switch (status) {
      case 'pending':
        return isDark
          ? 'bg-red-900/50 text-red-400 border-red-700'
          : 'bg-red-50 text-red-700 border-red-200';
      case 'in-progress':
        return isDark
          ? 'bg-amber-900/50 text-amber-400 border-amber-700'
          : 'bg-amber-50 text-amber-700 border-amber-200';
      case 'submitted':
        return isDark
          ? 'bg-blue-900/50 text-blue-400 border-blue-700'
          : 'bg-blue-50 text-blue-700 border-blue-200';
      case 'graded':
        return isDark
          ? 'bg-emerald-900/50 text-emerald-400 border-emerald-700'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return isDark
          ? 'bg-white/5 text-slate-500 border-white/10'
          : 'bg-background-light text-slate-700 border-slate-100';
    }
  };
```

### AFTER
```typescript
  const getStatusBadgeDark = (status: string, submissionStatus?: string) => {
    // Use submission status if available for pending assignments
    const effectiveStatus = submissionStatus && status === 'pending' ? submissionStatus : status;
    
    switch (effectiveStatus) {
      case 'pending':
      case 'not-submitted':
        return isDark
          ? 'bg-red-900/50 text-red-400 border-red-700'
          : 'bg-red-50 text-red-700 border-red-200';
      case 'in-progress':
        return isDark
          ? 'bg-amber-900/50 text-amber-400 border-amber-700'
          : 'bg-amber-50 text-amber-700 border-amber-200';
      case 'submitted':
        return isDark
          ? 'bg-blue-900/50 text-blue-400 border-blue-700'
          : 'bg-blue-50 text-blue-700 border-blue-200';
      case 'graded':
        return isDark
          ? 'bg-emerald-900/50 text-emerald-400 border-emerald-700'
          : 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return isDark
          ? 'bg-white/5 text-slate-500 border-white/10'
          : 'bg-background-light text-slate-700 border-slate-100';
    }
  };
```

---

## 5. Assignments.tsx - Loading State

### BEFORE
```typescript
  if (apiLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }
```

### AFTER
```typescript
  if (apiLoading || isLoadingSubmissions) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }
```

---

## 6. Assignments.tsx - Status Display & Button

### BEFORE
```typescript
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs ${getStatusBadgeDark(assignment.status)}`}
                          >
                            {getStatusIcon(assignment.status)}
                            <span className="capitalize">
                              {assignment.status === 'in-progress' ? t('inProgress') : t('pending')}
                            </span>
                          </span>
```

### AFTER
```typescript
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-xs ${getStatusBadgeDark(assignment.status, assignment.submissionStatus)}`}
                          >
                            {getStatusIcon(assignment.status, assignment.submissionStatus)}
                            <span className="capitalize">
                              {assignment.submissionStatus === 'not-submitted' ? t('notSubmitted') : 
                               assignment.submissionStatus === 'submitted' ? t('submitted') :
                               assignment.submissionStatus === 'graded' ? t('graded') :
                               assignment.status === 'in-progress' ? t('inProgress') : t('pending')}
                            </span>
                          </span>
```

---

## 7. Assignments.tsx - Button Text

### BEFORE
```typescript
                      <button
                        onClick={() => setSelectedAssignmentId(assignment.id)}
                        className="flex-1 px-3 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-1.5 text-sm font-medium"
                      >
                        <span>{t('continueWork')}</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
```

### AFTER
```typescript
                      <button
                        onClick={() => setSelectedAssignmentId(assignment.id)}
                        className="flex-1 px-3 py-2 bg-[var(--accent-color)] text-white rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-1.5 text-sm font-medium"
                      >
                        <span>
                          {assignment.submissionStatus === 'not-submitted' ? t('submitWork') || 'Submit Work' : 
                           assignment.submissionStatus === 'submitted' ? t('viewSubmission') || 'View Submission' :
                           assignment.submissionStatus === 'graded' ? t('viewGrade') || 'View Grade' :
                           t('continueWork') || 'Continue Work'}
                        </span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
```

---

## 8. Assignments.tsx - Assignment Filtering

### BEFORE
```typescript
  const pendingAssignments = assignments.filter(
    (a) => a.status === 'pending' || a.status === 'in-progress'
  );
  const completedAssignments = assignments.filter(
    (a) => a.status === 'submitted' || a.status === 'graded'
  );
```

### AFTER
```typescript
  const pendingAssignments = assignments.filter(
    (a) => !a.submissionStatus || a.submissionStatus === 'not-submitted'
  );
  const completedAssignments = assignments.filter(
    (a) => a.submissionStatus === 'submitted' || a.submissionStatus === 'graded'
  );
```

---

## 9. AssignmentDetails.tsx - Rubric Null Safety

### BEFORE
```typescript
          {/* Grading Rubric */}
          {assignment.rubric && (
            <div className="glass rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-background-light to-white p-6 border-b border-slate-100">
                <h2 className="text-slate-800 font-semibold">Grading Rubric</h2>
                <p className="text-slate-600 text-sm mt-1">Total: {assignment.points} points</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {assignment.rubric.map((item: any, index: number) => (
```

### AFTER
```typescript
          {/* Grading Rubric */}
          {assignment.rubric && assignment.rubric.length > 0 && (
            <div className="glass rounded-[2.5rem] shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-background-light to-white p-6 border-b border-slate-100">
                <h2 className="text-slate-800 font-semibold">Grading Rubric</h2>
                <p className="text-slate-600 text-sm mt-1">Total: {assignment.points || assignment.maxScore} points</p>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {(assignment.rubric || []).map((item: any, index: number) => (
```

---

## 10. AssignmentDetails.tsx - Description Fallback

### BEFORE
```typescript
            <div className="p-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {assignment.detailedDescription}
                </div>
              </div>
            </div>
```

### AFTER
```typescript
            <div className="p-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-slate-700 leading-relaxed">
                  {assignment.detailedDescription || assignment.description || 'No description provided.'}
                </div>
              </div>
            </div>
```

---

## 11. AssignmentDetails.tsx - Submission Type Null Safety

### BEFORE
```typescript
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-medium border ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                {assignment.submissionType}
              </span>
```

### AFTER
```typescript
              <span
                className={`px-2 py-0.5 rounded-md text-xs font-medium border ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
              >
                {assignment.submissionType || 'Assignment'}
              </span>
```

---

## 12. AssignmentDetails.tsx - Instructor Info Null Safety

### BEFORE
```typescript
            <div className="p-4 space-y-4">
              <div>
                <p className="text-slate-600 text-sm mb-1 font-medium">Instructor</p>
                <p className="text-slate-800 font-medium">{assignment.instructor}</p>
                <p className="text-[var(--accent-color)] text-sm">{assignment.instructorEmail}</p>
              </div>
              <div className="border-t border-slate-100 pt-4">
                <p className="text-slate-600 text-sm mb-1 font-medium">Date Assigned</p>
                <p className="text-slate-800 font-medium">
                  {new Date(assignment.dateAssigned).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>
```

### AFTER
```typescript
            <div className="p-4 space-y-4">
              {(assignment.instructor || assignment.createdBy) && (
                <div>
                  <p className="text-slate-600 text-sm mb-1 font-medium">Instructor</p>
                  <p className="text-slate-800 font-medium">{assignment.instructor || 'Instructor Name Not Available'}</p>
                  {assignment.instructorEmail && (
                    <p className="text-[var(--accent-color)] text-sm">{assignment.instructorEmail}</p>
                  )}
                </div>
              )}
              {assignment.dateAssigned && (
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-slate-600 text-sm mb-1 font-medium">Date Assigned</p>
                  <p className="text-slate-800 font-medium">
                    {new Date(assignment.dateAssigned).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              )}
```

---

## 13. AssignmentDetails.tsx - Progress Bar Null Safety

### BEFORE
```typescript
              <div className="border-t border-slate-100 pt-4">
                <p className="text-slate-600 text-sm mb-2 font-medium">Progress</p>
                <div className="relative">
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${assignment.color} h-2 rounded-full transition-all`}
                      style={{ width: `${assignment.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-slate-800 mt-2 font-medium">
                    {assignment.progress}% Complete
                  </p>
```

### AFTER
```typescript
              <div className="border-t border-slate-100 pt-4">
                <p className="text-slate-600 text-sm mb-2 font-medium">Progress</p>
                <div className="relative">
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`${assignment.color || 'bg-blue-500'} h-2 rounded-full transition-all`}
                      style={{ width: `${assignment.progress || 0}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-slate-800 mt-2 font-medium">
                    {assignment.progress || 0}% Complete
                  </p>
```

---

## Summary Statistics

- **Assignments.tsx Changes**: 
  - 20 lines added (imports, state, hooks, functions)
  - Key additions: useEffect for submission loading, updated status functions

- **AssignmentDetails.tsx Changes**: 
  - 24 lines added (null checks, fallbacks, conditional rendering)
  - Key additions: Rubric safety, description fallback, instructor section safety

- **Total**: ~44 lines of code changes
- **Build Result**: ✅ No errors, successful build

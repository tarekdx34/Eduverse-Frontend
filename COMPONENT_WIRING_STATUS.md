# Phase 5: Component Wiring Guide

## Status: Services Fixed ✅ | Components In Progress 🔄

---

## COMPLETED FIXES ✅

### Service Files (All Fixed)
1. **quizService.ts** - Uses /api/quizzes, correct shapes
2. **assignmentService.ts** - Uses /api/assignments, correct shapes  
3. **labService.ts** - Uses /api/labs, correct shapes
4. **vite.config.js** - Removed /quizzes proxy

### Components Updated
1. **Assignments.tsx** (Student) - API call fixed ✅

---

## COMPONENTS NEEDING UPDATES

### Student Dashboard

#### 1. AssignmentDetails.tsx 🔴 HIGH PRIORITY
**Current**: Uses mock ssignmentData object, fake submit
**Needs**:
- Import: import { AssignmentService } from '../../../services/api/assignmentService';
- Import: import { useApi, useMutation } from '../../../hooks/useApi';
- Replace mock data with:
  \\\	ypescript
  const { data: assignment, loading } = useApi(
    () => AssignmentService.getById(String(assignmentId)),
    [assignmentId]
  );
  
  const { data: mySubmission } = useApi(
    () => AssignmentService.getMySubmission(String(assignmentId)),
    [assignmentId]
  );
  \\\
- Update \confirmSubmit\ function:
  \\\	ypescript
  const { mutate: submitAssignment, loading: submitting } = useMutation(
    async (data: { text: string; files: File[] }) => {
      if (data.files.length > 0) {
        return AssignmentService.submitFile(
          String(assignmentId),
          data.files[0],
          data.text
        );
      } else {
        return AssignmentService.submitText(String(assignmentId), data.text);
      }
    }
  );
  
  const confirmSubmit = async () => {
    setShowSubmitConfirmation(false);
    try {
      await submitAssignment({
        text: submissionText || '',
        files: attachedFiles
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Submit failed:', error);
      // Show error toast
    }
  };
  \\\
- Add submission text state: \const [submissionText, setSubmissionText] = useState('');\
- Show existing submission if \mySubmission\ exists
- Disable submit if already submitted

#### 2. QuizTaking.tsx 🔴 HIGH PRIORITY
**Current**: Uses mock quiz data
**Needs**:
- Import: \import { QuizService } from '../../../services/api/quizService';\
- Fetch course progress: \QuizService.getCourseProgress(courseId)\
- Start attempt: \QuizService.startAttempt(quizId)\
- Submit attempt: \QuizService.submitAttempt(attemptId, answers)\
- Show attempt result after submission
- Handle max attempts error (400)
- Timer based on \	imeLimitMinutes\
- Answer format: \{ questionId: number, selectedOption?: string[], answerText?: string }\
- MCQ: radio buttons from \options\ array
- True/False: True/False buttons
- Short answer/Essay: textarea
- Empty questionType: fallback to textarea

#### 3. LabInstructions.tsx 🟡 MEDIUM PRIORITY
**Current**: May have partial Phase 4 wiring
**Needs**:
- Import: \import { LabService } from '../../../services/api/labService';\
- Fetch labs: \LabService.getAll({ courseId })\
- Fetch lab detail: \LabService.getLab(labId)\
- Show instructions sorted by \orderIndex\
- Check existing submission: \LabService.getMySubmission(labId)\
- Submit: \LabService.submit(labId, text, file?)\
- Show submission status if exists

---

### Instructor Dashboard

#### 4. AssignmentsList.tsx 🟡 MEDIUM PRIORITY
**Current**: Unknown
**Needs**:
- Fetch: \AssignmentService.getAll({ courseId })\
- Create: \AssignmentService.create({ courseId: Number(courseId), title, ... })\
- Update: \AssignmentService.update(id, data)\
- Delete: \AssignmentService.delete(id)\
- View submissions: \AssignmentService.getSubmissions(assignmentId)\
- Grade: \AssignmentService.gradeSubmission(assignmentId, submissionId, { score, feedback })\

#### 5. QuizzesPage.tsx (Instructor) 🟡 MEDIUM PRIORITY
**Needs**:
- Fetch: \QuizService.getAll({ courseId })\ → returns \{ data: Quiz[], total: number }\
- Create: \QuizService.createQuiz({ courseId: Number(courseId), title, quizType: 'graded'|'practice', ... })\
- IMPORTANT: \quizType\ MUST be 'graded' or 'practice' (NOT 'multiple_choice')
- Add question: \QuizService.addQuestion(quizId, { questionType: 'mcq'|'true_false'|... })\
- IMPORTANT: \questionType\ valid values: 'mcq', 'true_false', 'short_answer', 'essay', 'matching'
- Statistics: \QuizService.getStatistics(quizId)\
- All attempts: \QuizService.getAttempts({ quizId })\

---

### TA Dashboard

#### 6. GradingPage.tsx 🟢 LOW PRIORITY
**Current**: May be partially wired from Phase 4
**Needs**:
- Use same grading methods as instructor
- \AssignmentService.gradeSubmission(...)\
- \LabService.gradeSubmission(...)\

#### 7. QuizzesPage.tsx (TA) 🟢 LOW PRIORITY
**Needs**:
- View quizzes and attempts (read-only)
- Same as instructor but without create/edit

#### 8. LabsPage.tsx (TA) 🟢 LOW PRIORITY
**Needs**:
- \LabService.getAll({ courseId })\
- \LabService.getSubmissions(labId)\
- \LabService.gradeSubmission(labId, submissionId, { score, feedback })\

---

## CRITICAL NOTES

### Data Type Conversions
- **IDs from API**: strings → use \String(id)\ when calling API
- **IDs for display**: convert with \Number(id)\
- **String numbers**: \maxScore\, \weight\, \score\ come as strings
  - Use \Number(value)\ or \parseFloat(value)\ for math
- **Boolean integers**: \isLate\, \andomizeQuestions\, etc. are 0 or 1
  - Check with \=== 1\

### Null Handling
- \getMySubmission()\ returns \
ull\ on 404 → check before accessing
- \vailableFrom\, \vailableUntil\, \dueDate\ can be null
- \	imeLimitMinutes\ can be null (no time limit)

### Quiz Specifics
- \selectedOption\ MUST be array: \['answer']\ even for single choice
- Question types: 'mcq'|'true_false'|'short_answer'|'essay'|'matching'
- Legacy questions may have empty string \questionType: ''\ → handle gracefully
- Max attempts error: HTTP 400 "Maximum attempts (N) reached"

### Assignment/Lab Submission
- Check submission type: 'file'|'text'|'both'
- Use \submitFile()\ if file attached
- Use \submitText()\ if text only
- FormData for file uploads

---

## NEXT STEPS

1. ✅ Services fixed and tested
2. ✅ Assignments.tsx API call fixed
3. 🔄 Fix AssignmentDetails.tsx (high priority - submission)
4. 🔄 Fix QuizTaking.tsx (high priority - quiz flow)
5. 🔄 Fix LabInstructions.tsx (medium priority)
6. 🔄 Fix instructor/TA components (lower priority)

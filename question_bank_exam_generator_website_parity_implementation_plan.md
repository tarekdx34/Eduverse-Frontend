# Website Parity Implementation Plan For Question Bank And Exam Generator

Date: 2026-05-09

Flutter source project: `D:\Graduation\EduVerse\edu_verse`

Website target project: `D:\Graduation\frontend_tarek\Eduverse-Frontend`

Purpose: this is a concrete implementation plan for making the website Question Bank and Exam Generator match the Flutter implementation. This plan intentionally excludes routing/navigation differences and focuses only on missing concepts, data contracts, UI behavior, state handling, validation, services, tests, and file-level work.

## 1. Scope And Non-Scope

### 1.1 In Scope

This plan covers:

- Question Bank API service parity.
- Question Bank models/types parity.
- Question Bank list, filters, stats, selection, and batch actions.
- Question create/edit/detail behavior.
- Question type editors: MCQ, true/false, fill blanks, written, essay.
- Question images and attachments.
- Bulk question creation.
- Question groups and grouped question operations.
- Exam Generator API service parity.
- Exam Generator models/types parity.
- Exam list/draft list concepts already present inside the Exams page.
- Exam generation form concepts.
- Generation rules and sectioned generation.
- Availability and shortage handling.
- Draft editor behavior.
- Candidate question picker behavior.
- Saved exam lifecycle and export.
- Paper templates.
- Tests.

### 1.2 Out Of Scope

This plan does not cover:

- Route structure changes.
- Dashboard tab changes.
- Deep-linking differences.
- URL naming.
- Moving features to new pages only for routing parity.

The website team may still split large files for maintainability, but this plan does not require route parity.

## 2. Current Website Files To Edit Or Add

### 2.1 Existing Service Files To Edit

Edit:

- `src/services/api/questionBankService.ts`
- `src/services/api/questionGroupService.ts`
- `src/services/api/examGenerationService.ts`
- `src/services/api/chapterService.ts`

Goal:

- These files must become the single source of truth for endpoint paths, request payloads, response normalization, and TypeScript DTOs.
- Business components should stop constructing unusual backend payloads manually.

### 2.2 Existing Feature Files To Edit

Edit:

- `src/pages/instructor-dashboard/components/ExamsPage.tsx`
- `src/pages/instructor-dashboard/components/quizzes/QuestionBankModal.tsx`
- `src/pages/instructor-dashboard/components/quizzes/ExamGenerationModal.tsx`
- `src/components/exam-draft/DraftEditorModal.tsx`
- `src/components/exam-draft/ExamFullViewModal.tsx`
- `src/components/question-bank/BatchStatusDialog.tsx`
- `src/components/question-bank/BulkImportDialog.tsx`
- `src/components/question-bank/ChapterManagerDrawer.tsx`
- `src/components/question-bank/GroupDetailModal.tsx`
- `src/components/question-bank/GroupFormModal.tsx`
- `src/components/question-bank/QuestionAttachmentsPanel.tsx`
- `src/components/question-bank/QuestionGroupsTab.tsx`
- `src/components/question-bank/RejectQuestionDialog.tsx`
- `src/components/question-bank/index.ts`

Goal:

- Keep the existing website visual direction if desired, but change the behavior, payloads, validation, and supported feature set to match Flutter.

### 2.3 New Type Files To Add

Add:

- `src/types/questionBank.ts`
- `src/types/examGenerator.ts`

Goal:

- Move shared enums, DTOs, response types, and normalized UI models out of large components and service files.
- Avoid duplicating string unions across components.

### 2.4 New Hook/State Files To Add

Add:

- `src/hooks/useQuestionBank.ts`
- `src/hooks/useQuestionForm.ts`
- `src/hooks/useQuestionBulkCreate.ts`
- `src/hooks/useQuestionGroups.ts`
- `src/hooks/useExamGeneratorList.ts`
- `src/hooks/useExamGeneratorForm.ts`
- `src/hooks/useExamDraftEditor.ts`
- `src/hooks/useExamExport.ts`

Goal:

- Replace the huge mixed state in `ExamsPage.tsx` with smaller, testable units.
- These hooks do not require route changes.

### 2.5 New Or Expanded Component Files To Add

Add or expand:

- `src/components/question-bank/QuestionFormDialog.tsx`
- `src/components/question-bank/QuestionTypeEditor.tsx`
- `src/components/question-bank/QuestionOptionsEditor.tsx`
- `src/components/question-bank/QuestionFillBlanksEditor.tsx`
- `src/components/question-bank/QuestionImageField.tsx`
- `src/components/question-bank/QuestionAttachmentEditor.tsx`
- `src/components/question-bank/QuestionAttachmentReorderList.tsx`
- `src/components/question-bank/QuestionStatusActions.tsx`
- `src/components/question-bank/QuestionDetailDialog.tsx`
- `src/components/question-bank/QuestionBulkRowEditor.tsx`
- `src/components/question-bank/QuestionBulkValidationPanel.tsx`
- `src/components/exam-generator/ExamGenerationSettings.tsx`
- `src/components/exam-generator/ExamGenerationRuleEditor.tsx`
- `src/components/exam-generator/ExamGenerationSectionEditor.tsx`
- `src/components/exam-generator/ExamAvailabilityPanel.tsx`
- `src/components/exam-generator/ExamShortagePanel.tsx`
- `src/components/exam-generator/ExamCandidateQuestionPicker.tsx`
- `src/components/exam-generator/ExamDraftSectionEditor.tsx`
- `src/components/exam-generator/ExamDraftItemEditor.tsx`
- `src/components/exam-generator/ExamExportOptionsDialog.tsx`
- `src/components/exam-generator/ExamPaperTemplateDialog.tsx`

Goal:

- These components mirror Flutter concepts without forcing website route changes.
- They can be rendered inside existing modals/tabs.

### 2.6 Test Files To Add

Add:

- `src/services/api/questionBankService.test.ts`
- `src/services/api/questionGroupService.test.ts`
- `src/services/api/examGenerationService.test.ts`
- `src/hooks/useQuestionBank.test.tsx`
- `src/hooks/useQuestionForm.test.tsx`
- `src/hooks/useQuestionBulkCreate.test.tsx`
- `src/hooks/useQuestionGroups.test.tsx`
- `src/hooks/useExamGeneratorForm.test.tsx`
- `src/hooks/useExamDraftEditor.test.tsx`
- `src/components/question-bank/__tests__/QuestionFormDialog.test.tsx`
- `src/components/question-bank/__tests__/BulkImportDialog.test.tsx`
- `src/components/question-bank/__tests__/QuestionGroupsTab.test.tsx`
- `src/components/exam-generator/__tests__/ExamGenerationModal.test.tsx`
- `src/components/exam-draft/__tests__/DraftEditorModal.test.tsx`
- `src/pages/instructor-dashboard/components/__tests__/ExamsPage.question-bank-exam.test.tsx`

Goal:

- Cover service payloads first.
- Then cover state and UI flows that can break during parity work.

## 3. Phase 1: Shared Types And API Service Contracts

This phase must be completed before UI work. Most website missing behavior is currently blocked by incomplete or wrong service payloads.

### 3.1 Add `src/types/questionBank.ts`

Create this file and define:

```ts
export type QuestionBankType =
  | 'written'
  | 'mcq'
  | 'true_false'
  | 'fill_blanks'
  | 'essay';

export type QuestionBankDifficulty = 'easy' | 'medium' | 'hard';

export type BloomLevel =
  | 'remembering'
  | 'understanding'
  | 'applying'
  | 'analyzing'
  | 'evaluating'
  | 'creating';

export type QuestionBankStatus =
  | 'draft'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'archived';

export type QuestionAttachmentType =
  | 'image'
  | 'document'
  | 'audio'
  | 'video';

export type QuestionGroupType =
  | 'passage'
  | 'case_study'
  | 'image_set'
  | 'multipart'
  | 'other';
```

Also define interfaces:

- `CourseChapter`
- `QuestionBankOption`
- `QuestionBankFillBlank`
- `QuestionAttachmentPayload`
- `QuestionBankAttachment`
- `QuestionBankQuestion`
- `QuestionBankPage`
- `QuestionBankStats`
- `QuestionBankUploadResponse`
- `QuestionBankFormPayload`
- `QuestionBulkCreateRequest`
- `QuestionBulkCreateResult`
- `QuestionBulkRow`
- `QuestionBankListParams`
- `QuestionBankBatchStatusRequest`
- `QuestionBankGroup`
- `QuestionGroupPayload`
- `QuestionGroupListParams`

Important field requirements:

- `QuestionBankStatus` must include `under_review` and `rejected`.
- `QuestionGroupType` must include `other`.
- `QuestionAttachmentPayload` must use `fileId`, `attachmentType`, `caption`, `altText`, `displayOrder`, `isPrimary`.
- `QuestionBankFormPayload` must support `questionFileId`, `questionFileCaption`, `questionFileAltText`, `attachments`, `options`, and `fillBlanks`.

### 3.2 Add `src/types/examGenerator.ts`

Create this file and define:

```ts
export type ExamDraftStatus =
  | 'open'
  | 'finalized'
  | 'expired'
  | 'cancelled'
  | 'failed';

export type ExamStatus = 'draft' | 'published' | 'archived';

export type ExamMarkDistributionMode =
  | 'manual'
  | 'weight_normalized'
  | 'equal';

export type ExamRoundingPolicy =
  | 'none'
  | 'nearest_0_25'
  | 'nearest_0_5'
  | 'nearest_1';

export type ExamSectionAnswerPolicy = 'answer_all' | 'answer_any';

export type ExamGroupSelectionMode =
  | 'independent'
  | 'exclude_grouped'
  | 'keep_group_together';

export type ExamGenerationScope =
  | 'course'
  | 'chapter'
  | 'chapters'
  | 'group';

export type ExamExportFormat = 'docx' | 'pdf';
export type ExamExportVariant = 'student' | 'answer_key' | 'combined';
export type ExamAnswerKeyStyle = 'inline' | 'separate';
```

Also define interfaces:

- `ExamGenerationRule`
- `ExamGenerationSection`
- `ExamGenerationPayload`
- `ExamGenerationReadiness`
- `ExamAvailability`
- `ExamShortage`
- `ExamDraftItem`
- `ExamDraftSection`
- `ExamDraft`
- `ExamDraftValidation`
- `ExamReplacementCheck`
- `ExamResponse`
- `ExamFullDetail`
- `ExamStats`
- `ExamPage<T>`
- `ExamPaperTemplate`
- `ExamExportOptions`
- `ExamExportResponse`
- `ExamDraftListParams`
- `ExamListParams`

Important field requirements:

- `ExamGenerationRule` must support `scope`, `chapterId`, `chapterIds`, and `groupIds`.
- `ExamGenerationSection` must support `answerPolicy` and `requiredAnswerCount`.
- `ExamGenerationPayload` must support `totalMarks`, `markDistributionMode`, `roundingPolicy`, `groupSelectionMode`, `seed`, `durationMinutes`, `instructions`, `headerText`, `footerText`, `rules`, and `sections`.
- `ExamDraftItem` must support `draftSectionId`, `weightUnits`, `marks`, `itemOrder`, and `overrideReason` where returned by backend.
- `ExamExportOptions` must match Flutter export options.

### 3.3 Edit `src/services/api/questionBankService.ts`

Replace local type definitions with imports from `src/types/questionBank.ts`.

Implement these methods with exact payloads:

```ts
list(params: QuestionBankListParams): Promise<QuestionBankPage>
getStats(params?: QuestionBankListParams): Promise<QuestionBankStats>
getById(questionId: number): Promise<QuestionBankQuestion>
create(payload: QuestionBankFormPayload): Promise<QuestionBankQuestion>
update(questionId: number, payload: Partial<QuestionBankFormPayload>): Promise<QuestionBankQuestion>
deleteQuestion(questionId: number): Promise<void>
createBatch(request: QuestionBulkCreateRequest): Promise<QuestionBulkCreateResult>
getChapterCounts(courseId: number): Promise<Record<number, number>>
uploadImage(file: File): Promise<QuestionBankUploadResponse>
deleteUploadedFile(fileId: number): Promise<void>
downloadImageBlob(fileId: number): Promise<Blob>
uploadImageAttachment(questionId: number, file: File, metadata?: AttachmentMetadata): Promise<QuestionBankAttachment>
addAttachment(questionId: number, payload: QuestionAttachmentPayload): Promise<QuestionBankAttachment>
updateAttachment(questionId: number, attachmentId: number, payload: Partial<QuestionAttachmentPayload>): Promise<QuestionBankAttachment>
deleteAttachment(questionId: number, attachmentId: number): Promise<void>
reorderAttachments(questionId: number, orderedAttachmentIds: number[]): Promise<void>
statusAction(questionId: number, action: QuestionStatusAction, comment?: string): Promise<QuestionBankQuestion>
batchStatusAction(request: QuestionBankBatchStatusRequest): Promise<QuestionBankQuestion[]>
```

Specific required fixes:

- `createBatch` must post:

```json
{
  "courseId": 34,
  "defaultChapterId": 2,
  "questions": []
}
```

- `batchStatusAction` must post:

```json
{
  "questionIds": [1, 2],
  "action": "approve",
  "comment": "optional"
}
```

or for all matching:

```json
{
  "allMatchingFilters": true,
  "excludeQuestionIds": [3],
  "expectedQuestionCount": 100,
  "courseId": 34,
  "chapterId": 2,
  "questionType": "mcq",
  "difficulty": "medium",
  "bloomLevel": "understanding",
  "status": "draft",
  "search": "keyword",
  "hasAttachments": true,
  "groupId": 10,
  "action": "approve",
  "comment": "optional"
}
```

- `rejectQuestion` should be removed or changed to call `statusAction(id, 'reject', comment)`.
- Attachment reorder must post:

```json
{
  "items": [
    { "attachmentId": 1, "displayOrder": 0 },
    { "attachmentId": 2, "displayOrder": 1 }
  ]
}
```

- `addAttachment` must not post `{ url, type }` unless backend has separate URL attachment support. Use `fileId` and `attachmentType`.

### 3.4 Edit `src/services/api/questionGroupService.ts`

Replace current DTO with types from `src/types/questionBank.ts`.

Implement:

```ts
list(params?: QuestionGroupListParams): Promise<{ data: QuestionBankGroup[]; total?: number }>
getById(groupId: number): Promise<QuestionBankGroup>
create(payload: QuestionGroupPayload): Promise<QuestionBankGroup>
update(groupId: number, payload: Partial<QuestionGroupPayload>): Promise<QuestionBankGroup>
delete(groupId: number): Promise<void>
addQuestions(groupId: number, questions: QuestionBankFormPayload[]): Promise<QuestionBankQuestion[]>
linkQuestions(groupId: number, questionIds: number[]): Promise<QuestionBankQuestion[]>
unlinkQuestion(groupId: number, questionId: number): Promise<void>
reorderQuestions(groupId: number, orderedQuestionIds: number[]): Promise<void>
uploadGroupImage(file: File): Promise<QuestionBankUploadResponse>
downloadGroupImage(fileId: number): Promise<Blob>
```

Specific required fixes:

- Group create/update payload must use:

```json
{
  "courseId": 34,
  "title": "Case Study",
  "sharedPrompt": "Passage text",
  "sharedFileId": 100,
  "sharedFileCaption": "Caption",
  "sharedFileAltText": "Alt text",
  "groupType": "case_study"
}
```

- Add grouped questions must post:

```json
{
  "questions": []
}
```

- Reorder group questions must post:

```json
{
  "items": [
    { "questionId": 10, "itemOrder": 0 },
    { "questionId": 11, "itemOrder": 1 }
  ]
}
```

### 3.5 Edit `src/services/api/chapterService.ts`

Expand payload support:

```ts
create(courseId, payload: { name: string; chapterOrder?: number })
update(courseId, chapterId, payload: { name?: string; chapterOrder?: number; isActive?: 0 | 1 | boolean })
```

Specific required fixes:

- Do not type update as `{ name: string }` only.
- Support changing order and active flag because Flutter service does.

### 3.6 Edit `src/services/api/examGenerationService.ts`

Replace current local types with imports from `src/types/examGenerator.ts`.

Implement or fix:

```ts
listDrafts(params?: ExamDraftListParams): Promise<ExamPage<ExamDraft>>
listExams(params?: ExamListParams): Promise<ExamPage<ExamResponse>>
getDraft(draftId: number): Promise<ExamDraft>
getExam(examId: number): Promise<ExamResponse>
getExamFull(examId: number): Promise<ExamFullDetail>
getPaperTemplates(params?: { courseId?: number }): Promise<ExamPaperTemplate[]>
createPaperTemplate(template: ExamPaperTemplate): Promise<ExamPaperTemplate>
updatePaperTemplate(template: ExamPaperTemplate): Promise<ExamPaperTemplate>
applyPaperTemplate(examId: number, template: ExamPaperTemplate): Promise<unknown>
getExamStats(params?: { courseId?: number }): Promise<ExamStats>
checkGenerationReadiness(courseId: number): Promise<ExamGenerationReadiness>
checkGenerationAvailability(payload: ExamGenerationPayload): Promise<ExamAvailability>
generatePreview(payload: ExamGenerationPayload): Promise<ExamDraft>
createSection(draftId: number, payload: ExamDraftSectionPayload): Promise<ExamDraftSection>
updateSection(draftId: number, sectionId: number, payload: Partial<ExamDraftSectionPayload>): Promise<ExamDraftSection>
deleteSection(draftId: number, sectionId: number): Promise<void>
reorderSections(draftId: number, orderedSectionIds: number[]): Promise<void>
addDraftItem(draftId: number, payload: ExamDraftItemAddPayload): Promise<ExamDraftItem>
updateDraftItem(draftId: number, itemId: number, payload: ExamDraftItemUpdatePayload): Promise<void>
checkReplacement(draftId: number, itemId: number, replacementQuestionId: number): Promise<ExamReplacementCheck>
deleteDraftItem(draftId: number, itemId: number): Promise<void>
reorderDraftItems(draftId: number, orderedItemIds: number[]): Promise<void>
validateDraft(draftId: number): Promise<ExamDraftValidation>
saveDraft(draftId: number): Promise<ExamResponse>
regenerateDraft(draftId: number, payload: { seed?: string; keepManualEdits?: boolean }): Promise<ExamDraft>
duplicateDraft(draftId: number, payload: { title?: string; seed?: string; regenerate?: boolean }): Promise<ExamDraft>
reshuffleSection(draftId: number, sectionId: number, payload: { seed?: string; keepManualEdits?: boolean }): Promise<ExamDraft>
normalizeSectionMarks(draftId: number, sectionId: number, totalMarks?: number): Promise<void>
lifecycle(examId: number, action: string, reason?: string): Promise<ExamResponse>
exportExam(examId: number, options: ExamExportOptions): Promise<ExamExportResponse>
```

Specific required fixes:

- Remove fallback endpoint guessing after confirming backend endpoints.
- `checkReplacement` must send:

```json
{ "replacementQuestionId": 42 }
```

- Section answer policy must use `answer_all` and `answer_any`.
- Section reorder must post:

```json
{
  "items": [
    { "sectionId": 1, "sectionOrder": 0 }
  ]
}
```

- Draft item reorder must post:

```json
{
  "items": [
    { "itemId": 1, "itemOrder": 0 }
  ]
}
```

- Export must send options, not an empty body.

## 4. Phase 2: Question Bank Main State And List Behavior

### 4.1 Add `src/hooks/useQuestionBank.ts`

This hook should replace most Question Bank state currently embedded in `ExamsPage.tsx`.

State to include:

- `isLoading`
- `isLoadingMore`
- `isMutating`
- `errorMessage`
- `actionMessage`
- `activeBatchAction`
- `courses`
- `chapters`
- `questions`
- `groups`
- `selectedCourseId`
- `selectedChapterId`
- `selectedType`
- `selectedDifficulty`
- `selectedBloomLevel`
- `selectedStatus`
- `hasAttachments`
- `selectedGroupId`
- `search`
- `page`
- `limit`
- `total`
- `stats`
- `chapterQuestionCounts`
- `selectedQuestionIds`
- `excludedQuestionIds`
- `isAllMatchingQuestionsSelected`
- `isSelectionMode`

Functions to implement:

- `initialize(preferredCourseId?)`
- `selectCourse(courseId?)`
- `setFilters(filters)`
- `refresh()`
- `loadMore()`
- `loadChapters()`
- `loadChapterQuestionCounts()`
- `createChapter({ name, chapterOrder })`
- `updateChapter({ chapterId, name, chapterOrder, isActive })`
- `deleteChapter(chapterId)`
- `loadGroups()`
- `loadQuestions({ resetPage })`
- `loadStats()`
- `statusAction(questionId, action, comment?)`
- `setSelectionMode(enabled)`
- `toggleQuestionSelection(questionId)`
- `setCurrentQuestionsSelected(selected)`
- `selectAllMatchingQuestions()`
- `batchStatusAction(action, comment?)`
- `deleteQuestion(questionId)`

Behavior details:

- `initialize` loads chapters, groups, questions, stats, and chapter counts for the selected course.
- `selectCourse` resets chapter, group, selection, and page state.
- `setFilters` resets page to 1 and clears selection.
- `loadQuestions` must pass every filter to `QuestionBankService.list`.
- `loadStats` must pass the same active filters to `QuestionBankService.getStats`.
- `selectAllMatchingQuestions` must set `isAllMatchingQuestionsSelected = true`, clear `selectedQuestionIds`, and clear `excludedQuestionIds`.
- When all matching are selected, toggling a selected visible question should add/remove it from `excludedQuestionIds`.
- `batchStatusAction` must send either explicit `questionIds` or all-matching-filter payload.
- After every mutation, reload list and stats.

### 4.2 Edit `src/pages/instructor-dashboard/components/ExamsPage.tsx`

Replace these local state clusters with `useQuestionBank`:

- `questions`
- `total`
- `page`
- `limit`
- `selectedCourse`
- `selectedChapter`
- `chapters`
- `loading`
- `error`
- `selectedQuestionIds`
- `filterQuestionType`
- `filterDifficulty`
- `filterStatus`
- `filterBloomLevel`
- `searchInput`
- `searchQuery`
- `stats`
- `statsError`

Keep the existing layout if desired, but wire UI controls to the hook.

Specific changes:

- Stop manually issuing multiple list calls for multi-filter combinations.
- Add UI controls for:
  - has attachments
  - group
  - rejected status
  - archived status
  - attached/grouped stats
- Ensure stats refresh when filters change.
- Ensure list and selection reset when course changes.
- Ensure batch toolbar reflects all-matching selection count.

### 4.3 Edit `src/components/question-bank/BatchStatusDialog.tsx`

Current behavior:

- Uses local `status`.
- Calls `QuestionBankService.batchUpdateStatus(selectedIds, status)`.

Required behavior:

- Rename concept from status update to status action.
- Accept props:
  - `selectedCount`
  - `selectedIds`
  - `allMatchingFilters`
  - `excludedIds`
  - `activeFilters`
  - `onSubmit(action, comment?)`
- Actions:
  - submit for review
  - approve
  - reject
  - archive
  - restore
- Show comment field for reject and optional comment field for other actions if needed.
- Do not call service directly if `useQuestionBank` owns the mutation.

Payload behavior:

- The hook should call `QuestionBankService.batchStatusAction`.
- The dialog should only collect action and comment.

### 4.4 Edit `src/components/question-bank/RejectQuestionDialog.tsx`

Current behavior:

- Calls `QuestionBankService.rejectQuestion(questionId, reason.trim())`.

Required behavior:

- Call `onSubmit(comment)` passed from parent, or call `QuestionBankService.statusAction(questionId, 'reject', comment)`.
- Use field name `comment`, not `reason`, in the service payload.
- Keep validation: comment required for reject.

## 5. Phase 3: Question Create/Edit/Detail Parity

### 5.1 Replace Or Expand `QuestionBankModal.tsx`

Current file:

- `src/pages/instructor-dashboard/components/quizzes/QuestionBankModal.tsx`

Recommended approach:

- Keep it as a wrapper if the website team wants the same import path.
- Move form implementation into `src/components/question-bank/QuestionFormDialog.tsx`.
- `QuestionBankModal.tsx` can render `QuestionFormDialog` in create mode.

### 5.2 Add `src/hooks/useQuestionForm.ts`

State to include:

- `isLoading`
- `isSaving`
- `isUploading`
- `errorMessage`
- `successMessage`
- `originalQuestion`
- `savedQuestion`
- `chapters`
- `courseId`
- `chapterId`
- `questionType`
- `difficulty`
- `bloomLevel`
- `questionText`
- `questionFileId`
- `questionImagePreviewUrl`
- `questionImageLocalFile`
- `questionFileCaption`
- `questionFileAltText`
- `expectedAnswerText`
- `hints`
- `options`
- `fillBlanks`
- `attachments`
- `validationError`
- `pendingUploadedFileIds`

Functions:

- `initializeCreate({ courseId? })`
- `initializeEdit(questionId)`
- `selectCourse(courseId?)`
- `createChapter({ name, chapterOrder })`
- `updateCore(patch)`
- `updateOptions(options)`
- `updateFillBlanks(blanks)`
- `uploadQuestionImage(file)`
- `removeQuestionImage()`
- `uploadCreateAttachments(files)`
- `removeCreateAttachment(fileId)`
- `updateCreateAttachment(payload)`
- `reorderCreateAttachments(orderedFileIds)`
- `submit()`
- `statusSavedQuestion(action, comment?)`
- `discardPendingUploads()`
- `validate()`
- `toCreatePayload()`
- `toDirtyUpdatePayload(originalQuestion)`

Validation must match Flutter:

- Course required.
- Chapter required.
- Question text or image required.
- MCQ requires at least two options.
- MCQ requires at least one correct option.
- True/false requires exactly two options.
- True/false requires exactly one correct option.
- Fill blanks requires at least one blank.
- Fill blank keys must be unique.
- Written and essay require expected answer.
- Each attachment must have valid file ID and attachment type.

Dirty update behavior:

- Compare original and current values.
- Send only changed fields where possible.
- Include child arrays only when question type/options/fill blanks changed.
- Allow clearing optional fields by sending `null`.

Pending upload cleanup:

- Track every uploaded file ID before submit.
- Remove IDs from pending list after successful create/update.
- On cancel/close/failure where file is no longer used, call `QuestionBankService.deleteUploadedFile(fileId)`.

### 5.3 Add `src/components/question-bank/QuestionFormDialog.tsx`

Props:

- `open`
- `mode: 'create' | 'edit'`
- `questionId?`
- `initialCourseId?`
- `onOpenChange`
- `onSaved`

Render sections:

1. Course and chapter selector.
2. Inline create chapter.
3. Question type selector.
4. Difficulty selector.
5. Bloom level selector.
6. Question text textarea.
7. Question image upload with caption and alt text.
8. Type-specific editor:
   - MCQ editor.
   - True/false editor.
   - Fill blanks editor.
   - Written/essay expected answer.
9. Hints field.
10. Attachment editor.
11. Validation panel.
12. Save actions:
   - Save.
   - Save and add another for create mode.
   - Save as draft.
   - Submit for review after save.
   - Approve after save if instructor flow allows.

Important behavior:

- Disable closing while saving/uploading unless confirmed.
- On close, call `discardPendingUploads`.
- Preserve selected course/chapter when using "add another".

### 5.4 Add `src/components/question-bank/QuestionTypeEditor.tsx`

This component chooses between:

- `QuestionOptionsEditor` for `mcq`.
- `QuestionOptionsEditor` locked to true/false for `true_false`.
- `QuestionFillBlanksEditor` for `fill_blanks`.
- expected answer editor for `written` and `essay`.

Props:

- `questionType`
- `options`
- `fillBlanks`
- `expectedAnswerText`
- `onOptionsChange`
- `onFillBlanksChange`
- `onExpectedAnswerChange`
- `disabled`

### 5.5 Add `src/components/question-bank/QuestionOptionsEditor.tsx`

Behavior:

- For MCQ:
  - Minimum two options.
  - Add option.
  - Remove option.
  - Edit option text.
  - Mark one or multiple correct answers depending backend behavior. Flutter requires at least one correct.
- For true/false:
  - Exactly two rows: True and False.
  - Text should not be editable unless backend supports custom labels.
  - Exactly one correct answer.

### 5.6 Add `src/components/question-bank/QuestionFillBlanksEditor.tsx`

Behavior:

- Add blank.
- Remove blank.
- Edit `blankKey`.
- Edit `acceptableAnswer`.
- Toggle `isCaseSensitive`.
- Validate unique `blankKey` case-insensitively.
- Show examples like `blank_1`, `blank_2`.

### 5.7 Add `src/components/question-bank/QuestionImageField.tsx`

Behavior:

- Select image file.
- Upload image through `QuestionBankService.uploadImage`.
- Store returned `fileId`.
- Preview uploaded image.
- Edit caption.
- Edit alt text.
- Remove image.
- If removed before submit, call `deleteUploadedFile(fileId)`.

### 5.8 Add `src/components/question-bank/QuestionAttachmentEditor.tsx`

Behavior:

- Upload one or many image attachments.
- Add existing file ID if needed.
- Edit attachment type.
- Edit caption.
- Edit alt text.
- Toggle primary.
- Reorder attachments.
- Remove attachments.

For create mode:

- Manage pending attachment payloads locally.

For edit/detail mode:

- Call:
  - `uploadImageAttachment`
  - `addAttachment`
  - `updateAttachment`
  - `reorderAttachments`
  - `deleteAttachment`

### 5.9 Add Or Expand `QuestionDetailDialog.tsx`

Required behavior:

- Load full question with options, fill blanks, attachments, groups.
- Show question metadata.
- Show status actions.
- Show edit action.
- Show archive/delete action.
- Show attachments with captions, alt text, order, and primary flag.
- Show group membership.

This can be a dialog inside the existing page. No route changes are required.

### 5.10 Edit `src/pages/instructor-dashboard/components/ExamsPage.tsx`

Replace inline question edit logic with:

- `QuestionFormDialog` in edit mode.
- `QuestionDetailDialog` for detail view.
- `QuestionStatusActions` for row-level actions.

Remove or reduce state:

- `editingQuestion`
- `editingQuestionText`
- `editingQuestionAnswer`
- `editingQuestionHint`
- `savingQuestionEdit`

Those are incomplete compared to Flutter.

## 6. Phase 4: Bulk Question Creation Parity

### 6.1 Add `src/hooks/useQuestionBulkCreate.ts`

State:

- `isLoading`
- `isSubmitting`
- `isUploading`
- `courses`
- `chapters`
- `courseId`
- `defaultChapterId`
- `rows`
- `createdQuestions`
- `failedRows`
- `validationErrors`
- `errorMessage`
- `successMessage`
- `pendingUploadedFileIds`

Functions:

- `initialize()`
- `selectCourse(courseId?)`
- `createChapter({ name, chapterOrder })`
- `selectDefaultChapter(chapterId?)`
- `addRow()`
- `removeRow(localId)`
- `updateRow(row)`
- `updateRowType(localId, type)`
- `uploadRowQuestionImage(localId, file)`
- `removeRowQuestionImage(localId)`
- `uploadRowAttachments(localId, files)`
- `removeRowAttachment(localId, fileId)`
- `updateRowAttachment(localId, attachment)`
- `reorderRowAttachments(localId, orderedFileIds)`
- `submit()`
- `resetAfterSuccess()`
- `discardPendingUploads()`
- `statusCreatedQuestions(action, comment?)`
- `statusCreatedQuestion(questionId, action, comment?)`

### 6.2 Edit `src/components/question-bank/BulkImportDialog.tsx`

Current behavior is CSV import only. Keep CSV import, but add Flutter-style editable bulk creation.

Required changes:

- Add tabs or steps:
  - Manual rows.
  - CSV import.
  - Review and submit.
  - Result.
- After CSV parse, convert rows into editable `QuestionBulkRow` models.
- Render each row through `QuestionBulkRowEditor`.
- Allow per-row chapter selection.
- Allow per-row type/difficulty/Bloom.
- Allow per-row options/fill blanks/expected answer.
- Allow per-row question image and attachments.
- Validate all rows before submit.
- Submit through `QuestionBankService.createBatch({ courseId, defaultChapterId, questions })`.
- Parse detailed result.
- Keep failed rows editable.
- Show created questions.
- Provide status action controls for created questions.

### 6.3 Add `QuestionBulkRowEditor.tsx`

Each row must support:

- Chapter.
- Question type.
- Difficulty.
- Bloom level.
- Question text.
- Question image.
- Image caption/alt text.
- Type-specific editor.
- Expected answer.
- Hints.
- Attachments.
- Per-row validation errors.
- Remove row.

### 6.4 Add `QuestionBulkValidationPanel.tsx`

Show:

- Row number.
- Error message.
- Jump/focus action if practical.
- Summary count of valid/invalid rows.

## 7. Phase 5: Question Groups Parity

### 7.1 Add `src/hooks/useQuestionGroups.ts`

State:

- `isLoading`
- `isMutating`
- `errorMessage`
- `actionMessage`
- `groups`
- `selectedCourseId`
- `selectedChapterId`
- `selectedGroupTypes`
- `search`
- `page`
- `limit`
- `total`
- `activeGroup`
- `activeGroupQuestions`
- `approvedQuestions`
- `selectedQuestionIds`
- `createdQuestions`
- `pendingUploadedFileIds`

Functions:

- `loadGroups()`
- `loadGroup(groupId)`
- `createGroup(payload)`
- `updateGroup(groupId, payload)`
- `deleteGroup(groupId)`
- `uploadGroupImage(file)`
- `createChapter(payload)`
- `addGroupedQuestions(groupId, questions)`
- `statusCreatedQuestions(action, comment?)`
- `statusCreatedQuestion(questionId, action, comment?)`
- `clearCreatedQuestions()`
- `syncResolvedQuestions(questions)`
- `removeQuestionFromGroup(questionId)`
- `archiveQuestion(questionId)`
- `linkExistingQuestions(questionIds)`
- `reorderQuestions(orderedQuestionIds)`
- `discardUploadedQuestionImages(fileIds)`

### 7.2 Edit `src/components/question-bank/QuestionGroupsTab.tsx`

Required changes:

- Use `useQuestionGroups`.
- Keep current list layout if desired.
- Add support for `other` group type.
- Make search and group type filters server-backed where backend supports them.
- Ensure group counts and question previews use normalized `QuestionBankGroup`.
- Refresh main question bank list when group membership changes.

### 7.3 Edit `src/components/question-bank/GroupFormModal.tsx`

Current fields:

- title
- description
- groupType
- chapterId
- sharedImageFileId

Required fields:

- courseId
- title
- sharedPrompt
- sharedFileId
- sharedFileCaption
- sharedFileAltText
- groupType

Required behavior:

- Upload shared image with `QuestionGroupService.uploadGroupImage`.
- Store returned `fileId` as `sharedFileId`.
- Preview shared image.
- Edit caption and alt text.
- Remove shared image and optionally delete uploaded file if not saved.
- Support clearing title/shared prompt/shared file during edit.
- Add `other` group type.

### 7.4 Edit `src/components/question-bank/GroupDetailModal.tsx`

Required changes:

- Load group through normalized `QuestionGroupService.getById`.
- Display shared prompt, shared file, caption, alt text.
- Add full grouped-question creation using `QuestionFormDialog` or embedded `QuestionBulkRowEditor`, not the simplified basic form.
- `QuestionGroupService.addQuestions` must receive `{ questions }`.
- Link existing approved questions with filters:
  - course
  - chapter
  - type
  - difficulty
  - Bloom
  - search
  - status approved
  - exclude already linked questions
- Unlink questions through service.
- Reorder questions through service using `items`.
- Allow status actions on newly created questions.
- Allow archive question from group detail.

## 8. Phase 6: Exam Generator List And Shared State

### 8.1 Add `src/hooks/useExamGeneratorList.ts`

State:

- `isLoading`
- `isRefreshing`
- `isPoolLoading`
- `isLoadingMore`
- `isMutating`
- `errorMessage`
- `actionMessage`
- `shortages`
- `courses`
- `drafts`
- `exams`
- `stats`
- `readiness`
- `selectedCourseId`
- `selectedDraftStatus`
- `selectedExamStatus`
- `selectedListKind`
- `search`
- `dateFrom`
- `dateTo`
- `draftPage`
- `examPage`
- `limit`
- `draftTotalPages`
- `examTotalPages`

Functions:

- `initialize(preferredCourseId?)`
- `refresh()`
- `loadStats()`
- `loadReadiness()`
- `setFilters(filters)`
- `loadDrafts({ resetPage })`
- `loadExams({ resetPage })`
- `generateDraft(payload)`

### 8.2 Edit `src/pages/instructor-dashboard/components/ExamsPage.tsx`

Replace these local clusters with `useExamGeneratorList`:

- `generatedDrafts`
- `backendSavedExams`
- `examDetail`
- `draftDetail`
- `readiness`
- `examStats`
- draft/exam list loading and normalization logic

Required conceptual changes:

- Move response normalization to service or hook layer.
- Add filters already supported by Flutter concepts:
  - draft status
  - exam status
  - list kind
  - date range
  - search
- Keep UI within the current Exams page; no route change required.

## 9. Phase 7: Exam Generation Form Parity

### 9.1 Add `src/hooks/useExamGeneratorForm.ts`

State:

- `isLoading`
- `isSubmitting`
- `isCheckingAvailability`
- `isLoadingCourseData`
- `courses`
- `chapters`
- `groups`
- `courseId`
- `title`
- `totalMarks`
- `mode`
- `markDistributionMode`
- `roundingPolicy`
- `groupSelectionMode`
- `seed`
- `durationMinutes`
- `instructions`
- `headerText`
- `footerText`
- `rules`
- `sections`
- `availability`
- `shortages`
- `errorMessage`
- `createdDraftId`

Functions:

- `initialize()`
- `selectCourse(courseId?)`
- `updateBasics(patch)`
- `updateRules(rules)`
- `updateSections(sections)`
- `randomizeSeed()`
- `clearSeed()`
- `checkAvailability({ debounce })`
- `submit()`
- `validate()`
- `buildPayload()`

Validation:

- Course required.
- Title required.
- Flat mode requires at least one valid rule.
- Sectioned mode requires at least one valid section.
- Rule validation:
  - course scope: no chapter/group required.
  - chapter scope: `chapterId` required.
  - chapters scope: at least one `chapterId` in `chapterIds`.
  - group scope: at least one `groupId`.
  - count > 0.
  - weightPerQuestion > 0.
- Section validation:
  - title required.
  - totalMarks > 0.
  - at least one rule.
  - if `answer_any`, `requiredAnswerCount` should be positive and not exceed item count where known.

Availability:

- Debounce calls while editing.
- Call `ExamGenerationService.checkGenerationAvailability(payload)`.
- Store returned `availability`.
- Store shortage details separately for display.

### 9.2 Edit `src/pages/instructor-dashboard/components/quizzes/ExamGenerationModal.tsx`

Current modal is basic and preview-focused.

Required changes:

- Use `useExamGeneratorForm`.
- Add settings section:
  - title
  - course
  - mode
  - total marks
  - mark distribution mode
  - rounding policy
  - group selection mode
  - seed
  - duration
  - instructions
  - header text
  - footer text
- Add flat rule editor.
- Add sectioned generation editor.
- Add availability panel.
- Add shortage panel.
- Keep preview after submit if desired, but backend returns a draft object in Flutter service shape.
- Do not save immediately as exam. The correct flow is generate draft, review/edit draft, then save.

### 9.3 Add `ExamGenerationSettings.tsx`

Fields:

- Total marks.
- Mark distribution mode:
  - manual
  - weight normalized
  - equal
- Rounding policy:
  - none
  - nearest 0.25
  - nearest 0.5
  - nearest 1
- Group selection mode:
  - independent
  - exclude grouped
  - keep group together
- Seed with randomize and clear buttons.
- Duration minutes.
- Instructions.
- Header text.
- Footer text.

Important note:

- If backend currently only accepts `independent`, still show disabled options or explain not available based on backend capability, but keep TypeScript model ready for Flutter parity.

### 9.4 Add `ExamGenerationRuleEditor.tsx`

Fields per rule:

- Scope:
  - course
  - chapter
  - chapters
  - group
- Chapter selector for chapter scope.
- Multi-chapter selector for chapters scope.
- Group selector for group scope.
- Count.
- Weight per question.
- Optional question type.
- Optional difficulty.
- Optional Bloom level.
- Remove rule.
- Duplicate rule.

Behavior:

- Scope changes should clear incompatible fields.
- Count and weight must be positive.
- Show available pool count if availability response provides it.

### 9.5 Add `ExamGenerationSectionEditor.tsx`

Fields per section:

- Title.
- Instructions.
- Total marks.
- Answer policy:
  - answer all
  - answer any
- Required answer count when answer any.
- Rules inside section.
- Add/remove/reorder section rules.
- Add/remove/reorder sections.

Payload:

- Build `sections: ExamGenerationSection[]`.
- Do not also send flat `rules` when using sectioned mode unless backend expects both. Flutter sends rules for flat mode and sections for section mode.

### 9.6 Add `ExamAvailabilityPanel.tsx`

Display:

- Ready/not ready.
- Total available approved questions.
- Per chapter/type/difficulty/Bloom/group availability if returned.
- Warnings.
- Last checked timestamp.
- Loading state while checking.

### 9.7 Add `ExamShortagePanel.tsx`

Display shortage rows:

- Section title if present.
- Scope/chapter/group.
- Required count.
- Available count.
- Question type.
- Difficulty.
- Bloom level.
- Suggested fix:
  - approve more matching questions
  - lower count
  - broaden filters
  - change scope

## 10. Phase 8: Draft Editor Parity

### 10.1 Add `src/hooks/useExamDraftEditor.ts`

State:

- `isLoading`
- `isMutating`
- `isSaving`
- `isValidating`
- `isExporting`
- `errorMessage`
- `actionMessage`
- `draft`
- `validation`
- `candidateQuestions`
- `candidatePage`
- `candidateTotal`
- `candidateFilters`
- `selectedCandidateIds`
- `shortages`
- `overrideReason`

Functions:

- `loadDraft(draftId, options?)`
- `createSection(payload)`
- `upsertSection(sectionId?, payload)`
- `deleteSection(sectionId)`
- `reorderSections(orderedSectionIds)`
- `addItem(payload)`
- `updateItem(itemId, payload)`
- `replacementRequiresOverride(itemId, replacementQuestionId)`
- `removeItem(itemId)`
- `reorderItems(orderedItemIds)`
- `loadCandidateQuestions(filters)`
- `loadMoreCandidateQuestions()`
- `saveDraft()`
- `validateDraft()`
- `regenerateDraft({ seed, keepManualEdits })`
- `duplicateDraft({ title, seed, regenerate })`
- `reloadAfterSourceEdit()`
- `reshuffleSection(sectionId, { seed, keepManualEdits })`
- `normalizeSectionMarks(sectionId, totalMarks?)`
- `moveItemsToSection(itemIds, draftSectionId?)`

### 10.2 Edit `src/components/exam-draft/DraftEditorModal.tsx`

Current modal supports only a subset.

Required changes:

- Use `useExamDraftEditor`.
- Fix section answer policy values:
  - replace `ANSWER_ALL` with `answer_all`
  - add `answer_any`
- Add section update/edit.
- Add required answer count.
- Add section reorder.
- Add item reorder.
- Add item move to section/unassigned.
- Add candidate question filters.
- Add replacement question flow.
- Add override reason field.
- Add section reshuffle.
- Add normalize section marks with target total.
- Add duplicate options:
  - title
  - seed
  - regenerate
- Add regenerate options:
  - seed
  - keep manual edits
- Add draft validation panel.
- Disable edits if draft is not editable.

### 10.3 Add `ExamDraftSectionEditor.tsx`

Fields:

- Title.
- Instructions.
- Total marks.
- Answer policy.
- Required answer count.
- Save.
- Delete.

Behavior:

- Used for create and update.
- Validates before sending.
- Sends `answer_all`/`answer_any`.

### 10.4 Add `ExamDraftItemEditor.tsx`

Fields:

- Question preview.
- Section selector.
- Weight units.
- Marks.
- Order.
- Override reason.
- Replacement action.
- Remove action.

Behavior:

- If replacing, call `checkReplacement` with replacement question ID.
- If replacement requires override, require `overrideReason`.
- Update item through service.

### 10.5 Add `ExamCandidateQuestionPicker.tsx`

Filters:

- Search.
- Chapter.
- Question type.
- Difficulty.
- Bloom level.
- Group.
- Has attachments.
- Status fixed to approved.

Behavior:

- Load candidates from `QuestionBankService.list`.
- Pass draft course ID.
- Exclude questions already in draft.
- Support pagination/load more.
- Allow single select for replacement.
- Allow multi-select for adding items.
- Allow target section selection.
- Allow default marks/weight.

### 10.6 Fix Draft Export Concept

Current `DraftEditorModal` calls `exportExamWord(draftId)`.

Flutter exports saved exams, not open draft IDs.

Required behavior:

- If draft is open, show "Save as exam before export" or save first then export the returned exam ID.
- If backend supports draft export separately, add a distinct service method. Do not overload saved exam export.

## 11. Phase 9: Saved Exam, Export, And Paper Templates

### 11.1 Add `src/hooks/useExamExport.ts`

State:

- `isExporting`
- `isLoadingTemplates`
- `templates`
- `selectedTemplate`
- `options`
- `errorMessage`
- `lastExport`

Functions:

- `loadTemplates(courseId?)`
- `createTemplate(template)`
- `updateTemplate(template)`
- `applyTemplate(examId, template)`
- `updateOptions(options)`
- `exportExam(examId)`
- `downloadExport(response)`

### 11.2 Edit `src/components/exam-draft/ExamFullViewModal.tsx`

Required changes:

- Load full exam detail through `ExamGenerationService.getExamFull`.
- Display:
  - title
  - course
  - duration
  - instructions
  - header/footer
  - sections
  - items
  - marks
  - answer key where allowed
  - paper template summary
- Add lifecycle actions using `ExamGenerationService.lifecycle`.
- If archive/publish requires a reason, show reason dialog.

### 11.3 Add `ExamExportOptionsDialog.tsx`

Fields:

- Format:
  - docx
  - pdf if backend supports it
- Variant:
  - student
  - answer key
  - combined
- Student name line.
- Show course code.
- Page break per section.
- Show instructor name.
- Show total marks.
- Show question marks.
- Answer key style:
  - inline
  - separate
- Paper template selector.

Submit payload:

```json
{
  "format": "docx",
  "variant": "student",
  "includeAnswerKey": false,
  "studentNameLine": true,
  "showCourseCode": true,
  "pageBreakPerSection": false,
  "showInstructorName": false,
  "showTotalMarks": true,
  "showQuestionMarks": true,
  "answerKeyStyle": "inline",
  "paperTemplateId": 1,
  "paperTemplateSnapshot": {}
}
```

### 11.4 Add `ExamPaperTemplateDialog.tsx`

Template fields depend on backend model, but the website must support the same conceptual operations as Flutter:

- List templates.
- Create template.
- Update template.
- Apply template to exam.
- Send template snapshot during export/apply.

Required service methods:

- `getPaperTemplates`
- `createPaperTemplate`
- `updatePaperTemplate`
- `applyPaperTemplate`

### 11.5 Edit `ExamsPage.tsx` Saved Exams Actions

Replace direct calls:

- `publishExam`
- `unpublishExam`
- `archiveExam`
- `exportExamWord`

With:

- `ExamGenerationService.lifecycle(examId, action, reason?)`
- `useExamExport.exportExam(examId)`

Keep action buttons if desired, but update payload and refresh behavior.

## 12. Phase 10: Chapter Manager Parity

### 12.1 Edit `src/components/question-bank/ChapterManagerDrawer.tsx`

Required changes:

- Use expanded `ChapterService`.
- Create chapter with optional `chapterOrder`.
- Edit:
  - name
  - chapterOrder
  - isActive
- Show question count from `QuestionBankService.getChapterCounts`.
- Prevent deleting or warn clearly when count > 0 if backend rejects delete.
- Refresh question list and filters after chapter changes.

## 13. Phase 11: Localization And User-Facing Strings

The website currently hardcodes many strings. It should match Flutter concepts.

Edit:

- Existing i18n files if present.
- Components listed in this plan.

Add keys for:

- Question Bank.
- Create question.
- Edit question.
- Bulk create.
- Question groups.
- Status actions.
- Attachment labels.
- Fill blanks.
- Exam Generator.
- Generation settings.
- Availability.
- Shortages.
- Draft editor.
- Export options.
- Paper templates.
- Validation errors.

Important:

- Error messages from validation functions should be key-based or centralized.
- Status labels should map from enum values.

## 14. Phase 12: Tests

### 14.1 Service Tests

Add `questionBankService.test.ts`.

Test:

- `list` sends all filters.
- `getStats` sends filters.
- `create` sends full question payload.
- `update` sends dirty/partial payload.
- `createBatch` posts `{ courseId, defaultChapterId, questions }`.
- `batchStatusAction` posts explicit selection payload.
- `batchStatusAction` posts all-matching-filter payload.
- `statusAction` sends `comment`.
- `addAttachment` sends `fileId`, `attachmentType`, metadata.
- `reorderAttachments` sends `{ items }`.

Add `questionGroupService.test.ts`.

Test:

- create payload uses Flutter fields.
- update supports clearing shared fields.
- add questions posts `{ questions }`.
- link posts `{ questionIds }`.
- reorder posts `{ items: [{ questionId, itemOrder }] }`.

Add `examGenerationService.test.ts`.

Test:

- generate preview sends full payload.
- availability sends full payload.
- list drafts/exams sends status and date filters.
- create/update section uses `answer_all`/`answer_any`.
- reorder sections sends `{ items }`.
- add item uses `draftSectionId`, `weightUnits`, `marks`, `overrideReason`.
- replacement check sends replacement ID.
- reorder items sends `{ items }`.
- regenerate/duplicate/reshuffle payloads.
- normalize marks payload.
- lifecycle reason payload.
- export options payload.
- paper template calls.

### 14.2 Hook Tests

Add tests for:

- `useQuestionBank`
  - initialize loads list/stats/groups/chapters/counts.
  - filters reload and clear selection.
  - all-matching selection payload.
  - batch action refreshes list and stats.
- `useQuestionForm`
  - validation per question type.
  - pending upload cleanup.
  - dirty update payload.
- `useQuestionBulkCreate`
  - partial failure preserves failed rows.
  - created questions support status actions.
- `useQuestionGroups`
  - create/update payload.
  - add/link/unlink/reorder.
- `useExamGeneratorForm`
  - rule validation by scope.
  - section validation.
  - availability debounce.
  - submit payload.
- `useExamDraftEditor`
  - section operations.
  - item operations.
  - replacement check.
  - move items to section.
  - regenerate/duplicate/reshuffle/normalize.

### 14.3 Component Tests

Add tests for:

- `QuestionFormDialog`
  - MCQ validation.
  - true/false validation.
  - fill blanks validation.
  - written/essay expected answer.
  - image caption/alt.
  - attachment metadata.
- `BulkImportDialog`
  - CSV to editable rows.
  - validation panel.
  - correct batch payload.
  - partial failure.
- `QuestionGroupsTab`
  - group type filter includes `other`.
  - create group payload.
  - delete group.
- `GroupDetailModal`
  - link existing questions.
  - add grouped questions.
  - reorder group questions payload.
- `ExamGenerationModal`
  - flat generation payload.
  - sectioned generation payload.
  - availability panel.
  - shortage panel.
- `DraftEditorModal`
  - create/update/delete/reorder sections.
  - add/update/delete/reorder items.
  - replacement check requiring override.
  - save validation.
- `ExamExportOptionsDialog`
  - export variants and options.

## 15. Recommended Implementation Order

Follow this order to reduce rework:

1. Add shared type files.
2. Fix service payloads and tests.
3. Add `useQuestionBank` and wire the existing question list.
4. Add complete question form and replace basic modal behavior.
5. Add attachment editor.
6. Fix batch status and reject dialogs.
7. Upgrade bulk create.
8. Upgrade question groups.
9. Add `useExamGeneratorList`.
10. Add `useExamGeneratorForm`.
11. Upgrade exam generation modal.
12. Add `useExamDraftEditor`.
13. Upgrade draft editor.
14. Add candidate question picker.
15. Add export options and paper templates.
16. Finish saved exam lifecycle behavior.
17. Add localization keys.
18. Complete component/hook test coverage.
19. Run build, lint, and tests.

## 16. Acceptance Checklist

### 16.1 Question Bank Acceptance

- [ ] Website can create every Flutter-supported question type.
- [ ] Website validates each question type like Flutter.
- [ ] Website can edit full question metadata, not only text/answer/hints.
- [ ] Website supports question image caption and alt text.
- [ ] Website supports additional attachments with metadata.
- [ ] Website can reorder attachments.
- [ ] Website cleans up pending uploads.
- [ ] Website list supports all Flutter filters.
- [ ] Website stats include approved, draft, under review, rejected, archived, attached/grouped.
- [ ] Website selection supports current page and all matching filters.
- [ ] Website batch status payload matches Flutter.
- [ ] Website reject payload uses `comment`.
- [ ] Website bulk create sends correct batch payload.
- [ ] Website bulk create preserves failed rows.
- [ ] Website supports status actions after bulk create.
- [ ] Website group payload matches Flutter.
- [ ] Website groups support shared prompt/file/caption/alt.
- [ ] Website groups support add/link/unlink/reorder.
- [ ] Website group reorder payload uses `itemOrder`.

### 16.2 Exam Generator Acceptance

- [ ] Website generation rules support course, chapter, chapters, and group scopes.
- [ ] Website generation supports flat mode.
- [ ] Website generation supports sectioned mode.
- [ ] Website supports total marks.
- [ ] Website supports mark distribution mode.
- [ ] Website supports rounding policy.
- [ ] Website supports group selection mode.
- [ ] Website supports seed randomize/clear.
- [ ] Website supports duration/instructions/header/footer.
- [ ] Website checks generation availability before submit.
- [ ] Website displays shortages clearly.
- [ ] Website draft editor can create/update/delete/reorder sections.
- [ ] Website draft editor uses `answer_all`/`answer_any`.
- [ ] Website draft editor can add/update/delete/reorder items.
- [ ] Website draft editor can move items between sections.
- [ ] Website draft editor can check replacements.
- [ ] Website requires override reason when needed.
- [ ] Website draft editor supports regenerate/duplicate/reshuffle/normalize.
- [ ] Website saves draft only after validation.
- [ ] Website exports saved exams with options.
- [ ] Website supports paper templates.
- [ ] Website lifecycle actions support reason where needed.

### 16.3 Test Acceptance

- [ ] All changed service methods have payload tests.
- [ ] All new hooks have state-flow tests.
- [ ] Main question form has validation tests.
- [ ] Bulk create has partial failure tests.
- [ ] Group operations have payload and UI tests.
- [ ] Generation form has flat and sectioned payload tests.
- [ ] Draft editor has mutation tests.
- [ ] Export options have payload tests.
- [ ] `npm run build` passes.
- [ ] `npm run test` passes.
- [ ] `npm run lint` passes or known existing lint failures are documented.

## 17. Key Risks To Watch

### 17.1 Backend Payload Compatibility

Some website code currently uses payload names that differ from Flutter. The highest-risk payloads are:

- batch status
- batch create
- attachments
- question groups
- draft sections
- draft item add/update
- replacement check
- export options

Handle these first with service tests.

### 17.2 Large `ExamsPage.tsx`

`ExamsPage.tsx` is very large. Adding more behavior directly to it will make parity fragile.

Mitigation:

- Move state into hooks.
- Move feature sections into components.
- Keep `ExamsPage.tsx` as composition only.

### 17.3 Partial Feature Duplication

The website currently has overlapping concepts:

- `QuestionBankModal` and inline question editing.
- `ExamGenerationModal` preview editing and `DraftEditorModal`.
- custom Word export state and backend export endpoint.

Mitigation:

- Pick Flutter's concept as source of truth.
- One complete question form.
- One complete draft editor.
- One export options flow.

### 17.4 Tests Added Too Late

Many parity issues are payload-level. Without tests, regressions will happen.

Mitigation:

- Add service tests immediately after each service change.
- Add hook tests before large UI refactors.

## 18. Final Definition Of Done

The website implementation is complete when:

1. Every service method needed by the Flutter Question Bank and Exam Generator exists in TypeScript.
2. Every request payload matches the Flutter service behavior.
3. Every question type can be created, edited, validated, listed, filtered, and status-managed.
4. Attachments and group shared media support metadata, reorder, and cleanup.
5. Bulk create supports editable rows, partial failures, and created-question status actions.
6. Groups support full create/edit/detail/membership/reorder operations.
7. Exam generation supports flat and sectioned modes with all rule scopes and settings.
8. Availability and shortages are visible before generation.
9. Drafts can be fully edited, validated, regenerated, duplicated, reshuffled, normalized, and saved.
10. Saved exams can be viewed, lifecycle-managed, templated, and exported with options.
11. The main feature files are no longer carrying all business state directly.
12. Build, lint, and tests pass.


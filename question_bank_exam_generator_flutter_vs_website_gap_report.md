# Question Bank And Exam Generator Gap Report

Date: 2026-05-09

Flutter project: `D:\Graduation\EduVerse\edu_verse`

Website project compared: `D:\Graduation\frontend_tarek\Eduverse-Frontend`

Audience: website developers who need to update the React website so its Question Bank and Exam Generator match the Flutter implementation.

## 1. Executive Summary

The Flutter project is the current source of truth for the instructor Question Bank and Exam Generator features. It implements these modules as complete instructor workflows with dedicated routes, typed models, Cubit state machines, API services, localized UI, validation, batch operations, media handling, grouped questions, draft editing, exam lifecycle actions, export options, and tests.

The website project has partial support. It has an `Exams` dashboard tab, a very large `ExamsPage.tsx`, a question creation modal, a generation modal, several group/attachment dialogs, and API service wrappers. However, it does not yet match Flutter in feature depth, payload shapes, filters, validation, state handling, draft editor behavior, export options, paper templates, lifecycle reasoning, availability checks, or test coverage.

The highest priority website gaps are:

1. Fix API contract mismatches in question batch creation, batch status actions, attachment reorder, question group payloads, draft section/item payloads, replacement check, answer policy enum values, and export options.
2. Implement the full Question Bank CRUD lifecycle from Flutter: detailed create/edit screens or equivalent modal flow, fill-blanks editor, pending media cleanup, attachment metadata/reorder, filtered stats, all-matching batch status actions, reject comments, and status transitions.
3. Implement the full Question Group workflow: group creation/edit with shared prompt/image/caption/alt text, add new grouped questions, link existing questions, unlink, reorder, delete group without deleting questions, status actions on newly created group questions, and group-aware question filtering.
4. Implement the full Exam Generator form: generation modes, course/chapter/chapters/group scopes, sections, total marks, mark distribution mode, rounding policy, group selection mode, seed randomization, duration, instructions, header/footer text, availability check, shortage display, and draft creation.
5. Implement the full draft editor: load/validate draft, create/update/delete/reorder sections, add/replacement-check/update/delete/reorder items, move items to sections, candidate question picker with filters, regenerate/duplicate/reshuffle/normalize/save draft, and reload after source question edits.
6. Implement saved exam detail/lifecycle/export: full saved exam view, publish/archive actions with reasons, paper template preview/apply, export variants, answer key options, local download/open behavior, and stats/readiness displays matching Flutter.
7. Add website tests for services, state flows, question forms, groups, draft editor, generation, export, and route behavior. The website currently has no tests for these modules.

## 2. Source Files Used For This Investigation

### 2.1 Flutter Source Of Truth

Main services:

- `lib/services/api/question_bank_service.dart`
- `lib/services/api/exam_generator_service.dart`

Question Bank state:

- `lib/bloc/instructor/question_bank/question_bank_cubit.dart`
- `lib/bloc/instructor/question_bank/question_bank_state.dart`
- `lib/bloc/instructor/question_bank/question_form_cubit.dart`
- `lib/bloc/instructor/question_bank/question_form_state.dart`
- `lib/bloc/instructor/question_bank/question_bulk_create_cubit.dart`
- `lib/bloc/instructor/question_bank/question_bulk_create_state.dart`
- `lib/bloc/instructor/question_bank/question_detail_cubit.dart`
- `lib/bloc/instructor/question_bank/question_detail_state.dart`
- `lib/bloc/instructor/question_bank/question_group_cubit.dart`
- `lib/bloc/instructor/question_bank/question_group_state.dart`

Exam Generator state:

- `lib/bloc/instructor/exam_generator/exam_generator_cubit.dart`
- `lib/bloc/instructor/exam_generator/exam_generator_state.dart`
- `lib/bloc/instructor/exam_generator/exam_generator_form_cubit.dart`
- `lib/bloc/instructor/exam_generator/exam_generator_form_state.dart`
- `lib/bloc/instructor/exam_generator/exam_draft_editor_cubit.dart`
- `lib/bloc/instructor/exam_generator/exam_draft_editor_state.dart`

Key models:

- `lib/models/question_bank/*`
- `lib/models/exams/*`

Routes:

- `lib/config/app_router.dart`

Screens and widgets:

- `lib/screens/instructor/question_bank/*`
- `lib/widgets/instructor/question_bank/*`
- `lib/screens/instructor/exam_generator/*`
- `lib/widgets/instructor/exam_generator/*`

Tests:

- `test/bloc/instructor/question_bank_cubit_test.dart`
- `test/bloc/instructor/question_bulk_create_cubit_test.dart`
- `test/bloc/instructor/question_group_cubit_test.dart`
- `test/bloc/instructor/exam_generator_cubit_test.dart`
- `test/bloc/instructor/exam_generator_form_cubit_test.dart`
- `test/bloc/instructor/exam_draft_editor_cubit_test.dart`
- `test/services/api/question_bank_service_test.dart`
- `test/services/api/exam_generator_service_test.dart`
- `test/models/question_bank/question_bank_models_test.dart`
- `test/models/exams/exam_generator_models_test.dart`
- `test/widgets/instructor/question_bank_screen_test.dart`
- `test/widgets/instructor/question_bank_bulk_create_screen_test.dart`
- `test/widgets/instructor/question_bank_detail_screen_test.dart`
- `test/widgets/instructor/exam_generator_screen_test.dart`
- `test/widgets/instructor/exam_generator_create_screen_test.dart`
- `test/widgets/instructor/exam_draft_detail_screen_test.dart`
- `test/integration/features/question_bank_exam/instructor_question_bank_exam_flow_test.dart`
- `test/l10n/question_bank_exam_localization_test.dart`

### 2.2 Website Current Implementation

Main page:

- `src/pages/instructor-dashboard/components/ExamsPage.tsx`

Question Bank components:

- `src/pages/instructor-dashboard/components/quizzes/QuestionBankModal.tsx`
- `src/components/question-bank/BatchStatusDialog.tsx`
- `src/components/question-bank/BulkImportDialog.tsx`
- `src/components/question-bank/ChapterManagerDrawer.tsx`
- `src/components/question-bank/QuestionAttachmentsPanel.tsx`
- `src/components/question-bank/QuestionGroupsTab.tsx`
- `src/components/question-bank/GroupFormModal.tsx`
- `src/components/question-bank/GroupDetailModal.tsx`
- `src/components/question-bank/RejectQuestionDialog.tsx`

Exam components:

- `src/pages/instructor-dashboard/components/quizzes/ExamGenerationModal.tsx`
- `src/components/exam-draft/DraftEditorModal.tsx`
- `src/components/exam-draft/ExamFullViewModal.tsx`

Website services:

- `src/services/api/questionBankService.ts`
- `src/services/api/questionGroupService.ts`
- `src/services/api/examGenerationService.ts`
- `src/services/api/chapterService.ts`

Dashboard route:

- `src/pages/instructor-dashboard/InstructorDashboard.tsx`

Tests:

- No question bank, exam generator, exam draft, or exam service tests were found under `src`.

## 3. Route And Information Architecture Differences

### 3.1 Flutter Routing

Flutter exposes these features as first-class routes:

- `/instructor/question-bank`
- `/instructor/question-bank/create`
- `/instructor/question-bank/bulk-create`
- `/instructor/question-bank/chapters`
- `/instructor/question-bank/groups`
- `/instructor/question-bank/groups/create`
- `/instructor/question-bank/groups/:groupId/edit`
- `/instructor/question-bank/groups/:groupId/add-questions`
- `/instructor/question-bank/groups/:groupId/link-questions`
- `/instructor/question-bank/groups/:groupId`
- `/instructor/question-bank/:questionId/edit`
- `/instructor/question-bank/:questionId`
- `/instructor/exam-generator`
- `/instructor/exam-generator/create`
- `/instructor/exam-generator/info`
- `/instructor/exam-generator/drafts/:draftId`
- `/instructor/exam-generator/exams/:examId/paper-export`
- `/instructor/exam-generator/exams/:examId`

Operational impact:

- Every major workflow can be deep-linked.
- Edit/detail/create workflows are isolated, so page state is smaller and easier to preserve.
- The browser/app history represents the instructor's workflow.
- Each route can own loading, validation, and error states.

### 3.2 Website Routing

The website adds one dashboard tab:

- `InstructorDashboard.tsx` contains `activeTab === 'exams' && <ExamsPage courses={coursesData} />`.
- `ExamsPage.tsx` has internal tabs: `questions`, `groups`, `drafts`, `saved`.
- Detail flows are mostly modal-based or handled inside the huge `ExamsPage.tsx`.
- Some URLs use `/instructordashboard/exams/:id?entity=draft|saved`, but they are still handled by the same page rather than dedicated modules.

Website gaps:

- Missing dedicated routes for question create/edit/detail, bulk create, chapter manager, group create/edit/detail/add/link, exam generator create/info, draft detail, saved exam detail, and paper export preview.
- Most behavior is in one large file, making parity work difficult and increasing regression risk.
- Several modal flows cannot be bookmarked or reopened directly.

Website recommendation:

- Either add dedicated React routes matching Flutter, or split `ExamsPage.tsx` into route-level screens with the same information architecture.
- Keep the existing `Exams` tab as the entry point, but route into dedicated pages for non-trivial flows.

## 4. Shared Enums And Domain Values

### 4.1 Question Bank Enums

Flutter supports:

```ts
type QuestionBankType = 'written' | 'mcq' | 'true_false' | 'fill_blanks' | 'essay';
type QuestionBankDifficulty = 'easy' | 'medium' | 'hard';
type BloomLevel =
  | 'remembering'
  | 'understanding'
  | 'applying'
  | 'analyzing'
  | 'evaluating'
  | 'creating';
type QuestionBankStatus =
  | 'draft'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'archived';
type QuestionAttachmentType = 'image' | 'document' | 'audio' | 'video';
type QuestionGroupType =
  | 'passage'
  | 'case_study'
  | 'image_set'
  | 'multipart'
  | 'other';
```

Website status:

- `questionBankService.ts` includes question types, difficulties, and Bloom levels.
- `UpdateQuestionBankPayload` includes the same statuses.
- `QuestionGroupService.QuestionGroupDto` omits `other`.
- Some UI places are not fully wired for `fill_blanks`.

Website gaps:

- Add `other` to group type support everywhere.
- Ensure all UI filters, badges, forms, services, and payloads consistently support `under_review`, `rejected`, and `archived`.
- Do not use legacy or display-only values in payloads.

### 4.2 Exam Generator Enums

Flutter supports:

```ts
type ExamDraftStatus = 'open' | 'finalized' | 'expired' | 'cancelled' | 'failed';
type ExamStatus = 'draft' | 'published' | 'archived';
type ExamMarkDistributionMode = 'manual' | 'weight_normalized' | 'equal';
type ExamRoundingPolicy = 'none' | 'nearest_0_25' | 'nearest_0_5' | 'nearest_1';
type ExamSectionAnswerPolicy = 'answer_all' | 'answer_any';
type ExamGroupSelectionMode = 'independent' | 'exclude_grouped' | 'keep_group_together';
type ExamExportFormat = 'docx' | 'pdf';
type ExamExportVariant = 'student' | 'answer_key' | 'combined';
type ExamAnswerKeyStyle = 'inline' | 'separate';
type ExamGenerationScope = 'course' | 'chapter' | 'chapters' | 'group';
```

Website status:

- `examGenerationService.ts` only types a basic `ExamGenerationRule` with `chapterId`, `count`, `weightPerQuestion`, optional type/difficulty/Bloom.
- `DraftEditorModal.tsx` uses `answerPolicy: 'ANSWER_ALL'`, which does not match Flutter/backend values `answer_all` and `answer_any`.
- Website generation has no typed mark distribution, rounding, group selection, export variant, answer key style, or generation scope model.

Website gaps:

- Add all Flutter enum values to TypeScript.
- Fix `ANSWER_ALL` to `answer_all`.
- Add `answer_any` with `requiredAnswerCount`.
- Add generation scopes: course-wide, single chapter, multiple chapters, and group-based rules.

## 5. Question Bank API Contract Differences

### 5.1 Flutter QuestionBankService Coverage

Flutter implements:

- `GET /courses/:courseId/chapters`
- `POST /courses/:courseId/chapters`
- `PATCH /courses/:courseId/chapters/:chapterId`
- `DELETE /courses/:courseId/chapters/:chapterId`
- `GET /question-bank/questions`
- `GET /question-bank/questions/stats`
- `GET /question-bank/questions/:id`
- `POST /question-bank/questions`
- `PATCH /question-bank/questions/:id`
- `DELETE /question-bank/questions/:id`
- `POST /question-bank/questions/batch`
- `GET /question-bank/questions/chapter-counts`
- `POST /question-bank/questions/upload-image`
- `DELETE /files/:fileId`
- `POST /question-bank/groups/upload-image`
- `POST /question-bank/questions/:questionId/attachments/upload-image`
- `POST /question-bank/questions/:questionId/attachments`
- `PATCH /question-bank/questions/:questionId/attachments/reorder`
- `PATCH /question-bank/questions/:questionId/attachments/:attachmentId`
- `DELETE /question-bank/questions/:questionId/attachments/:attachmentId`
- `POST /question-bank/questions/:questionId/:action`
- `POST /question-bank/questions/status/batch`
- `GET /question-bank/groups`
- `GET /question-bank/groups/:groupId`
- `POST /question-bank/groups`
- `PATCH /question-bank/groups/:groupId`
- `POST /question-bank/groups/:groupId/questions/batch`
- `POST /question-bank/groups/:groupId/questions/link`
- `DELETE /question-bank/groups/:groupId/questions/:questionId`
- `PATCH /question-bank/groups/:groupId/questions/reorder`
- `DELETE /question-bank/groups/:groupId`

### 5.2 Website Service Mismatches

#### Question list filters

Flutter sends:

```ts
{
  page,
  limit,
  courseId,
  chapterId,
  questionType,
  difficulty,
  bloomLevel,
  status,
  search,
  hasAttachments,
  groupId,
  questionGroupId,
  groupIds
}
```

Website service supports only:

```ts
{
  courseId,
  chapterId,
  questionType,
  difficulty,
  bloomLevel,
  page,
  limit,
  search,
  status
}
```

Missing on website:

- `hasAttachments`
- `groupId`
- `questionGroupId`
- `groupIds`
- typed status enum in list params
- stats params mirroring the active filters

Required website behavior:

1. Every visible filter should map to server query parameters.
2. Stats should be requested with the same filters, except where the UI intentionally shows global totals.
3. Group detail and exam candidate pickers should use group-aware filters, not local-only filtering.

#### Batch create payload

Flutter sends:

```json
{
  "courseId": 34,
  "defaultChapterId": 2,
  "questions": [
    {
      "courseId": 34,
      "chapterId": 2,
      "questionType": "mcq",
      "difficulty": "medium",
      "bloomLevel": "understanding",
      "questionText": "Question",
      "options": []
    }
  ]
}
```

Website currently sends:

```ts
QuestionBankService.createBatch(payloads)
// posts payloads directly as the request body
```

Website gap:

- Change `createBatch` to accept `{ courseId, defaultChapterId?, questions }`.
- Parse the response as a detailed batch result, not just a success count.
- Preserve failed rows for correction, like Flutter.

#### Batch status payload

Flutter sends:

```json
{
  "questionIds": [1, 2],
  "action": "approve",
  "comment": "optional",
  "expectedQuestionCount": 2
}
```

For selecting all matching filtered records, Flutter sends:

```json
{
  "allMatchingFilters": true,
  "excludeQuestionIds": [3],
  "courseId": 34,
  "chapterId": 2,
  "questionType": "mcq",
  "difficulty": "medium",
  "bloomLevel": "understanding",
  "status": "draft",
  "search": "network",
  "hasAttachments": true,
  "groupId": 10,
  "expectedQuestionCount": 125,
  "action": "approve",
  "comment": "optional"
}
```

Website currently sends:

```json
{
  "ids": [1, 2],
  "status": "approved"
}
```

Website gaps:

- Rename `ids` to `questionIds`.
- Replace `status` with `action`.
- Support action values used by Flutter: `submit-for-review`, `approve`, `reject`, `archive`, `restore`.
- Support optional `comment`.
- Support all-matching-filter selection with excluded IDs and expected count.

#### Reject payload

Flutter status action sends:

```json
{
  "comment": "Reason text"
}
```

Website currently sends:

```json
{
  "reason": "Reason text"
}
```

Website gap:

- Use `comment`, or confirm backend accepts both. The Flutter contract should be treated as the safer target.

#### Attachment payloads

Flutter add attachment sends:

```json
{
  "fileId": 100,
  "attachmentType": "image",
  "caption": "optional",
  "altText": "optional",
  "displayOrder": 0,
  "isPrimary": true
}
```

Website add attachment currently sends:

```json
{
  "url": "...",
  "type": "image",
  "caption": "...",
  "altText": "..."
}
```

Flutter reorder sends:

```json
{
  "items": [
    { "attachmentId": 1, "displayOrder": 0 },
    { "attachmentId": 2, "displayOrder": 1 }
  ]
}
```

Website reorder currently sends:

```json
{
  "order": [1, 2]
}
```

Website gaps:

- Use `fileId`, `attachmentType`, `displayOrder`, and `isPrimary`.
- Add update support for `displayOrder`, `isPrimary`, clearing caption, and clearing alt text.
- Reorder with `items`, not `order`.
- Upload attachment image should return the created attachment where available, not just `{ fileId }`.
- Add pending-upload cleanup via `DELETE /files/:fileId` for create flows that are cancelled or fail.

#### Question group payloads

Flutter create group sends:

```json
{
  "courseId": 34,
  "title": "Case study",
  "sharedPrompt": "Shared passage",
  "sharedFileId": 100,
  "sharedFileCaption": "optional",
  "sharedFileAltText": "optional",
  "groupType": "case_study"
}
```

Website group service currently defines:

```ts
{
  title: string;
  description?: string;
  groupType: 'passage' | 'case_study' | 'image_set' | 'multipart';
  chapterId?: number;
  sharedImageFileId?: number;
}
```

Website gaps:

- Add required `courseId`.
- Replace `description` with `sharedPrompt` or map it explicitly.
- Replace `sharedImageFileId` with `sharedFileId`.
- Add `sharedFileCaption` and `sharedFileAltText`.
- Add `other` group type.
- Confirm whether `chapterId` is valid for group create. Flutter does not send it in `createGroup`.

#### Group add-questions payload

Flutter sends:

```json
{
  "questions": [questionPayload]
}
```

Website sends:

```ts
QuestionGroupService.addQuestions(groupId, questions)
// posts questions directly as body
```

Website gap:

- Wrap the array in `{ questions }`.

#### Group reorder payload

Flutter sends:

```json
{
  "items": [
    { "questionId": 10, "itemOrder": 0 },
    { "questionId": 11, "itemOrder": 1 }
  ]
}
```

Website sends:

```json
{
  "order": [10, 11]
}
```

Website gap:

- Use the `items` payload shape.

## 6. Question Bank Flow Differences

### 6.1 Main List Flow

Flutter flow:

1. `QuestionBankCubit.initialize(preferredCourseId?)`
2. Load instructor teaching courses.
3. Select a preferred or first course.
4. Load course chapters.
5. Load chapter question counts.
6. Load question groups.
7. Load questions with current filters.
8. Load stats with the same filter shape.
9. Cache question objects for later status/batch refresh.
10. Support pagination via `loadMore()`.

Website flow:

1. `ExamsPage` receives `courses`.
2. User selects course/chapter.
3. `loadChapters()` loads chapters.
4. `loadQuestions()` loads questions.
5. `loadQuestions()` manually handles some multi-select filters by making repeated list requests.
6. Stats are loaded separately via `QuestionBankService.getStats()` with no filter params.

Website gaps:

- Add a dedicated state layer or hook equivalent to `QuestionBankCubit`.
- Make filters server-driven rather than manually combining requests for selected type/difficulty/status/Bloom values.
- Add `hasAttachments` and `groupId` filters.
- Keep selected question objects cached so status updates can refresh consistently.
- Add `loadMore` behavior using `total` and `limit`.

### 6.2 Supported Question List Filters

Flutter supports:

- Course
- Chapter
- Question type
- Difficulty
- Bloom level
- Status
- Search text
- Has attachments
- Group
- Page
- Limit

Website currently supports:

- Course
- Chapter
- Question type
- Difficulty
- Bloom level
- Status
- Search text
- Page
- Limit

Website missing:

- Attachment filter
- Group filter
- Full server-level multi-filter behavior
- Stats tied to filter context

### 6.3 Question Stats

Flutter state exposes:

- `approvedCount`
- `draftCount`
- `underReviewCount`
- `rejectedCount`
- `archivedCount`
- `attachedOrGroupedCount`

Website state currently types:

```ts
{ approved: number; underReview: number; draft: number }
```

Website gaps:

- Add `rejected`, `archived`, and `attachedOrGrouped`.
- Pass the same filters as the list.
- Display failures separately from empty stats, as Flutter does through state fields.

### 6.4 Selection And Batch Actions

Flutter supports:

- Toggle selection mode.
- Select/deselect individual questions.
- Select all questions on the current page.
- Select all matching questions across the full filtered result set.
- Track excluded question IDs when all matching records are selected.
- Send `expectedQuestionCount`.
- Run batch status actions with action names and optional comments.
- Refresh list and stats after completion.

Website supports:

- Selecting visible questions.
- A batch status dialog that posts `ids` and `status`.
- Deleting selected questions one by one.

Website gaps:

- Add all-matching-filter selection.
- Add excluded IDs.
- Use `questionIds` and `action`.
- Add `expectedQuestionCount`.
- Add batch comments.
- Refresh stats, list, and selection state after completion.
- For delete-selected, consider backend bulk support if available; otherwise preserve per-item failure reporting.

### 6.5 Question Create/Edit Form

Flutter form behavior:

1. Initialize create with optional `courseId`.
2. Initialize edit by loading question details.
3. Load chapters when course changes.
4. Create chapters inline.
5. Update core fields:
   - course
   - chapter
   - type
   - difficulty
   - Bloom level
   - question text
   - question file
   - question file caption
   - question file alt text
   - expected answer
   - hints
6. Edit MCQ options.
7. Edit true/false options.
8. Edit fill blanks.
9. Upload question image.
10. Remove question image.
11. Upload pending attachments before create.
12. Update pending attachment metadata.
13. Reorder pending attachments.
14. Submit create or dirty update.
15. Optionally status the saved question after create/edit.
16. Discard pending uploads when leaving the form.

Website `QuestionBankModal` behavior:

1. Select course.
2. Load chapters.
3. Select chapter or create a chapter.
4. Select type/difficulty/Bloom.
5. Enter question text or upload one question image.
6. For MCQ/true-false, enter/select options.
7. Enter expected answer and hints.
8. Create question.
9. Optionally add another.

Website gaps:

- No full edit form equivalent. `ExamsPage` only has inline edit for question text, answer, and hint.
- No dirty update payload logic.
- No fill-blanks editor, even though the type is selectable.
- No attachment creation inside create/edit.
- No question image caption/alt text.
- No pending upload cleanup.
- No post-save status action flow.
- No full detail screen equivalent.
- No reusable typed form state equivalent.

Required website validation rules from Flutter:

- Course is required.
- Chapter is required.
- Either question text, uploaded question file ID, or local image path is required.
- Each attachment must validate.
- MCQ requires at least two options.
- MCQ requires at least one correct option.
- True/false requires exactly two options.
- True/false requires exactly one correct option.
- Fill blanks requires at least one blank.
- Fill blank keys must be unique case-insensitively.
- Written and essay require `expectedAnswerText`.

### 6.6 Bulk Create

Flutter bulk create behavior:

1. Initialize course and chapters.
2. Select default chapter.
3. Add up to many local row models.
4. Each row has its own type, chapter, difficulty, Bloom level, text/media, answer data, hints, options, fill blanks, and attachments.
5. Upload row question image.
6. Upload row attachments.
7. Remove/update/reorder row attachments.
8. Validate all rows before submit.
9. Upload pending media.
10. Submit `{ courseId, defaultChapterId, questions }`.
11. Parse detailed result.
12. On partial success, keep failed rows editable.
13. Display created questions.
14. Allow status action on all created questions or individual created questions.
15. Discard pending uploads on cancel/reset.

Website `BulkImportDialog` behavior:

1. Upload/parse CSV.
2. Parse rows into basic fields.
3. Import by calling `QuestionBankService.createBatch(payloads)`.
4. Show imported count.

Website gaps:

- CSV import is useful but does not replace Flutter's editable row-based bulk authoring flow.
- Missing per-row chapter editing in UI after parse.
- Missing image and attachment support.
- Missing fill-blanks support.
- Missing partial failure row preservation from detailed backend response.
- Missing created-question status actions.
- Uses wrong batch endpoint payload shape.

### 6.7 Attachments

Flutter supports:

- Question image as primary prompt media.
- Additional attachments with:
  - file ID
  - attachment type
  - caption
  - alt text
  - display order
  - primary flag
- Upload image attachment to an existing question.
- Add attachment from existing file ID.
- Update caption/alt/order/primary.
- Clear caption/alt.
- Reorder attachments.
- Remove attachment.
- Pending attachments during create/bulk create with cleanup if cancelled.

Website supports:

- Upload image attachment after question exists.
- Add URL attachment.
- Delete attachment.
- Load attachments from question detail.

Website gaps:

- Use backend file-based attachment payloads instead of URL/type-only payloads unless URL attachments are separately supported by backend.
- Add metadata editing.
- Add reorder.
- Add primary flag.
- Add display order.
- Add create-form and bulk-create attachment handling.
- Add pending upload cleanup.

### 6.8 Question Groups

Flutter group behavior:

1. List groups with course/chapter/pagination.
2. Create group with course, optional title, shared prompt, shared file, caption, alt text, and group type.
3. Upload group image.
4. Update group and clear title/shared prompt/shared file.
5. Delete group without deleting questions.
6. Load group detail.
7. Add new grouped questions using full question payloads.
8. Link existing questions.
9. Unlink a question from group.
10. Reorder group questions.
11. Status newly created group questions globally or individually.
12. Archive a group question.
13. Sync resolved group questions after external updates.

Website group behavior:

- `QuestionGroupsTab` lists groups with search, group type, chapter, pagination.
- `GroupFormModal` creates/updates group with title, description, groupType, chapterId, shared image.
- `GroupDetailModal` loads detail, previews image, loads approved questions, links existing questions, removes questions, reorders locally, and creates basic new questions.

Website gaps:

- Payload fields do not match Flutter.
- Missing `sharedPrompt`, `sharedFileId`, `sharedFileCaption`, `sharedFileAltText`.
- Missing `other` group type.
- Add-question payload is wrong shape.
- Reorder payload is wrong shape.
- New grouped question creator is simplified and does not include full Flutter validation, fill blanks, attachments, image captions/alt, pending cleanup, or status actions.
- Link existing should be filter-aware and should exclude already-linked questions.
- Group filtering should integrate with the main question list.

## 7. Exam Generator API Contract Differences

### 7.1 Flutter ExamGeneratorService Coverage

Flutter implements:

- `GET /exams/drafts`
- `GET /exams`
- `GET /exams/drafts/:draftId`
- `GET /exams/:examId`
- `GET /exams/:examId/full`
- `GET /exams/paper-templates`
- `POST /exams/paper-templates`
- `PATCH /exams/paper-templates/:templateId`
- `PATCH /exams/:examId/paper-template`
- `GET /exams/stats`
- `GET /exams/generation-readiness`
- `POST /exams/generate-preview`
- `POST /exams/generation-availability`
- `POST /exams/drafts/:draftId/sections`
- `PATCH /exams/drafts/:draftId/sections/reorder`
- `PATCH /exams/drafts/:draftId/sections/:sectionId`
- `DELETE /exams/drafts/:draftId/sections/:sectionId`
- `POST /exams/drafts/:draftId/items`
- `PATCH /exams/drafts/:draftId/items/:itemId`
- `POST /exams/drafts/:draftId/items/:itemId/replacement-check`
- `DELETE /exams/drafts/:draftId/items/:itemId`
- `PATCH /exams/drafts/:draftId/items/reorder`
- `POST /exams/drafts/:draftId/save`
- `GET /exams/drafts/:draftId/validation`
- `POST /exams/drafts/:draftId/regenerate`
- `POST /exams/drafts/:draftId/duplicate`
- `POST /exams/drafts/:draftId/sections/:sectionId/reshuffle`
- `POST /exams/drafts/:draftId/sections/:sectionId/normalize-marks`
- `POST /exams/:examId/:action`
- `POST /exams/:examId/export-word`

### 7.2 Website Service Mismatches

#### Generate preview payload

Flutter sends:

```json
{
  "courseId": 34,
  "title": "Midterm",
  "rules": [],
  "sections": [],
  "totalMarks": 60,
  "markDistributionMode": "weight_normalized",
  "roundingPolicy": "none",
  "groupSelectionMode": "independent",
  "seed": "optional",
  "durationMinutes": 90,
  "instructions": "optional",
  "headerText": "optional",
  "footerText": "optional"
}
```

Website sends:

```json
{
  "courseId": 34,
  "title": "Midterm",
  "rules": [
    {
      "chapterId": 2,
      "count": 5,
      "weightPerQuestion": 2,
      "questionType": "mcq",
      "difficulty": "medium",
      "bloomLevel": "applying"
    }
  ]
}
```

Website gaps:

- Add `sections`.
- Add generation modes.
- Add `totalMarks`.
- Add `markDistributionMode`.
- Add `roundingPolicy`.
- Add `groupSelectionMode`.
- Add `seed` and randomize/clear seed controls.
- Add `durationMinutes`.
- Add `instructions`, `headerText`, `footerText`.
- Add rule `scope`, `chapterIds`, and `groupIds`.

#### Generation availability

Flutter calls:

```http
POST /exams/generation-availability
```

with the same payload as preview.

Website does not call this endpoint.

Website gap:

- Add debounced availability checks in the generation form.
- Show shortage buckets before generation.
- Disable or warn on generation when requirements exceed approved question pool.

#### Draft list and exam list filters

Flutter supports:

```ts
{
  courseId,
  status,
  dateFrom,
  dateTo,
  page,
  limit
}
```

Website supports:

```ts
{
  courseId,
  page,
  limit
}
```

Website gaps:

- Add draft status filter.
- Add exam status filter.
- Add date range filters.
- Add list kind behavior matching Flutter: all, drafts, saved.

#### Draft section payloads

Flutter create/update section sends:

```json
{
  "title": "Part A",
  "instructions": "Answer all",
  "totalMarks": 20,
  "answerPolicy": "answer_all",
  "requiredAnswerCount": 3
}
```

Website `DraftEditorModal` sends uppercase `ANSWER_ALL`, does not send `requiredAnswerCount`, and uses integer parsing.

Website gaps:

- Use `answer_all` and `answer_any`.
- Add `requiredAnswerCount`.
- Allow decimal marks where backend/Flutter model supports `double`.
- Add section update UI, not only create/delete.

#### Draft section reorder payload

Flutter sends:

```json
{
  "items": [
    { "sectionId": 1, "sectionOrder": 0 },
    { "sectionId": 2, "sectionOrder": 1 }
  ]
}
```

Website sends:

```json
{
  "order": [1, 2]
}
```

Website gap:

- Match Flutter `items` payload.

#### Add draft item payload

Flutter sends:

```json
{
  "questionId": 10,
  "draftSectionId": 5,
  "weightUnits": 1,
  "marks": 2,
  "overrideReason": "optional"
}
```

Website service sends:

```json
{
  "questionId": 10,
  "weight": 1,
  "itemOrder": 1
}
```

Website `DraftEditorModal` attempts to pass `sectionId`, which is not part of the typed service payload.

Website gaps:

- Use `draftSectionId`, not `sectionId`.
- Support `weightUnits`.
- Support `marks`.
- Support `overrideReason`.
- Add override reason UI where replacement/add violates a rule or needs instructor justification.

#### Update draft item payload

Flutter supports:

```json
{
  "replacementQuestionId": 42,
  "draftSectionId": 5,
  "draftSectionId": null,
  "weight": 1,
  "weightUnits": 1,
  "marks": 2,
  "itemOrder": 3,
  "overrideReason": "optional"
}
```

Website supports only:

```ts
{
  weight?: number;
  weightUnits?: number;
  marks?: number;
  replacementQuestionId?: number;
}
```

Website gaps:

- Add `draftSectionId`.
- Add explicit clear-section behavior.
- Add `itemOrder`.
- Add `overrideReason`.
- Refresh draft after update.

#### Replacement check payload

Flutter sends:

```json
{
  "replacementQuestionId": 42
}
```

Website service has:

```ts
checkReplacement(draftId: number, itemId: number)
```

and sends no replacement question ID.

Website gap:

- Require `replacementQuestionId` and send it.
- Display whether override is required before applying replacement.

#### Draft item reorder payload

Flutter sends:

```json
{
  "items": [
    { "itemId": 1, "itemOrder": 0 },
    { "itemId": 2, "itemOrder": 1 }
  ]
}
```

Website generation modal sends this shape, but other reorder helpers use `order`.

Website gap:

- Standardize every item reorder call to the Flutter `items` shape.
- Add drag/drop or explicit reorder for both sectioned and unsectioned questions.

#### Regenerate, duplicate, reshuffle

Flutter supports:

```json
// regenerate
{
  "seed": "optional",
  "keepManualEdits": false
}

// duplicate
{
  "title": "optional",
  "seed": "optional",
  "regenerate": false
}

// reshuffle section
{
  "seed": "optional",
  "keepManualEdits": true
}
```

Website sends only seed for regenerate, no payload for duplicate, and seed only for reshuffle.

Website gaps:

- Add `keepManualEdits`.
- Add duplicate title.
- Add duplicate seed.
- Add duplicate regenerate toggle.
- Add reshuffle `keepManualEdits`.

#### Normalize section marks

Flutter sends:

```json
{
  "totalMarks": 20
}
```

Website calls normalize with no total marks.

Website gap:

- Allow instructor to normalize to current section total marks or a custom total.

#### Lifecycle actions

Flutter lifecycle method supports:

```http
POST /exams/:examId/:action
```

with:

```json
{
  "reason": "optional"
}
```

Website supports publish, unpublish, archive without reason.

Website gaps:

- Add reason prompts where appropriate.
- Confirm backend supports `unpublish`; Flutter enum only has `draft`, `published`, `archived`, and lifecycle action is generic.
- Match Flutter available actions and labels.

#### Export options

Flutter export sends:

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

Website export service sends no options.

Website gaps:

- Add export options modal matching Flutter.
- Support student paper, answer key, and combined variants.
- Support answer key style.
- Support paper template selection/snapshot.
- Download the returned base64 file reliably.

#### Paper templates

Flutter supports list/create/update/apply paper templates.

Website has template state in `ExamsPage.tsx`, but `examGenerationService.ts` does not expose paper template methods.

Website gaps:

- Add service methods for:
  - `getPaperTemplates(courseId?)`
  - `createPaperTemplate(template)`
  - `updatePaperTemplate(template)`
  - `applyPaperTemplate(examId, template)`
- Wire the existing UI state to real service calls.

## 8. Exam Generator Flow Differences

### 8.1 Main Exam Generator List

Flutter flow:

1. `ExamGeneratorCubit.initialize(preferredCourseId?)`
2. Load teaching courses.
3. Select course.
4. Load stats.
5. Load generation readiness.
6. Load drafts.
7. Load saved exams.
8. Support filters:
   - selected course
   - draft status
   - exam status
   - list kind: all/drafts/saved
   - search
   - date from/to
   - page/limit for both lists
9. Cache drafts and exams.
10. Generate draft from the list screen.

Website flow:

1. `ExamsPage` loads backend drafts and saved exams.
2. It uses fallback endpoints.
3. It maps many possible response shapes into local summary objects.
4. It has internal tabs for drafts and saved exams.
5. It loads generation readiness for a selected course.

Website gaps:

- Add status and date filters.
- Normalize list response shapes in the service layer, not inside the page.
- Remove fallback endpoint guessing once backend contract is fixed.
- Add typed draft/exam models.
- Add separate state hooks for list, stats, readiness, and details.

### 8.2 Generation Form

Flutter form supports:

- Course selection.
- Chapter list.
- Question group list.
- Title.
- Total marks.
- Mode:
  - flat rules
  - sectioned exam
- Mark distribution:
  - manual
  - weight normalized
  - equal
- Rounding:
  - none
  - nearest 0.25
  - nearest 0.5
  - nearest 1
- Group selection mode.
- Seed, randomize seed, clear seed.
- Duration minutes.
- Instructions.
- Header text.
- Footer text.
- Rules.
- Sections.
- Debounced availability check.
- Shortage handling.
- Submit and navigate to created draft.

Website `ExamGenerationModal` supports:

- Course.
- Title.
- Chapter-based rules.
- Count.
- Weight per question.
- Optional type/difficulty/Bloom.
- Generate preview.
- Fetch question details for preview items.
- Edit item weights.
- Reorder preview items.
- Save exam.

Website gaps:

- Missing sectioned generation.
- Missing scopes other than single chapter.
- Missing group-based generation.
- Missing course-wide generation.
- Missing multi-chapter rules.
- Missing total marks and mark distribution.
- Missing rounding.
- Missing group selection mode.
- Missing seed controls.
- Missing duration/instructions/header/footer.
- Missing availability panel and shortage display before generation.
- Missing backend shortage object parsing.

### 8.3 Rule Model

Flutter rule model:

```ts
{
  scope: 'course' | 'chapter' | 'chapters' | 'group',
  chapterId?: number,
  chapterIds?: number[],
  groupIds?: number[],
  count: number,
  weightPerQuestion: number,
  questionType?: QuestionBankType,
  difficulty?: QuestionBankDifficulty,
  bloomLevel?: BloomLevel
}
```

Website rule model:

```ts
{
  chapterId: number,
  count: number,
  weightPerQuestion: number,
  questionType?: QuestionBankType,
  difficulty?: QuestionBankDifficulty,
  bloomLevel?: BloomLevel
}
```

Website gaps:

- Add `scope`.
- Add `chapterIds`.
- Add `groupIds`.
- Update validation:
  - course scope needs no chapter.
  - chapter scope requires one chapter.
  - chapters scope requires at least one chapter.
  - group scope requires at least one group.
  - count must be greater than zero.
  - weight must be greater than zero.

### 8.4 Sectioned Generation

Flutter section model:

```ts
{
  title: string,
  instructions?: string,
  totalMarks: number,
  answerPolicy: 'answer_all' | 'answer_any',
  requiredAnswerCount?: number,
  rules: ExamGenerationRule[]
}
```

Website has no generation section model in `ExamGenerationModal`.

Website gaps:

- Add section editor inside generation form.
- Each section must contain its own rules.
- Validate title, total marks, and rules.
- Include `requiredAnswerCount` when answer policy is `answer_any`.
- Show calculated totals and availability by section.

### 8.5 Draft Editor

Flutter draft editor supports:

- Load draft.
- Create section.
- Upsert section.
- Delete section.
- Reorder sections.
- Add item.
- Update item.
- Check whether replacement requires override.
- Remove item.
- Reorder items.
- Load candidate questions with filters.
- Load more candidate questions.
- Save draft.
- Regenerate draft.
- Duplicate draft.
- Reload after editing source question.
- Reshuffle section.
- Normalize section marks.
- Move selected items to a section or unassigned pool.

Website `DraftEditorModal` supports:

- Load draft.
- Validate.
- Regenerate.
- Duplicate.
- Save as exam.
- Export.
- Create section.
- Delete section.
- Load approved questions.
- Add selected questions.
- Update marks.
- Delete item.

Website gaps:

- No section update/edit.
- No section reorder.
- No item reorder in `DraftEditorModal`.
- No candidate question filters except local text search.
- No load-more candidates.
- No replacement workflow.
- No override reason.
- No move items to section.
- No reshuffle section control.
- No normalize section marks with target total.
- No reload after source question edit.
- Uses wrong `answerPolicy` values.
- Uses likely wrong `sectionId`/`draftSectionId` payload.
- Export is called with draft ID through `exportExamWord`, while Flutter exports saved exams by exam ID.

### 8.6 Candidate Question Picker

Flutter candidate picker should use approved questions and supports filtering by the same question bank dimensions.

Website candidate question loading:

```ts
QuestionBankService.list({
  status: 'approved',
  page: 1,
  limit: 100
});
```

Website gaps:

- Add course constraint from the draft.
- Add chapter/type/difficulty/Bloom/search filters.
- Add group filter.
- Exclude questions already in the draft.
- Add pagination/load more.
- Show shortages and rule compatibility.
- Check replacement before replacing.

### 8.7 Saved Exam Detail And Lifecycle

Flutter saved exam routes:

- `/instructor/exam-generator/exams/:examId`
- `/instructor/exam-generator/exams/:examId/paper-export`

Flutter service supports:

- `getExam`
- `getFullExam`
- lifecycle action with reason
- export with options
- paper template apply

Website supports:

- Saved exams tab.
- Full view modal.
- publish/unpublish/archive buttons.
- export Word button.
- some custom Word document settings in `ExamsPage`.

Website gaps:

- Align export with backend export options, not only custom local doc generation state.
- Add full saved exam page or detail route.
- Add lifecycle reason.
- Add archive/publish state refresh.
- Add paper template service and preview/apply flow.
- Add answer key/combined export flow.

## 9. Localization And Accessibility Differences

Flutter has English and Arabic localization entries for these modules, including:

- Question Bank labels.
- Exam Generator labels.
- Bulk create labels.
- Group labels.
- Draft detail labels.
- Draft tabs: overview, questions, reorder, build, review.
- Readiness, issues, expiration, finalized/expired states.

Website is mostly hardcoded English in the inspected components.

Website gaps:

- Add i18n keys for all user-facing strings.
- Include Arabic translations matching Flutter where applicable.
- Avoid hardcoded status/action labels inside services/components.
- Ensure validation and error messages are localizable.

## 10. Testing Differences

Flutter has dedicated test coverage across:

- models
- services
- Cubits/state flows
- widgets/screens
- localization
- integration flow

Website has no tests for:

- `questionBankService.ts`
- `questionGroupService.ts`
- `examGenerationService.ts`
- `QuestionBankModal`
- `BulkImportDialog`
- `BatchStatusDialog`
- `QuestionGroupsTab`
- `GroupFormModal`
- `GroupDetailModal`
- `QuestionAttachmentsPanel`
- `ExamGenerationModal`
- `DraftEditorModal`
- `ExamFullViewModal`
- `ExamsPage`

Required website test checklist:

- Service tests for every endpoint and payload shape listed in this report.
- Question form validation tests.
- Fill-blanks editor tests.
- Pending media cleanup tests.
- Bulk create partial failure tests.
- Batch status all-matching-filter tests.
- Group create/update/link/unlink/reorder tests.
- Generation rule validation tests for all scopes.
- Sectioned generation tests.
- Availability/shortage rendering tests.
- Draft editor section/item mutation tests.
- Replacement check tests.
- Export option payload tests.
- Route/deep-link tests for draft and saved exam detail.

## 11. Implementation Roadmap For Website Team

### Phase 1: Fix API Services And Types

Update these files first:

- `src/services/api/questionBankService.ts`
- `src/services/api/questionGroupService.ts`
- `src/services/api/examGenerationService.ts`
- `src/services/api/chapterService.ts`

Required outputs:

- Full enum parity with Flutter.
- Correct request/response types.
- Correct payload shapes.
- No fallback endpoint guessing for stable APIs.
- All service methods needed by Flutter.
- Unit tests for every service method.

### Phase 2: Split State Out Of `ExamsPage.tsx`

Create focused hooks or state modules:

- `useQuestionBank`
- `useQuestionForm`
- `useQuestionBulkCreate`
- `useQuestionGroups`
- `useExamGeneratorList`
- `useExamGeneratorForm`
- `useExamDraftEditor`
- `useExamExport`

Required outputs:

- Smaller page components.
- Reusable state logic.
- Testable flow operations.

### Phase 3: Complete Question Bank UI

Implement or upgrade:

- Question list with all filters.
- Filtered stats.
- Selection mode and all-matching batch actions.
- Full create/edit form.
- Fill-blanks editor.
- Attachment manager with metadata/reorder.
- Bulk create editable rows.
- Detailed question view.
- Status workflow.

### Phase 4: Complete Question Groups

Implement:

- Correct group payloads.
- Shared prompt/image/caption/alt text.
- Create/edit/detail routes or robust modals.
- Add grouped questions with full question editor.
- Link existing questions.
- Unlink.
- Reorder.
- Delete.
- Group-aware question filters.

### Phase 5: Complete Exam Generator Form

Implement:

- Flat and sectioned modes.
- Rule scopes.
- Group rules.
- Total marks.
- Mark distribution.
- Rounding.
- Group selection mode.
- Seed controls.
- Duration/instructions/header/footer.
- Availability checks and shortage panels.

### Phase 6: Complete Draft Editor

Implement:

- Draft overview/build/reorder/review tabs.
- Section create/update/delete/reorder.
- Item add/update/delete/reorder.
- Replacement check and override reason.
- Candidate picker with filters.
- Move items to section.
- Regenerate/duplicate/reshuffle/normalize.
- Save validation.

### Phase 7: Complete Saved Exam And Export

Implement:

- Saved exam detail.
- Full exam detail.
- Lifecycle actions with reason.
- Paper templates list/create/update/apply.
- Export options.
- Answer key variants.
- Download handling.

### Phase 8: Add Tests

Add Vitest/Testing Library coverage matching Flutter's test intent.

## 12. Quick Parity Checklist

### Question Bank

- [ ] Dedicated routes or equivalent deep-linkable screens.
- [ ] Course/chapter loading.
- [ ] Chapter create/update/delete with order and active support.
- [ ] Question list filters: course, chapter, type, difficulty, Bloom, status, search, has attachments, group.
- [ ] Filtered stats.
- [ ] Question create.
- [ ] Question edit with dirty payload.
- [ ] Question detail.
- [ ] MCQ editor.
- [ ] True/false editor.
- [ ] Fill-blanks editor.
- [ ] Written/essay expected-answer validation.
- [ ] Question image upload.
- [ ] Question image caption and alt text.
- [ ] Additional attachments.
- [ ] Attachment update/reorder/remove.
- [ ] Pending upload cleanup.
- [ ] Bulk create editable rows.
- [ ] Bulk create detailed partial failure handling.
- [ ] Status actions.
- [ ] Batch status actions.
- [ ] All-matching-filter batch actions.
- [ ] Group list/create/edit/detail/delete.
- [ ] Group image upload.
- [ ] Group shared prompt/caption/alt text.
- [ ] Add grouped questions.
- [ ] Link/unlink group questions.
- [ ] Reorder group questions.

### Exam Generator

- [ ] Draft/saved list filters: course, status, date range, list kind.
- [ ] Exam stats.
- [ ] Generation readiness.
- [ ] Generation form flat mode.
- [ ] Generation form sectioned mode.
- [ ] Rule scopes: course, chapter, chapters, group.
- [ ] Availability check.
- [ ] Shortage panel.
- [ ] Seed randomize/clear.
- [ ] Total marks.
- [ ] Mark distribution mode.
- [ ] Rounding policy.
- [ ] Group selection mode.
- [ ] Duration.
- [ ] Instructions/header/footer.
- [ ] Draft detail/editor.
- [ ] Draft validation.
- [ ] Section create/update/delete/reorder.
- [ ] Item add/update/delete/reorder.
- [ ] Candidate question picker filters.
- [ ] Replacement check.
- [ ] Override reason.
- [ ] Move items to section.
- [ ] Regenerate draft.
- [ ] Duplicate draft.
- [ ] Reshuffle section.
- [ ] Normalize section marks.
- [ ] Save draft to exam.
- [ ] Saved exam detail.
- [ ] Publish/archive lifecycle with reason.
- [ ] Paper templates.
- [ ] Export options and variants.

## 13. Most Important Concrete Fixes

These are the contract-level fixes that should be handled before UI polish:

1. `QuestionBankService.createBatch` must post `{ courseId, defaultChapterId?, questions }`.
2. `QuestionBankService.batchUpdateStatus` must post `{ questionIds, action, comment?, ...filters }`, not `{ ids, status }`.
3. `QuestionBankService.rejectQuestion` should send `{ comment }`, not `{ reason }`.
4. Attachment create/update/reorder must use `fileId`, `attachmentType`, `displayOrder`, `isPrimary`, and `{ items }`.
5. `QuestionGroupService.create/update` must use `courseId`, `sharedPrompt`, `sharedFileId`, `sharedFileCaption`, `sharedFileAltText`, and `groupType`.
6. `QuestionGroupService.addQuestions` must post `{ questions }`.
7. `QuestionGroupService.reorderQuestions` must post `{ items }`.
8. `ExamGenerationService.generatePreview` must support sections, total marks, mark distribution, rounding, group selection, seed, duration, instructions, header, and footer.
9. Add `POST /exams/generation-availability`.
10. Draft section answer policy must use `answer_all`/`answer_any`, not `ANSWER_ALL`.
11. Draft item add/update must support `draftSectionId`, `weightUnits`, `marks`, `itemOrder`, and `overrideReason`.
12. Replacement check must send `replacementQuestionId`.
13. Section/item reorder must consistently post `{ items }`.
14. Regenerate/duplicate/reshuffle/normalize must support the same payloads as Flutter.
15. Export must send Flutter's export options and support paper templates.

## 14. Definition Of Done For Website Parity

The website can be considered updated to Flutter parity when:

1. The website services can express every method in `QuestionBankService` and `ExamGeneratorService` from Flutter.
2. Every Flutter enum and payload model has a TypeScript equivalent.
3. Every Flutter route-level flow has a website route or an equally complete modal/page flow.
4. Question creation/editing supports all question types, media, attachments, validation, and status actions.
5. Bulk create handles partial success and failed-row correction.
6. Groups support shared prompts/files and full question membership management.
7. Exam generation supports flat and sectioned modes with availability checks.
8. Draft editing supports sections, item operations, replacement checks, reorder, regenerate, duplicate, reshuffle, normalize, and save.
9. Saved exams support lifecycle, full detail, paper templates, and export variants.
10. Website tests cover service payloads and major UI/state flows.

import type { ClientExamPaperModel, ExamPaperPdfBlock } from './types';

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
};

const toStr = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : undefined;

const toNum = (v: unknown): number | undefined => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim()) {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
};

const normalizeItem = (item: unknown, index: number): ExamPaperPdfBlock | null => {
  const i = toRecord(item);
  if (!i) return null;
  const snap = toRecord(i.snapshot) ?? {};
  const q = toRecord(i.question) ?? {};
  const rawOptions = snap.options ?? i.options ?? q.options;
  const options = Array.isArray(rawOptions)
    ? (rawOptions as unknown[]).map((o) => {
        const opt = toRecord(o) ?? {};
        return {
          optionText: toStr(opt.optionText ?? opt.text),
          isCorrect: opt.isCorrect === true || opt.isCorrect === 1 || opt.correct === true,
        };
      })
    : [];

  const questionText =
    toStr(snap.questionText) ??
    toStr(q.questionText) ??
    toStr(i.questionText) ??
    `Question #${index}`;

  const marks = toNum(i.marks ?? i.weight ?? snap.marks) ?? 0;
  const imageUrl =
    toStr(snap.questionImagePreviewUrl) ??
    toStr(snap.sourceGroupImagePreviewUrl) ??
    undefined;

  return {
    kind: 'question',
    index,
    questionText,
    marks,
    options,
    imageUrl: imageUrl ?? null,
    expectedAnswerText: toStr(snap.expectedAnswerText ?? q.expectedAnswerText),
    hints: toStr(snap.hints ?? q.hints),
  };
};

const flattenFromItems = (items: unknown[]): ExamPaperPdfBlock[] => {
  const blocks: ExamPaperPdfBlock[] = [];
  let idx = 0;
  for (const item of items) {
    idx += 1;
    const q = normalizeItem(item, idx);
    if (q) blocks.push(q);
  }
  return blocks;
};

/** Ordered `items` with section headers when `sectionId` changes (matches full-exam list + sections metadata). */
const buildBlocksFromExam = (exam: Record<string, unknown>): ExamPaperPdfBlock[] => {
  const rawItems = Array.isArray(exam.items) ? exam.items : [];
  const rawSections = Array.isArray(exam.sections) ? exam.sections : [];
  if (rawItems.length === 0) return [];
  if (rawSections.length === 0) return flattenFromItems(rawItems);

  const sectionById = new Map<
    number,
    { title: string; instructions?: string; totalMarks?: number }
  >();
  for (const s of rawSections) {
    const rec = toRecord(s);
    const id = toNum(rec?.id);
    if (id == null) continue;
    sectionById.set(id, {
      title: toStr(rec.title) ?? `Section ${id}`,
      instructions: toStr(rec.instructions),
      totalMarks: toNum(rec.totalMarks),
    });
  }

  const sorted = [...rawItems].sort(
    (a, b) => (toNum(toRecord(a)?.itemOrder) ?? 0) - (toNum(toRecord(b)?.itemOrder) ?? 0),
  );

  const blocks: ExamPaperPdfBlock[] = [];
  let lastSid: number | undefined;
  let qIndex = 0;

  for (const item of sorted) {
    const rec = toRecord(item);
    const sid = rec?.sectionId != null && rec.sectionId !== '' ? toNum(rec.sectionId) : undefined;
    if (sid != null && sectionById.has(sid) && sid !== lastSid) {
      const sec = sectionById.get(sid)!;
      blocks.push({
        kind: 'section',
        title: sec.title,
        instructions: sec.instructions,
        totalMarks: sec.totalMarks,
      });
      lastSid = sid;
    }
    qIndex += 1;
    const q = normalizeItem(item, qIndex);
    if (q) blocks.push(q);
  }
  return blocks;
};

/**
 * Normalizes `/exams/:id/full` (or nested `.data`) into a model for client PDF rendering.
 */
export function normalizeExamFullForPdf(
  raw: unknown,
  options?: { includeAnswerKey?: boolean },
): ClientExamPaperModel {
  const root = toRecord(raw);
  const payload = toRecord(root?.data) ?? root ?? {};
  const exam = toRecord(payload.exam) ?? payload;

  const title = toStr(exam.title) ?? toStr(payload.title) ?? 'Exam';
  const instructions = toStr(exam.instructions);
  const course = toRecord(exam.course) ?? toRecord(payload.course);
  const courseCode = toStr(exam.courseCode) ?? toStr(course?.code);
  const courseName = toStr(exam.courseName) ?? toStr(course?.name);
  const durationMinutes = toNum(exam.durationMinutes ?? payload.durationMinutes);
  const totalMarks = toNum(exam.totalMarks ?? exam.totalWeight ?? payload.totalMarks ?? payload.totalWeight);

  const studentNameLine = Boolean(Number(exam.studentNameLine ?? 1));
  const showCourseCode = Boolean(Number(exam.showCourseCode ?? 1));
  const showTotalMarks = true;
  const showQuestionMarks = true;

  const paperTemplateSnapshot =
    (toRecord(exam.paperTemplateSnapshot) as Record<string, unknown> | null) ??
    (toRecord(exam.paperTemplateSnapshotJson) as Record<string, unknown> | null);

  const blocks = buildBlocksFromExam(exam);

  return {
    title,
    instructions,
    courseCode,
    courseName,
    durationMinutes: durationMinutes ?? null,
    totalMarks: totalMarks ?? null,
    studentNameLine,
    showCourseCode,
    showTotalMarks,
    showQuestionMarks,
    includeAnswerKey: options?.includeAnswerKey === true,
    paperTemplateSnapshot,
    blocks,
  };
}

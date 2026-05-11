import React, { useMemo } from 'react';
import { MathText } from './MathText';
import type { ClientExamPaperModel, ExamPaperPdfBlock } from '../../lib/exam-paper/types';

export const EXAM_PAPER_PDF_ROOT_ID = 'exam-paper-pdf-root';

const toRecord = (v: unknown): Record<string, unknown> | null =>
  v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null;

const toStr = (v: unknown): string | undefined =>
  typeof v === 'string' && v.trim() ? v.trim() : undefined;

type HeaderLine = { text: string; bold?: boolean };

function defaultHeaderJson(): Record<string, unknown> {
  return {
    left: [
      { value: 'Alexandria University', bold: true },
      { value: 'Faculty of Engineering', bold: true },
      { value: 'Department' },
    ],
    center: [{ value: 'Alexandria University' }, { value: '[Logo]' }],
    right: [
      { value: 'جامعة الإسكندرية', bold: true },
      { value: 'كلية الهندسة', bold: true },
      { value: 'القسم' },
    ],
    metadataLeft: [
      { value: 'Date: {date}' },
      { value: '{courseName}' },
      { value: 'Time allowed: {duration}' },
    ],
    metadataRight: [
      { value: 'العام الجامعي: {academicYear}' },
      { value: 'المادة: {courseCode}' },
      { value: 'الزمن: {duration}' },
    ],
  };
}

function parseZone(raw: unknown): HeaderLine[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const o = toRecord(item);
    const text = toStr(o?.value) ?? toStr(o?.text) ?? '';
    const bold = o?.bold === true;
    return { text, bold };
  });
}

function resolvePlaceholders(
  template: string,
  ctx: {
    date: string;
    academicYear: string;
    courseCode: string;
    courseName: string;
    duration: string;
    examTitle: string;
    totalMarks: string;
  },
): string {
  const map: Record<string, string> = {
    date: ctx.date,
    academicYear: ctx.academicYear,
    courseCode: ctx.courseCode,
    courseName: ctx.courseName,
    duration: ctx.duration,
    examTitle: ctx.examTitle,
    totalMarks: ctx.totalMarks,
    universityEnglish: 'Alexandria University',
    facultyEnglish: 'Faculty of Engineering',
    departmentEnglish: '',
    universityArabic: 'جامعة الإسكندرية',
    facultyArabic: 'كلية الهندسة',
    departmentArabic: 'القسم',
  };
  return template.replace(/\{([A-Za-z0-9_]+)\}/g, (_, key: string) => map[key] ?? `{${key}}`);
}

function HeaderColumn({ lines, align, rtl }: { lines: HeaderLine[]; align: 'left' | 'center' | 'right'; rtl?: boolean }) {
  return (
    <div
      style={{
        flex: 1,
        textAlign: align,
        direction: rtl ? 'rtl' : 'ltr',
        verticalAlign: 'top',
        fontSize: '10.5pt',
        lineHeight: 1.25,
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            fontWeight: line.bold ? 700 : 400,
            marginBottom: i === lines.length - 1 ? 0 : 2,
          }}
        >
          {line.text}
        </div>
      ))}
    </div>
  );
}

export interface ExamPaperPdfRootProps {
  model: ClientExamPaperModel;
  rootId?: string;
}

export const ExamPaperPdfRoot: React.FC<ExamPaperPdfRootProps> = ({ model, rootId = EXAM_PAPER_PDF_ROOT_ID }) => {
  const ctx = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const duration =
      model.durationMinutes != null && model.durationMinutes > 0
        ? `${model.durationMinutes} minutes`
        : '';
    return {
      date: now.toISOString().slice(0, 10),
      academicYear: `${y}/${y + 1}`,
      courseCode: model.courseCode ?? '',
      courseName: model.courseName || model.title,
      duration,
      examTitle: model.title,
      totalMarks: model.totalMarks != null ? String(model.totalMarks) : '',
    };
  }, [model]);

  const headerJson = useMemo(() => {
    const tpl = model.paperTemplateSnapshot ?? {};
    const h = toRecord(tpl.headerJson) ?? defaultHeaderJson();
    return {
      left: parseZone(h.left),
      center: parseZone(h.center),
      right: parseZone(h.right),
      metadataLeft: parseZone(h.metadataLeft).map((line) => ({
        ...line,
        text: resolvePlaceholders(line.text, ctx),
      })),
      metadataRight: parseZone(h.metadataRight).map((line) => ({
        ...line,
        text: resolvePlaceholders(line.text, ctx),
      })),
    };
  }, [model.paperTemplateSnapshot, ctx]);

  const courseLine =
    model.showCourseCode && (model.courseCode || model.courseName)
      ? [model.courseCode, model.courseName].filter(Boolean).join(' — ')
      : '';

  return (
    <div
      id={rootId}
      style={{
        width: '794px',
        minHeight: '200px',
        backgroundColor: '#ffffff',
        color: '#111827',
        fontFamily: '"Times New Roman", "DejaVu Serif", Times, serif',
        fontSize: '11pt',
        lineHeight: 1.35,
        padding: '28px 36px 36px',
        boxSizing: 'border-box',
      }}
    >
      <header style={{ borderBottom: '1px solid #111', paddingBottom: 10, marginBottom: 12 }}>
        <div style={{ display: 'flex', width: '100%', gap: 8 }}>
          <HeaderColumn lines={headerJson.left} align="left" />
          <HeaderColumn lines={headerJson.center} align="center" />
          <HeaderColumn lines={headerJson.right} align="right" rtl />
        </div>
        <div
          style={{
            borderTop: '1px solid #111',
            marginTop: 10,
            paddingTop: 8,
            display: 'flex',
            width: '100%',
            gap: 8,
            alignItems: 'flex-start',
          }}
        >
          <HeaderColumn lines={headerJson.metadataLeft} align="left" />
          <div style={{ flex: 1, textAlign: 'center', fontWeight: 700, fontSize: '13pt', paddingTop: 2 }}>
            {model.title}
          </div>
          <HeaderColumn lines={headerJson.metadataRight} align="right" rtl />
        </div>
      </header>

      {model.instructions ? (
        <p style={{ margin: '8px 0', fontSize: '10.5pt' }}>{model.instructions}</p>
      ) : null}

      {model.showTotalMarks && model.totalMarks != null ? (
        <p style={{ margin: '4px 0', fontSize: '10.5pt' }}>Total marks: {model.totalMarks}</p>
      ) : null}

      {model.studentNameLine ? (
        <p style={{ margin: '6px 0', fontSize: '10.5pt' }}>Student name: ________________________________</p>
      ) : null}

      {courseLine ? <p style={{ margin: '6px 0', fontSize: '10.5pt' }}>Course: {courseLine}</p> : null}

      <div style={{ borderBottom: '1px solid #111', marginTop: 10, marginBottom: 14 }} />

      <section>
        {model.blocks.map((block, idx) => (
          <PdfBlock key={idx} block={block} model={model} />
        ))}
      </section>

    </div>
  );
};

const PdfBlock: React.FC<{ block: ExamPaperPdfBlock; model: ClientExamPaperModel }> = ({ block, model }) => {
  if (block.kind === 'section') {
    return (
      <div style={{ marginTop: 20, marginBottom: 8 }}>
        <div style={{ fontSize: '13pt', fontWeight: 700, borderBottom: '1px solid #ccc', paddingBottom: 4 }}>
          {block.title}
        </div>
        {block.instructions ? (
          <p style={{ margin: '8px 0 0', fontSize: '10.5pt', color: '#374151' }}>{block.instructions}</p>
        ) : null}
        {block.totalMarks != null ? (
          <p style={{ margin: '6px 0 0', fontSize: '10pt', color: '#4b5563' }}>Section marks: {block.totalMarks}</p>
        ) : null}
      </div>
    );
  }

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  return (
    <div data-pdf-block="question" style={{ marginTop: 14, breakInside: 'avoid' as const }}>
      <div style={{ margin: '0 0 6px', lineHeight: 1.45 }}>
        <strong>{block.index}.</strong>{' '}
        <span style={{ display: 'inline' }}>
          <MathText text={block.questionText} />
        </span>
      </div>
      {block.imageUrl ? (
        <div style={{ margin: '8px 0', textAlign: 'center' }}>
          <img
            src={block.imageUrl}
            alt=""
            crossOrigin="anonymous"
            style={{ maxWidth: '100%', maxHeight: 240, objectFit: 'contain' }}
          />
        </div>
      ) : null}
      {model.showQuestionMarks ? (
        <p style={{ margin: '4px 0 8px', fontSize: '9.5pt', color: '#4b5563' }}>Marks: {block.marks}</p>
      ) : null}
      {block.options.length > 0 ? (
        <ol
          type="A"
          style={{
            margin: '6px 0 0 18px',
            padding: 0,
            listStyleType: 'upper-alpha',
            fontSize: '10.5pt',
          }}
        >
          {block.options.map((opt, i) => (
            <li key={i} style={{ marginBottom: 4 }}>
              <MathText text={opt.optionText} />
              {model.includeAnswerKey && opt.isCorrect ? (
                <span style={{ fontWeight: 600, marginLeft: 6 }}>(correct)</span>
              ) : null}
            </li>
          ))}
        </ol>
      ) : null}
      {model.includeAnswerKey && block.expectedAnswerText ? (
        <p style={{ margin: '8px 0 0', fontSize: '10pt' }}>
          <strong>Expected answer:</strong> <MathText text={block.expectedAnswerText} />
        </p>
      ) : null}
      {model.includeAnswerKey && block.hints ? (
        <p style={{ margin: '4px 0 0', fontSize: '9.5pt', color: '#4b5563' }}>
          <strong>Hints:</strong> <MathText text={block.hints} />
        </p>
      ) : null}
    </div>
  );
};

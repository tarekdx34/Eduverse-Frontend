import { createRoot } from 'react-dom/client';
import { ExamPaperPdfRoot, EXAM_PAPER_PDF_ROOT_ID } from '../../components/exam-paper/ExamPaperPdfRoot';
import ExamGenerationService from '../../services/api/examGenerationService';
import { normalizeExamFullForPdf } from './normalizeExamFullForPdf';
import { renderExamPdfElement } from './renderExamPdf';

function unwrapPayload(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;
  const r = raw as Record<string, unknown>;
  if (r.data !== undefined && typeof r.data === 'object') return r.data;
  return raw;
}

/**
 * Fetches `/exams/:id/full`, renders KaTeX paper off-screen, and downloads a client-built PDF.
 */
export async function downloadClientExamPdf(
  examId: number,
  options?: { includeAnswerKey?: boolean },
): Promise<void> {
  const raw = await ExamGenerationService.getExamFull(examId);
  const payload = unwrapPayload(raw);
  const model = normalizeExamFullForPdf(payload, { includeAnswerKey: options?.includeAnswerKey });

  const host = document.createElement('div');
  host.setAttribute('data-exam-pdf-host', 'true');
  host.style.position = 'fixed';
  host.style.left = '-14000px';
  host.style.top = '0';
  host.style.zIndex = '-5';
  document.body.appendChild(host);

  const root = createRoot(host);
  root.render(<ExamPaperPdfRoot model={model} />);

  await new Promise<void>((resolve) => setTimeout(resolve, 120));

  const el = document.getElementById(EXAM_PAPER_PDF_ROOT_ID);
  if (!el) {
    root.unmount();
    document.body.removeChild(host);
    throw new Error('Exam paper mount failed');
  }

  try {
    await renderExamPdfElement(el, `exam-${examId}.pdf`, {
      footer: { line1: 'End of paper', line2: 'Good luck' },
    });
  } finally {
    root.unmount();
    document.body.removeChild(host);
  }
}

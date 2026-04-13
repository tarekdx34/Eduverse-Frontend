/**
 * Calls the local AI quiz service and maps results to QuestionFormData for the quiz builder.
 */
import { AI_QUIZ_BASE_URL } from '../../../../services/api/config';
import {
  QuestionFormData,
  DEFAULT_QUESTION_FORM,
} from './types';

type AiUploadResponse = { uploadId: string };
type AiGenerateResponse = { quizId: string; status: string; numQuestions: number };

export type AiQuizPayload = {
  quizId: string;
  questions?: Array<{
    type?: 'MCQ' | 'FillBlank' | 'Explain';
    question?: string;
    options?: string[];
  }>;
  answerKey?: Array<{
    questionId?: string;
    correctAnswer?: string;
    answer?: string;
    reference?: string;
  }>;
};

type AiQType = 'MCQ' | 'FillBlank' | 'Explain';

/** Avoids "Unexpected end of JSON input" when the proxy returns an empty body (service down, 502, etc.). */
async function parseJsonResponse<T>(res: Response, step: string): Promise<T> {
  const text = await res.text();
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error(
      `${step}: empty response (HTTP ${res.status}). ` +
        'Start the quiz AI service (FastAPI on port 8001) or check the /ai-quiz Vite proxy.',
    );
  }
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    throw new Error(
      `${step}: not JSON (HTTP ${res.status}). ${trimmed.slice(0, 240)}${trimmed.length > 240 ? '…' : ''}`,
    );
  }
}

type NormalizedAiRow = {
  type: AiQType;
  question: string;
  options: string[];
  answer: string;
  reference: string;
};

function guessMcqAnswerIndex(answer: string, options: string[]): string {
  const cleaned = answer.trim().toUpperCase();
  const letterMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
  if (cleaned in letterMap && letterMap[cleaned] < options.length) return String(letterMap[cleaned]);
  const byPrefix = options.findIndex((o) => o.trim().toUpperCase().startsWith(`${cleaned})`));
  if (byPrefix >= 0) return String(byPrefix);
  return '0';
}

function normalizeAiRows(payload: AiQuizPayload): NormalizedAiRow[] {
  const answersByQ = new Map<string, { correctAnswer?: string; answer?: string; reference?: string }>();
  for (const a of payload.answerKey ?? []) {
    if (a.questionId) answersByQ.set(a.questionId, a);
  }

  return (payload.questions ?? []).map((q, idx) => {
    const qId = `Question ${idx + 1}`;
    const ans = answersByQ.get(qId);
    return {
      type: (q.type ?? 'MCQ') as AiQType,
      question: q.question ?? '',
      options: Array.isArray(q.options) ? q.options : [],
      answer: ans?.correctAnswer ?? ans?.answer ?? '',
      reference: ans?.reference ?? '',
    };
  });
}

function padMcqOptions(opts: string[]): string[] {
  const o = opts.filter((x) => x.trim());
  while (o.length < 4) o.push(`Option ${String.fromCharCode(65 + o.length)}`);
  return o.slice(0, 8);
}

/** Maps one AI row to QuestionFormData with provenance `ai`. */
export function mapAiRowsToQuestionForms(rows: NormalizedAiRow[], startOrderIndex: number): QuestionFormData[] {
  return rows.map((row, idx) => {
    const tempId = Date.now() + idx;
    const base: QuestionFormData = {
      ...DEFAULT_QUESTION_FORM,
      tempId,
      orderIndex: startOrderIndex + idx,
      questionProvenance: 'ai',
    };

    if (row.type === 'MCQ') {
      const options = padMcqOptions(row.options);
      return {
        ...base,
        questionType: 'mcq',
        questionText: row.question,
        options,
        correctAnswer: guessMcqAnswerIndex(row.answer, options),
        explanation: row.reference || '',
        points: base.points,
      };
    }

    if (row.type === 'FillBlank') {
      return {
        ...base,
        questionType: 'short_answer',
        questionText: row.question,
        options: [],
        correctAnswer: row.answer,
        explanation: row.reference || '',
        points: base.points,
      };
    }

    return {
      ...base,
      questionType: 'essay',
      questionText: row.question,
      options: [],
      correctAnswer: '',
      explanation: row.reference || row.answer || '',
      points: base.points,
    };
  });
}

export type GenerateAiQuestionsParams = {
  file: File;
  numQuestions: number;
  questionType: AiQType;
  difficulty: 'easy' | 'medium' | 'hard';
};

export async function generateQuestionsFromAiService(
  params: GenerateAiQuestionsParams,
): Promise<QuestionFormData[]> {
  const { file, numQuestions, questionType, difficulty } = params;

  const uploadFd = new FormData();
  uploadFd.append('file', file);
  const uploadRes = await fetch(`${AI_QUIZ_BASE_URL}/api/v1/upload`, { method: 'POST', body: uploadFd });
  const uploadJson = await parseJsonResponse<AiUploadResponse | { detail?: string }>(uploadRes, 'Upload');
  if (!uploadRes.ok || !('uploadId' in uploadJson)) {
    throw new Error(('detail' in uploadJson && String(uploadJson.detail)) || 'Upload failed.');
  }

  const generateFd = new FormData();
  generateFd.append('uploadId', uploadJson.uploadId);
  generateFd.append('numQuestions', String(numQuestions));
  generateFd.append('questionType', questionType);
  generateFd.append('difficulty', difficulty);
  generateFd.append('saveAsFiles', 'false');
  const genRes = await fetch(`${AI_QUIZ_BASE_URL}/api/v1/generate`, { method: 'POST', body: generateFd });
  const genJson = await parseJsonResponse<AiGenerateResponse | { detail?: string }>(genRes, 'Generate');
  if (!genRes.ok || !('quizId' in genJson)) {
    throw new Error(('detail' in genJson && String(genJson.detail)) || 'Generation failed.');
  }

  const quizRes = await fetch(`${AI_QUIZ_BASE_URL}/api/v1/quiz/${genJson.quizId}`);
  const quizJson = await parseJsonResponse<AiQuizPayload | { detail?: string }>(quizRes, 'Fetch quiz');
  if (!quizRes.ok || !('quizId' in quizJson)) {
    throw new Error(('detail' in quizJson && String(quizJson.detail)) || 'Failed to fetch generated quiz.');
  }

  const rows = normalizeAiRows(quizJson);
  return mapAiRowsToQuestionForms(rows, 0);
}

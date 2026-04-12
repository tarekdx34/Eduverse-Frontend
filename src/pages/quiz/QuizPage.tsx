import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bot, FileQuestion, Plus, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../services/api/client';
import QuizService from '../../services/api/quizService';
import { AI_QUIZ_BASE_URL } from '../../services/api/config';

type TeachingRow = {
  sectionId?: number;
  section?: { id?: number; sectionNumber?: string };
  course?: { id?: number; code?: string; name?: string };
  semester?: { name?: string };
};

type QuizQuestionRow = {
  id: string;
  type: 'MCQ' | 'FillBlank' | 'Explain';
  question: string;
  options: string[];
  answer: string;
  reference?: string;
};

type AiUploadResponse = {
  uploadId: string;
};

type AiGenerateResponse = {
  quizId: string;
  status: string;
  numQuestions: number;
};

type AiQuizPayload = {
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

type Difficulty = 'easy' | 'medium' | 'hard';
type QType = 'MCQ' | 'FillBlank' | 'Explain';

function errMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}

function normalizeAiQuiz(payload: AiQuizPayload): QuizQuestionRow[] {
  const answersByQ = new Map<string, { correctAnswer?: string; answer?: string; reference?: string }>();
  for (const a of payload.answerKey ?? []) {
    if (a.questionId) answersByQ.set(a.questionId, a);
  }

  return (payload.questions ?? []).map((q, idx) => {
    const qId = `Question ${idx + 1}`;
    const ans = answersByQ.get(qId);
    return {
      id: crypto.randomUUID(),
      type: (q.type ?? 'MCQ') as QType,
      question: q.question ?? '',
      options: Array.isArray(q.options) ? q.options : [],
      answer: ans?.correctAnswer ?? ans?.answer ?? '',
      reference: ans?.reference ?? '',
    };
  });
}

function guessMcqAnswerIndex(answer: string, options: string[]): string {
  const cleaned = answer.trim().toUpperCase();
  const letterMap: Record<string, number> = { A: 0, B: 1, C: 2, D: 3 };
  if (cleaned in letterMap && letterMap[cleaned] < options.length) return String(letterMap[cleaned]);
  const byPrefix = options.findIndex((o) => o.trim().toUpperCase().startsWith(`${cleaned})`));
  if (byPrefix >= 0) return String(byPrefix);
  return '0';
}

export default function QuizPage() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const [teaching, setTeaching] = useState<TeachingRow[]>([]);
  const [loadingTeaching, setLoadingTeaching] = useState(false);
  const [selectedClass, setSelectedClass] = useState<{ row: TeachingRow; sectionId: number } | null>(null);
  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>('ai');

  const [aiFile, setAiFile] = useState<File | null>(null);
  const [aiNumQuestions, setAiNumQuestions] = useState(8);
  const [aiQuestionType, setAiQuestionType] = useState<QType>('MCQ');
  const [aiDifficulty, setAiDifficulty] = useState<Difficulty>('medium');
  const [aiLoading, setAiLoading] = useState(false);

  const [questions, setQuestions] = useState<QuizQuestionRow[]>([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [quizDescription, setQuizDescription] = useState('');
  const [publishing, setPublishing] = useState(false);
  /** Avoid re-fetching forever when the API returns an empty list or errors (teaching stays []). */
  const teachingFetchOnceRef = useRef(false);

  const loadTeaching = useCallback(async () => {
    setLoadingTeaching(true);
    try {
      const data = await ApiClient.get<TeachingRow[]>('/enrollments/teaching');
      setTeaching(Array.isArray(data) ? data : []);
    } catch (e) {
      toast.error(errMessage(e));
      setTeaching([]);
    } finally {
      setLoadingTeaching(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      teachingFetchOnceRef.current = false;
      setTeaching([]);
      return;
    }
    if (teachingFetchOnceRef.current) return;
    teachingFetchOnceRef.current = true;
    void loadTeaching();
  }, [isAuthenticated, loadTeaching]);

  const needsReview = useMemo(
    () =>
      questions.filter((q) => {
        if (!q.question.trim()) return true;
        if (q.type === 'MCQ') return q.options.length < 4 || !q.answer.trim();
        if (q.type === 'FillBlank') return !q.answer.trim();
        return !q.reference?.trim();
      }),
    [questions],
  );

  const addBlankQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: aiQuestionType,
        question: '',
        options: aiQuestionType === 'MCQ' ? ['Option A', 'Option B', 'Option C', 'Option D'] : [],
        answer: '',
        reference: '',
      },
    ]);
  };

  const updateQuestion = (id: string, patch: Partial<QuizQuestionRow>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q)));
  };

  const runAiGenerate = async () => {
    if (!aiFile) return toast.error('Upload a source document first.');
    if (!selectedClass?.row.course?.id) return toast.error('This section is missing course ID.');
    setAiLoading(true);
    try {
      const uploadFd = new FormData();
      uploadFd.append('file', aiFile);
      const uploadRes = await fetch(`${AI_QUIZ_BASE_URL}/api/v1/upload`, { method: 'POST', body: uploadFd });
      const uploadJson = (await uploadRes.json()) as AiUploadResponse | { detail?: string };
      if (!uploadRes.ok || !('uploadId' in uploadJson)) {
        throw new Error(('detail' in uploadJson && uploadJson.detail) || 'Upload failed.');
      }

      const generateFd = new FormData();
      generateFd.append('uploadId', uploadJson.uploadId);
      generateFd.append('numQuestions', String(aiNumQuestions));
      generateFd.append('questionType', aiQuestionType);
      generateFd.append('difficulty', aiDifficulty);
      generateFd.append('saveAsFiles', 'false');
      const genRes = await fetch(`${AI_QUIZ_BASE_URL}/api/v1/generate`, { method: 'POST', body: generateFd });
      const genJson = (await genRes.json()) as AiGenerateResponse | { detail?: string };
      if (!genRes.ok || !('quizId' in genJson)) {
        throw new Error(('detail' in genJson && genJson.detail) || 'Generation failed.');
      }

      const quizRes = await fetch(`${AI_QUIZ_BASE_URL}/api/v1/quiz/${genJson.quizId}`);
      const quizJson = (await quizRes.json()) as AiQuizPayload | { detail?: string };
      if (!quizRes.ok || !('quizId' in quizJson)) {
        throw new Error(('detail' in quizJson && quizJson.detail) || 'Failed to fetch generated quiz.');
      }

      const normalized = normalizeAiQuiz(quizJson);
      setQuestions(normalized);
      setQuizTitle(`AI Quiz - ${selectedClass.row.course?.code ?? 'Course'}`);
      setQuizDescription(`Generated from ${aiFile.name}`);
      setActiveTab('ai');
      toast.success(`Generated ${normalized.length} question(s).`);
    } catch (e) {
      toast.error(errMessage(e));
    } finally {
      setAiLoading(false);
    }
  };

  const publishQuiz = async () => {
    if (!selectedClass?.row.course?.id) return toast.error('Missing course ID.');
    if (!quizTitle.trim()) return toast.error('Enter a quiz title.');
    if (questions.length === 0) return toast.error('No questions to publish.');
    setPublishing(true);
    try {
      const created = await QuizService.create({
        courseId: Number(selectedClass.row.course.id),
        title: quizTitle.trim(),
        description: quizDescription.trim() || undefined,
        quizType: 'practice',
        maxAttempts: 2,
        showCorrectAnswers: true,
      });

      for (let i = 0; i < questions.length; i += 1) {
        const q = questions[i];
        const questionType = q.type === 'MCQ' ? 'mcq' : q.type === 'FillBlank' ? 'short_answer' : 'essay';
        await QuizService.addQuestion(String(created.id), {
          questionText: q.question,
          questionType,
          options: q.type === 'MCQ' ? q.options : undefined,
          correctAnswer: q.type === 'MCQ' ? guessMcqAnswerIndex(q.answer, q.options) : q.answer || q.reference,
          explanation: q.reference || undefined,
          points: 1,
          orderIndex: i,
        });
      }
      toast.success('Quiz created in EduVerse.');
    } catch (e) {
      toast.error(errMessage(e));
    } finally {
      setPublishing(false);
    }
  };

  if (isLoading) return <div className="flex min-h-[50vh] items-center justify-center bg-slate-950 text-slate-300">Loading...</div>;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
        <div className="mx-auto max-w-md">
          <h1 className="text-xl font-semibold tracking-tight">Quiz generation</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in as instructor or TA.</p>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setAuthSubmitting(true);
              try {
                await login(authEmail.trim(), authPassword, false);
                toast.success('Signed in.');
              } catch (err) {
                toast.error(errMessage(err));
              } finally {
                setAuthSubmitting(false);
              }
            }}
            className="mt-6 space-y-4 rounded-xl border border-slate-800 bg-slate-900/80 p-5"
          >
            <input type="email" value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" required />
            <input type="password" value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} placeholder="Password" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" required />
            <button type="submit" disabled={authSubmitting} className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50">{authSubmitting ? 'Signing in...' : 'Sign in'}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-5xl">
        {!selectedClass ? (
          <>
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold tracking-tight">Quiz generation</h1>
                <p className="text-sm text-slate-400">Choose your section (instructor/TA).</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={loadingTeaching}
                  onClick={() => void loadTeaching()}
                  className="rounded-lg border border-slate-600 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900 disabled:opacity-50"
                >
                  {loadingTeaching ? 'Loading…' : 'Refresh sections'}
                </button>
                <button type="button" onClick={() => void logout()} className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900">Sign out</button>
              </div>
            </div>
            {loadingTeaching ? (
              <p className="text-sm text-slate-500">Loading sections...</p>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {teaching.map((row) => {
                  const sid = row.sectionId ?? row.section?.id;
                  if (sid == null) return null;
                  return (
                    <button key={sid} type="button" onClick={() => setSelectedClass({ row, sectionId: sid })} className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 text-left hover:border-blue-600/60">
                      <div className="text-[0.7rem] font-semibold uppercase tracking-wider text-slate-500">{row.course?.code}</div>
                      <div className="mt-0.5 font-semibold text-slate-100">{row.course?.name ?? 'Course'}</div>
                      <div className="mt-1 text-xs text-slate-500">Section {row.section?.sectionNumber ?? sid}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">{selectedClass.row.course?.code} — {selectedClass.row.course?.name}</h2>
                <p className="text-sm text-slate-400">Section {selectedClass.row.section?.sectionNumber ?? selectedClass.sectionId}</p>
              </div>
              <button type="button" onClick={() => setSelectedClass(null)} className="rounded-lg border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-900">← Back</button>
            </div>

            <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/60 p-1.5">
              <button type="button" onClick={() => setActiveTab('ai')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${activeTab === 'ai' ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>AI Generate</button>
              <button type="button" onClick={() => setActiveTab('manual')} className={`rounded-lg px-4 py-2 text-sm font-semibold ${activeTab === 'manual' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>Manual</button>
            </div>

            {activeTab === 'ai' && (
              <div className="mb-4 rounded-xl border border-violet-700/50 bg-violet-950/20 p-5">
                <div className="flex items-center gap-2">
                  <Bot className="size-5 text-violet-300" />
                  <h3 className="text-lg font-semibold text-violet-100">AI Quiz Builder</h3>
                </div>
                <p className="mt-2 text-sm text-violet-100/80">Upload source material, generate quiz questions, review, then publish.</p>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <input type="file" accept=".pdf,.docx,.txt" onChange={(e) => setAiFile(e.target.files?.[0] ?? null)} className="md:col-span-2 text-sm text-slate-300 file:mr-2 file:rounded-lg file:border-0 file:bg-violet-700 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-violet-600" />
                  <input type="number" min={1} max={20} value={aiNumQuestions} onChange={(e) => setAiNumQuestions(Number(e.target.value || 1))} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
                  <select value={aiQuestionType} onChange={(e) => setAiQuestionType(e.target.value as QType)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
                    <option value="MCQ">MCQ</option>
                    <option value="FillBlank">FillBlank</option>
                    <option value="Explain">Explain</option>
                  </select>
                  <select value={aiDifficulty} onChange={(e) => setAiDifficulty(e.target.value as Difficulty)} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm">
                    <option value="easy">easy</option>
                    <option value="medium">medium</option>
                    <option value="hard">hard</option>
                  </select>
                  <button type="button" disabled={aiLoading || !aiFile} onClick={() => void runAiGenerate()} className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:opacity-40">
                    {aiLoading ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'manual' && (
              <div className="mb-4 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
                <p className="text-sm text-slate-300">Manual mode: add your own questions quickly.</p>
                <button type="button" onClick={addBlankQuestion} className="mt-3 inline-flex items-center gap-1 rounded-lg border border-slate-600 px-3 py-1.5 text-sm font-semibold text-slate-200 hover:bg-slate-800"><Plus className="size-4" /> Add question</button>
              </div>
            )}

            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-4"><div className="text-2xl font-bold text-violet-100">{questions.length}</div><div className="text-sm text-slate-400">Questions</div></div>
              <div className="rounded-lg border border-amber-700/50 bg-amber-950/25 p-4"><div className="text-2xl font-bold text-amber-200">{needsReview.length}</div><div className="text-sm text-amber-100/80">Needs review</div></div>
              <div className="rounded-lg border border-slate-700 bg-slate-950/60 p-4"><div className="text-2xl font-bold text-slate-100">{questions.filter((q) => q.type === 'MCQ').length}</div><div className="text-sm text-slate-400">MCQ</div></div>
            </div>

            <div className="mb-4 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
              <div className="grid gap-2 md:grid-cols-2">
                <input value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)} placeholder="Quiz title" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
                <input value={quizDescription} onChange={(e) => setQuizDescription(e.target.value)} placeholder="Quiz description" className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
              </div>
            </div>

            <div className="space-y-3">
              {questions.length === 0 ? (
                <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-sm text-slate-400">No questions yet. Generate via AI or add manually.</div>
              ) : (
                questions.map((q, idx) => (
                  <div key={q.id} className={`rounded-xl border p-4 ${needsReview.some((n) => n.id === q.id) ? 'border-amber-700/60 bg-amber-950/15' : 'border-slate-800 bg-slate-900/50'}`}>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-100">Q{idx + 1} · {q.type}</p>
                      <button type="button" onClick={() => setQuestions((prev) => prev.filter((x) => x.id !== q.id))} className="text-xs text-red-300 hover:text-red-200">Remove</button>
                    </div>
                    <textarea value={q.question} onChange={(e) => updateQuestion(q.id, { question: e.target.value })} rows={2} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
                    {q.type === 'MCQ' && (
                      <div className="mt-2 space-y-2">
                        {q.options.map((opt, oidx) => (
                          <input key={oidx} value={opt} onChange={(e) => {
                            const next = [...q.options];
                            next[oidx] = e.target.value;
                            updateQuestion(q.id, { options: next });
                          }} className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
                        ))}
                        <input value={q.answer} onChange={(e) => updateQuestion(q.id, { answer: e.target.value })} placeholder="Correct answer (A/B/C/D)" className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
                      </div>
                    )}
                    {q.type !== 'MCQ' && (
                      <input value={q.answer} onChange={(e) => updateQuestion(q.id, { answer: e.target.value })} placeholder={q.type === 'Explain' ? 'Reference answer' : 'Correct answer'} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm" />
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={addBlankQuestion} className="inline-flex items-center gap-1 rounded-lg border border-slate-600 px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"><FileQuestion className="size-4" /> Add question</button>
              <button type="button" disabled={publishing} onClick={() => void publishQuiz()} className="inline-flex items-center gap-1 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-40"><Sparkles className="size-4" /> {publishing ? 'Publishing...' : 'Create quiz in EduVerse'}</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


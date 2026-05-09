import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { LoadingSkeleton } from '../shared';
import { FileUploadDropzone } from '../shared/FileUploadDropzone';
import QuestionBankService, { CreateQuestionBankPayload, QuestionBankType, QuestionBankDifficulty, BloomLevel } from '../../services/api/questionBankService';
import { ChevronRight, Download, AlertCircle, CheckCircle2 } from 'lucide-react';

type Step = 'upload' | 'preview' | 'success';

interface ParsedRow {
  index: number;
  questionText: string;
  questionType: string;
  difficulty: string;
  bloomLevel: string;
  expectedAnswerText: string;
  hints: string;
  errors: string[];
}

export interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: number;
  chapterId?: number;
  onSuccess: (count: number) => void;
}

const VALID_TYPES: QuestionBankType[] = ['mcq', 'true_false', 'written', 'fill_blanks', 'essay'];
const VALID_DIFFICULTIES: QuestionBankDifficulty[] = ['easy', 'medium', 'hard'];
const VALID_BLOOMS: BloomLevel[] = ['remembering', 'understanding', 'applying', 'analyzing', 'evaluating', 'creating'];

export function BulkImportDialog({
  open,
  onOpenChange,
  courseId,
  chapterId,
  onSuccess,
}: BulkImportDialogProps) {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [importedCount, setImportedCount] = useState(0);

  const validRowCount = useMemo(() => parsedRows.filter(r => r.errors.length === 0).length, [parsedRows]);

  const handleDownloadTemplate = () => {
    const csv = 'questionText,questionType,difficulty,bloomLevel,expectedAnswerText,hints\n' +
      '"What is the capital of France?","mcq","easy","remembering","Paris","Think of the Eiffel Tower"';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'question-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFilesUploaded = async (files: File[]) => {
    if (files.length === 0) return;
    const uploaded = files[0];
    if (!uploaded.name.endsWith('.csv')) {
      setError('Only CSV files are supported. XLSX support coming soon.');
      return;
    }
    setFile(uploaded);
    setError(null);

    // Parse CSV
    const text = await uploaded.text();
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) {
      setError('CSV must have at least a header row and one data row.');
      return;
    }

    const header = lines[0];
    const expectedHeader = 'questionText,questionType,difficulty,bloomLevel,expectedAnswerText,hints';
    if (header.toLowerCase() !== expectedHeader.toLowerCase()) {
      setError(`CSV header mismatch. Expected: ${expectedHeader}`);
      return;
    }

    const rows: ParsedRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Simple CSV parser (handles quoted fields with commas)
      const regex = /("([^"]*)"|[^,]*)/g;
      const match = line.match(regex);
      const fields = match ? match.map(f => f.replace(/^"|"$/g, '').trim()) : [];

      if (fields.length < 6) {
        rows.push({
          index: i,
          questionText: fields[0] || '',
          questionType: fields[1] || '',
          difficulty: fields[2] || '',
          bloomLevel: fields[3] || '',
          expectedAnswerText: fields[4] || '',
          hints: fields[5] || '',
          errors: ['Missing columns'],
        });
        continue;
      }

      const [questionText, questionType, difficulty, bloomLevel, expectedAnswerText, hints] = fields;
      const errors: string[] = [];

      if (!questionText) errors.push('Question text required');
      if (!VALID_TYPES.includes(questionType as QuestionBankType)) errors.push(`Type must be one of: ${VALID_TYPES.join(', ')}`);
      if (!VALID_DIFFICULTIES.includes(difficulty as QuestionBankDifficulty)) errors.push(`Difficulty must be one of: ${VALID_DIFFICULTIES.join(', ')}`);
      if (!VALID_BLOOMS.includes(bloomLevel as BloomLevel)) errors.push(`Bloom level must be one of: ${VALID_BLOOMS.join(', ')}`);

      rows.push({
        index: i,
        questionText,
        questionType,
        difficulty,
        bloomLevel,
        expectedAnswerText,
        hints,
        errors,
      });
    }

    setParsedRows(rows);
    setStep('preview');
  };

  const handleImport = async () => {
    if (validRowCount === 0) return;

    setLoading(true);
    setProgress(0);
    setError(null);

    try {
      const payloads: CreateQuestionBankPayload[] = parsedRows
        .filter(r => r.errors.length === 0)
        .map(r => ({
          courseId,
          chapterId: chapterId || 0,
          questionType: r.questionType as QuestionBankType,
          difficulty: r.difficulty as QuestionBankDifficulty,
          bloomLevel: r.bloomLevel as BloomLevel,
          questionText: r.questionText,
          expectedAnswerText: r.expectedAnswerText || undefined,
          hints: r.hints || undefined,
        }));

      await QuestionBankService.createBatch(payloads);
      setProgress(100);
      setImportedCount(payloads.length);
      setStep('success');
      onSuccess(payloads.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Import failed');
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setFile(null);
    setParsedRows([]);
    setProgress(0);
    setError(null);
  };

  const handleClose = () => {
    if (step === 'success') {
      handleReset();
      onOpenChange(false);
    } else {
      onOpenChange(false);
    }
  };

  const isDark = document.documentElement.classList.contains('dark');
  const headingClass = isDark ? 'text-slate-100' : 'text-slate-900';
  const subTextClass = isDark ? 'text-slate-400' : 'text-slate-500';
  const borderColor = isDark ? 'border-white/10' : 'border-slate-200';
  const bgSoft = isDark ? 'bg-white/5' : 'bg-slate-50';

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={`max-w-2xl max-h-[90vh] flex flex-col rounded-3xl p-0 overflow-hidden ${isDark ? 'bg-slate-950 border-white/10 shadow-2xl shadow-indigo-500/10' : 'bg-white border-slate-200'}`}>
        <DialogHeader className="p-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-500/10 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
              <Download size={20} />
            </div>
            <DialogTitle className={`text-xl font-bold tracking-tight ${headingClass}`}>Bulk Import Questions</DialogTitle>
          </div>
          <DialogDescription className={`text-sm ${subTextClass}`}>
            Synchronize your local question bank with the cloud environment.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-8 pb-8">
          {step === 'upload' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className={`text-sm font-bold uppercase tracking-wider ${headingClass}`}>Step 1: Resource Setup</h4>
                  <p className={`text-xs ${subTextClass}`}>Upload your data source in CSV format.</p>
                </div>
                <button
                  onClick={handleDownloadTemplate}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                    isDark ? 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10' : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <Download size={14} />
                  Template
                </button>
              </div>

              <FileUploadDropzone
                onFilesUploaded={handleFilesUploaded}
                acceptedTypes={['.csv']}
                maxFiles={1}
                maxSizeInMB={5}
              />

              {error && (
                <div className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-500/30 dark:bg-red-500/10">
                  <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                </div>
              )}

              <div className={`rounded-2xl border p-4 ${borderColor} ${bgSoft}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>Required Structure:</p>
                <div className={`p-3 rounded-xl font-mono text-[10px] break-all ${isDark ? 'bg-black/20 text-slate-400' : 'bg-white text-slate-600 border border-slate-100'}`}>
                  questionText, questionType, difficulty, bloomLevel, expectedAnswerText, hints
                </div>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className={`text-sm font-bold uppercase tracking-wider ${headingClass}`}>Step 2: Integrity Check</h4>
                  <p className={`text-xs ${subTextClass}`}>
                    Reviewing <span className="font-bold text-indigo-500">{parsedRows.length}</span> entries. 
                    {parsedRows.length - validRowCount > 0 && <span className="ml-1 text-rose-500 font-bold underline decoration-2">{parsedRows.length - validRowCount} issues found.</span>}
                  </p>
                </div>
              </div>

              <div className={`overflow-hidden rounded-2xl border ${borderColor}`}>
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`${bgSoft} border-b ${borderColor}`}>
                      <th className={`px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest ${subTextClass}`}>Content Preview</th>
                      <th className={`px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest ${subTextClass}`}>Type</th>
                      <th className={`px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest ${subTextClass}`}>Diff</th>
                      <th className={`px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest ${subTextClass}`}>Bloom</th>
                      <th className={`px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-widest ${subTextClass}`}>Status</th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y ${borderColor}`}>
                    {parsedRows.slice(0, 20).map((row) => (
                      <tr
                        key={row.index}
                        className={`transition-colors ${row.errors.length > 0 ? (isDark ? 'bg-rose-500/5' : 'bg-rose-50') : (isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50')}`}
                      >
                        <td className={`px-3 py-2 text-[11px] truncate max-w-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                          {row.questionText}
                        </td>
                        <td className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${subTextClass}`}>{row.questionType}</td>
                        <td className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${subTextClass}`}>{row.difficulty}</td>
                        <td className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider ${subTextClass}`}>{row.bloomLevel}</td>
                        <td className="px-3 py-2 text-center">
                          {row.errors.length === 0 ? (
                            <CheckCircle2 size={14} className="text-emerald-500 mx-auto" />
                          ) : (
                            <AlertCircle size={14} className="text-rose-500 mx-auto" title={row.errors.join('; ')} />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {parsedRows.length > 20 && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Showing 20 of {parsedRows.length} rows
                </p>
              )}
            </div>
          )}

          {step === 'success' && (
            <div className="flex flex-col items-center justify-center space-y-4 p-8 text-center">
              <div className="rounded-full bg-green-100 p-4 dark:bg-green-500/20">
                <CheckCircle2 size={40} className="text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Import Successful
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                  {importedCount} question{importedCount !== 1 ? 's' : ''} imported successfully
                </p>
              </div>
            </div>
          )}
        </div>

        <div className={`flex items-center justify-between border-t px-8 py-6 ${borderColor} ${bgSoft}`}>
          {step === 'upload' && (
            <div className="ml-auto">
              <button 
                onClick={() => onOpenChange(false)}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Cancel
              </button>
            </div>
          )}
          {step === 'preview' && (
            <div className="flex gap-4 ml-auto">
              <button 
                onClick={() => setStep('upload')}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                  isDark ? 'text-slate-400 hover:bg-white/5' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                Previous
              </button>
              <button
                onClick={handleImport}
                disabled={validRowCount === 0 || loading}
                className={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 ${
                  isDark ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                }`}
              >
                {loading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    Sync {validRowCount} Question{validRowCount !== 1 ? 's' : ''}
                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          )}
          {step === 'success' && (
            <div className="ml-auto">
              <button 
                onClick={() => { handleReset(); onOpenChange(false); }}
                className={`px-10 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] ${
                  isDark ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                }`}
              >
                Finalize
              </button>
            </div>
          )}

          {loading && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-transparent overflow-hidden">
              <div 
                className="h-full bg-indigo-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

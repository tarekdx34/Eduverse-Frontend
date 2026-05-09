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

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bulk Import Questions</DialogTitle>
          <DialogDescription>
            Upload a CSV file to create multiple questions at once
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {step === 'upload' && (
            <div className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Step 1: Upload CSV File</p>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  <Download size={16} />
                  Download Template
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

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Expected CSV columns:</p>
                <p className="mt-1 font-mono text-xs text-gray-700 dark:text-gray-300">
                  questionText, questionType, difficulty, bloomLevel, expectedAnswerText, hints
                </p>
              </div>
            </div>
          )}

          {step === 'preview' && (
            <div className="space-y-4 p-4">
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium">Step 2: Preview & Validate</p>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                  {parsedRows.length}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({validRowCount} valid, {parsedRows.length - validRowCount} errors)
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-white/10">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-white/5">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Question</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Type</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Difficulty</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Bloom</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700 dark:text-gray-300">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                    {parsedRows.slice(0, 20).map((row) => (
                      <tr
                        key={row.index}
                        className={row.errors.length > 0 ? 'bg-red-50 dark:bg-red-500/10' : ''}
                      >
                        <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300 truncate max-w-xs">
                          {row.questionText}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">{row.questionType}</td>
                        <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">{row.difficulty}</td>
                        <td className="px-3 py-2 text-xs text-gray-600 dark:text-gray-400">{row.bloomLevel}</td>
                        <td className="px-3 py-2 text-xs">
                          {row.errors.length === 0 ? (
                            <span className="text-green-600 dark:text-green-400">✓</span>
                          ) : (
                            <span className="text-red-600 dark:text-red-400" title={row.errors.join('; ')}>
                              ✗
                            </span>
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

        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4 dark:border-white/10">
          {step === 'upload' && (
            <div className="ml-auto">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          )}
          {step === 'preview' && (
            <div className="flex gap-2 ml-auto">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Back
              </Button>
              <Button
                onClick={handleImport}
                disabled={validRowCount === 0 || loading}
              >
                {loading ? (
                  <>
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent mr-2" />
                    Importing...
                  </>
                ) : (
                  <>
                    Import {validRowCount} Question{validRowCount !== 1 ? 's' : ''}
                    <ChevronRight size={16} className="ml-1.5" />
                  </>
                )}
              </Button>
            </div>
          )}
          {step === 'success' && (
            <div className="ml-auto">
              <Button onClick={() => { handleReset(); onOpenChange(false); }}>
                Done
              </Button>
            </div>
          )}

          {loading && (
            <div className="absolute bottom-[60px] left-0 right-0 h-1 bg-gray-200 dark:bg-white/10">
              <Progress value={progress} className="h-full rounded-none" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

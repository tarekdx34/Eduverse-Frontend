import { useCallback, useState } from 'react';
import ExamGenerationService from '../services/api/examGenerationService';
import type {
  ExamExportOptions,
  ExamExportResponse,
  ExamPaperTemplate,
} from '../types/examGenerator';

const DEFAULT_OPTIONS: ExamExportOptions = {
  format: 'docx',
  variant: 'student',
  includeAnswerKey: false,
  studentNameLine: true,
  showCourseCode: true,
  pageBreakPerSection: false,
  showInstructorName: false,
  showTotalMarks: true,
  showQuestionMarks: true,
  answerKeyStyle: 'inline',
};

const getExportField = (
  response: ExamExportResponse,
  field: 'fileName' | 'mimeType' | 'content',
) => response[field] ?? response.data?.[field];

export function useExamExport(initialOptions: Partial<ExamExportOptions> = {}) {
  const [isExporting, setIsExporting] = useState(false);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [templates, setTemplates] = useState<ExamPaperTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ExamPaperTemplate | null>(null);
  const [options, setOptions] = useState<ExamExportOptions>({
    ...DEFAULT_OPTIONS,
    ...initialOptions,
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<ExamExportResponse | null>(null);

  const loadTemplates = useCallback(async (courseId?: number) => {
    setIsLoadingTemplates(true);
    setErrorMessage(null);
    try {
      const result = await ExamGenerationService.getPaperTemplates({ courseId });
      setTemplates(Array.isArray(result) ? result : []);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Failed to load paper templates');
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []);

  const createTemplate = useCallback(async (template: ExamPaperTemplate) => {
    const created = await ExamGenerationService.createPaperTemplate(template);
    setTemplates((current) => [...current, created]);
    return created;
  }, []);

  const updateTemplate = useCallback(async (template: ExamPaperTemplate) => {
    const updated = await ExamGenerationService.updatePaperTemplate(template);
    setTemplates((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    if (selectedTemplate?.id === updated.id) {
      setSelectedTemplate(updated);
    }
    return updated;
  }, [selectedTemplate?.id]);

  const applyTemplate = useCallback(async (examId: number, template: ExamPaperTemplate) => {
    await ExamGenerationService.applyPaperTemplate(examId, template);
    setSelectedTemplate(template);
    setOptions((current) => ({
      ...current,
      paperTemplateId: template.id,
      paperTemplateSnapshot: template.snapshot ?? template.template,
    }));
  }, []);

  const updateOptions = useCallback((patch: Partial<ExamExportOptions>) => {
    setOptions((current) => ({ ...current, ...patch }));
  }, []);

  const downloadExport = useCallback((response: ExamExportResponse, fallbackName = 'exam.docx') => {
    const fileName = getExportField(response, 'fileName') ?? fallbackName;
    const mimeType =
      getExportField(response, 'mimeType') ??
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    const base64 = getExportField(response, 'content');

    if (!base64) {
      throw new Error('Export finished but no file content was returned');
    }

    const byteChars = atob(base64);
    const bytes = new Uint8Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i += 1) {
      bytes[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  }, []);

  const exportExam = useCallback(async (examId: number) => {
    setIsExporting(true);
    setErrorMessage(null);
    try {
      const response = await ExamGenerationService.exportExam(examId, options);
      setLastExport(response);
      downloadExport(response, `exam-${examId}.${options.format}`);
      return response;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to export exam';
      setErrorMessage(message);
      throw error;
    } finally {
      setIsExporting(false);
    }
  }, [downloadExport, options]);

  return {
    isExporting,
    isLoadingTemplates,
    templates,
    selectedTemplate,
    options,
    errorMessage,
    lastExport,
    setSelectedTemplate,
    loadTemplates,
    createTemplate,
    updateTemplate,
    applyTemplate,
    updateOptions,
    exportExam,
    downloadExport,
  };
}

export default useExamExport;

export type ExamPaperPdfBlock =
  | {
      kind: 'section';
      title: string;
      instructions?: string;
      totalMarks?: number;
    }
  | {
      kind: 'question';
      index: number;
      questionText: string;
      marks: number;
      options: { optionText?: string; isCorrect?: boolean }[];
      imageUrl?: string | null;
      expectedAnswerText?: string;
      hints?: string;
    };

export type ClientExamPaperModel = {
  title: string;
  instructions?: string;
  courseCode?: string;
  courseName?: string;
  durationMinutes?: number | null;
  totalMarks?: number | null;
  studentNameLine: boolean;
  showCourseCode: boolean;
  showTotalMarks: boolean;
  showQuestionMarks: boolean;
  includeAnswerKey: boolean;
  paperTemplateSnapshot: Record<string, unknown> | null;
  blocks: ExamPaperPdfBlock[];
};

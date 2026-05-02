import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeightRule,
  ImageRun,
  Packer,
  PageNumber,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  UnderlineType,
  VerticalAlign,
  WidthType,
  convertMillimetersToTwip,
} from 'docx';

type QuestionOption = {
  optionText?: string;
  isCorrect?: boolean;
};

export type ExportExamItem = {
  id: string;
  questionId?: number;
  chapterId?: number;
  questionType?: string;
  difficulty?: string;
  bloomLevel?: string;
  questionText: string;
  expectedAnswerText?: string;
  hints?: string;
  weight: number;
  itemOrder?: number;
  options: QuestionOption[];
};

export interface ExportExamPayload {
  title: string;
  courseName: string;
  generatedAt: string;
  durationMinutes?: number;
  items: ExportExamItem[];
  isDraft?: boolean;
  examinerName?: string;
  institution?: {
    enUniversity: string;
    enFaculty: string;
    enDepartment: string;
    enMonthYear: string;
    arUniversity: string;
    arFaculty: string;
    arDepartment: string;
    arMonthYear: string;
  };
  courseInfo?: {
    enCourseTitle: string;
    enYearTrack: string;
    arCourseTitle: string;
    arYearTrack: string;
  };
  hintText?: string;
  logoBytes?: Uint8Array;
}

const bodyRun = (text: string, extra?: Partial<TextRun>) =>
  new TextRun({
    text,
    font: 'Times New Roman',
    size: 24,
    ...extra,
  });

const majorSeparator = () =>
  new Paragraph({
    border: {
      bottom: {
        style: BorderStyle.DASHED,
        size: 1,
        color: 'BEBEBE',
      },
    },
    spacing: { after: 160, before: 100 },
  });

const marksLine = (marks: number) =>
  new Paragraph({
    alignment: AlignmentType.RIGHT,
    spacing: { after: 120 },
    children: [bodyRun(`( ${marks} Marks )`, { italics: true })],
  });

const createHeader = (
  monthYearEn: string,
  institution?: ExportExamPayload['institution'],
  logoBytes?: Uint8Array,
) =>
  new Header({
    children: [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        layout: TableLayoutType.FIXED,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.LEFT,
                    children: [bodyRun(institution?.enUniversity || 'Alexandria University', { bold: true, size: 26 })],
                  }),
                  new Paragraph({ children: [bodyRun(institution?.enFaculty || 'Faculty of Engineering')] }),
                  new Paragraph({
                    children: [bodyRun(institution?.enDepartment || 'Electrical Engineering Department')],
                  }),
                  new Paragraph({ children: [bodyRun(institution?.enMonthYear || monthYearEn)] }),
                ],
              }),
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: logoBytes
                      ? [
                          new ImageRun({
                            data: logoBytes,
                            transformation: { width: 80, height: 80 },
                          }),
                        ]
                      : [bodyRun('UNIVERSITY SEAL', { italics: true })],
                  }),
                ],
              }),
              new TableCell({
                verticalAlign: VerticalAlign.CENTER,
                children: [
                  new Paragraph({
                    bidirectional: true,
                    alignment: AlignmentType.RIGHT,
                    children: [bodyRun(institution?.arUniversity || 'جامعة الإسكندرية', { bold: true, size: 26 })],
                  }),
                  new Paragraph({
                    bidirectional: true,
                    alignment: AlignmentType.RIGHT,
                    children: [bodyRun(institution?.arFaculty || 'كلية الهندسة')],
                  }),
                  new Paragraph({
                    bidirectional: true,
                    alignment: AlignmentType.RIGHT,
                    children: [bodyRun(institution?.arDepartment || 'قسم الهندسة الكهربية')],
                  }),
                  new Paragraph({
                    bidirectional: true,
                    alignment: AlignmentType.RIGHT,
                    children: [bodyRun(institution?.arMonthYear || 'يناير ٢٠٢٥')],
                  }),
                ],
              }),
            ],
          }),
        ],
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
          bottom: { style: BorderStyle.DOUBLE, size: 12, color: '000000' },
        },
      }),
      new Paragraph({ spacing: { after: 120 } }),
    ],
  });

const createFooter = () =>
  new Footer({
    children: [
      new Paragraph({
        border: { top: { style: BorderStyle.SINGLE, size: 1, color: '000000' } },
        spacing: { before: 80, after: 80 },
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 120 },
        children: [
          bodyRun('Page ', { italics: true }),
          new TextRun({ children: [PageNumber.CURRENT], font: 'Times New Roman', size: 24, italics: true }),
          bodyRun(' of ', { italics: true }),
          new TextRun({ children: [PageNumber.TOTAL_PAGES], font: 'Times New Roman', size: 24, italics: true }),
        ],
      }),
    ],
  });

const buildTrueFalseTable = (rowsCount: number) =>
  new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            shading: { fill: 'F2F2F2' },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [bodyRun('Number of the statement', { bold: true })] })],
          }),
          new TableCell({
            width: { size: 15, type: WidthType.PERCENTAGE },
            shading: { fill: 'F2F2F2' },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [bodyRun('TRUE', { bold: true })] })],
          }),
          new TableCell({
            width: { size: 50, type: WidthType.PERCENTAGE },
            shading: { fill: 'F2F2F2' },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [bodyRun('FALSE (give the true answer)', { bold: true })],
              }),
            ],
          }),
        ],
      }),
      ...Array.from({ length: rowsCount }).map((_, idx) =>
        new TableRow({
          height: { value: 320, rule: HeightRule.EXACT },
          children: [
            new TableCell({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [bodyRun(String(idx + 1))] })] }),
            new TableCell({ children: [new Paragraph('')] }),
            new TableCell({ children: [new Paragraph('')] }),
          ],
        }),
      ),
    ],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      left: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      right: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
      insideVertical: { style: BorderStyle.SINGLE, size: 1, color: '000000' },
    },
  });

export const exportExamToWord = async (payload: ExportExamPayload) => {
  const examDate = new Date(payload.generatedAt || Date.now());
  const monthYearEn = examDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const durationMinutes = payload.durationMinutes ?? 60;
  const hintText = payload.hintText || 'ε₀ = 8.85 x 10⁻¹² F/m  ,  μ₀ = 4π x 10⁻⁷ H/m';

  const bodyChildren: (Paragraph | Table)[] = [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      layout: TableLayoutType.FIXED,
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    bodyRun(payload.courseInfo?.enCourseTitle || payload.courseName || payload.title, { bold: true, size: 26 }),
                  ],
                }),
                new Paragraph({
                  children: [bodyRun(payload.courseInfo?.enYearTrack || 'Third Year - Communications')],
                }),
                new Paragraph({
                  children: [bodyRun(`Time allowed: ${durationMinutes} minutes (for this part)`)],
                }),
              ],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  bidirectional: true,
                  alignment: AlignmentType.RIGHT,
                  children: [bodyRun(payload.courseInfo?.arCourseTitle || 'موجات كهرومغناطيسية', { bold: true, size: 26 })],
                }),
                new Paragraph({
                  bidirectional: true,
                  alignment: AlignmentType.RIGHT,
                  children: [bodyRun(payload.courseInfo?.arYearTrack || 'السنة الثالثة - اتصالات')],
                }),
                new Paragraph({
                  bidirectional: true,
                  alignment: AlignmentType.RIGHT,
                  children: [bodyRun(`الزمن: ${durationMinutes} دقيقة لهذا الجزء`)],
                }),
              ],
            }),
          ],
        }),
      ],
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' },
      },
    }),
    new Paragraph({ spacing: { after: 200 } }),
    new Paragraph({
      alignment: AlignmentType.LEFT,
      spacing: { after: 200 },
      children: [bodyRun('Answer All Questions', { bold: true, underline: { type: UnderlineType.SINGLE } })],
    }),
  ];

  payload.items
    .slice()
    .sort((a, b) => (a.itemOrder ?? 0) - (b.itemOrder ?? 0))
    .forEach((item, index) => {
      bodyChildren.push(
        new Paragraph({
          spacing: { after: 120 },
          indent: { hanging: convertMillimetersToTwip(5) },
          children: [bodyRun(`${index + 1}. `, { bold: true }), bodyRun(item.questionText || `Question #${item.questionId ?? item.id}`)],
        }),
      );

      if (Array.isArray(item.options) && item.options.length > 0) {
        item.options.forEach((option, optionIndex) => {
          bodyChildren.push(
            new Paragraph({
              indent: { left: convertMillimetersToTwip(10), hanging: convertMillimetersToTwip(5) },
              spacing: { after: 80 },
              children: [bodyRun(`${String.fromCharCode(97 + optionIndex)}) ${option.optionText || ''}`)],
            }),
          );
        });
      }

      if (item.questionType === 'true_false') {
        bodyChildren.push(new Paragraph({ spacing: { after: 80 }, children: [bodyRun('Statements list:')] }));
        bodyChildren.push(buildTrueFalseTable(Math.max(item.options?.length || 0, 15)));
      }

      bodyChildren.push(marksLine(item.weight));

      if (item.hints) {
        bodyChildren.push(
          new Paragraph({
            spacing: { after: 80 },
            children: [
              bodyRun('Hint:', { bold: true, underline: { type: UnderlineType.SINGLE } }),
              bodyRun(` ${item.hints}`),
            ],
          }),
        );
      }

      if (index !== payload.items.length - 1) {
        bodyChildren.push(majorSeparator());
      }
    });

  bodyChildren.push(
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 1, color: '000000' } },
      spacing: { before: 160, after: 80 },
    }),
    new Paragraph({
      spacing: { after: 100 },
      children: [bodyRun(`Examiner : ${payload.examinerName || 'Prof. Dr. [Examiner Full Name]'}`, { italics: true })],
    }),
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 1, color: '000000' } },
      spacing: { before: 140, after: 80 },
      children: [
        bodyRun('Hint:', { bold: true, underline: { type: UnderlineType.SINGLE } }),
        bodyRun(`  ${hintText}`),
      ],
    }),
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertMillimetersToTwip(25),
              bottom: convertMillimetersToTwip(25),
              left: convertMillimetersToTwip(25),
              right: convertMillimetersToTwip(25),
            },
            size: { width: 11906, height: 16838 },
          },
        },
        headers: { default: createHeader(monthYearEn, payload.institution, payload.logoBytes) },
        footers: { default: createFooter() },
        children: bodyChildren,
      },
    ],
    styles: {
      default: {
        document: {
          run: { font: 'Times New Roman', size: 24 },
          paragraph: { spacing: { line: 360, after: 120 } },
        },
      },
    },
  });

  const blob = await Packer.toBlob(doc);
  const examName = payload.title.trim().replace(/\s+/g, '_').replace(/[^\w-]/g, '');
  const filename = `${examName || 'exam'}_${payload.isDraft ? 'draft' : 'saved'}.docx`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};


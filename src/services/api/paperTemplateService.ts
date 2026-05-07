import { ApiClient } from './client';

export interface PaperTemplateDto {
  name: string;
  layoutMode?: string;
  headerText?: string;
  footerText?: string;
  showAnswers?: boolean;
  numberingStyle?: string;
}

export class PaperTemplateService {
  static async list() {
    return ApiClient.get('/exams/paper-templates');
  }

  static async create(dto: PaperTemplateDto) {
    return ApiClient.post('/exams/paper-templates', dto);
  }

  static async update(templateId: number, dto: Partial<PaperTemplateDto>) {
    return ApiClient.patch(`/exams/paper-templates/${templateId}`, dto);
  }

  static async delete(templateId: number) {
    return ApiClient.delete(`/exams/paper-templates/${templateId}`);
  }

  static async applyToExam(examId: number, templateId: number) {
    return ApiClient.patch(`/exams/${examId}/paper-template`, { templateId });
  }
}

export default PaperTemplateService;

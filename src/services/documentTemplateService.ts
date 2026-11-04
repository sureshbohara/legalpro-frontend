import api from '@/lib/axios';
import { ApiResponse, DocumentTemplate } from '@/types';


export const documentTemplateService = {


  async getAll(params?: { search?: string; category?: string }) {
    const response = await api.get<ApiResponse<DocumentTemplate[]>>('/api/document-templates', { params });
    return response.data;
  },

  async fillTemplate(templateId: number, clientId: number, caseId?: number) {
    const response = await api.post<ApiResponse<{ filled_content: string; template_name: string }>>(
      `/api/document-templates/${templateId}/fill`,
      { client_id: clientId, case_id: caseId }
    );
    return response.data;
  },
  
};
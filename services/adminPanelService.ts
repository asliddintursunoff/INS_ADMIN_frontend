import { apiClient } from '@/lib/apiClient';
import { StudentYear, Subject, Major } from '@/types';

export const adminPanelService = {
  getStudentYears: async (): Promise<StudentYear[]> => {
    const response = await apiClient.get<StudentYear[]>('/adminpanel/student-year');
    return response.data;
  },

  getSubjectsByStudentYear: async (studentYearId: string): Promise<Subject[]> => {
    const response = await apiClient.get<Subject[]>(`/adminpanel/subjects-by-st-year`, {
      params: { student_year_id: studentYearId },
    });
    return response.data;
  },

  getMajors: async (): Promise<Major[]> => {
    const response = await apiClient.get<Major[]>('/adminpanel/majors');
    return response.data;
  },
};

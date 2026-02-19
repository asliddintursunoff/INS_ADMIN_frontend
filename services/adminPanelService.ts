import { apiClient } from '@/lib/apiClient';
import { StudentYear, Subject, Major } from '@/types';
import { StudentYearSchema, SubjectSchema, MajorSchema } from '@/types/schemas';
import { z } from 'zod';

export const adminPanelService = {
  getStudentYears: async (): Promise<StudentYear[]> => {
    const response = await apiClient.get('/adminpanel/student-year');
    return z.array(StudentYearSchema).parse(response.data);
  },

  getSubjectsByStudentYear: async (studentYearId: string): Promise<Subject[]> => {
    const response = await apiClient.get(`/adminpanel/subjects-by-st-year`, {
      params: { student_year_id: studentYearId },
    });
    return z.array(SubjectSchema).parse(response.data);
  },

  getMajors: async (): Promise<Major[]> => {
    const response = await apiClient.get('/adminpanel/majors');
    // The response data might have different field names based on the requirement A/B
    // but the provided Major schema uses 'id' and 'major_name'
    return z.array(MajorSchema).parse(response.data);
  },
};

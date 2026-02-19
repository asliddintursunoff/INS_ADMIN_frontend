import { apiClient } from '@/lib/apiClient';
import { Enrollment, StudentEnrollmentDetail } from '@/types';

export const attendanceService = {
  getStudentsBySubject: async (subjectId: string): Promise<Enrollment[]> => {
    const response = await apiClient.get<Enrollment[]>(`/attendance/students-by-subject/${subjectId}`);
    return response.data;
  },

  getStudentByEnrollment: async (enrollmentId: string): Promise<StudentEnrollmentDetail> => {
    const response = await apiClient.get<StudentEnrollmentDetail>(`/attendance/student-by-enrollment/${enrollmentId}`);
    return response.data;
  },
};

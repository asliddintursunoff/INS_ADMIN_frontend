import { apiClient } from '@/lib/apiClient';
import { Enrollment, StudentEnrollmentDetail } from '@/types';
import { EnrollmentSchema, StudentEnrollmentDetailSchema } from '@/types/schemas';
import { z } from 'zod';

export const attendanceService = {
  getStudentsBySubject: async (subjectId: string): Promise<Enrollment[]> => {
    const response = await apiClient.get(`/attendance/students-by-subject/${subjectId}`);
    return z.array(EnrollmentSchema).parse(response.data);
  },

  getStudentByEnrollment: async (enrollmentId: string): Promise<StudentEnrollmentDetail> => {
    const response = await apiClient.get(`/attendance/student-by-enrollment/${enrollmentId}`);
    return StudentEnrollmentDetailSchema.parse(response.data);
  },
};

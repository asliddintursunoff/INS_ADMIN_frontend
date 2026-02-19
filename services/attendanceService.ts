import { apiClient } from '@/lib/apiClient';
import { StudentEnrollmentDetail, Subject, StudentInSubject } from '@/types';
import { StudentEnrollmentDetailSchema, StudentsBySubjectResponseSchema } from '@/types/schemas';

export interface StudentsBySubjectResponse {
  subject: Subject;
  students: StudentInSubject[];
}

export const attendanceService = {
  getStudentsBySubject: async (subjectId: string): Promise<StudentsBySubjectResponse> => {
    const response = await apiClient.get(`/attendance/students-by-subject/${subjectId}`);
    return StudentsBySubjectResponseSchema.parse(response.data);
  },

  getStudentByEnrollment: async (enrollmentId: string): Promise<StudentEnrollmentDetail> => {
    const response = await apiClient.get(`/attendance/student-by-enrollment/${enrollmentId}`);
    return StudentEnrollmentDetailSchema.parse(response.data);
  },
};

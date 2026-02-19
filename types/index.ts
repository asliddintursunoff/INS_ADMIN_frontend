import { z } from 'zod';
import {
  MajorSchema,
  ProfessorSchema,
  SubjectSchema,
  EnrollmentSchema,
  StudentYearSchema,
  SuperUserSchema,
  AttendanceInfoSchema,
  StudentEnrollmentDetailSchema,
  AttendanceNotificationSchema,
  StudentsBySubjectResponseSchema,
  StudentInSubjectSchema
} from './schemas';

export type Major = z.infer<typeof MajorSchema>;
export type Professor = z.infer<typeof ProfessorSchema>;
export type Subject = z.infer<typeof SubjectSchema>;
export type Enrollment = z.infer<typeof EnrollmentSchema>;
export type StudentYear = z.infer<typeof StudentYearSchema>;
export type SuperUser = z.infer<typeof SuperUserSchema>;
export type AttendanceInfo = z.infer<typeof AttendanceInfoSchema>;
export type StudentEnrollmentDetail = z.infer<typeof StudentEnrollmentDetailSchema>;
export type AttendanceNotification = z.infer<typeof AttendanceNotificationSchema>;
export type StudentsBySubjectResponse = z.infer<typeof StudentsBySubjectResponseSchema>;
export type StudentInSubject = z.infer<typeof StudentInSubjectSchema>;

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export enum GroupType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
}

export enum AcademicYear {
  YEAR_1 = '1',
  YEAR_2 = '2',
  YEAR_3 = '3',
  YEAR_4 = '4',
}

export interface MatrixData {
  rows: any[];
  columns: any[];
  data: any[][];
}

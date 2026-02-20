import { z } from 'zod';
import {
  MajorSchema,
  ProfessorSchema,
  SubjectSchema,
  StudentYearSchema,
  SuperUserSchema,
  StudentEnrollmentDetailSchema,
  AttendanceNotificationSchema,
  StudentsBySubjectResponseSchema,
  AttendanceStudentSchema,
  AttendanceSubjectSchema,
  DetailEnrollmentSchema,
  ExactInfoSchema
} from './schemas';

export type Major = z.infer<typeof MajorSchema>;
export type Professor = z.infer<typeof ProfessorSchema>;
export type Subject = z.infer<typeof SubjectSchema>;
export type StudentYear = z.infer<typeof StudentYearSchema>;
export type SuperUser = z.infer<typeof SuperUserSchema>;
export type StudentEnrollmentDetail = z.infer<typeof StudentEnrollmentDetailSchema>;
export type AttendanceNotification = z.infer<typeof AttendanceNotificationSchema>;
export type StudentsBySubjectResponse = z.infer<typeof StudentsBySubjectResponseSchema>;
export type AttendanceStudent = z.infer<typeof AttendanceStudentSchema>;
export type AttendanceSubject = z.infer<typeof AttendanceSubjectSchema>;
export type DetailEnrollment = z.infer<typeof DetailEnrollmentSchema>;
export type ExactInfo = z.infer<typeof ExactInfoSchema>;

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

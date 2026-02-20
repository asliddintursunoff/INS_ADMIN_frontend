import { z } from 'zod';

const safeArray = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => (Array.isArray(val) ? val : []), z.array(schema)).default([]);

const safeObject = <T extends z.ZodRawShape>(shape: T, defaultValue: any) =>
  z.preprocess((val) => (val && typeof val === 'object' ? val : defaultValue), z.object(shape)).default(defaultValue);

export const SuperUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  telegram_id: z.string().optional().nullable(),
  is_root: z.boolean().default(false),
});

export const StudentYearSchema = z.object({
  id: z.string(),
  year_name: z.string(),
  starting_year: z.number(),
  graduation_year: z.number(),
});

export const MajorSchema = z.object({
  id: z.string(),
  major_name: z.string(),
});

export const ProfessorSchema = z.object({
  name: z.string(),
});

export const SubjectSchema = z.object({
  id: z.string(),
  short_name: z.string(),
  name: z.string().optional(),
  subject_name: z.string().optional(),
  majors: safeArray(MajorSchema),
  professors: safeArray(ProfessorSchema),
});

// For Students by Subject endpoint
export const AttendanceEnrollmentSchema = z.object({
  id: z.string(),
  attendance: z.number().catch(0),
  late: z.number().catch(0),
  absence: z.number().catch(0),
});

export const AttendanceStudentSchema = z.object({
  id: z.string(),
  name: z.string(),
  telegram_id: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  enrollments: safeArray(AttendanceEnrollmentSchema),
});

export const AttendanceSubjectSchema = z.object({
  subject_id: z.string(),
  subject_name: z.string(),
  professors: safeArray(z.string()),
});

export const StudentsBySubjectResponseSchema = z.object({
  subject: AttendanceSubjectSchema,
  students: safeArray(AttendanceStudentSchema),
});

// For Student by Enrollment endpoint
export const ExactInfoSchema = z.object({
  id: z.string(),
  date_of_week: z.string(),
  class_name: z.string(),
  attendance: z.boolean().catch(false),
  absence: z.boolean().catch(false),
  late: z.boolean().catch(false),
});

export const DetailEnrollmentSchema = z.object({
  id: z.string(),
  attendance: z.number().catch(0),
  late: z.number().catch(0),
  absence: z.number().catch(0),
  exact_info: safeArray(ExactInfoSchema),
});

export const StudentEnrollmentDetailSchema = z.object({
  subject: z.object({
    subject_id: z.string(),
    subject_name: z.string(),
    professor_name: z.string().optional().nullable(),
  }),
  student: z.object({
    id: z.string(),
    name: z.string(),
    telegram_id: z.string().optional().nullable(),
    phone: z.string().optional().nullable(),
    enrollments: safeArray(DetailEnrollmentSchema),
  }),
});

// For Notifications
export const AttendanceNotificationSchema = z.object({
  attendance_info_id: z.string(),
  enrollment_id: z.string(),
  student_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  group_name: z.string(),
  major: z.string(),
  st_year: z.string(),
  total_attendance: z.object({
    attendance: z.number().catch(0),
    absence: z.number().catch(0),
    late: z.number().catch(0),
  }),
  new_absence_date: z.string(),
  subject_name: z.string(),
  prof_name: z.string(),
  seen: z.boolean().optional().default(false),
});

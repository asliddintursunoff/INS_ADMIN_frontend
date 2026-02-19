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

export const EnrollmentSchema = z.object({
  id: z.string(),
  student_id: z.string(),
  student_name: z.string(),
  telegram_id: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  attendance_count: z.number().catch(0),
  absence_count: z.number().catch(0),
  late_count: z.number().catch(0),
  max_absence: z.number().catch(0),
  max_late: z.number().catch(0),
});

export const AttendanceInfoSchema = z.object({
  id: z.string(),
  date_of_week: z.string(),
  class_name: z.string(),
  status: z.enum(['attendance', 'absence', 'late']),
});

export const StudentEnrollmentDetailSchema = z.object({
  student_info: z.object({
    first_name: z.string(),
    last_name: z.string(),
    telegram_id: z.string().optional().nullable(),
  }),
  summary: z.object({
    attendance: z.number().default(0),
    late: z.number().default(0),
    absence: z.number().default(0),
  }),
  exact_info: safeArray(AttendanceInfoSchema),
});

export const AttendanceNotificationSchema = z.object({
  student_id: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  group_name: z.string(),
  major: z.string(),
  st_year: z.string(),
  total_attendance: safeObject({
    attendance: z.number().default(0),
    absence: z.number().default(0),
    late: z.number().default(0),
  }, { attendance: 0, absence: 0, late: 0 }),
  new_absence_date: z.string(),
  subject_name: z.string(),
  prof_name: z.string(),
  enrollment_id: z.string(),
  attendance_info_id: z.string(),
  seen: z.boolean().optional().default(false),
});

export const StudentInSubjectSchema = z.object({
  id: z.string(),
  student_id: z.string(),
  student_name: z.string(),
  telegram_id: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  enrollments: safeArray(EnrollmentSchema),
  attendance_count: z.number().catch(0),
  absence_count: z.number().catch(0),
  late_count: z.number().catch(0),
  max_absence: z.number().catch(0),
  max_late: z.number().catch(0),
  highest_absence: z.number().catch(0),
}).passthrough();

export const AttendanceSubjectSchema = z.object({
  id: z.string().optional(), // some endpoints use 'id', some 'subject_id'
  subject_id: z.string().optional(),
  subject_name: z.string().optional(),
  name: z.string().optional(),
  short_name: z.string().optional(),
  professors: z.union([z.string(), safeArray(ProfessorSchema)]).optional(),
});

export const AttendanceEnrollmentSchema = z.object({
  id: z.string(),
  attendance: z.number().catch(0),
  late: z.number().catch(0),
  absence: z.number().catch(0),
});

export const AttendanceStudentSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  student_name: z.string().optional(),
  telegram_id: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  enrollments: safeArray(AttendanceEnrollmentSchema),
});

export const StudentsBySubjectResponseSchema = z.object({
  subject: AttendanceSubjectSchema,
  students: safeArray(AttendanceStudentSchema),
});

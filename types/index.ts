export interface SuperUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  telegram_id?: string;
  is_root: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface StudentYear {
  id: string;
  year_name: string;
  starting_year: number;
  graduation_year: number;
}

export interface Subject {
  id: string;
  short_name: string;
  name: string;
  majors: string[];
  professors: string[];
}

export interface Enrollment {
  id: string;
  student_id: string;
  student_name: string;
  telegram_id?: string;
  phone?: string;
  attendance_count: number;
  absence_count: number;
  late_count: number;
  max_absence: number;
  max_late: number;
}

export interface StudentEnrollmentDetail {
  student_info: {
    first_name: string;
    last_name: string;
    telegram_id?: string;
  };
  summary: {
    attendance: number;
    late: number;
    absence: number;
  };
  exact_info: AttendanceInfo[];
}

export interface AttendanceInfo {
  id: string;
  date_of_week: string;
  class_name: string;
  status: 'attendance' | 'absence' | 'late';
}

export interface AttendanceNotification {
  student_id: string;
  first_name: string;
  last_name: string;
  group_name: string;
  major: string;
  st_year: string;
  total_attendance: {
    attendance: number;
    absence: number;
    late: number;
  };
  new_absence_date: string;
  subject_name: string;
  prof_name: string;
  enrollment_id: string;
  attendance_info_id: string;
  seen?: boolean;
}

export interface Major {
  id: string;
  name: string;
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

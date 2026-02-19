'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { attendanceService } from '@/services/attendanceService';
import { adminPanelService } from '@/services/adminPanelService';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { StudentEnrollmentModal } from '@/features/attendance/components/StudentEnrollmentModal';
import { cn } from '@/lib/utils';
import { User, Phone, Send, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

import { useMemo } from 'react';
import { Enrollment } from '@/types';

export default function StudentsInSubjectPage() {
  const params = useParams();
  const stYearId = params.stYearId as string;
  const subjectId = params.subjectId as string;

  const [selectedStudent, setSelectedStudent] = useState<{
    enrollmentId: string;
    name: string;
    allEnrollments: { id: string; label: string }[];
  } | null>(null);

  const { data: years } = useQuery({
    queryKey: ['student-years'],
    queryFn: adminPanelService.getStudentYears,
  });

  const { data: subjects } = useQuery({
    queryKey: ['subjects', stYearId],
    queryFn: () => adminPanelService.getSubjectsByStudentYear(stYearId),
    enabled: !!stYearId,
  });

  const currentYear = years?.find((y) => y.id === stYearId);
  const currentSubject = subjects?.find((s) => s.id === subjectId);

  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['students-in-subject', subjectId],
    queryFn: () => attendanceService.getStudentsBySubject(subjectId),
    enabled: !!subjectId,
    placeholderData: keepPreviousData,
  });

  const students = useMemo(() => {
    const list = Array.isArray(enrollments) ? enrollments : [];
    if (list.length === 0) return [];

    const grouped = list.reduce((acc, curr) => {
      if (!acc[curr.student_id]) {
        acc[curr.student_id] = {
          student_id: curr.student_id,
          student_name: curr.student_name,
          telegram_id: curr.telegram_id,
          phone: curr.phone,
          enrollments: [],
          attendance_count: 0,
          absence_count: 0,
          late_count: 0,
          max_absence: 0,
          max_late: 0,
          highest_absence: 0,
        };
      }
      const student = acc[curr.student_id];
      student.enrollments.push(curr);
      student.attendance_count += curr.attendance_count;
      student.absence_count += curr.absence_count;
      student.late_count += curr.late_count;
      student.max_absence = Math.max(student.max_absence, curr.max_absence);
      student.max_late = Math.max(student.max_late, curr.max_late);
      student.highest_absence = Math.max(student.highest_absence, curr.absence_count);
      return acc;
    }, {} as Record<string, {
      student_id: string;
      student_name: string;
      telegram_id: string | null | undefined;
      phone: string | null | undefined;
      enrollments: Enrollment[];
      attendance_count: number;
      absence_count: number;
      late_count: number;
      max_absence: number;
      max_late: number;
      highest_absence: number;
    }>);

    return Object.values(grouped);
  }, [enrollments]);

  const getAbsenceColorClass = (highestAbsence: number) => {
    if (highestAbsence >= 7) return 'bg-red-50 hover:bg-red-100';
    if (highestAbsence >= 5) return 'bg-orange-50 hover:bg-orange-100';
    if (highestAbsence >= 3) return 'bg-yellow-50 hover:bg-yellow-100';
    return '';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/student-years">Student Years</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href={`/student-years/${stYearId}/subjects`}>
                  {currentYear?.year_name || 'Subjects'}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{currentSubject?.name || 'Students'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {currentSubject?.name}
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <User className="w-4 h-4" />
                Professors:{' '}
                {currentSubject?.professors?.map((p) => p.name).join(', ') || 'N/A'}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant="outline" className="bg-white">
                {currentSubject?.short_name}
              </Badge>
              {currentSubject?.majors?.map((m) => (
                <Badge key={m.id} variant="secondary">
                  {m.major_name}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="rounded-md border-t overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="w-[250px]">Student Name</TableHead>
                      <TableHead>Telegram ID</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="text-center">Attendance</TableHead>
                      <TableHead className="text-center">Late</TableHead>
                      <TableHead className="text-center">Absence</TableHead>
                      <TableHead className="text-right">Max Limits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow
                        key={student.student_id || Math.random()}
                        className={cn(
                          'cursor-pointer transition-colors',
                          getAbsenceColorClass(student.highest_absence ?? 0)
                        )}
                        onClick={() =>
                          setSelectedStudent({
                            enrollmentId: student.enrollments[0].id,
                            name: student.student_name,
                            allEnrollments: student.enrollments.map((e, i) => ({
                              id: e.id,
                              label: `Enrollment ${i + 1} (${e.absence_count} abs)`
                            }))
                          })
                        }
                      >
                        <TableCell className="font-medium">
                          {student.student_name}
                        </TableCell>
                        <TableCell>
                          {student.telegram_id ? (
                            <div className="flex items-center gap-1 text-blue-600">
                              <Send className="w-3 h-3" />
                              {String(student.telegram_id)}
                            </div>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {student.phone ? (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {String(student.phone)}
                            </div>
                          ) : (
                            <span className="text-slate-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 font-bold text-xs">
                            {student.attendance_count ?? 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 font-bold text-xs">
                            {student.late_count ?? 0}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={cn(
                              'inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs',
                              student.highest_absence >= 7
                                ? 'bg-red-600 text-white'
                                : student.highest_absence >= 5
                                  ? 'bg-orange-500 text-white'
                                  : student.highest_absence >= 3
                                    ? 'bg-yellow-500 text-white'
                                    : 'bg-slate-100 text-slate-700'
                            )}
                          >
                            {student.absence_count}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          Max Abs: {student.max_absence} / Max Late: {student.max_late}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-start gap-2 text-xs text-muted-foreground bg-blue-50 p-4 rounded-lg border border-blue-100">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-blue-700">Table Guide:</p>
            <p>Row highlighting based on absence count: 3-4 (Yellow), 5-6 (Orange), 7+ (Red).</p>
            <p>Click on a row to see detailed attendance history for that student.</p>
          </div>
        </div>
      </div>

      <StudentEnrollmentModal
        isOpen={!!selectedStudent}
        onClose={() => setSelectedStudent(null)}
        enrollmentId={selectedStudent?.enrollmentId || null}
        studentName={selectedStudent?.name || ''}
        allEnrollments={selectedStudent?.allEnrollments}
      />
    </DashboardLayout>
  );
}

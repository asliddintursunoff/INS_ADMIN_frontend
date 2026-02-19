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

import { useMemo, useEffect } from 'react';
import { EmptyState } from '@/components/EmptyState';
import { Users2 } from 'lucide-react';

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

  const { data: response, isLoading } = useQuery({
    queryKey: ['students-in-subject', subjectId],
    queryFn: () => attendanceService.getStudentsBySubject(subjectId),
    enabled: !!subjectId,
    placeholderData: keepPreviousData,
  });

  const currentYear = years?.find((y) => y.id === stYearId);
  const currentSubject = response?.subject;
  const backupSubject = subjects?.find((s) => s.id === subjectId);

  useEffect(() => {
    if (response) {
      console.log("students-by-subject response:", response);
    }
  }, [response]);

  const students = useMemo(() => {
    const list = Array.isArray(response?.students) ? response.students : [];
    return list.map(student => {
      const enrollments = student.enrollments || [];
      const attendance_count = enrollments.reduce((sum, e) => sum + (e.attendance || 0), 0);
      const absence_count = enrollments.reduce((sum, e) => sum + (e.absence || 0), 0);
      const late_count = enrollments.reduce((sum, e) => sum + (e.late || 0), 0);
      const highest_absence = enrollments.length > 0
        ? Math.max(...enrollments.map(e => e.absence || 0))
        : 0;
      const highest_late = enrollments.length > 0
        ? Math.max(...enrollments.map(e => e.late || 0))
        : 0;

      return {
        ...student,
        attendance_count,
        absence_count,
        late_count,
        highest_absence,
        highest_late
      };
    });
  }, [response]);

  const getAbsenceColorClass = (highestAbsence: number) => {
    if (highestAbsence >= 7) return 'bg-red-50 hover:bg-red-100';
    if (highestAbsence >= 5) return 'bg-orange-50 hover:bg-orange-100';
    if (highestAbsence >= 3) return 'bg-yellow-50 hover:bg-yellow-100';
    return '';
  };

  const renderProfessors = (professors: string | { name: string }[] | string[] | undefined | null) => {
    if (!professors) return 'N/A';
    if (typeof professors === 'string') return professors;
    if (Array.isArray(professors)) {
      return professors.map((p) => (typeof p === 'string' ? p : p.name)).join(', ');
    }
    return 'N/A';
  };

  const shortName = (currentSubject as { short_name?: string })?.short_name || backupSubject?.short_name;

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
                <BreadcrumbPage>{currentSubject?.subject_name || backupSubject?.name || backupSubject?.subject_name || 'Students'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {currentSubject?.subject_name || backupSubject?.name || backupSubject?.subject_name}
              </h1>
              <p className="text-muted-foreground mt-1 flex items-center gap-2">
                <User className="w-4 h-4" />
                Professors:{' '}
                {renderProfessors(currentSubject?.professors || backupSubject?.professors)}
              </p>
            </div>
            <div className="flex gap-2">
              {shortName && (
                <Badge variant="outline" className="bg-white">
                  {shortName}
                </Badge>
              )}
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
            ) : students.length === 0 ? (
              <EmptyState
                icon={Users2}
                title="No students found"
                description="No students are currently enrolled in this subject."
              />
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
                      <TableHead className="text-center">Max Abs</TableHead>
                      <TableHead className="text-center">Max Late</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow
                        key={student.id}
                        className={cn(
                          'cursor-pointer transition-colors',
                          getAbsenceColorClass(student.highest_absence ?? 0)
                        )}
                        onClick={() => {
                          if (!student.enrollments || student.enrollments.length === 0) return;
                          setSelectedStudent({
                            enrollmentId: student.enrollments[0].id,
                            name: student.name || 'Unknown Student',
                            allEnrollments: student.enrollments.map((e, i) => ({
                              id: e.id,
                              label: `Enrollment ${i + 1} (${e.absence || 0} abs)`
                            }))
                          });
                        }}
                      >
                        <TableCell className="font-medium">
                          {student.name}
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
                        <TableCell className="text-center font-bold text-green-700">
                          {student.attendance_count ?? 0}
                        </TableCell>
                        <TableCell className="text-center font-bold text-amber-700">
                          {student.late_count ?? 0}
                        </TableCell>
                        <TableCell className="text-center font-bold text-red-700">
                          {student.absence_count ?? 0}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-mono">
                            {student.highest_absence}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-mono">
                            {student.highest_late}
                          </Badge>
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
            <p><strong>Max Abs/Late:</strong> The highest count found across all enrollments for this student.</p>
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

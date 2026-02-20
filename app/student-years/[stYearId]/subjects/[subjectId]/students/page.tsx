'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { attendanceService } from '@/services/attendanceService';
import { adminPanelService } from '@/services/adminPanelService';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useParams } from 'next/navigation';
import { useState, useMemo } from 'react';
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
import { User, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/EmptyState';
import { Users2 } from 'lucide-react';

export default function StudentsInSubjectPage() {
  const params = useParams();
  const stYearId = params.stYearId as string;
  const subjectId = params.subjectId as string;

  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredStudents = useMemo(() => {
    const list = Array.isArray(response?.students) ? response.students : [];

    const mapped = list.map(student => {
      const enrollments = Array.isArray(student.enrollments) ? student.enrollments : [];
      const attendance_count = enrollments.reduce((sum, e) => sum + (e.attendance || 0), 0);
      const absence_count = enrollments.reduce((sum, e) => sum + (e.absence || 0), 0);
      const late_count = enrollments.reduce((sum, e) => sum + (e.late || 0), 0);
      const highest_absence = enrollments.length > 0
        ? Math.max(...enrollments.map(e => e.absence || 0))
        : 0;

      return {
        ...student,
        attendance_count,
        absence_count,
        late_count,
        highest_absence
      };
    });

    if (!searchTerm) return mapped;

    const s = searchTerm.toLowerCase();
    return mapped.filter(st =>
      (st.id || "").toLowerCase().includes(s) ||
      (st.name || "").toLowerCase().includes(s)
    );
  }, [response, searchTerm]);

  const getAbsenceColorClass = (highestAbsence: number) => {
    if (highestAbsence >= 7) return 'bg-red-50 hover:bg-red-100';
    if (highestAbsence >= 5) return 'bg-orange-50 hover:bg-orange-100';
    if (highestAbsence >= 3) return 'bg-yellow-50 hover:bg-yellow-100';
    return '';
  };

  const renderProfessors = (professors: string[] | undefined | null) => {
    if (!professors || professors.length === 0) return 'N/A';
    return professors.join(', ');
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
                <BreadcrumbPage>{currentSubject?.subject_name || backupSubject?.name || backupSubject?.subject_name || 'Students'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {currentSubject?.subject_name || backupSubject?.name || backupSubject?.subject_name}
              </h1>
              <div className="text-muted-foreground mt-1 flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="font-medium">Professors:</span>
                {renderProfessors(currentSubject?.professors)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by ID or Name..."
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="text-sm text-slate-500">
            Showing {filteredStudents.length} students
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
            ) : filteredStudents.length === 0 ? (
              <EmptyState
                icon={Users2}
                title="No students found"
                description={searchTerm ? "Try a different search term." : "No students are currently enrolled in this subject."}
              />
            ) : (
              <div className="rounded-md border-t overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Student Name</TableHead>
                      <TableHead className="text-center">Attendance</TableHead>
                      <TableHead className="text-center">Absence</TableHead>
                      <TableHead className="text-center">Late</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow
                        key={student.id}
                        className={cn(
                          'cursor-pointer transition-colors',
                          getAbsenceColorClass(student.highest_absence ?? 0)
                        )}
                        onClick={() => {
                          const enrollmentId = student.enrollments?.[0]?.id;
                          if (!enrollmentId) return;
                          setSelectedStudent({
                            enrollmentId,
                            name: student.name,
                            allEnrollments: student.enrollments.map((e, i) => ({
                              id: e.id,
                              label: `Enrollment ${i + 1} (${e.absence || 0} abs)`
                            }))
                          });
                        }}
                      >
                        <TableCell className="font-mono text-sm">
                          {student.id}
                        </TableCell>
                        <TableCell className="font-medium">
                          {student.name}
                        </TableCell>
                        <TableCell className="text-center font-bold text-green-700">
                          {student.attendance_count ?? 0}
                        </TableCell>
                        <TableCell className="text-center font-bold text-red-700">
                          {student.absence_count ?? 0}
                        </TableCell>
                        <TableCell className="text-center font-bold text-amber-700">
                          {student.late_count ?? 0}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
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

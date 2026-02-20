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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { User, Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/EmptyState';

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

  const { data: response, isLoading } = useQuery({
    queryKey: ['students-by-subject', subjectId],
    queryFn: () => attendanceService.getStudentsBySubject(subjectId),
    enabled: !!subjectId,
    placeholderData: keepPreviousData,
  });


  const currentYear = years?.find((y) => y.id === stYearId);
  const currentSubject = response?.subject;

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
      (st.student_id || "").toLowerCase().includes(s) ||
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
                <BreadcrumbPage>{currentSubject?.subject_name || 'Students'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="mt-4">
            <h1 className="text-3xl font-bold tracking-tight">
              {currentSubject?.subject_name}
            </h1>
            <div className="text-muted-foreground mt-1 flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="font-medium text-slate-700">Professors:</span>
              {renderProfessors(currentSubject?.professors)}
            </div>
          </div>
        </div>

        <Card className="shadow-sm border-slate-200 overflow-hidden">
          <CardHeader className="pb-4 border-b bg-slate-50/50">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Students List
              </CardTitle>
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-500 font-medium">
                  Showing {filteredStudents.length} students
                </div>
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search ID or Name..."
                    className="pl-9 h-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filteredStudents.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No students found"
                description={searchTerm ? "Try a different search term." : "No students are currently enrolled in this subject."}
              />
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent bg-slate-50/50">
                      <TableHead className="w-[180px] font-semibold">Student ID</TableHead>
                      <TableHead className="font-semibold">Student Name</TableHead>
                      <TableHead className="text-center font-semibold">Attendance</TableHead>
                      <TableHead className="text-center font-semibold">Absence</TableHead>
                      <TableHead className="text-center font-semibold">Late</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow
                        key={student.id}
                        className={cn(
                          'cursor-pointer transition-colors border-b border-slate-100',
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
                        <TableCell className="font-mono font-medium text-blue-600">
                          {student.student_id}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900 whitespace-nowrap">
                          {student.name}
                        </TableCell>
                        <TableCell className="text-center font-bold text-green-600">
                          {student.attendance_count ?? 0}
                        </TableCell>
                        <TableCell className="text-center font-bold text-red-600">
                          {student.absence_count ?? 0}
                        </TableCell>
                        <TableCell className="text-center font-bold text-amber-600">
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

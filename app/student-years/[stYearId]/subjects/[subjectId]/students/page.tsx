'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { attendanceService } from '@/services/attendanceService';
import { adminPanelService } from '@/services/adminPanelService';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
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
import { User, Search, Users } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/EmptyState';

export default function StudentsInSubjectPage() {
  const params = useParams();
  const stYearId = params.stYearId as string;
  const subjectId = params.subjectId as string;

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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

  const students = useMemo(() => {
    const list = Array.isArray(response?.students) ? response.students : [];

    return list.map(student => {
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
  }, [response]);

  const filteredStudents = useMemo(() => {
    if (!debouncedSearchTerm) return students;

    const s = debouncedSearchTerm.toLowerCase();
    return students.filter(st =>
      (st.student_id || "").toLowerCase().includes(s) ||
      (st.name || "").toLowerCase().includes(s)
    );
  }, [students, debouncedSearchTerm]);

  const getAbsenceColorClass = (highestAbsence: number) => {
    if (highestAbsence >= 7) return 'bg-red-50 hover:bg-red-100';
    if (highestAbsence >= 5) return 'bg-orange-50 hover:bg-orange-100';
    if (highestAbsence >= 3) return 'bg-yellow-50 hover:bg-yellow-100';
    return 'hover:bg-slate-50';
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
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              {currentSubject?.subject_name}
            </h1>
            <div className="text-muted-foreground mt-1 flex items-center gap-2">
              <User className="w-4 h-4" />
              <span className="font-medium text-slate-700">Professors:</span>
              {renderProfessors(currentSubject?.professors)}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium">
            <Users className="w-4 h-4 text-blue-500" />
            Showing {filteredStudents.length} students
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by ID or Name..."
              className="pl-9 h-10 rounded-xl border-slate-200 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card className="rounded-xl border-slate-200 shadow-sm overflow-hidden bg-white">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-lg" />
                ))}
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-20">
                <EmptyState
                  icon={Users}
                  title="No students found"
                  description={searchTerm ? "Try a different search term." : "No students are currently enrolled in this subject."}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent bg-slate-50">
                      <TableHead className="w-[180px] font-bold text-slate-700 h-12">Student ID</TableHead>
                      <TableHead className="font-bold text-slate-700 h-12">Student Name</TableHead>
                      <TableHead className="text-center font-bold text-slate-700 h-12">Attendance</TableHead>
                      <TableHead className="text-center font-bold text-slate-700 h-12">Absence</TableHead>
                      <TableHead className="text-center font-bold text-slate-700 h-12">Late</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow
                        key={student.id}
                        className={cn(
                          'cursor-pointer transition-colors border-b border-slate-100 h-14',
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
                        <TableCell className="font-mono font-bold text-blue-600">
                          {student.student_id}
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900 whitespace-nowrap">
                          {student.name}
                        </TableCell>
                        <TableCell className="text-center font-black text-green-600">
                          {student.attendance_count ?? 0}
                        </TableCell>
                        <TableCell className="text-center font-black text-red-600">
                          {student.absence_count ?? 0}
                        </TableCell>
                        <TableCell className="text-center font-black text-amber-500">
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

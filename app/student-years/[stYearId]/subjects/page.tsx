'use client';

import { useQuery, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { adminPanelService } from '@/services/adminPanelService';
import { attendanceService } from '@/services/attendanceService';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useParams } from 'next/navigation';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Search, Book, Users, FilterX, BookX } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export default function SubjectsPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const stYearId = params.stYearId as string;
  const [search, setSearch] = useState('');
  const [majorFilter, setMajorFilter] = useState('all');

  const { data: years } = useQuery({
    queryKey: ['student-years'],
    queryFn: adminPanelService.getStudentYears,
  });

  const currentYear = years?.find((y) => y.id === stYearId);

  const { data: subjects, isLoading } = useQuery({
    queryKey: ['subjects', stYearId],
    queryFn: () => adminPanelService.getSubjectsByStudentYear(stYearId),
    placeholderData: keepPreviousData,
  });

  const prefetchStudents = (subjectId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['students-in-subject', subjectId],
      queryFn: () => attendanceService.getStudentsBySubject(subjectId),
    });
  };

  const majors = useMemo(() => {
    const list = Array.isArray(subjects) ? subjects : [];
    const allMajors = list.flatMap((s) => (Array.isArray(s.majors) ? s.majors : []));
    const uniqueMajors = Array.from(
      new Map(allMajors.map((m) => [m?.id, m])).values()
    ).filter(Boolean);
    return uniqueMajors;
  }, [subjects]);

  const filteredSubjects = useMemo(() => {
    const list = Array.isArray(subjects) ? subjects : [];
    return list.filter((subject) => {
      const matchesSearch =
        (subject.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (subject.short_name || "").toLowerCase().includes(search.toLowerCase());
      const matchesMajor =
        majorFilter === 'all' ||
        (Array.isArray(subject.majors) && subject.majors.some((m) => m?.id === majorFilter));
      return matchesSearch && matchesMajor;
    });
  }, [subjects, search, majorFilter]);

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
                <BreadcrumbPage>{currentYear?.year_name || 'Subjects'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-3xl font-bold tracking-tight mt-2">
            Subjects for {currentYear?.year_name}
          </h1>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search subjects by name or short name..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64">
            <Select value={majorFilter} onValueChange={setMajorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Major" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Majors</SelectItem>
                {majors.map((major) => (
                  <SelectItem key={major.id} value={major.id}>
                    {major.major_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-40 w-full" />
            ))}
          </div>
        ) : filteredSubjects.length === 0 ? (
          <EmptyState
            icon={search || majorFilter !== 'all' ? FilterX : BookX}
            title="No subjects found"
            description={search || majorFilter !== 'all' ? "Try adjusting your search or filters" : "No subjects are available for this year."}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.isArray(filteredSubjects) && filteredSubjects.map((subject) => (
              <Link
                key={subject.id}
                href={`/student-years/${stYearId}/subjects/${subject.id}/students`}
                onMouseEnter={() => prefetchStudents(subject.id)}
              >
                <Card className="hover:border-blue-500 transition-colors h-full">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="outline" className="text-xs">
                        {subject.short_name}
                      </Badge>
                      <div className="flex -space-x-2">
                        {subject.majors?.map((major) => (
                          <div
                            key={major.id}
                            className="w-2 h-2 rounded-full bg-blue-500"
                            title={major.major_name}
                          />
                        ))}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold mb-4 line-clamp-1">{subject.name}</h3>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-slate-600">
                        <Users className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {subject.professors?.map((p) => p.name).join(', ') ||
                            'No professors assigned'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Book className="w-4 h-4 mr-2 text-slate-400 shrink-0" />
                        <span className="truncate">
                          {subject.majors?.map((m) => m.major_name).join(', ') || '-'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

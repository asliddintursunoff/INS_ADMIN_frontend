'use client';

import { useQuery } from '@tanstack/react-query';
import { adminPanelService } from '@/services/adminPanelService';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Calendar, ChevronRight, GraduationCap } from 'lucide-react';
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb';

export default function StudentYearsPage() {
  const { data: years, isLoading, error } = useQuery({
    queryKey: ['student-years'],
    queryFn: adminPanelService.getStudentYears,
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Student Years</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-3xl font-bold tracking-tight mt-2">Student Years</h1>
          <p className="text-muted-foreground">Select a student year to view its subjects</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 w-full" />
            ))}
          </div>
        ) : error ? (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <p className="text-red-600">Failed to load student years. Please try again later.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {years?.map((year) => (
              <Link key={year.id} href={`/student-years/${year.id}/subjects`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-blue-100 hover:border-blue-300">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl text-blue-700">{year.year_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-slate-600">
                        <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                        <span>Starting Year: <strong>{year.starting_year}</strong></span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <GraduationCap className="w-4 h-4 mr-2 text-slate-400" />
                        <span>Graduation Year: <strong>{year.graduation_year}</strong></span>
                      </div>
                      <div className="pt-4 flex justify-end">
                        <span className="text-blue-600 text-sm font-medium flex items-center">
                          View Subjects
                          <ChevronRight className="w-4 h-4 ml-1" />
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

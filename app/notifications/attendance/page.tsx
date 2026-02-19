'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService, GetNotificationsParams } from '@/services/notificationService';
import { AttendanceNotification } from '@/types';
import { adminPanelService } from '@/services/adminPanelService';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { StudentEnrollmentModal } from '@/features/attendance/components/StudentEnrollmentModal';
import { CheckCircle2, Filter, RefreshCcw, Bell, Loader2, BellOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmptyState } from '@/components/EmptyState';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

export default function AttendanceNotificationsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    stYear: searchParams.get('st_year_id') || 'all',
    major: searchParams.get('major_id') || 'all',
    absence: searchParams.get('absence_greater_than') || '',
  });

  const params: GetNotificationsParams = {
    st_year_id: filters.stYear === 'all' ? undefined : filters.stYear,
    major_id: filters.major === 'all' ? undefined : filters.major,
    absence_greater_than: filters.absence ? parseInt(filters.absence) : undefined,
  };

  const [selectedEnrollment, setSelectedEnrollment] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: years } = useQuery({
    queryKey: ['student-years'],
    queryFn: adminPanelService.getStudentYears,
  });

  const { data: majors } = useQuery({
    queryKey: ['majors'],
    queryFn: adminPanelService.getMajors,
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationService.getNotifications(params),
  });

  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const seenMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsSeen(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['notifications', params] });
      const previousNotifications = queryClient.getQueryData(['notifications', params]);

      queryClient.setQueryData(['notifications', params], (old: unknown) => {
        const list = old as AttendanceNotification[];
        if (!list) return list;
        return list.map((n) =>
          n.attendance_info_id === id ? { ...n, seen: true } : n
        );
      });

      setPendingIds(prev => new Set(prev).add(id));
      return { previousNotifications };
    },
    onSuccess: (_, id) => {
      toast({
        title: 'Marked as seen',
        description: 'The notification has been updated.',
      });
      setSeenIds(prev => new Set(prev).add(id));
    },
    onError: (error, id, context: unknown) => {
      const ctx = context as { previousNotifications?: AttendanceNotification[] };
      if (ctx?.previousNotifications) {
        queryClient.setQueryData(['notifications', params], ctx.previousNotifications);
      }
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to mark notification as seen.',
      });
    },
    onSettled: (_, __, id) => {
      setPendingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  });

  const handleApplyFilters = () => {
    const newParams = new URLSearchParams();
    if (filters.stYear !== 'all') newParams.set('st_year_id', filters.stYear);
    if (filters.major !== 'all') newParams.set('major_id', filters.major);
    if (filters.absence) newParams.set('absence_greater_than', filters.absence);

    router.push(`/notifications/attendance?${newParams.toString()}`);
  };

  const handleResetFilters = () => {
    setFilters({ stYear: 'all', major: 'all', absence: '' });
    router.push('/notifications/attendance');
  };

  useEffect(() => {
    setFilters({
      stYear: searchParams.get('st_year_id') || 'all',
      major: searchParams.get('major_id') || 'all',
      absence: searchParams.get('absence_greater_than') || '',
    });
  }, [searchParams]);

  const handleMarkAsSeen = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (seenIds.has(id)) return;

    seenMutation.mutate(id, {
      onSuccess: () => {
        setSeenIds(prev => new Set(prev).add(id));
      }
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Notifications</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <Bell className="w-8 h-8 text-blue-600" />
            Attendance Notifications
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor and manage student absence alerts
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-500">Student Year</label>
                <Select
                  value={filters.stYear}
                  onValueChange={(v) => setFilters({ ...filters, stYear: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {years?.map((y) => (
                      <SelectItem key={y.id} value={y.id}>
                        {y.year_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-500">Major</label>
                <Select
                  value={filters.major}
                  onValueChange={(v) => setFilters({ ...filters, major: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Majors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Majors</SelectItem>
                    {majors?.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.major_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-500">Absence &gt;</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.absence}
                  onChange={(e) => setFilters({ ...filters, absence: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleApplyFilters} className="flex-1">
                  Apply
                </Button>
                <Button variant="outline" onClick={handleResetFilters}>
                  <RefreshCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : notifications?.length === 0 ? (
              <EmptyState
                icon={BellOff}
                title="No notifications"
                description="There are no attendance alerts for the selected filters."
              />
            ) : (
              <div className="rounded-md border-t overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Group/Major</TableHead>
                      <TableHead>Subject/Prof</TableHead>
                      <TableHead className="text-center">Absence Date</TableHead>
                      <TableHead className="text-center">Total (A/A/L)</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {notifications?.map((n) => (
                      <TableRow
                        key={`${n.enrollment_id}-${n.attendance_info_id}`}
                        className="cursor-pointer hover:bg-slate-50 transition-colors"
                        onClick={() => setSelectedEnrollment({
                          id: n.enrollment_id,
                          name: `${n.first_name} ${n.last_name}`
                        })}
                      >
                        <TableCell>
                          <div className="font-medium">{n.first_name} {n.last_name}</div>
                          <div className="text-xs text-slate-400">{n.st_year}</div>
                        </TableCell>
                        <TableCell>
                          <div>{n.group_name}</div>
                          <div className="text-xs text-slate-400">{n.major}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{n.subject_name}</div>
                          <div className="text-xs text-slate-400">{n.prof_name}</div>
                        </TableCell>
                        <TableCell className="text-center">
                          {n.new_absence_date}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex justify-center gap-1 text-xs">
                            <span className="text-green-600 font-bold">{n.total_attendance.attendance}</span>
                            <span>/</span>
                            <span className="text-red-600 font-bold">{n.total_attendance.absence}</span>
                            <span>/</span>
                            <span className="text-amber-600 font-bold">{n.total_attendance.late}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant={(n.seen || seenIds.has(n.attendance_info_id)) ? "secondary" : "default"}
                            disabled={n.seen || seenIds.has(n.attendance_info_id) || pendingIds.has(n.attendance_info_id)}
                            onClick={(e) => handleMarkAsSeen(e, n.attendance_info_id)}
                            className="w-20"
                          >
                            {pendingIds.has(n.attendance_info_id) ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (n.seen || seenIds.has(n.attendance_info_id)) ? (
                              <><CheckCircle2 className="w-3 h-3 mr-1" /> Done</>
                            ) : (
                              'Done'
                            )}
                          </Button>
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
        isOpen={!!selectedEnrollment}
        onClose={() => setSelectedEnrollment(null)}
        enrollmentId={selectedEnrollment?.id || null}
        studentName={selectedEnrollment?.name || ''}
      />
    </DashboardLayout>
  );
}

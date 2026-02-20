'use client';

import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import { notificationService, GetNotificationsParams } from '@/services/notificationService';
import { adminPanelService } from '@/services/adminPanelService';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDebounce } from '@/hooks/useDebounce';
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
import { cn } from '@/lib/utils';
import { Filter, RefreshCcw, Bell, Loader2, BellOff, Search as SearchIcon, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { EmptyState } from '@/components/EmptyState';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

function AttendanceNotificationsContent() {
  const { toast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState({
    stYear: searchParams.get('st_year_id') || 'all',
    major: searchParams.get('major_id') || 'all',
    absence: searchParams.get('absence_greater_than') || '',
  });

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const params = useMemo<GetNotificationsParams>(() => ({
    st_year_id: filters.stYear === 'all' ? undefined : filters.stYear,
    major_id: filters.major === 'all' ? undefined : filters.major,
    absence_greater_than: filters.absence ? parseInt(filters.absence) : undefined,
  }), [filters.stYear, filters.major, filters.absence]);

  const [selectedEnrollment, setSelectedEnrollment] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: years } = useQuery({
    queryKey: ['student-years'],
    queryFn: adminPanelService.getStudentYears,
    staleTime: 5 * 60 * 1000,
  });

  const { data: majors } = useQuery({
    queryKey: ['majors'],
    queryFn: adminPanelService.getMajors,
    staleTime: 5 * 60 * 1000,
  });

  const { data: rawNotifications, isLoading } = useQuery({
    queryKey: ['notifications', params],
    queryFn: () => notificationService.getNotifications(params),
    placeholderData: keepPreviousData,
  });

  const notifications = useMemo(() => {
    const list = Array.isArray(rawNotifications) ? rawNotifications : [];
    if (!debouncedSearchTerm) return list;

    const s = debouncedSearchTerm.toLowerCase();
    return list.filter(n =>
      (n.student_id || "").toLowerCase().includes(s) ||
      (`${n.first_name || ""} ${n.last_name || ""}`).toLowerCase().includes(s)
    );
  }, [rawNotifications, debouncedSearchTerm]);

  const [seenIds, setSeenIds] = useState<Set<string>>(new Set());
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  const seenMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsSeen(id),
    onMutate: async (id) => {
      setPendingIds(prev => new Set(prev).add(id));
      // Optimistic update
      setSeenIds(prev => new Set(prev).add(id));
    },
    onSuccess: () => {
      toast({
        title: 'Marked as seen',
        description: 'The notification has been updated.',
      });
    },
    onError: (error, id) => {
      // Revert on error
      setSeenIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
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
    setSearchTerm('');
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
    seenMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Notifications</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-slate-900">
            <Bell className="w-8 h-8 text-blue-600" />
            Attendance Notifications
          </h1>
          <p className="text-muted-foreground mt-1 font-bold text-slate-500">
            Total: {notifications.length} students
          </p>
        </div>
      </div>

      <Card className="rounded-2xl shadow-sm border-slate-200 overflow-hidden bg-white">
        <CardHeader className="pb-4 border-b bg-slate-50/50">
          <CardTitle className="text-base font-bold flex items-center gap-2 text-slate-800 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-500" />
            Control Center
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
            <div className="space-y-2 col-span-1 md:col-span-1">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.1em] ml-1">Search Database</label>
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="ID or Name..."
                  className="pl-9 h-11 rounded-xl border-slate-200 focus:ring-blue-500 bg-slate-50/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.1em] ml-1">Academic Year</label>
              <Select
                value={filters.stYear}
                onValueChange={(v) => setFilters({ ...filters, stYear: v })}
              >
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50">
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
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
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.1em] ml-1">Student Major</label>
              <Select
                value={filters.major}
                onValueChange={(v) => setFilters({ ...filters, major: v })}
              >
                <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50">
                  <SelectValue placeholder="All Majors" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
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
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.1em] ml-1">Absence &gt;</label>
              <Input
                type="number"
                placeholder="0"
                className="h-11 rounded-xl border-slate-200 bg-slate-50/50"
                value={filters.absence}
                onChange={(e) => setFilters({ ...filters, absence: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleApplyFilters} className="flex-1 h-11 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 shadow-md transition-all active:scale-95">
                Apply Filters
              </Button>
              <Button variant="outline" onClick={handleResetFilters} className="h-11 w-11 p-0 rounded-xl border-slate-200 hover:bg-slate-100">
                <RefreshCcw className="w-4 h-4 text-slate-500" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl shadow-md border-slate-200 overflow-hidden bg-white">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-xl" />
              ))}
            </div>
          ) : notifications?.length === 0 ? (
            <div className="py-24">
              <EmptyState
                icon={BellOff}
                title="No notifications found"
                description="There are no attendance alerts for the selected criteria."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent bg-slate-50/80 h-14">
                    <TableHead className="font-black text-slate-600 uppercase text-[11px] tracking-widest pl-6">Student ID</TableHead>
                    <TableHead className="font-black text-slate-600 uppercase text-[11px] tracking-widest">Name</TableHead>
                    <TableHead className="font-black text-slate-600 uppercase text-[11px] tracking-widest">Group/Major</TableHead>
                    <TableHead className="font-black text-slate-600 uppercase text-[11px] tracking-widest">Subject</TableHead>
                    <TableHead className="text-center font-black text-slate-600 uppercase text-[11px] tracking-widest">Att.</TableHead>
                    <TableHead className="text-center font-black text-red-600 uppercase text-[11px] tracking-widest">Abs.</TableHead>
                    <TableHead className="text-center font-black text-amber-600 uppercase text-[11px] tracking-widest">Late</TableHead>
                    <TableHead className="text-right pr-8 font-black text-slate-600 uppercase text-[11px] tracking-widest">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notifications.map((n) => (
                    <TableRow
                      key={`${n.enrollment_id}-${n.attendance_info_id}`}
                      className={cn(
                        "cursor-pointer transition-colors border-b border-slate-50 h-16",
                        (n.seen || seenIds.has(n.attendance_info_id)) ? "opacity-40 grayscale-[0.5] bg-slate-50/50" : "hover:bg-slate-50/50"
                      )}
                      onClick={() => setSelectedEnrollment({
                        id: n.enrollment_id,
                        name: `${n.first_name} ${n.last_name}`
                      })}
                    >
                      <TableCell className="font-mono text-xs font-black text-blue-600 pl-6">
                        {n.student_id}
                      </TableCell>
                      <TableCell className="font-bold text-slate-900 whitespace-nowrap">
                        {n.first_name} {n.last_name}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        <div className="text-xs font-bold text-slate-700">{n.group_name}</div>
                        <div className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">{n.major}</div>
                      </TableCell>
                      <TableCell className="max-w-[200px]">
                        <div className="font-bold text-slate-800 text-sm truncate">{n.subject_name}</div>
                        <div className="text-[10px] text-slate-400 truncate font-semibold">Prof: {n.prof_name}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-black text-green-600">{n.total_attendance?.attendance ?? 0}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-black text-red-600">{n.total_attendance?.absence ?? 0}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="font-black text-amber-500">{n.total_attendance?.late ?? 0}</span>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        <Button
                          size="sm"
                          variant={(n.seen || seenIds.has(n.attendance_info_id)) ? "secondary" : "default"}
                          disabled={n.seen || seenIds.has(n.attendance_info_id) || pendingIds.has(n.attendance_info_id)}
                          onClick={(e) => handleMarkAsSeen(e, n.attendance_info_id)}
                          className={cn(
                            "h-8 min-w-[90px] font-black text-[10px] uppercase tracking-widest rounded-full shadow-sm",
                            !(n.seen || seenIds.has(n.attendance_info_id)) && "bg-blue-600 hover:bg-blue-700"
                          )}
                        >
                          {pendingIds.has(n.attendance_info_id) ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (n.seen || seenIds.has(n.attendance_info_id)) ? (
                            <><CheckCircle2 className="w-3 h-3 mr-1" /> Done ✓</>
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

      <StudentEnrollmentModal
        isOpen={!!selectedEnrollment}
        onClose={() => setSelectedEnrollment(null)}
        enrollmentId={selectedEnrollment?.id || null}
        studentName={selectedEnrollment?.name || ''}
      />
    </div>
  );
}

export default function AttendanceNotificationsPage() {
  return (
    <DashboardLayout>
      <Suspense fallback={
        <div className="space-y-6 p-8">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-[500px] w-full rounded-2xl" />
        </div>
      }>
        <AttendanceNotificationsContent />
      </Suspense>
    </DashboardLayout>
  );
}

'use client';

import { useQuery } from '@tanstack/react-query';
import { attendanceService } from '@/services/attendanceService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { User, Calendar, CheckCircle2, XCircle, Clock, Phone, Send, BookOpen } from 'lucide-react';

import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface StudentEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  enrollmentId: string | null;
  studentName: string;
  allEnrollments?: { id: string; label: string }[];
}

export function StudentEnrollmentModal({
  isOpen,
  onClose,
  enrollmentId: initialEnrollmentId,
  studentName,
  allEnrollments = [],
}: StudentEnrollmentModalProps) {
  const { toast } = useToast();
  const [activeEnrollmentId, setActiveEnrollmentId] = useState<string | null>(initialEnrollmentId);

  useEffect(() => {
    setActiveEnrollmentId(initialEnrollmentId);
  }, [initialEnrollmentId, isOpen]);

  const { data: detail, isLoading, isError, error } = useQuery({
    queryKey: ['student-by-enrollment', activeEnrollmentId],
    queryFn: () => attendanceService.getStudentByEnrollment(activeEnrollmentId!),
    enabled: isOpen && !!activeEnrollmentId,
  });


  useEffect(() => {
    if (isError) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: (error as any)?.response?.data?.detail || 'Failed to load enrollment details',
      });
    }
  }, [isError, error, toast]);

  const selectedEnrollment = useMemo(() => {
    if (!detail?.student?.enrollments) return null;
    return detail.student.enrollments.find(e => e.id === activeEnrollmentId) || detail.student.enrollments[0];
  }, [detail, activeEnrollmentId]);

  const studentInfo = detail?.student;
  const subjectInfo = detail?.subject;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 pb-4 border-b bg-slate-50/50">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-3">
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold flex items-center gap-2 text-slate-900">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <User className="w-5 h-5" />
                  </div>
                  {studentInfo?.name || studentName}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                  <span className="font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-bold border border-blue-100">
                    {studentInfo?.student_id || 'ID N/A'}
                  </span>
                  {studentInfo?.phone && (
                    <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {studentInfo.phone}
                    </span>
                  )}
                  {studentInfo?.telegram_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-3 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 flex items-center gap-1.5 rounded-full"
                      onClick={() => {
                        const id = studentInfo.telegram_id;
                        if (!id) return;
                        const url = isNaN(Number(id))
                          ? `https://t.me/${id.replace('@', '')}`
                          : `https://t.me/user?id=${id}`;
                        window.open(url, '_blank', 'noreferrer');
                      }}
                    >
                      <Send className="w-3.5 h-3.5" />
                      Contact Telegram
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-3 w-full md:w-auto">
              {allEnrollments.length > 1 && (
                <Select
                  value={activeEnrollmentId || ''}
                  onValueChange={setActiveEnrollmentId}
                >
                  <SelectTrigger className="h-9 w-full md:w-56 text-xs bg-white border-slate-200 shadow-sm">
                    <SelectValue placeholder="Select enrollment" />
                  </SelectTrigger>
                  <SelectContent>
                    {allEnrollments.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {subjectInfo && (
                <div className="text-right space-y-1">
                  <div className="flex items-center justify-end gap-1.5 text-slate-800 font-bold text-base">
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    {subjectInfo.subject_name}
                  </div>
                  {subjectInfo.professor_name && (
                    <div className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded inline-block">
                      Professor: {subjectInfo.professor_name}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
            <Skeleton className="h-80 w-full rounded-xl" />
          </div>
        ) : isError ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-10 h-10" />
            </div>
            <p className="text-lg font-bold text-slate-900">Failed to load student details</p>
            <p className="text-slate-500 max-w-xs mx-auto mt-2 text-sm">We couldn't retrieve the attendance data. Please try again or contact support.</p>
            <Button variant="outline" className="mt-6" onClick={onClose}>Close Modal</Button>
          </div>
        ) : selectedEnrollment ? (
          <>
            <div className="px-6 py-4 bg-slate-50 border-b grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:border-green-200 hover:shadow-md">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Attendance</p>
                <p className="text-3xl font-black text-green-600">{selectedEnrollment.attendance ?? 0}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:border-red-200 hover:shadow-md">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Absence</p>
                <p className="text-3xl font-black text-red-600">{selectedEnrollment.absence ?? 0}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-xl border border-slate-200 shadow-sm transition-all hover:border-yellow-200 hover:shadow-md">
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Late</p>
                <p className="text-3xl font-black text-amber-500">{selectedEnrollment.late ?? 0}</p>
              </div>
            </div>

            <ScrollArea className="flex-1 bg-white">
              <Table>
                <TableHeader className="sticky top-0 bg-white/95 backdrop-blur-sm z-10">
                  <TableRow className="border-b border-slate-100 hover:bg-transparent">
                    <TableHead className="pl-6 font-bold text-slate-600 uppercase text-[11px] tracking-wider">Date</TableHead>
                    <TableHead className="font-bold text-slate-600 uppercase text-[11px] tracking-wider">Class Name</TableHead>
                    <TableHead className="text-right pr-6 font-bold text-slate-600 uppercase text-[11px] tracking-wider">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(!selectedEnrollment.exact_info || selectedEnrollment.exact_info.length === 0) ? (
                    <TableRow>
                      <TableCell colSpan={3} className="h-32 text-center text-slate-400 italic">
                        No detailed history found for this enrollment.
                      </TableCell>
                    </TableRow>
                  ) : selectedEnrollment.exact_info.map((info, idx) => (
                    <TableRow
                      key={info.id || idx}
                      className={cn(
                        "border-b border-slate-50 transition-colors",
                        info.late ? "bg-yellow-50/30 hover:bg-yellow-50/50" :
                        info.absence ? "bg-red-50/30 hover:bg-red-50/50" :
                        "hover:bg-slate-50/50"
                      )}
                    >
                      <TableCell className="font-medium pl-6 py-3">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {info.date_of_week}
                        </div>
                      </TableCell>
                      <TableCell className="text-slate-700 font-medium">{info.class_name}</TableCell>
                      <TableCell className="text-right pr-6 py-3">
                        <StatusBadge info={info} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </>
        ) : (
          <div className="p-20 text-center text-slate-400">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 opacity-40" />
            </div>
            No data available for this enrollment.
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({ info }: { info: any }) {
  if (info.late) {
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200 gap-1.5 py-0.5 rounded-full">
        <Clock className="w-3 h-3" />
        Late
      </Badge>
    );
  }
  if (info.absence) {
    return (
      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 gap-1.5 py-0.5 rounded-full">
        <XCircle className="w-3 h-3" />
        Absence
      </Badge>
    );
  }
  if (info.attendance) {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 gap-1.5 py-0.5 rounded-full">
        <CheckCircle2 className="w-3 h-3" />
        Attendance
      </Badge>
    );
  }
  return <Badge variant="outline" className="rounded-full">Unknown</Badge>;
}

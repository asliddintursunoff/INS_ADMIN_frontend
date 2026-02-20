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
      <DialogContent className="max-w-[980px] w-[95vw] max-h-[85vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <DialogHeader className="p-8 pb-6 border-b bg-slate-50/50">
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <DialogTitle className="text-3xl font-bold flex items-center gap-3 text-slate-900">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                    <User className="w-6 h-6" />
                  </div>
                  {studentInfo?.name || studentName}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                  <span className="font-mono bg-blue-50 text-blue-700 px-3 py-1 rounded-lg font-bold border border-blue-100 shadow-sm">
                    {studentInfo?.student_id || 'ID N/A'}
                  </span>
                  {studentInfo?.phone && (
                    <span className="flex items-center gap-2 text-slate-600 font-semibold">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {studentInfo.phone}
                    </span>
                  )}
                  {studentInfo?.telegram_id && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-4 text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 flex items-center gap-2 rounded-full font-bold shadow-sm transition-all"
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
                  <SelectTrigger className="h-10 w-full md:w-64 text-sm bg-white border-slate-200 shadow-sm rounded-xl">
                    <SelectValue placeholder="Select enrollment" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {allEnrollments.map((e) => (
                      <SelectItem key={e.id} value={e.id} className="rounded-lg">
                        {e.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {subjectInfo && (
                <div className="text-right space-y-1">
                  <div className="flex items-center justify-end gap-2 text-slate-800 font-extrabold text-lg">
                    <BookOpen className="w-5 h-5 text-slate-500" />
                    {subjectInfo.subject_name}
                  </div>
                  {subjectInfo.professor_name && (
                    <div className="text-xs text-slate-500 font-bold bg-slate-100 px-3 py-1 rounded-full inline-block border border-slate-200">
                      Professor: {subjectInfo.professor_name}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-8">
          <div className="space-y-8 pb-4">
            {isLoading ? (
              <div className="space-y-8">
                <div className="grid grid-cols-3 gap-6">
                  <Skeleton className="h-28 w-full rounded-2xl" />
                  <Skeleton className="h-28 w-full rounded-2xl" />
                  <Skeleton className="h-28 w-full rounded-2xl" />
                </div>
                <Skeleton className="h-96 w-full rounded-2xl" />
              </div>
            ) : isError ? (
              <div className="py-20 text-center bg-red-50 rounded-2xl border border-red-100 m-4">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-10 h-10" />
                </div>
                <p className="text-xl font-bold text-slate-900">Failed to load student details</p>
                <p className="text-slate-500 max-w-xs mx-auto mt-2 font-medium">We couldn't retrieve the attendance data. Please try again or contact support.</p>
                <Button variant="outline" className="mt-8 rounded-xl font-bold" onClick={onClose}>Close Modal</Button>
              </div>
            ) : selectedEnrollment ? (
              <>
                <div className="grid grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-green-200 hover:shadow-md group">
                    <p className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-black mb-2 group-hover:text-green-500">Attendance</p>
                    <p className="text-4xl font-black text-green-600">{selectedEnrollment.attendance ?? 0}</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-red-200 hover:shadow-md group">
                    <p className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-black mb-2 group-hover:text-red-500">Absence</p>
                    <p className="text-4xl font-black text-red-600">{selectedEnrollment.absence ?? 0}</p>
                  </div>
                  <div className="text-center p-6 bg-white rounded-2xl border border-slate-100 shadow-sm transition-all hover:border-yellow-200 hover:shadow-md group">
                    <p className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-black mb-2 group-hover:text-amber-500">Late</p>
                    <p className="text-4xl font-black text-amber-500">{selectedEnrollment.late ?? 0}</p>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                  <Table>
                    <TableHeader className="bg-slate-50/80">
                      <TableRow className="border-b border-slate-200 hover:bg-transparent">
                        <TableHead className="pl-6 font-black text-slate-500 uppercase text-[11px] tracking-widest h-12">Date</TableHead>
                        <TableHead className="font-black text-slate-500 uppercase text-[11px] tracking-widest h-12">Class Name</TableHead>
                        <TableHead className="text-right pr-6 font-black text-slate-500 uppercase text-[11px] tracking-widest h-12">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(!selectedEnrollment.exact_info || selectedEnrollment.exact_info.length === 0) ? (
                        <TableRow>
                          <TableCell colSpan={3} className="h-40 text-center text-slate-400 italic font-medium">
                            No detailed history found for this enrollment.
                          </TableCell>
                        </TableRow>
                      ) : selectedEnrollment.exact_info.map((info, idx) => (
                        <TableRow
                          key={info.id || idx}
                          className={cn(
                            "border-b border-slate-100 transition-colors h-14",
                            info.late ? "bg-yellow-50/40 hover:bg-yellow-50/60" :
                            info.absence ? "bg-red-50/40 hover:bg-red-50/60" :
                            "hover:bg-slate-50/30"
                          )}
                        >
                          <TableCell className="font-bold pl-6 py-4">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-slate-400" />
                              <span className="text-slate-700">{info.date_of_week}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 font-bold">{info.class_name}</TableCell>
                          <TableCell className="text-right pr-6 py-4">
                            <StatusBadge info={info} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Calendar className="w-8 h-8 opacity-20" />
                </div>
                <p className="font-bold text-slate-500">No data available for this enrollment.</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function StatusBadge({ info }: { info: any }) {
  if (info.late) {
    return (
      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200 gap-2 py-1 px-3 rounded-full font-black text-[10px] uppercase shadow-sm">
        <Clock className="w-3 h-3" />
        Late
      </Badge>
    );
  }
  if (info.absence) {
    return (
      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 gap-2 py-1 px-3 rounded-full font-black text-[10px] uppercase shadow-sm">
        <XCircle className="w-3 h-3" />
        Absence
      </Badge>
    );
  }
  if (info.attendance) {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 gap-2 py-1 px-3 rounded-full font-black text-[10px] uppercase shadow-sm">
        <CheckCircle2 className="w-3 h-3" />
        Attendance
      </Badge>
    );
  }
  return <Badge variant="outline" className="rounded-full py-1 px-3 font-bold text-[10px] uppercase">Unknown</Badge>;
}

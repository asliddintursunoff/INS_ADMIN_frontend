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
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div className="space-y-1">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                {studentInfo?.name || studentName}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="font-mono">{studentInfo?.id}</span>
                {studentInfo?.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    {studentInfo.phone}
                  </span>
                )}
                {studentInfo?.telegram_id && (
                  <Button
                    variant="link"
                    className="h-auto p-0 text-blue-600 flex items-center gap-1 hover:no-underline"
                    onClick={() => {
                      const id = studentInfo.telegram_id;
                      const url = isNaN(Number(id))
                        ? `https://t.me/${id?.replace('@', '')}`
                        : `https://t.me/${id}`;
                      window.open(url, '_blank', 'noreferrer');
                    }}
                  >
                    <Send className="w-3.5 h-3.5" />
                    Telegram
                  </Button>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 w-full md:w-auto">
              {allEnrollments.length > 1 && (
                <Select
                  value={activeEnrollmentId || ''}
                  onValueChange={setActiveEnrollmentId}
                >
                  <SelectTrigger className="h-9 w-full md:w-48 text-xs">
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
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1.5 text-slate-700 font-semibold text-sm">
                    <BookOpen className="w-3.5 h-3.5" />
                    {subjectInfo.subject_name}
                  </div>
                  {subjectInfo.professor_name && (
                    <div className="text-xs text-muted-foreground">
                      Prof: {subjectInfo.professor_name}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-600 bg-red-50 rounded-lg m-6 border border-red-100">
            <XCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="font-bold">Failed to load student details</p>
            <p className="text-sm opacity-70">Please try again later or contact support.</p>
          </div>
        ) : selectedEnrollment ? (
          <>
            <div className="px-6 py-4 bg-slate-50 border-b grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded-lg border shadow-sm">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Attendance</p>
                <p className="text-2xl font-bold text-green-600">{selectedEnrollment.attendance ?? 0}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border shadow-sm">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Absence</p>
                <p className="text-2xl font-bold text-red-600">{selectedEnrollment.absence ?? 0}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border shadow-sm">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Late</p>
                <p className="text-2xl font-bold text-amber-600">{selectedEnrollment.late ?? 0}</p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-0">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="pl-6">Date</TableHead>
                    <TableHead>Class Name</TableHead>
                    <TableHead className="text-right pr-6">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(selectedEnrollment.exact_info || []).map((info) => (
                    <TableRow key={info.id}>
                      <TableCell className="font-medium pl-6">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {info.date_of_week}
                        </div>
                      </TableCell>
                      <TableCell>{info.class_name}</TableCell>
                      <TableCell className="text-right pr-6">
                        <StatusBadge info={info} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </>
        ) : (
          <div className="p-12 text-center text-muted-foreground">
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
      <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-200 gap-1">
        <Clock className="w-3 h-3" />
        Late
      </Badge>
    );
  }
  if (info.absence) {
    return (
      <Badge variant="outline" className="bg-red-100 text-red-700 border-red-200 gap-1">
        <XCircle className="w-3 h-3" />
        Absence
      </Badge>
    );
  }
  if (info.attendance) {
    return (
      <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 gap-1">
        <CheckCircle2 className="w-3 h-3" />
        Attendance
      </Badge>
    );
  }
  return <Badge variant="outline">Unknown</Badge>;
}

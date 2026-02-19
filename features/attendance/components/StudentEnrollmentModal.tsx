'use client';

import { useQuery } from '@tanstack/react-query';
import { attendanceService } from '@/services/attendanceService';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import { User, Calendar, CheckCircle2, XCircle, Clock, BookOpen } from 'lucide-react';

import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
    queryKey: ['enrollment-detail', activeEnrollmentId],
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

  const displayName = detail?.student
    ? `${detail.student.first_name} ${detail.student.last_name}`
    : studentName;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <div className="flex justify-between items-start pr-8">
            <div className="space-y-1">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <User className="w-6 h-6 text-blue-600" />
                {displayName}
              </DialogTitle>
              {detail?.subject && (
                <div className="flex flex-col gap-1">
                  <DialogDescription className="flex items-center gap-1.5 text-slate-600 font-medium">
                    <BookOpen className="w-3.5 h-3.5" />
                    {detail.subject.subject_name}
                  </DialogDescription>
                  {detail.subject.professor_name && (
                    <span className="text-xs text-muted-foreground">
                      Professor: {detail.subject.professor_name}
                    </span>
                  )}
                </div>
              )}
              {!detail?.subject && (
                <DialogDescription>
                  Detailed attendance history
                </DialogDescription>
              )}
            </div>
            {allEnrollments.length > 1 && (
              <div className="w-48">
                <Select
                  value={activeEnrollmentId || ''}
                  onValueChange={setActiveEnrollmentId}
                >
                  <SelectTrigger className="h-8 text-xs">
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
              </div>
            )}
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
        ) : detail ? (
          <>
            <div className="px-6 py-4 bg-slate-50 border-y grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded-lg border shadow-sm">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Attendance</p>
                <p className="text-2xl font-bold text-green-600">{detail.summary?.attendance ?? 0}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border shadow-sm">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Absence</p>
                <p className="text-2xl font-bold text-red-600">{detail.summary?.absence ?? 0}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border shadow-sm">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">Late</p>
                <p className="text-2xl font-bold text-amber-600">{detail.summary?.late ?? 0}</p>
              </div>
            </div>

            <ScrollArea className="flex-1 p-6 pt-2">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Class Name</TableHead>
                    <TableHead className="text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(Array.isArray(detail.exact_info) ? detail.exact_info : []).map((info) => (
                    <TableRow key={info?.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {info.date_of_week}
                        </div>
                      </TableCell>
                      <TableCell>{info.class_name}</TableCell>
                      <TableCell className="text-right">
                        <StatusBadge status={info.status} />
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

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'attendance':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
          <CheckCircle2 className="w-3 h-3" />
          Attendance
        </Badge>
      );
    case 'absence':
      return (
        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
          <XCircle className="w-3 h-3" />
          Absence
        </Badge>
      );
    case 'late':
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
          <Clock className="w-3 h-3" />
          Late
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

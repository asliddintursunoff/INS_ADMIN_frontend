'use client';

import { useQuery } from '@tanstack/react-query';
import { superUserService } from '@/services/superUserService';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useState } from 'react';
import { GroupType, AcademicYear } from '@/types';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileDown, Loader2, Info, Beaker, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { EmptyState } from '@/components/EmptyState';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';

export default function MatrixPage() {
  const { toast } = useToast();
  const [program, setProgram] = useState<GroupType>(GroupType.FULL_TIME);
  const [year, setYear] = useState<AcademicYear>(AcademicYear.YEAR_1);
  const [isLoadingExcel, setIsLoadingExcel] = useState(false);

  const { data: matrixData, isLoading, refetch, isError } = useQuery({
    queryKey: ['matrix', program, year],
    queryFn: () => superUserService.getMatrix(program, year),
    enabled: false, // Only load on button click
  });

  const handleDownloadExcel = async () => {
    setIsLoadingExcel(true);
    try {
      const blob = await superUserService.getMatrixExcel(program, year);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `matrix-${program}-${year}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Download failed',
        description: 'Failed to download Excel file.',
      });
    } finally {
      setIsLoadingExcel(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Matrix</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">Matrix View</h1>
              <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200 gap-1">
                <Beaker className="w-3 h-3" /> Experimental
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Academic matrix for programs and years
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-500">Program</label>
                <Select value={program} onValueChange={(v) => setProgram(v as GroupType)}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={GroupType.FULL_TIME}>Full Time</SelectItem>
                    <SelectItem value={GroupType.PART_TIME}>Part Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase text-slate-500">Academic Year</label>
                <Select value={year} onValueChange={(v) => setYear(v as AcademicYear)}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={AcademicYear.YEAR_1}>Year 1</SelectItem>
                    <SelectItem value={AcademicYear.YEAR_2}>Year 2</SelectItem>
                    <SelectItem value={AcademicYear.YEAR_3}>Year 3</SelectItem>
                    <SelectItem value={AcademicYear.YEAR_4}>Year 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => refetch()} disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Load Matrix
                </Button>
                <Button variant="outline" onClick={handleDownloadExcel} disabled={isLoadingExcel}>
                  {isLoadingExcel ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="mr-2 h-4 w-4" />
                  )}
                  Download Excel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-lg border border-dashed">
            <Loader2 className="h-10 w-10 animate-spin text-blue-500 mb-4" />
            <p className="text-slate-500">Generating matrix data...</p>
          </div>
        ) : isError ? (
          <div className="p-12 text-center text-red-600 bg-red-50 rounded-lg border border-red-100">
            Failed to load matrix data. The endpoint might not be available yet.
          </div>
        ) : matrixData ? (
          <Card>
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="text-lg">Matrix Data</CardTitle>
              <CardDescription>
                Preview of the generated matrix for {program} - Year {year}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="w-full">
                <div className="p-6">
                  {/* Generic renderer for unknown matrix shape */}
                  <pre className="text-xs bg-slate-900 text-slate-50 p-4 rounded-lg overflow-auto max-h-[500px]">
                    {JSON.stringify(matrixData, null, 2)}
                  </pre>
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </CardContent>
          </Card>
        ) : (
          <EmptyState
            icon={Database}
            title="Matrix not loaded"
            description="Select program and year then click 'Load Matrix' to view data"
          />
        )}

        <div className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 p-4 rounded-lg border border-amber-100">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <p>
            <strong>Note:</strong> This section is experimental and may be removed or updated in future versions.
            The Excel export provides the full data in a formatted spreadsheet.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

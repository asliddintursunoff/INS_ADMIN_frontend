'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCcw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 text-center bg-white rounded-lg border border-red-100 shadow-sm">
      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-6 h-6 text-red-600" />
      </div>
      <h2 className="text-xl font-bold text-slate-900 mb-2">Something went wrong!</h2>
      <p className="text-slate-500 mb-6 max-w-md">
        An error occurred while loading the students list.
      </p>
      <Button onClick={() => reset()} className="gap-2">
        <RefreshCcw className="w-4 h-4" />
        Try again
      </Button>
    </div>
  );
}

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import axios from 'axios';

export default function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes default
        gcTime: 10 * 60 * 1000,   // 10 minutes
        retry: (failureCount, error: unknown) => {
          // Only retry GET requests and only once
          if (failureCount >= 1) return false;
          if (axios.isAxiosError(error)) {
            return error.config?.method?.toUpperCase() === 'GET';
          }
          return false;
        },
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  );
}

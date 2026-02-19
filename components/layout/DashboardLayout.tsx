'use client';

import { SidebarNav } from './SidebarNav';
import { Topbar } from './Topbar';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth(true);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full">
        <div className="w-64 bg-slate-900 h-full" />
        <div className="flex-1 flex flex-col">
          <header className="h-16 border-b bg-white" />
          <main className="p-6">
            <Skeleton className="h-10 w-1/4 mb-6" />
            <div className="grid grid-cols-3 gap-6">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden">
      <SidebarNav />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

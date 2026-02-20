'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Bell,
  BookOpen,
  Grid3X3,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const items = [
  {
    title: 'Student Years',
    href: '/student-years',
    icon: LayoutDashboard,
  },
  {
    title: 'Attendance Notifications',
    href: '/notifications/attendance',
    icon: Bell,
  },
  {
    title: 'Admins',
    href: '/admins',
    icon: ShieldCheck,
    rootOnly: true,
  },
];

export function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="flex flex-col h-full bg-slate-900 text-white w-64">
      <div className="p-6">
        <h1 className="text-xl font-bold flex items-center gap-2 text-white">
          <BookOpen className="w-6 h-6 text-blue-500" />
          Uni CRM Admin
        </h1>
      </div>
      <nav className="flex-1 px-4 space-y-2">
        {items.map((item) => {
          if (item.rootOnly && !user?.is_root) return null;

          const isActive = pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50 translate-x-1"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-500 group-hover:text-white")} />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-800 bg-slate-900/50">
        <div className="text-[10px] text-slate-500 px-3 uppercase tracking-widest font-black mb-1">
          Authenticated as
        </div>
        <div className="px-3 py-1 font-bold truncate text-slate-200">
          {user?.username}
        </div>
      </div>
    </div>
  );
}

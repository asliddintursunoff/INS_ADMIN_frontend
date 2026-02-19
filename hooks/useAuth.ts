'use client';

import { useQuery } from '@tanstack/react-query';
import { authService } from '@/services/authService';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export function useAuth(requireAuth = true) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { data: user, isLoading, error, refetch } = useQuery({
    queryKey: ['me'],
    queryFn: authService.getMe,
    retry: false,
    enabled: mounted && !!localStorage.getItem('token'),
  });

  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem('token');

    if (requireAuth && !token && pathname !== '/login') {
      router.push('/login');
    }

    if (!requireAuth && token && pathname === '/login' && user) {
      router.push('/student-years');
    }
  }, [user, isLoading, requireAuth, router, pathname]);

  return { user, isLoading, error, refetch };
}

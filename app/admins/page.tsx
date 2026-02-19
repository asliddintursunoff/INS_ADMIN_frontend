'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { superUserService } from '@/services/superUserService';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Trash2, UserPlus, Shield, ShieldAlert, Loader2, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { DataTable } from '@/components/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { SuperUser } from '@/types';

export default function AdminsPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewAdmin, setViewAdmin] = useState<SuperUser | null>(null);

  const { data: admins, isLoading } = useQuery({
    queryKey: ['admins'],
    queryFn: superUserService.getSuperUsers,
    enabled: !!currentUser?.is_root,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => superUserService.deleteSuperUser(id),
    onSuccess: () => {
      toast({ title: 'Admin deleted successfully' });
      queryClient.invalidateQueries({ queryKey: ['admins'] });
      setDeleteId(null);
    },
    onError: (error: unknown) => {
      let description = 'An error occurred';
      if (axios.isAxiosError(error)) {
        description = error.response?.data?.detail || error.message;
      } else if (error instanceof Error) {
        description = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Failed to delete admin',
        description,
      });
    },
  });

  const columns: ColumnDef<SuperUser>[] = [
    {
      accessorKey: 'username',
      header: 'Username',
    },
    {
      id: 'full_name',
      header: 'Full Name',
      cell: ({ row }) => `${row.original.first_name} ${row.original.last_name}`,
    },
    {
      accessorKey: 'telegram_id',
      header: 'Telegram ID',
      cell: ({ row }) => row.original.telegram_id || 'N/A',
    },
    {
      accessorKey: 'is_root',
      header: 'Role',
      cell: ({ row }) => (
        row.original.is_root ? (
          <Badge className="bg-blue-600 gap-1">
            <Shield className="w-3 h-3" /> Root
          </Badge>
        ) : (
          <Badge variant="secondary">Admin</Badge>
        )
      ),
    },
    {
      id: 'actions',
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => setViewAdmin(row.original)}
          >
            <Eye className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={() => setDeleteId(row.original.id)}
            disabled={row.original.id === currentUser?.id}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    },
  ];

  if (currentUser && !currentUser.is_root) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-full text-center">
          <ShieldAlert className="w-16 h-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">Only root administrators can access this section.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbPage>Admins</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admins</h1>
            <p className="text-muted-foreground">Manage administrative accounts</p>
          </div>
          <Link href="/admins/register">
            <Button className="gap-2">
              <UserPlus className="w-4 h-4" />
              Register New Admin
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <DataTable columns={columns} data={admins || []} searchKey="username" />
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!viewAdmin} onOpenChange={() => setViewAdmin(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Admin Details</DialogTitle>
          </DialogHeader>
          {viewAdmin && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Username:</span>
                <span className="col-span-2">{viewAdmin.username}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">First Name:</span>
                <span className="col-span-2">{viewAdmin.first_name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Last Name:</span>
                <span className="col-span-2">{viewAdmin.last_name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Telegram ID:</span>
                <span className="col-span-2">{viewAdmin.telegram_id || 'N/A'}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="font-semibold">Role:</span>
                <span className="col-span-2">
                  {viewAdmin.is_root ? 'Root Administrator' : 'Administrator'}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setViewAdmin(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground py-4">
            This action cannot be undone. This will permanently delete the admin account.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

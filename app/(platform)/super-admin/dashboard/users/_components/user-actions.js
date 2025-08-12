'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MoreHorizontal, UserCheck, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ManageRoleDialog } from './manage-role-dialog';

export function UserActions({ user }) {
  const router = useRouter();
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);

  const handleImpersonate = async () => {
    const promise = fetch('/api/auth/impersonate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId: user.id }),
    }).then(async (response) => {
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to impersonate.');
      }
      return response.json();
    });

    toast.promise(promise, {
      loading: 'Starting impersonation...',
      success: (data) => {
        // Redirect to the school's dashboard on the client side
        window.location.href = data.redirectUrl;
        return `Now impersonating ${user.name || user.email}.`;
      },
      error: (err) => err.message,
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsRoleDialogOpen(true)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Manage Role</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleImpersonate}
            disabled={user.role !== 'ADMIN'}
            className="flex items-center gap-2 cursor-pointer"
          >
            <UserCheck className="h-4 w-4" />
            <span>Impersonate User</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ManageRoleDialog
        user={user}
        open={isRoleDialogOpen}
        onOpenChange={setIsRoleDialogOpen}
      />
    </>
  );
}
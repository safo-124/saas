'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MoreHorizontal, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function UserActions({ user }) {
  const router = useRouter();

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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={handleImpersonate}
          disabled={user.role !== 'ADMIN'} // Only allow impersonating other Admins
          className="flex items-center gap-2"
        >
          <UserCheck className="h-4 w-4" />
          Impersonate User
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { EditStaffDialog } from './edit-staff-dialog';

export function StaffActions({ staffMember }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirmation = confirm(`Are you sure you want to delete ${staffMember.name}?`);
    if (!confirmation) return;

    const promise = fetch(`/api/staff/${staffMember.id}`, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Failed to delete staff member.');
        return res.json();
      });

    toast.promise(promise, {
      loading: 'Deleting...',
      success: () => {
        router.refresh();
        return 'Staff member deleted.';
      },
      error: (err) => err.message,
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={handleDelete} className="text-red-600">Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <EditStaffDialog
        staffMember={staffMember}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
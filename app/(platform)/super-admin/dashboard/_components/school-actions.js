'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EditSchoolDialog } from './edit-school-dialog';

export function SchoolActions({ school, plans }) {
  const router = useRouter();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Handles the deactivation of a school with a confirmation prompt
  const handleDeactivate = async () => {
    const confirmation = confirm(
      `Are you sure you want to deactivate "${school.name}"? This will prevent users from accessing their dashboard.`
    );
    
    if (!confirmation) return;

    const promise = fetch(`/api/schools/${school.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionStatus: 'DEACTIVATED' }),
    }).then(response => {
      if (!response.ok) {
        throw new Error('Failed to deactivate school.');
      }
      router.refresh(); // Refresh page to show the updated status
      return response.json();
    });

    toast.promise(promise, {
      loading: 'Deactivating school...',
      success: 'School has been successfully deactivated.',
      error: 'Error: Could not deactivate school.',
    });
  };

  return (
    <>
      {/* The Dropdown Menu for all actions */}
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
          <DropdownMenuItem asChild>
            <Link href={`/super-admin/dashboard/schools/${school.id}`}>View Details</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
            Edit School
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600 focus:text-red-600"
            onClick={handleDeactivate}
          >
            Deactivate School
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* The Edit Dialog, controlled by state from this component */}
      <EditSchoolDialog
        school={school}
        plans={plans}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
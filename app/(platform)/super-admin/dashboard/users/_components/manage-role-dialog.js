'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Define the roles here to match the Prisma enum
const roles = ["ADMIN", "TEACHER", "HR", "ACCOUNTANT", "LIBRARIAN", "PROCUREMENT_OFFICER"];

export function ManageRoleDialog({ user, open, onOpenChange }) {
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user, open]);

  const handleRoleChange = async () => {
    setIsLoading(true);
    const promise = fetch(`/api/users/${user.id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: selectedRole }),
    }).then(res => {
      if (!res.ok) throw new Error('Failed to update role.');
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Updating role...',
      success: () => {
        onOpenChange(false);
        router.refresh();
        return `Role updated for ${user.name || user.email}.`;
      },
      error: (err) => err.message,
    });

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Role for {user.name || user.email}</DialogTitle>
          <DialogDescription>Assign a new role to this user.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="role-select">User Role</Label>
          <Select id="role-select" value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger>
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              {roles.map(role => (
                <SelectItem key={role} value={role}>{role}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button onClick={handleRoleChange} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
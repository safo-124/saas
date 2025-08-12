'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const roles = ["ADMIN", "TEACHER", "HR", "ACCOUNTANT", "LIBRARIAN", "PROCUREMENT_OFFICER"];

export function EditStaffDialog({ staffMember, open, onOpenChange }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (staffMember) {
      setName(staffMember.name || '');
      setEmail(staffMember.email || '');
      setRole(staffMember.role || '');
    }
  }, [staffMember, open]);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    const promise = fetch(`/api/staff/${staffMember.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, role }),
    }).then(res => {
      if (!res.ok) throw new Error('Failed to update staff member.');
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Saving changes...',
      success: () => {
        onOpenChange(false);
        router.refresh();
        return 'Staff member updated successfully!';
      },
      error: (err) => err.message,
    });

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Edit Staff Member</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-2"><Label>Full Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid gap-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="grid gap-2"><Label>Role</Label>
            <Select value={role} onValueChange={setRole}><SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>{roles.map(r => (<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSaveChanges} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
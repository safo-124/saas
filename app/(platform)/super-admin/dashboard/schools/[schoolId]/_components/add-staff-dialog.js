'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy } from 'lucide-react';

const roles = ["ADMIN", "TEACHER", "HR", "ACCOUNTANT", "LIBRARIAN", "PROCUREMENT_OFFICER"];

export function AddStaffDialog({ schoolId }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Generate a random temporary password when the dialog opens
  useEffect(() => {
    if (open) {
      const tempPassword = Math.random().toString(36).slice(-8);
      setPassword(tempPassword);
    }
  }, [open]);

  const handleCreateUser = async () => {
    setIsLoading(true);
    const promise = fetch(`/api/schools/${schoolId}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    }).then(async res => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create user.');
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Creating new user...',
      success: () => {
        setOpen(false);
        router.refresh(); // Refresh the page to show the new user in the list
        return `User "${name}" created successfully.`;
      },
      error: (err) => err.message,
    });

    setIsLoading(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    toast.success("Temporary password copied to clipboard!");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Staff Member</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>Create a new user account for this school.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2"><Label htmlFor="name">Full Name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid gap-2"><Label htmlFor="email">Email Address</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
          <div className="grid gap-2"><Label htmlFor="role">Role</Label>
            <Select value={role} onValueChange={setRole}><SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>{roles.map(r => (<SelectItem key={r} value={r}>{r}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-2"><Label htmlFor="password">Temporary Password</Label>
            <div className="flex items-center gap-2">
              <Input id="password" value={password} readOnly />
              <Button variant="outline" size="icon" onClick={copyToClipboard}><Copy className="h-4 w-4"/></Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreateUser} disabled={isLoading}>{isLoading ? 'Creating...' : 'Create User'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
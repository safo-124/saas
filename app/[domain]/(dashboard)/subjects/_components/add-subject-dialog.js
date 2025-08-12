'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AddSubjectDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateSubject = async () => {
    setIsLoading(true);
    const promise = fetch(`/api/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, code }),
    }).then(async res => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create subject.');
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Creating new subject...',
      success: () => {
        setOpen(false);
        router.refresh();
        return `Subject "${name}" created successfully.`;
      },
      error: (err) => err.message,
    });

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Add New Subject</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Subject</DialogTitle>
          <DialogDescription>Add a new subject offered by the school.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-2"><Label>Subject Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Physics" /></div>
          <div className="grid gap-2"><Label>Subject Code (Optional)</Label><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g., PHY-101" /></div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreateSubject} disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Subject'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
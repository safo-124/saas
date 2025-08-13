'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AddExamDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateExam = async () => {
    setIsLoading(true);
    const promise = fetch(`/api/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, date }),
    }).then(async res => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create exam.');
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Creating new exam...',
      success: () => {
        setOpen(false);
        router.refresh();
        return `Exam "${name}" created successfully.`;
      },
      error: (err) => err.message,
    });
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Add New Exam</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Exam</DialogTitle>
          <DialogDescription>Create a new examination session for the school.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-2"><Label>Exam Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Mid-Term Exams" /></div>
          <div className="grid gap-2"><Label>Date</Label><Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreateExam} disabled={isLoading}>{isLoading ? 'Creating...' : 'Create Exam'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
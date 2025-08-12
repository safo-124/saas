'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function AssignSubjectDialog({ classId, subjects, teachers }) {
  const [open, setOpen] = useState(false);
  const [subjectId, setSubjectId] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAssignSubject = async () => {
    setIsLoading(true);
    const promise = fetch(`/api/classes/${classId}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectId, teacherId }),
    }).then(async res => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to assign subject.');
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Assigning subject...',
      success: () => {
        setOpen(false);
        router.refresh();
        return `Subject assigned successfully.`;
      },
      error: (err) => err.message,
    });
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Assign Subject</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Subject to Class</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-2"><Label>Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger><SelectValue placeholder="Select a subject" /></SelectTrigger>
              <SelectContent>{subjects.map(s => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}</SelectContent>
            </Select>
          </div>
          <div className="grid gap-2"><Label>Teacher</Label>
            <Select value={teacherId} onValueChange={setTeacherId}>
              <SelectTrigger><SelectValue placeholder="Select a teacher" /></SelectTrigger>
              <SelectContent>{teachers.map(t => (<SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>))}</SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleAssignSubject} disabled={isLoading}>{isLoading ? 'Assigning...' : 'Assign Subject'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function AddStudentDialog({ classes = [] }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [classId, setClassId] = useState('none'); // Default to 'none'
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (open) {
      setName('');
      setStudentId('');
      setClassId('none'); // Reset to 'none' when dialog opens
    }
  }, [open]);

  const handleCreateStudent = async () => {
    setIsLoading(true);
    const promise = fetch(`/api/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        studentId,
        // If 'none' is selected, send null to the API. Otherwise, send the ID.
        classId: classId === 'none' ? null : classId,
      }),
    }).then(async res => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create student.');
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Adding new student...',
      success: () => {
        setOpen(false);
        router.refresh();
        return `Student "${name}" added successfully.`;
      },
      error: (err) => err.message,
    });

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Student</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Student</DialogTitle>
          <DialogDescription>
            Enter the details for the new student.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="student-name">Full Name</Label>
            <Input id="student-name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="student-id">Student ID</Label>
            <Input id="student-id" value={studentId} onChange={(e) => setStudentId(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="class-select">Assign to Class</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger id="class-select">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent>
                {/* Use 'none' as the value for the "Not Assigned" option */}
                <SelectItem value="none">-- Not Assigned --</SelectItem>
                {classes.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreateStudent} disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Student'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
'use client';

import { useState } from 'react';
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

// The list of teachers is passed in as a prop
export function AddClassDialog({ teachers }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [classTeacherId, setClassTeacherId] = useState('none'); // Change #1: Default state
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateClass = async () => {
    setIsLoading(true);
    const promise = fetch(`/api/classes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // Change #2: Convert 'none' back to null for the API
      body: JSON.stringify({ name, classTeacherId: classTeacherId === 'none' ? null : classTeacherId }),
    }).then(async res => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create class.');
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Creating new class...',
      success: () => {
        setOpen(false);
        router.refresh();
        return `Class "${name}" created successfully.`;
      },
      error: (err) => err.message,
    });

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New Class</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Class</DialogTitle>
          <DialogDescription>Enter the details for the new class.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="class-name">Class Name</Label>
            <Input id="class-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Grade 10 - Section A" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="class-teacher">Assign Class Teacher</Label>
            <Select value={classTeacherId} onValueChange={setClassTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {/* Change #3: Use 'none' as the value */}
                <SelectItem value="none">-- None --</SelectItem>
                {teachers.map(teacher => (
                  <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleCreateClass} disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Class'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export function ManageTeacherSubjectsDialog({ teacher, allSubjects, open, onOpenChange }) {
  const [selectedSubjects, setSelectedSubjects] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (teacher) {
      setSelectedSubjects(new Set(teacher.teachableSubjects.map(s => s.id)));
    }
  }, [teacher, open]);

  const onSubjectCheckedChange = (subjectId) => {
    setSelectedSubjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subjectId)) {
        newSet.delete(subjectId);
      } else {
        newSet.add(subjectId);
      }
      return newSet;
    });
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    const promise = fetch(`/api/teachers/${teacher.id}/subjects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subjectIds: Array.from(selectedSubjects) }),
    }).then(res => {
      if (!res.ok) throw new Error('Failed to update subjects.');
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Saving changes...',
      success: () => { onOpenChange(false); router.refresh(); return 'Teacher subjects updated.'; },
      error: (err) => err.message,
    });
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Subjects for {teacher?.name}</DialogTitle>
          <DialogDescription>Select the subjects this teacher is qualified to teach.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4 max-h-80 overflow-y-auto">
          {allSubjects.map(subject => (
            <div key={subject.id} className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100">
              <Checkbox
                id={`subject-${subject.id}`}
                checked={selectedSubjects.has(subject.id)}
                onCheckedChange={() => onSubjectCheckedChange(subject.id)}
              />
              <Label htmlFor={`subject-${subject.id}`} className="font-normal flex-1 cursor-pointer">{subject.name}</Label>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button onClick={handleSaveChanges} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
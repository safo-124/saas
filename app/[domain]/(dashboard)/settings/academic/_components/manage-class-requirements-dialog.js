'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ManageClassRequirementsDialog({ classData, allSubjects, open, onOpenChange }) {
  const [requirements, setRequirements] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (classData) {
      const initialReqs = classData.subjectRequirements.reduce((acc, req) => {
        acc[req.subjectId] = req.periodsPerWeek;
        return acc;
      }, {});
      setRequirements(initialReqs);
    }
  }, [classData, open]);

  const handleRequirementChange = (subjectId, value) => {
    const periods = parseInt(value, 10);
    setRequirements(prev => ({
      ...prev,
      [subjectId]: isNaN(periods) ? 0 : periods,
    }));
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    const requirementsPayload = Object.entries(requirements)
      .filter(([_, periods]) => periods > 0)
      .map(([subjectId, periodsPerWeek]) => ({ subjectId, periodsPerWeek }));

    const promise = fetch(`/api/classes/${classData.id}/requirements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requirementsPayload),
    }).then(res => {
      if (!res.ok) throw new Error('Failed to update requirements.');
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Saving requirements...',
      success: () => { onOpenChange(false); router.refresh(); return 'Class requirements updated.'; },
      error: (err) => err.message,
    });
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Requirements for {classData?.name}</DialogTitle>
          <DialogDescription>Set the number of periods required for each subject per week.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4 max-h-80 overflow-y-auto">
          {allSubjects.map(subject => (
            <div key={subject.id} className="grid grid-cols-3 items-center gap-4">
              <Label className="col-span-2">{subject.name}</Label>
              <Input
                type="number"
                min="0"
                value={requirements[subject.id] || ''}
                onChange={(e) => handleRequirementChange(subject.id, e.target.value)}
                placeholder="Periods/week"
              />
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
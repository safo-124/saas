'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';

export function EditStudentDialog({ student, classes = [], open, onOpenChange }) {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [classId, setClassId] = useState('none');
  // --- New State ---
  const [dob, setDob] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (student) {
      setName(student.name || '');
      setStudentId(student.studentId || '');
      setClassId(student.classId || 'none');
      // --- Pre-fill new fields ---
      setDob(student.dateOfBirth ? format(new Date(student.dateOfBirth), 'yyyy-MM-dd') : '');
      setGuardianName(student.guardianInfo?.name || '');
      setGuardianPhone(student.guardianInfo?.phone || '');
    }
  }, [student, open]);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    const promise = fetch(`/api/students/${student.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        studentId,
        classId,
        // --- Send new data ---
        dateOfBirth: dob ? new Date(dob) : null,
        guardianInfo: { name: guardianName, phone: guardianPhone },
      }),
    }).then(res => {
      if (!res.ok) throw new Error('Failed to update student.');
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Saving changes...',
      success: () => {
        onOpenChange(false);
        router.refresh(); // This will refresh both the main page and the detail page if open
        return 'Student details updated successfully!';
      },
      error: (err) => err.message,
    });
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student Details</DialogTitle>
          <DialogDescription>Make changes to the students profile.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <h4 className="font-semibold text-sm">Academic Details</h4>
          <div className="grid gap-2"><Label>Full Name</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label>Student ID</Label><Input value={studentId} onChange={(e) => setStudentId(e.target.value)} /></div>
            <div className="grid gap-2"><Label>Class</Label>
              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger><SelectValue/></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Not Assigned --</SelectItem>
                  {classes.map(c => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <h4 className="font-semibold text-sm pt-4">Personal Details</h4>
          <div className="grid gap-2"><Label>Date of Birth</Label><Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} /></div>
          <h4 className="font-semibold text-sm pt-4">Guardian Details</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label>Guardian Name</Label><Input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} /></div>
            <div className="grid gap-2"><Label>Guardian Phone</Label><Input value={guardianPhone} onChange={(e) => setGuardianPhone(e.target.value)} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSaveChanges} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
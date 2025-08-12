'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

const daysOfWeek = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

export function AddTimeSlotDialog() {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    data.periodNumber = parseInt(data.periodNumber);
    data.isBreak = data.isBreak === 'on';

    const promise = fetch('/api/timeslots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    }).then(res => {
        if (!res.ok) throw new Error('Failed to create time slot.');
        return res.json();
    });

    toast.promise(promise, {
        loading: 'Creating...',
        success: () => { setOpen(false); router.refresh(); return 'Time slot created.'; },
        error: (err) => err.message,
    });
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button>Add Time Slot</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add New Time Slot</DialogTitle></DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid gap-2"><Label>Day of the Week</Label>
            <Select name="dayOfWeek" required><SelectTrigger><SelectValue/></SelectTrigger>
              <SelectContent>{daysOfWeek.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label>Period Number</Label><Input name="periodNumber" type="number" required /></div>
            <div className="flex items-end gap-2"><Checkbox id="isBreak" name="isBreak" /><Label htmlFor="isBreak">This is a break</Label></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label>Start Time</Label><Input name="startTime" type="time" required /></div>
            <div className="grid gap-2"><Label>End Time</Label><Input name="endTime" type="time" required /></div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
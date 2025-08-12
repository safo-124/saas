'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function EditSchoolDialog({ school, plans = [], open, onOpenChange }) {
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [planId, setPlanId] = useState('none'); // Use 'none' as the default
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (school) {
      setName(school.name);
      setSubdomain(school.subdomain);
      // Change #1: If school.planId is null/undefined, set state to 'none'
      setPlanId(school.planId || 'none');
    }
  }, [school, open]);

  const handleUpdateSchool = async () => {
    setIsLoading(true);
    const promise = fetch(`/api/schools/${school.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        subdomain,
        // Change #2: If state is 'none', send null to the API. Otherwise, send the ID.
        planId: planId === 'none' ? null : planId,
      }),
    }).then(response => {
      if (!response.ok) {
        return response.json().then(err => { throw new Error(err.message || 'Update failed') });
      }
      return response.json();
    });

    toast.promise(promise, {
      loading: 'Saving changes...',
      success: (data) => {
        onOpenChange(false);
        router.refresh();
        return `School "${data.name}" updated successfully.`;
      },
      error: (err) => err.message,
    });
    
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit School Details</DialogTitle>
          <DialogDescription>
            Make changes to the schools information. Click save when youre done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* ... name and subdomain inputs ... */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plan" className="text-right">Plan</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                {/* Change #3: Use 'none' as the value for the "No Plan" item */}
                <SelectItem value="none">-- No Plan (Trial) --</SelectItem>
                {plans.map(plan => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} (${plan.price}/mo)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" onClick={handleUpdateSchool} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
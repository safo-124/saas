'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function EditPlanDialog({ plan, open, onOpenChange }) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [features, setFeatures] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setPrice(String(plan.price));
      setFeatures(plan.features.join('\n'));
      setStatus(plan.status);
    }
  }, [plan, open]);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    const featuresArray = features.split('\n').map(f => f.trim()).filter(f => f);

    const promise = fetch(`/api/plans/${plan.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        price: parseFloat(price),
        features: featuresArray,
        status,
      }),
    }).then(res => {
      if (!res.ok) throw new Error('Failed to update plan.');
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Saving changes...',
      success: () => {
        onOpenChange(false);
        router.refresh();
        return 'Plan updated successfully!';
      },
      error: (err) => err.message,
    });

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Plan</DialogTitle>
          <DialogDescription>Update the details for this subscription plan.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2"><Label htmlFor="name">Plan Name</Label><Input id="name" value={name} onChange={(e) => setName(e.target.value)} /></div>
          <div className="grid gap-2"><Label htmlFor="price">Price</Label><Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
          <div className="grid gap-2"><Label htmlFor="features">Features (one per line)</Label><Textarea id="features" value={features} onChange={(e) => setFeatures(e.target.value)} /></div>
          <div className="grid gap-2"><Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSaveChanges} disabled={isLoading}>{isLoading ? 'Saving...' : 'Save Changes'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
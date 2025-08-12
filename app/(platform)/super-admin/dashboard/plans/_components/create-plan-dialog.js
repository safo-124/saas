'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function CreatePlanDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [features, setFeatures] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreatePlan = async () => {
    setIsLoading(true);
    // Split features by newline and trim whitespace
    const featuresArray = features.split('\n').map(f => f.trim()).filter(f => f);

    const promise = fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, price: parseFloat(price), features: featuresArray }),
    }).then(res => {
      if (!res.ok) throw new Error('Failed to create plan.');
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Creating new plan...',
      success: () => {
        setOpen(false);
        router.refresh();
        return 'New plan created successfully!';
      },
      error: (err) => err.message,
    });

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New Plan</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Subscription Plan</DialogTitle>
          <DialogDescription>
            Define the details for a new plan you can offer to schools.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Plan Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Pro Plan" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="price">Price (per month)</Label>
            <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="e.g., 99.99" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea id="features" value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="Up to 500 students\nEmail support\n..." />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreatePlan} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
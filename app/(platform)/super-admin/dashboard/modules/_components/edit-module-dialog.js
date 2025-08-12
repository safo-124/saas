'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function EditModuleDialog({ module, open, onOpenChange }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (module) {
      setName(module.name);
      setDescription(module.description || '');
    }
  }, [module, open]);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    const promise = fetch(`/api/modules/${module.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description }),
    }).then(res => {
      if (!res.ok) throw new Error('Failed to update module.');
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Saving changes...',
      success: () => {
        onOpenChange(false);
        router.refresh();
        return 'Module updated successfully!';
      },
      error: (err) => err.message,
    });
    
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Module</DialogTitle>
          <DialogDescription>Update the details for this module.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name-edit">Module Name</Label>
            <Input id="name-edit" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="key-edit">Unique Key</Label>
            {/* The key is immutable and cannot be edited */}
            <Input id="key-edit" value={module?.key || ''} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description-edit">Description</Label>
            <Textarea id="description-edit" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSaveChanges} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
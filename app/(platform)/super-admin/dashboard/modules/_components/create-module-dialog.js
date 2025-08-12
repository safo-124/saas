'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export function CreateModuleDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateModule = async () => {
    setIsLoading(true);
    const promise = fetch('/api/modules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, key, description }),
    }).then(res => {
      if (!res.ok) throw new Error('Failed to create module.');
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Creating new module...',
      success: () => {
        setOpen(false);
        router.refresh();
        return 'New module created successfully!';
      },
      error: (err) => err.message,
    });

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Create New Module</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Module</DialogTitle>
          <DialogDescription>
            Define a new module that can be assigned to schools.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Module Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Library Management" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="key">Unique Key</Label>
            <Input id="key" value={key} onChange={(e) => setKey(e.target.value.toUpperCase().replace(/\s+/g, '_'))} placeholder="e.g., LIBRARY_MANAGEMENT" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            {/* This is the corrected line */}
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what this module does." />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreateModule} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Module"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
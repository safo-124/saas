'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from "sonner"; // Importing the toast function from sonner
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddSchoolDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCreateSchool = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/schools', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, subdomain }),
      });

      if (response.ok) {
          setOpen(false); // Close the dialog on success
          setName(''); // Reset form
          setSubdomain(''); // Reset form
          toast.success("School Created!", {
            description: `The school "${name}" is now available.`,
          });
          router.refresh(); // Refresh server component data to show the new school
      } else {
          const errorData = await response.json();
          throw new Error(errorData.message || "An unknown error occurred.");
      }
    } catch (error) {
        toast.error("Creation Failed", {
          description: error.message,
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add New School</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create a New School</DialogTitle>
          <DialogDescription>
            Enter the details for the new school. The subdomain must be unique.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input 
              id="name" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="col-span-3" 
              placeholder="e.g. Greenwood High" 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subdomain" className="text-right">Subdomain</Label>
            <Input 
              id="subdomain" 
              value={subdomain} 
              onChange={(e) => setSubdomain(e.target.value.toLowerCase().trim())} 
              className="col-span-3" 
              placeholder="e.g. greenwood" 
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleCreateSchool} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create School"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
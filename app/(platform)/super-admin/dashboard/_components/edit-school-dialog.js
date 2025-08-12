'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

export function EditSchoolDialog({ school, plans = [], allModules = [], open, onOpenChange }) {
  const [name, setName] = useState('');
  const [subdomain, setSubdomain] = useState('');
  const [planId, setPlanId] = useState('none');
  const [selectedModules, setSelectedModules] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (school) {
      setName(school.name);
      setSubdomain(school.subdomain);
      setPlanId(school.planId || 'none');
      setSelectedModules(new Set(school.modules.map(m => m.id)));
    }
  }, [school, open]);

  const onModuleCheckedChange = (moduleId) => {
    setSelectedModules(prev => {
      const newSet = new Set(prev);
      if (newSet.has(moduleId)) {
        newSet.delete(moduleId);
      } else {
        newSet.add(moduleId);
      }
      return newSet;
    });
  };

  const handleUpdateSchool = async () => {
    setIsLoading(true);
    const promise = fetch(`/api/schools/${school.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        subdomain,
        planId: planId === 'none' ? null : planId,
        moduleIds: Array.from(selectedModules),
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit School Details</DialogTitle>
          <DialogDescription>
            Make changes to the schools information and enabled modules.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="subdomain" className="text-right">Subdomain</Label>
            <Input id="subdomain" value={subdomain} onChange={(e) => setSubdomain(e.target.value.toLowerCase().trim())} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plan" className="text-right">Plan</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger className="col-span-3"><SelectValue placeholder="Select a plan" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- No Plan (Trial) --</SelectItem>
                {plans.map(plan => (<SelectItem key={plan.id} value={plan.id}>{plan.name} (${plan.price}/mo)</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Enabled Modules</Label>
            <div className="p-4 border rounded-md space-y-2 max-h-48 overflow-y-auto">
              {allModules.map(module => (
                <div key={module.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`module-${module.id}`}
                    checked={selectedModules.has(module.id)}
                    onCheckedChange={() => onModuleCheckedChange(module.id)}
                  />
                  <Label htmlFor={`module-${module.id}`} className="font-normal">{module.name}</Label>
                </div>
              ))}
            </div>
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
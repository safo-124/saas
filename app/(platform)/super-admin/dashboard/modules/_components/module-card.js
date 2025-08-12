'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Package, MoreVertical } from "lucide-react";
import { EditModuleDialog } from './edit-module-dialog';

export function ModuleCard({ module }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirmation = confirm(`Are you sure you want to delete the "${module.name}" module? This cannot be undone.`);
    if (!confirmation) return;

    const promise = fetch(`/api/modules/${module.id}`, {
      method: 'DELETE',
    }).then(async (res) => {
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to delete module.');
      }
      return res.json();
    });

    toast.promise(promise, {
      loading: 'Deleting module...',
      success: () => {
        router.refresh();
        return 'Module deleted successfully.';
      },
      error: (err) => err.message,
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Package className="h-8 w-8 text-blue-500" />
              <div>
                <CardTitle>{module.name}</CardTitle>
                <CardDescription>KEY: {module.key}</CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">{module.description}</p>
        </CardContent>
      </Card>

      <EditModuleDialog
        module={module}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
'use client'; // <-- Add this to make the component interactive

import { useState } from 'react'; // <-- Import useState
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Edit } from "lucide-react";
import { Button } from '@/components/ui/button';
import { EditPlanDialog } from './edit-plan-dialog'; // <-- Import the new dialog

export function PlanCard({ plan }) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  return (
    <>
      <Card className={plan.status === 'ARCHIVED' ? 'opacity-60 border-dashed' : ''}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>{plan.name}</CardTitle>
            <Badge variant={plan.status === 'ACTIVE' ? 'default' : 'secondary'}>
              {plan.status}
            </Badge>
          </div>
          <CardDescription>
            <span className="text-3xl font-bold">${String(plan.price)}</span>
            <span className="text-sm text-gray-500"> / month</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">{feature}</span>
              </li>
            ))}
          </ul>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit Plan
          </Button>
        </CardFooter>
      </Card>
      <EditPlanDialog
        plan={plan}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
      />
    </>
  );
}
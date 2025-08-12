'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ManageClassRequirementsDialog } from './manage-class-requirements-dialog';

export function ClassRequirementsTab({ classes, allSubjects }) {
  const [selectedClass, setSelectedClass] = useState(null);

  return (
    <>
      <Table>
        <TableHeader><TableRow><TableHead>Class Name</TableHead><TableHead>Requirements Set</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {classes.map(c => (
            <TableRow key={c.id}>
              <TableCell className="font-medium">{c.name}</TableCell>
              <TableCell>{c.subjectRequirements.length} subject(s)</TableCell>
              <TableCell><Button variant="outline" onClick={() => setSelectedClass(c)}>Manage</Button></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ManageClassRequirementsDialog
        classData={selectedClass}
        allSubjects={allSubjects}
        open={!!selectedClass}
        onOpenChange={() => setSelectedClass(null)}
      />
    </>
  );
}
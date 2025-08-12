'use client';

import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ManageTeacherSubjectsDialog } from './manage-teacher-subjects-dialog';

export function TeacherAssignmentsTab({ teachers, allSubjects }) {
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  return (
    <>
      <Table>
        <TableHeader><TableRow><TableHead>Teacher</TableHead><TableHead>Teachable Subjects</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
        <TableBody>
          {teachers.map(teacher => (
            <TableRow key={teacher.id}>
              <TableCell className="font-medium">{teacher.name}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {teacher.teachableSubjects.map(subject => (
                    <Badge key={subject.id} variant="secondary">{subject.name}</Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Button variant="outline" onClick={() => setSelectedTeacher(teacher)}>
                  Manage Subjects
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ManageTeacherSubjectsDialog
        teacher={selectedTeacher}
        allSubjects={allSubjects}
        open={!!selectedTeacher}
        onOpenChange={() => setSelectedTeacher(null)}
      />
    </>
  );
}
'use client';

import Link from 'next/link'; // <-- Import Link
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StudentActions } from './student-actions';

export function StudentCard({ student, classes }) {
  const initials = student.name?.split(' ').map(n => n[0]).join('') || '?';

  return (
    // The Link component wraps the entire card.
    // We use stopPropagation on the actions menu to prevent the link from firing
    // when the user clicks the actions button.
    <Link href={`/students/${student.id}`} className="block">
      <Card className="hover:shadow-md hover:border-blue-500 transition-all">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${student.name}`} />
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{student.name}</CardTitle>
              <CardDescription>ID: {student.studentId}</CardDescription>
            </div>
          </div>
          <div onClick={(e) => e.stopPropagation()}>
            <StudentActions student={student} classes={classes} />
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
}
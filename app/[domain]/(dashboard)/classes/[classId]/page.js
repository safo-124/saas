import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const prisma = new PrismaClient();

export default async function ClassDetailsPage({ params }) {
  const classDetails = await prisma.class.findUnique({
    where: { id: params.classId, school: { subdomain: params.domain } },
    include: {
      classTeacher: { select: { name: true } },
      students: {
        orderBy: { name: 'asc' },
      },
    },
  });

  if (!classDetails) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{classDetails.name}</h1>
        <p className="text-gray-500">
          Class Teacher: {classDetails.classTeacher?.name || 'Not Assigned'}
        </p>
      </div>

      {/* We will add tabs here in a future step */}

      {/* Student Roster Card */}
      <Card>
        <CardHeader>
          <CardTitle>Student Roster</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Date Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classDetails.students.length > 0 ? (
                classDetails.students.map((student) => {
                  const initials = student.name?.split(' ').map(n => n[0]).join('') || '?';
                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={`https://api.dicebear.com/8.x/initials/svg?seed=${student.name}`} />
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{student.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{student.studentId}</TableCell>
                      <TableCell>{new Date(student.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan="3" className="text-center h-24">
                    No students are enrolled in this class yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
import { PrismaClient } from '@prisma/client';
import { AddSubjectDialog } from './_components/add-subject-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const prisma = new PrismaClient();

export default async function SubjectManagementPage({ params }) {
  const school = await prisma.school.findUnique({
    where: { subdomain: params.domain },
    select: { id: true },
  });

  if (!school) { return <div>School not found.</div>; }

  const subjects = await prisma.subject.findMany({
    where: { schoolId: school.id },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Subject Management</h1>
        <AddSubjectDialog />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader><TableRow><TableHead>Subject Name</TableHead><TableHead>Code</TableHead></TableRow></TableHeader>
          <TableBody>
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>{subject.code}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan="2" className="text-center h-24">No subjects found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
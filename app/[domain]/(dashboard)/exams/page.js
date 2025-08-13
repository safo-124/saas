import { PrismaClient } from '@prisma/client';
import { format } from 'date-fns';
import { AddExamDialog } from './_components/add-exam-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const prisma = new PrismaClient();

export default async function ExamManagementPage({ params }) {
  const school = await prisma.school.findUnique({
    where: { subdomain: params.domain },
    select: { id: true },
  });

  if (!school) { return <div>School not found.</div>; }

  const exams = await prisma.exam.findMany({
    where: { schoolId: school.id },
    orderBy: { date: 'desc' },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Exam Management</h1>
        <AddExamDialog />
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader><TableRow><TableHead>Exam Name</TableHead><TableHead>Date</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {exams.length > 0 ? (
              exams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-medium">{exam.name}</TableCell>
                  <TableCell>{format(new Date(exam.date), 'PPP')}</TableCell>
                  <TableCell>{/* Actions menu will go here */}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow><TableCell colSpan="3" className="text-center h-24">No exams found.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
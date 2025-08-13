import { PrismaClient } from '@prisma/client';
import { AddStudentDialog } from './_components/add-student-dialog';
import { StudentCard } from './_components/student-card';

const prisma = new PrismaClient();

export default async function StudentManagementPage({ params }) {
  const school = await prisma.school.findUnique({
    where: { subdomain: params.domain },
    select: { id: true },
  });

  if (!school) {
    return <div>School not found.</div>;
  }

  // Fetch both students and available classes in parallel
  const [students, classes] = await Promise.all([
    prisma.student.findMany({
      where: { schoolId: school.id },
      orderBy: { name: 'asc' },
    }),
    prisma.class.findMany({
      where: { schoolId: school.id },
      orderBy: { name: 'asc' },
    })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Student Management</h1>
        <AddStudentDialog classes={classes} />
      </div>

      {students.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {students.map((student) => (
            <StudentCard key={student.id} student={student} classes={classes} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-lg text-gray-500">No students found.</p>
          <p className="text-sm text-gray-400">Add a new student to get started.</p>
        </div>
      )}
    </div>
  );
}
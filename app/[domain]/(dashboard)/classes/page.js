import Link from 'next/link';
import { PrismaClient } from '@prisma/client';
import { AddClassDialog } from './_components/add-class-dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { User } from 'lucide-react';

const prisma = new PrismaClient();

export default async function ClassManagementPage({ params }) {
  const school = await prisma.school.findUnique({
    where: { subdomain: params.domain },
    select: { id: true },
  });

  if (!school) {
    return <div>School not found.</div>;
  }

  // Fetch classes and teachers in parallel
  const [classes, teachers] = await Promise.all([
    prisma.class.findMany({
      where: { schoolId: school.id },
      include: {
        classTeacher: { select: { name: true } },
        _count: { select: { students: true } },
      },
      orderBy: { name: 'asc' },
    }),
    prisma.user.findMany({
      where: { schoolId: school.id, role: 'TEACHER' },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Class Management</h1>
        <AddClassDialog teachers={teachers} />
      </div>

      {classes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((c) => (
            // --- THIS IS THE CORRECTED PART ---
            // The <Link> component now directly wraps the <Card>
            // and the `legacyBehavior` prop and `<a>` tag are removed.
            <Link key={c.id} href={`/classes/${c.id}`} className="block">
              <Card className="hover:shadow-lg hover:border-blue-500 transition-all h-full">
                <CardHeader>
                  <CardTitle>{c.name}</CardTitle>
                  <CardDescription>
                    {c._count.students} Student(s)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center text-sm text-gray-500">
                    <User className="h-4 w-4 mr-2" />
                    Class Teacher: {c.classTeacher?.name || 'Not Assigned'}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <p className="text-lg text-gray-500">No classes found.</p>
          <p className="text-sm text-gray-400">Add a new class to get started.</p>
        </div>
      )}
    </div>
  );
}
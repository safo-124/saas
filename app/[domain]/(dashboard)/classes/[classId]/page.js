import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StudentRosterTab } from './_components/student-roster-tab';
import { SubjectAssignmentTab } from './_components/subject-assignment-tab';

const prisma = new PrismaClient();

export default async function ClassDetailsPage({ params }) {
  // Fetch all necessary data in parallel
  const [classDetails, allSubjects, allTeachers] = await Promise.all([
    prisma.class.findUnique({
      where: { id: params.classId, school: { subdomain: params.domain } },
      include: {
        classTeacher: { select: { name: true } },
        students: { orderBy: { name: 'asc' } },
        subjectAssignments: {
          include: { subject: true, teacher: true },
          orderBy: { subject: { name: 'asc' } }
        },
      },
    }),
    prisma.subject.findMany({ where: { school: { subdomain: params.domain } } }),
    prisma.user.findMany({ where: { school: { subdomain: params.domain }, role: 'TEACHER' } }),
  ]);

  if (!classDetails) { notFound(); }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{classDetails.name}</h1>
        <p className="text-gray-500">Class Teacher: {classDetails.classTeacher?.name || 'Not Assigned'}</p>
      </div>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Student Roster</TabsTrigger>
          <TabsTrigger value="subjects">Subjects & Teachers</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <StudentRosterTab students={classDetails.students} />
        </TabsContent>
        <TabsContent value="subjects">
          <SubjectAssignmentTab 
            classId={classDetails.id}
            assignments={classDetails.subjectAssignments} 
            allSubjects={allSubjects}
            allTeachers={allTeachers}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
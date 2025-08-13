import { PrismaClient } from '@prisma/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { AddTimeSlotDialog } from './_components/add-timeslot-dialog';
import { TimeSlotList } from './_components/timeslot-list';
import { TeacherAssignmentsTab } from './_components/teacher-assignments-tab';
import { ClassRequirementsTab } from './_components/class-requirements-tab';
import { GradingSystemTab } from './_components/grading-system-tab';

const prisma = new PrismaClient();

export default async function AcademicSettingsPage({ params }) {
  // Fetch the school record first to get its ID
  const school = await prisma.school.findUnique({
    where: { subdomain: params.domain },
    select: { id: true, gradingSystem: true },
  });

  if (!school) {
    return <div>School not found.</div>;
  }

  // Fetch all other necessary data for the tabs in parallel
  const [timeSlots, teachers, allSubjects, classes] = await Promise.all([
    prisma.timeSlot.findMany({
      where: { schoolId: school.id },
      orderBy: [{ dayOfWeek: 'asc' }, { periodNumber: 'asc' }],
    }),
    prisma.user.findMany({
      where: { schoolId: school.id, role: 'TEACHER' },
      include: { teachableSubjects: { select: { id: true, name: true } } },
    }),
    prisma.subject.findMany({
      where: { schoolId: school.id },
      orderBy: { name: 'asc' },
    }),
    prisma.class.findMany({
      where: { schoolId: school.id },
      include: {
        subjectRequirements: { select: { subjectId: true, periodsPerWeek: true } },
      },
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Academic Settings</h1>

      <Tabs defaultValue="timeslots">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeslots">Time Slots</TabsTrigger>
          <TabsTrigger value="assignments">Teacher Assignments</TabsTrigger>
          <TabsTrigger value="requirements">Class Requirements</TabsTrigger>
          <TabsTrigger value="grading">Grading System</TabsTrigger>
        </TabsList>

        <TabsContent value="timeslots">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Weekly Time Slots</CardTitle>
                <CardDescription>Define the periods for each day of the school week.</CardDescription>
              </div>
              <AddTimeSlotDialog />
            </CardHeader>
            <CardContent>
              <TimeSlotList timeSlots={timeSlots} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assignments">
          <Card>
            <CardHeader>
              <CardTitle>Teacher Subject Assignments</CardTitle>
              <CardDescription>Specify which subjects each teacher is qualified to teach.</CardDescription>
            </CardHeader>
            <CardContent>
              <TeacherAssignmentsTab teachers={teachers} allSubjects={allSubjects} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requirements">
          <Card>
            <CardHeader>
              <CardTitle>Class Subject Requirements</CardTitle>
              <CardDescription>Specify how many periods of each subject are required per week for each class.</CardDescription>
            </CardHeader>
            <CardContent>
              <ClassRequirementsTab classes={classes} allSubjects={allSubjects} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="grading">
           <GradingSystemTab school={school} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { PrismaClient } from '@prisma/client';
import { TimetableViewer } from './_components/timetable-viewer';

const prisma = new PrismaClient();

export default async function TimetablePage({ params }) {
  const school = await prisma.school.findUnique({
    where: { subdomain: params.domain },
    select: { id: true, name: true }, // Get school name for the header
  });

  if (!school) {
    return <div>School not found.</div>;
  }

  // Fetch all necessary data in parallel
  const [classes, teachers, timeSlots, allEntries] = await Promise.all([
    prisma.class.findMany({ where: { schoolId: school.id }, orderBy: { name: 'asc' } }),
    prisma.user.findMany({ where: { schoolId: school.id, role: 'TEACHER' }, orderBy: { name: 'asc' } }),
    prisma.timeSlot.findMany({ where: { schoolId: school.id, isBreak: false }, orderBy: [{ dayOfWeek: 'asc' }, { periodNumber: 'asc' }] }),
    prisma.timetableEntry.findMany({
      where: { schoolId: school.id },
      include: {
        subject: { select: { name: true } },
        teacher: { select: { name: true } },
        class: { select: { name: true } },
        timeSlot: { select: { dayOfWeek: true, periodNumber: true, startTime: true } }
      }
    })
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">
        Timetable for {school.name}
      </h1>
      
      {allEntries.length > 0 ? (
        <TimetableViewer 
          classes={classes}
          teachers={teachers}
          timeSlots={timeSlots}
          allEntries={allEntries}
        />
      ) : (
        <div className="text-center text-gray-500 py-12 border-2 border-dashed rounded-lg">
          <p className="text-lg">No timetable has been generated yet.</p>
          <p className="text-sm">Go to Academic Settings to generate a timetable.</p>
        </div>
      )}
    </div>
  );
}
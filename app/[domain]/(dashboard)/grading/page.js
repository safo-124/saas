import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';
import { MarkEntryForm } from './_components/mark-entry-form';

const prisma = new PrismaClient();

export default async function GradingPage({ params }) {
  const token = cookies().get('auth_token')?.value;
  const { userId, schoolId } = jwtDecode(token);

  const [exams, assignments] = await Promise.all([
    prisma.exam.findMany({ where: { schoolId }, orderBy: { date: 'desc' } }),
    prisma.classSubjectAssignment.findMany({
        where: { teacherId: userId },
        include: { class: true, subject: true }
    }),
  ]);

  // Group assignments by class for the dropdown
  const teacherAssignments = assignments.reduce((acc, assign) => {
    const existing = acc.find(item => item.classId === assign.classId);
    if (existing) {
      existing.subjects.push({ id: assign.subjectId, name: assign.subject.name });
    } else {
      acc.push({ classId: assign.classId, className: assign.class.name, subjects: [{ id: assign.subjectId, name: assign.subject.name }] });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Mark Entry</h1>
      <MarkEntryForm exams={exams} teacherAssignments={teacherAssignments} />
    </div>
  );
}
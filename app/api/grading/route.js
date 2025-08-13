import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request) {
  try {
    // 1. Authenticate the user and get their role and ID
    const tokenCookie = cookies().get('auth_token');
    if (!tokenCookie) { return NextResponse.json({ message: 'Unauthorized' }, { status: 401 }); }

    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    const { userId, schoolId, role } = payload;

    const { examId, subjectId, classId, grades } = await request.json();
    if (!examId || !subjectId || !classId || !grades) {
        return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    
    // 2. Authorize the action based on the user's role
    if (role === 'TEACHER') {
      // If the user is a teacher, they MUST be assigned to this subject for this class.
      const assignment = await prisma.classSubjectAssignment.findFirst({
        where: {
          classId: classId,
          subjectId: subjectId,
          teacherId: userId, // Check if the assignment belongs to this specific teacher
        }
      });
      if (!assignment) {
        return NextResponse.json({ message: 'Forbidden: You are not assigned to teach this subject for this class.' }, { status: 403 });
      }
    } else if (role !== 'ADMIN') {
      // If the user is not an admin or a teacher, deny access.
      return NextResponse.json({ message: 'Forbidden: Insufficient privileges.' }, { status: 403 });
    }
    // If the role is 'ADMIN', they are automatically authorized.

    // 3. Use a transaction to update or create all grades at once
    const transactions = grades.map(grade =>
      prisma.grade.upsert({
        where: {
          studentId_subjectId_examId: {
            studentId: grade.studentId,
            subjectId: subjectId,
            examId: examId,
          }
        },
        update: {
          examMarks: grade.examMarks,
          maxExamMarks: grade.maxExamMarks,
          remarks: grade.remarks,
        },
        create: {
          studentId: grade.studentId,
          subjectId: subjectId,
          examId: examId,
          examMarks: grade.examMarks,
          maxExamMarks: grade.maxExamMarks,
          remarks: grade.remarks,
        }
      })
    );
    
    await prisma.$transaction(transactions);

    return NextResponse.json({ message: 'Grades submitted successfully' });

  } catch (error) {
    console.error('Submit grades error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
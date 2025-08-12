import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request, { params }) {
  try {
    const tokenCookie = cookies().get('auth_token');
    if (!tokenCookie) { return NextResponse.json({ message: 'Unauthorized' }, { status: 401 }); }

    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    if (!payload.schoolId || payload.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const { classId } = params;
    const { subjectId, teacherId } = await request.json();

    if (!subjectId || !teacherId) {
      return NextResponse.json({ message: 'Subject and Teacher are required' }, { status: 400 });
    }

    const assignment = await prisma.classSubjectAssignment.create({
      data: { classId, subjectId, teacherId },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'This subject is already assigned to this class.' }, { status: 409 });
    }
    console.error('Assign subject error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
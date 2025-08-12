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

    const { teacherId } = params;
    const { subjectIds } = await request.json();

    if (!Array.isArray(subjectIds)) {
      return NextResponse.json({ message: 'subjectIds must be an array' }, { status: 400 });
    }

    // Update the many-to-many relationship
    const updatedTeacher = await prisma.user.update({
      where: { id: teacherId, schoolId: payload.schoolId },
      data: {
        teachableSubjects: {
          // `set` replaces all existing connections with the new list
          set: subjectIds.map(id => ({ id })),
        },
      },
    });

    return NextResponse.json(updatedTeacher, { status: 200 });
  } catch (error) {
    console.error('Update teacher subjects error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
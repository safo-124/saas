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
    const requirements = await request.json(); // Expects an array of { subjectId, periodsPerWeek }

    // Use a transaction to delete old requirements and create new ones
    const transaction = await prisma.$transaction([
      // 1. Delete all existing requirements for this class
      prisma.classSubjectRequirement.deleteMany({
        where: { classId: classId },
      }),
      // 2. Create the new requirements
      prisma.classSubjectRequirement.createMany({
        data: requirements.map(req => ({
          classId: classId,
          subjectId: req.subjectId,
          periodsPerWeek: req.periodsPerWeek,
        })),
      }),
    ]);

    return NextResponse.json(transaction, { status: 200 });
  } catch (error) {
    console.error('Update class requirements error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
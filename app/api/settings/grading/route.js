import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request) {
  try {
    // 1. Authenticate and authorize the admin making the request
    const tokenCookie = cookies().get('auth_token');
    if (!tokenCookie) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    if (!payload.schoolId || payload.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }
    const schoolId = payload.schoolId;

    // 2. Get the grading system configuration from the request body
    const gradingSystemConfig = await request.json();

    // You could add validation here to ensure the weightings add up to 100,
    // or that the grade boundaries are logical. For now, we will trust the client.

    // 3. Update the school's record with the new grading system
    const updatedSchool = await prisma.school.update({
      where: {
        id: schoolId,
      },
      data: {
        // The entire configuration is stored in the single JSON field
        gradingSystem: gradingSystemConfig,
      },
    });

    return NextResponse.json({ message: 'Grading system updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Update grading system error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
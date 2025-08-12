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

    // 2. Get the new student's data from the request body
    const body = await request.json();
    const { name, studentId, classId } = body;

    if (!name || !studentId) {
      return NextResponse.json({ message: 'Name and Student ID are required' }, { status: 400 });
    }

    // 3. Check if a student with this ID already exists for this school
    const existingStudent = await prisma.student.findUnique({
      where: { studentId_schoolId: { studentId, schoolId } },
    });
    if (existingStudent) {
      return NextResponse.json({ message: 'A student with this ID already exists.' }, { status: 409 });
    }
    
    // 4. Create the new student, including the optional classId
    const newStudent = await prisma.student.create({
      data: { 
        name, 
        studentId, 
        schoolId,
        classId,
      },
    });

    return NextResponse.json(newStudent, { status: 201 });
  } catch (error) {
    console.error('Create student error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
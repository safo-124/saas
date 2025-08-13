import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

/**
 * A helper function to authorize the request. It verifies the JWT and ensures
 * the user is an ADMIN for a school.
 * @returns {object | null} The JWT payload if authorized, otherwise null.
 */
async function authorizeRequest() {
  const tokenCookie = cookies().get('auth_token');
  if (!tokenCookie) return null;
  try {
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    if (!payload.schoolId || payload.role !== 'ADMIN') return null;
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Handles PATCH requests to update a student's details.
 */
export async function PATCH(request, { params }) {
  const adminPayload = await authorizeRequest();
  if (!adminPayload) {
    return NextResponse.json({ message: 'Forbidden: Insufficient privileges' }, { status: 403 });
  }

  try {
    const { studentId } = params;
    const body = await request.json();
    const { name, studentId: newStudentId, classId, dateOfBirth, guardianInfo } = body;

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (newStudentId !== undefined) dataToUpdate.studentId = newStudentId;
    if (classId !== undefined) dataToUpdate.classId = classId === 'none' ? null : classId;
    if (dateOfBirth !== undefined) dataToUpdate.dateOfBirth = dateOfBirth;
    if (guardianInfo !== undefined) dataToUpdate.guardianInfo = guardianInfo;

    const updatedStudent = await prisma.student.update({
      where: {
        id: studentId,
        schoolId: adminPayload.schoolId, // Security: Ensures admin can only update students in their own school
      },
      data: dataToUpdate,
    });

    return NextResponse.json(updatedStudent, { status: 200 });
  } catch (error) {
    console.error('Update student error:', error);
    if (error.code === 'P2002') { // Handle unique constraint errors (e.g., duplicate studentId)
        return NextResponse.json({ message: 'A student with this ID already exists.'}, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Handles DELETE requests to remove a student record.
 */
export async function DELETE(request, { params }) {
  const adminPayload = await authorizeRequest();
  if (!adminPayload) {
    return NextResponse.json({ message: 'Forbidden: Insufficient privileges' }, { status: 403 });
  }

  try {
    const { studentId } = params;

    await prisma.student.delete({
      where: {
        id: studentId,
        schoolId: adminPayload.schoolId, // Security: Ensures admin can only delete students in their own school
      },
    });

    return NextResponse.json({ message: 'Student deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete student error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

// Helper function to authorize the request
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

// Function to handle PATCH requests (Update)
export async function PATCH(request, { params }) {
  const adminPayload = await authorizeRequest();
  if (!adminPayload) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const { staffId } = params;
    const body = await request.json();
    const { name, email, role } = body;

    const updatedUser = await prisma.user.update({
      where: {
        id: staffId,
        schoolId: adminPayload.schoolId, // Ensure admin can only update users in their own school
      },
      data: { name, email, role },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Update staff error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Function to handle DELETE requests
export async function DELETE(request, { params }) {
  const adminPayload = await authorizeRequest();
  if (!adminPayload) {
    return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  try {
    const { staffId } = params;

    await prisma.user.delete({
      where: {
        id: staffId,
        schoolId: adminPayload.schoolId, // Ensure admin can only delete users in their own school
      },
    });

    return NextResponse.json({ message: 'Staff member deleted' }, { status: 200 });
  } catch (error) {
    console.error('Delete staff error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request, { params }) {
  try {
    const { userId } = params;
    const body = await request.json();
    const { role } = body;

    if (!role) {
      return NextResponse.json({ message: 'Role is required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role },
    });

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error) {
    console.error('Update user role error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
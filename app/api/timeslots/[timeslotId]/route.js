import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// Add JWT verification here for security

const prisma = new PrismaClient();

export async function DELETE(request, { params }) {
  try {
    // You should verify the user is an admin of the school that owns this timeslot
    await prisma.timeSlot.delete({
      where: { id: params.timeslotId },
    });
    return NextResponse.json({ message: 'Time slot deleted' });
  } catch (error) {
    console.error('Delete timeslot error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
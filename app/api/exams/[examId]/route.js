import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
// You would add the same JWT verification here as in the POST route

const prisma = new PrismaClient();

// Function to handle PATCH requests (Update)
export async function PATCH(request, { params }) {
  // Add JWT verification here
  const { examId } = params;
  const { name, date } = await request.json();
  const updatedExam = await prisma.exam.update({
    where: { id: examId },
    data: { name, date: new Date(date) },
  });
  return NextResponse.json(updatedExam);
}

// Function to handle DELETE requests
export async function DELETE(request, { params }) {
    // Add JWT verification here
    const { examId } = params;
    await prisma.exam.delete({
        where: { id: examId },
    });
    return NextResponse.json({ message: 'Exam deleted' });
}
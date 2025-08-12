import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to handle PATCH requests (Update)
export async function PATCH(request, { params }) {
  try {
    const { moduleId } = params;
    const body = await request.json();
    const { name, description } = body;

    const updatedModule = await prisma.module.update({
      where: { id: moduleId },
      data: { name, description },
    });

    return NextResponse.json(updatedModule, { status: 200 });
  } catch (error) {
    console.error('Update module error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Function to handle DELETE requests
export async function DELETE(request, { params }) {
  try {
    const { moduleId } = params;

    await prisma.module.delete({
      where: { id: moduleId },
    });

    return NextResponse.json({ message: 'Module deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Delete module error:', error);
    // Handle case where module is still in use by a school
    if (error.code === 'P2003') {
      return NextResponse.json({ message: 'Cannot delete module as it is currently assigned to one or more schools.' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
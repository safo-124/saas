import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(request, { params }) {
  try {
    const { schoolId } = params;
    const body = await request.json();
    
    const { name, subdomain, subscriptionStatus, planId, moduleIds } = body;

    const dataToUpdate = {};
    if (name !== undefined) dataToUpdate.name = name;
    if (subdomain !== undefined) dataToUpdate.subdomain = subdomain;
    if (subscriptionStatus !== undefined) dataToUpdate.subscriptionStatus = subscriptionStatus;
    if (planId !== undefined) dataToUpdate.planId = planId;
    
    // Handle updating the many-to-many relationship for modules
    if (moduleIds !== undefined) {
      dataToUpdate.modules = {
        // `set` overwrites the existing relations with the new list of IDs
        set: moduleIds.map(id => ({ id: id }))
      };
    }

    if (Object.keys(dataToUpdate).length === 0) {
      return NextResponse.json({ message: 'No fields to update provided' }, { status: 400 });
    }

    if (subdomain) {
      const existingSchool = await prisma.school.findFirst({
        where: {
          subdomain: subdomain,
          id: { not: schoolId },
        },
      });
      if (existingSchool) {
        return NextResponse.json({ message: 'Subdomain is already taken' }, { status: 409 });
      }
    }

    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: dataToUpdate,
      // Include the updated modules in the response
      include: {
        modules: { select: { id: true } },
      }
    });

    return NextResponse.json(updatedSchool, { status: 200 });
  } catch (error) {
    console.error('Update school error:', error);
    if (error.code === 'P2002' && error.meta?.target?.includes('subdomain')) {
      return NextResponse.json({ message: 'Subdomain is already taken' }, { status: 409 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
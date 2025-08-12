// app/api/schools/route.js
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, subdomain } = body;

    if (!name || !subdomain) {
      return NextResponse.json({ message: 'Name and subdomain are required' }, { status: 400 });
    }

    // Check if subdomain is already taken
    const existingSchool = await prisma.school.findUnique({
      where: { subdomain },
    });

    if (existingSchool) {
      return NextResponse.json({ message: 'Subdomain is already taken' }, { status: 409 }); // 409 Conflict
    }

    const school = await prisma.school.create({
      data: {
        name,
        subdomain,
      },
    });

    return NextResponse.json(school, { status: 201 }); // 201 Created
  } catch (error) {
    console.error('Create school error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, key, description } = body;

    if (!name || !key) {
      return NextResponse.json({ message: 'Name and Key are required' }, { status: 400 });
    }

    const newModule = await prisma.module.create({
      data: {
        name,
        key,
        description,
      },
    });

    return NextResponse.json(newModule, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') { // Unique constraint failed
      return NextResponse.json({ message: 'A module with this key already exists.'}, { status: 409 });
    }
    console.error('Create module error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
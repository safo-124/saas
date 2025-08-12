import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request) {
  try {
    const tokenCookie = cookies().get('auth_token');
    if (!tokenCookie) { return NextResponse.json({ message: 'Unauthorized' }, { status: 401 }); }

    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    if (!payload.schoolId || payload.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
    const schoolId = payload.schoolId;

    const body = await request.json();
    const { name, classTeacherId } = body;

    if (!name) { return NextResponse.json({ message: 'Class name is required' }, { status: 400 }); }

    const newClass = await prisma.class.create({
      data: { name, schoolId, classTeacherId },
    });

    return NextResponse.json(newClass, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'A class with this name already exists.' }, { status: 409 });
    }
    console.error('Create class error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
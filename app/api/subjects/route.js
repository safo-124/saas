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
    const { name, code } = body;

    if (!name) { return NextResponse.json({ message: 'Subject name is required' }, { status: 400 }); }

    const newSubject = await prisma.subject.create({
      data: { name, code, schoolId },
    });

    return NextResponse.json(newSubject, { status: 201 });
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ message: 'A subject with this name already exists.' }, { status: 409 });
    }
    console.error('Create subject error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
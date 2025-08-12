import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request) {
  try {
    // 1. Authenticate and authorize the admin making the request
    const tokenCookie = cookies().get('auth_token');
    if (!tokenCookie) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    if (!payload.schoolId || payload.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Forbidden: Insufficient privileges' }, { status: 403 });
    }
    const schoolId = payload.schoolId;

    // 2. Get the new user's data from the request body
    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // 3. Check if user already exists for this school
    const existingUser = await prisma.user.findUnique({
      where: { email_schoolId: { email, schoolId } },
    });
    if (existingUser) {
      return NextResponse.json({ message: 'A user with this email already exists for this school.' }, { status: 409 });
    }
    
    // 4. Create the new user
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await prisma.user.create({
      data: { name, email, password: hashedPassword, role, schoolId },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Create staff error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
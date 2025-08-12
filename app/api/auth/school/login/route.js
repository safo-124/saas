import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, subdomain } = body;

    if (!email || !password || !subdomain) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // 1. Find the school by its subdomain
    const school = await prisma.school.findUnique({ where: { subdomain } });
    if (!school) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // 2. Find the user by email *within that specific school*
    const user = await prisma.user.findUnique({
      where: { email_schoolId: { email, schoolId: school.id } },
    });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // 3. Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // 4. Create a JWT containing user and school info
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role, schoolId: user.schoolId, subdomain: school.subdomain },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    // 5. Set the token in a secure cookie
    cookies().set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    return NextResponse.json({ message: 'Login successful' }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
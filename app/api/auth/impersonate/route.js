import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const prisma = new PrismaClient();
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request) {
  try {
    // 1. Verify the current user is a Super Admin
    const tokenCookie = cookies().get('auth_token');
    if (!tokenCookie) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let superAdminPayload;
    try {
      const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
      if (payload.role !== 'superadmin') {
        return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
      superAdminPayload = payload;
    } catch (err) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    // 2. Get the target user to impersonate
    const { targetUserId } = await request.json();
    if (!targetUserId) {
      return NextResponse.json({ message: 'Target user ID is required' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: { school: true }, // We need the school's subdomain
    });

    if (!targetUser || !targetUser.school) {
      return NextResponse.json({ message: 'Target user or their school not found' }, { status: 404 });
    }

    // 3. Create a new impersonation JWT
    // This token is for the target user but includes who initiated it
    const impersonationToken = jwt.sign(
      {
        // Target user's info
        userId: targetUser.id,
        email: targetUser.email,
        role: targetUser.role,
        schoolId: targetUser.schoolId,
        subdomain: targetUser.school.subdomain,
        // Impersonation tracking info
        impersonatedBy: superAdminPayload.userId, 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' } // Shorter expiry for impersonation tokens
    );

    // 4. Set the original super admin token in a temporary cookie
    // This is how we'll get back to our original session
    cookies().set('original_auth_token', tokenCookie.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });
    
    // 5. Overwrite the main auth_token with the new impersonation token
    cookies().set('auth_token', impersonationToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60, // 1 hour
    });

    // 6. Return the URL to redirect to
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
    const redirectUrl = `${protocol}://${targetUser.school.subdomain}.localhost:3000/dashboard`;

    return NextResponse.json({ redirectUrl });

  } catch (error) {
    console.error('Impersonation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
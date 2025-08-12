import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request) {
  try {
    // 1. Get the original token from the temporary cookie
    const originalTokenCookie = cookies().get('original_auth_token');

    if (!originalTokenCookie) {
      return NextResponse.json({ message: 'No original session found to restore.' }, { status: 400 });
    }

    // 2. Restore the original token as the main auth_token
    cookies().set('auth_token', originalTokenCookie.value, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 60 * 60 * 24, // Reset to 1 day expiry
    });

    // 3. Clear the temporary cookie
    cookies().delete('original_auth_token');

    // 4. Return the redirect URL
    const redirectUrl = new URL('/super-admin/dashboard', request.url).toString();
    return NextResponse.json({ redirectUrl });

  } catch (error) {
    console.error('Stop impersonation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
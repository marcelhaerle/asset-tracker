import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ isLoggedIn: false }, { status: 200 });
    }

    // Return user info without sensitive data
    return NextResponse.json({
      isLoggedIn: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { success: false, message: 'Error checking session' },
      { status: 500 }
    );
  }
}

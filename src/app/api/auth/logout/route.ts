import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    const cookieStore = await cookies();

    const token = cookieStore.get('session')?.value;

    if (token) {
      // Delete the session from the database
      await prisma.session
        .delete({
          where: { token },
        })
        .catch(() => {
          // Ignore errors if session doesn't exist
        });

      // Clear the cookie
      cookieStore.delete('session');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}

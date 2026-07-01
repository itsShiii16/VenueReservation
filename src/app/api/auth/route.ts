import { NextResponse } from 'next/server';
import { getMockDb } from '@/lib/mock-data';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, email, password, userId } = body;

    const db = getMockDb();

    if (action === 'login') {
      let user;
      try {
        user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
        });
      } catch (e) {
        user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
      }

      if (!user || password !== 'password123') {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }

      const response = NextResponse.json({ success: true, user });
      response.cookies.set('vrs_user_id', user.id, {
        path: '/',
        maxAge: 86400,
        sameSite: 'lax',
      });
      return response;
    }

    if (action === 'logout') {
      const response = NextResponse.json({ success: true });
      response.cookies.set('vrs_user_id', '', {
        path: '/',
        maxAge: 0,
      });
      return response;
    }

    if (action === 'me') {
      const userIdFromCookie = req.headers.get('cookie')?.match(/vrs_user_id=([^;]+)/)?.[1];
      if (!userIdFromCookie) {
        return NextResponse.json({ user: null });
      }
      
      let user;
      try {
        user = await prisma.user.findUnique({
          where: { id: userIdFromCookie },
        });
      } catch (e) {
        user = db.users.find((u) => u.id === userIdFromCookie);
      }

      return NextResponse.json({ user: user || null });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

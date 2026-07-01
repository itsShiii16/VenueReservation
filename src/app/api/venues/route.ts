import { NextResponse } from 'next/server';
import { getMockDb } from '@/lib/mock-data';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  const db = getMockDb();
  try {
    const venues = await prisma.venue.findMany({
      where: { isActive: true },
    });
    return NextResponse.json(venues);
  } catch (e) {
    // Graceful fallback to mock data
    return NextResponse.json(db.venues.filter((v) => v.isActive));
  }
}

export async function POST(req: Request) {
  const db = getMockDb();
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    const userId = cookieStore.get('vrs_user_id')?.value || 'user-manager-1';

    let newVenue;
    try {
      newVenue = await prisma.venue.create({
        data: {
          ...body,
          createdById: userId,
        },
      });
    } catch (e) {
      // Fallback
      newVenue = {
        id: `venue-${Date.now()}`,
        ...body,
        isActive: true,
        createdById: userId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.venues.push(newVenue);
      db.save();
    }

    return NextResponse.json({ success: true, venue: newVenue });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

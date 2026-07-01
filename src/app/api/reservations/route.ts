import { NextResponse } from 'next/server';
import { getMockDb } from '@/lib/mock-data';
import { prisma } from '@/lib/prisma';
import { checkScheduleConflict } from '@/lib/conflict-checking';

export async function GET(req: Request) {
  const db = getMockDb();
  const userId = req.headers.get('cookie')?.match(/vrs_user_id=([^;]+)/)?.[1];
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const reservations = await prisma.reservation.findMany({
      where: { clientId: userId },
      include: { venue: true },
    });
    return NextResponse.json(reservations);
  } catch (e) {
    // Fallback
    const clientReservations = db.reservations.filter((r) => r.clientId === userId);
    // Populate venue details
    const populated = clientReservations.map((res) => ({
      ...res,
      venue: db.venues.find((v) => v.id === res.venueId),
    }));
    return NextResponse.json(populated);
  }
}

export async function POST(req: Request) {
  const db = getMockDb();
  const userId = req.headers.get('cookie')?.match(/vrs_user_id=([^;]+)/)?.[1];

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { venueId, startTime, endTime, eventTitle, activityType, expectedAttendees, notes } = body;

    const conflictResult = checkScheduleConflict(venueId, startTime, endTime);
    if (conflictResult.conflict) {
      return NextResponse.json({ error: conflictResult.reason }, { status: 409 });
    }

    let newReservation;
    const refNum = `RES-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      newReservation = await prisma.reservation.create({
        data: {
          referenceNumber: refNum,
          eventTitle,
          activityType,
          expectedAttendees,
          startTime: new Date(startTime),
          endTime: new Date(endTime),
          notes,
          clientId: userId,
          venueId,
        },
      });
    } catch (e) {
      newReservation = {
        id: `res-${Date.now()}`,
        referenceNumber: refNum,
        eventTitle,
        activityType,
        expectedAttendees,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        status: 'UNDER_REVIEW',
        bookingSource: 'CLIENT_SUBMITTED',
        notes,
        clientId: userId,
        venueId,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.reservations.push(newReservation as any);
      db.save();
    }

    return NextResponse.json({ success: true, reservation: newReservation });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

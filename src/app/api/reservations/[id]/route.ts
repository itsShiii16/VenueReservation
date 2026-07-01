import { NextResponse } from 'next/server';
import { getMockDb } from '@/lib/mock-data';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<any> }
) {
  const { id } = await params;
  const db = getMockDb();

  try {
    const reservation = await prisma.reservation.findUnique({
      where: { id },
      include: { venue: true, client: true },
    });
    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }
    return NextResponse.json(reservation);
  } catch (e) {
    const res = db.reservations.find((r) => r.id === id);
    if (!res) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
    }
    
    // Populate
    const populated = {
      ...res,
      venue: db.venues.find((v) => v.id === res.venueId),
      client: db.users.find((u) => u.id === res.clientId),
      requirements: db.requirements.filter((reqItem) => reqItem.reservationId === id),
      logs: db.auditLogs.filter((log) => log.entityId === id && log.entityType === 'Reservation'),
    };
    return NextResponse.json(populated);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<any> }
) {
  const { id } = await params;
  const db = getMockDb();
  const userId = req.headers.get('cookie')?.match(/vrs_user_id=([^;]+)/)?.[1];

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, ...updateData } = body;
    let updated;

    if (action === 'cancel') {
      try {
        updated = await prisma.reservation.update({
          where: { id },
          data: { status: 'CANCELLED' },
        });
      } catch (e) {
        const idx = db.reservations.findIndex((r) => r.id === id);
        if (idx === -1) {
          return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
        }
        db.reservations[idx].status = 'CANCELLED';
        db.reservations[idx].updatedAt = new Date();
        db.save();
        updated = db.reservations[idx];

        // Audit Log
        db.auditLogs.push({
          id: `log-${Date.now()}`,
          action: 'CANCEL_RESERVATION',
          entityType: 'Reservation',
          entityId: id,
          description: `Client requested cancellation for reservation: "${updated.eventTitle}"`,
          userId,
          createdAt: new Date(),
        });
        db.save();
      }
      return NextResponse.json({ success: true, reservation: updated });
    }

    // Default Update
    try {
      updated = await prisma.reservation.update({
        where: { id },
        data: updateData,
      });
    } catch (e) {
      const idx = db.reservations.findIndex((r) => r.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Reservation not found' }, { status: 404 });
      }
      db.reservations[idx] = {
        ...db.reservations[idx],
        ...updateData,
        updatedAt: new Date(),
      };
      db.save();
      updated = db.reservations[idx];
    }

    return NextResponse.json({ success: true, reservation: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

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
    const venue = await prisma.venue.findUnique({
      where: { id },
    });
    if (!venue || !venue.isActive) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }
    return NextResponse.json(venue);
  } catch (e) {
    const venue = db.venues.find((v) => v.id === id && v.isActive);
    if (!venue) {
      return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
    }
    return NextResponse.json(venue);
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<any> }
) {
  const { id } = await params;
  const db = getMockDb();
  try {
    const body = await req.json();
    let updatedVenue;

    try {
      updatedVenue = await prisma.venue.update({
        where: { id },
        data: body,
      });
    } catch (e) {
      const idx = db.venues.findIndex((v) => v.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
      }
      db.venues[idx] = {
        ...db.venues[idx],
        ...body,
        updatedAt: new Date(),
      };
      db.save();
      updatedVenue = db.venues[idx];
    }

    return NextResponse.json({ success: true, venue: updatedVenue });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<any> }
) {
  const { id } = await params;
  const db = getMockDb();
  try {
    let deletedVenue;

    try {
      deletedVenue = await prisma.venue.update({
        where: { id },
        data: { isActive: false },
      });
    } catch (e) {
      const idx = db.venues.findIndex((v) => v.id === id);
      if (idx === -1) {
        return NextResponse.json({ error: 'Venue not found' }, { status: 404 });
      }
      db.venues[idx].isActive = false;
      db.venues[idx].updatedAt = new Date();
      db.save();
      deletedVenue = db.venues[idx];
    }

    return NextResponse.json({ success: true, message: 'Venue soft-removed successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

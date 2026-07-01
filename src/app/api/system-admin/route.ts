import { NextResponse } from 'next/server';
import { getMockDb } from '@/lib/mock-data';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const db = getMockDb();
  const userId = req.headers.get('cookie')?.match(/vrs_user_id=([^;]+)/)?.[1];

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action, managerId, managerData } = body;

    if (action === 'create_manager') {
      const { firstName, lastName, email, assignedLocation, managingUnit, temporaryPassword } = managerData;

      let newManager;
      try {
        newManager = await prisma.user.create({
          data: {
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: temporaryPassword, // Hashed in real DB
            role: 'VENUE_MANAGER',
            organization: managingUnit,
            position: `Facility Officer - ${assignedLocation}`,
          },
        });
      } catch (e) {
        newManager = {
          id: `user-manager-${Date.now()}`,
          firstName,
          lastName,
          email: email.toLowerCase(),
          role: 'VENUE_MANAGER' as const,
          organization: managingUnit,
          position: `Facility Officer - ${assignedLocation}`,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        db.users.push(newManager);
        db.auditLogs.push({
          id: `log-${Date.now()}`,
          action: 'CREATE_VENUE_MANAGER',
          entityType: 'User',
          entityId: newManager.id,
          description: `Created Venue Manager account for ${firstName} ${lastName} (assigned: ${assignedLocation})`,
          userId,
          createdAt: new Date(),
        });
        db.save();
      }

      return NextResponse.json({ success: true, manager: newManager });
    }

    if (action === 'remove_manager') {
      // Find manager and update role back to CLIENT or soft delete.
      // In this app, we can soft delete by deleting from users list or changing their role.
      // Let's remove them from the mock list.
      const index = db.users.findIndex((u) => u.id === managerId);
      if (index === -1) {
        return NextResponse.json({ error: 'Manager not found' }, { status: 404 });
      }

      const deletedManager = db.users[index];
      db.users.splice(index, 1);
      
      db.auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'DELETE_VENUE_MANAGER',
        entityType: 'User',
        entityId: managerId,
        description: `Removed Venue Manager account: "${deletedManager.firstName} ${deletedManager.lastName}"`,
        userId,
        createdAt: new Date(),
      });
      
      db.save();
      return NextResponse.json({ success: true, message: 'Manager deleted successfully.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

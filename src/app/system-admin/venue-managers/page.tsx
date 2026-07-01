'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import SystemAdminLayout from '@/components/layout/SystemAdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getMockDb } from '@/lib/mock-data';
import { User } from '@/types/user';
import { Users, Plus, Trash2, Mail, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

export default function VenueManagersPage() {
  const router = useRouter();
  const [managers, setManagers] = useState<User[]>([]);
  const [removeManagerId, setRemoveManagerId] = useState<string | null>(null);

  const refreshData = () => {
    const db = getMockDb();
    setManagers(db.users.filter((u) => u.role === 'VENUE_MANAGER'));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleRemoveManager = () => {
    if (!removeManagerId) return;
    const db = getMockDb();
    const idx = db.users.findIndex((u) => u.id === removeManagerId);

    if (idx > -1) {
      const removed = db.users[idx];
      db.users.splice(idx, 1);

      db.auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'DELETE_VENUE_MANAGER',
        entityType: 'User',
        entityId: removeManagerId,
        description: `Removed Venue Manager account: "${removed.firstName} ${removed.lastName}"`,
        userId: 'user-admin',
        createdAt: new Date(),
      });

      db.save();
      toast.success('Venue Manager account removed successfully.');
      setRemoveManagerId(null);
      refreshData();
    }
  };

  return (
    <SystemAdminLayout>
      <div className="space-y-6 font-sans">
        <PageHeader
          title="Venue Manager Accounts"
          description="Register and manage facility officers assigned to campus locations and units."
          action={
            <Button
              onClick={() => router.push('/system-admin/venue-managers/new')}
              className="bg-red-800 hover:bg-red-900 text-white font-bold flex items-center gap-1.5"
            >
              <Plus className="h-4.5 w-4.5" /> Add Venue Manager
            </Button>
          }
        />

        {managers.length === 0 ? (
          <div className="border border-dashed border-zinc-300 bg-white p-12 rounded-xl text-center flex flex-col items-center justify-center">
            <Users className="h-10 w-10 text-zinc-400 mb-3" />
            <p className="text-zinc-500 font-medium mb-1">No Venue Managers registered.</p>
            <p className="text-zinc-400 text-xs">Create manager accounts and assign facilities to begin.</p>
          </div>
        ) : (
          <Card className="border border-zinc-200 bg-white rounded-xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-50 border-b border-zinc-200">
                <TableRow>
                  <TableHead className="font-bold text-zinc-800 text-xs uppercase">Manager Name</TableHead>
                  <TableHead className="font-bold text-zinc-800 text-xs uppercase">UP Mail</TableHead>
                  <TableHead className="font-bold text-zinc-800 text-xs uppercase">Managing Unit</TableHead>
                  <TableHead className="font-bold text-zinc-800 text-xs uppercase">Assigned Facility Role</TableHead>
                  <TableHead className="font-bold text-zinc-800 text-xs uppercase text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {managers.map((mgr) => (
                  <TableRow key={mgr.id} className="hover:bg-zinc-50/50">
                    <TableCell className="font-bold text-zinc-900 text-sm">
                      {mgr.firstName} {mgr.lastName}
                    </TableCell>
                    <TableCell className="text-zinc-700 text-xs">
                      <div className="flex items-center gap-1.5 font-mono">
                        <Mail className="h-3.5 w-3.5 text-zinc-400" />
                        <span>{mgr.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-600 text-xs font-semibold">
                      {mgr.organization || 'UP Diliman'}
                    </TableCell>
                    <TableCell className="text-zinc-700 text-xs">
                      <Badge variant="outline" className="bg-zinc-50 border-zinc-250 text-zinc-600 font-sans">
                        {mgr.position || 'Facility Manager'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setRemoveManagerId(mgr.id)}
                        className="h-8 w-8 text-zinc-400 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Remove Manager Dialog */}
        <ConfirmDialog
          isOpen={!!removeManagerId}
          onOpenChange={(open) => !open && setRemoveManagerId(null)}
          title="Remove Venue Manager Account?"
          description="Are you sure you want to delete this Venue Manager? They will lose access to their facility dashboard."
          confirmText="Yes, Remove Manager"
          variant="destructive"
          onConfirm={handleRemoveManager}
        />
      </div>
    </SystemAdminLayout>
  );
}

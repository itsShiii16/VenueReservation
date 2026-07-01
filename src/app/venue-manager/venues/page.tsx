'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMockDb } from '@/lib/mock-data';
import { Venue } from '@/types/venue';
import { getCurrentUserClient } from '@/lib/auth';
import VenueManagerLayout from '@/components/layout/VenueManagerLayout';
import PageHeader from '@/components/shared/PageHeader';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { MapPin, Users, Edit, Trash2, Plus, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ManageVenuesPage() {
  const router = useRouter();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [deleteVenueId, setDeleteVenueId] = useState<string | null>(null);

  const refreshData = () => {
    const user = getCurrentUserClient();
    if (!user) return;

    const db = getMockDb();
    // For mock, list all active venues
    setVenues(db.venues.filter((v) => v.isActive));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const handleDeleteVenue = () => {
    if (!deleteVenueId) return;
    const db = getMockDb();
    const idx = db.venues.findIndex((v) => v.id === deleteVenueId);
    
    if (idx > -1) {
      db.venues[idx].isActive = false;
      db.venues[idx].updatedAt = new Date();

      db.auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'DELETE_VENUE',
        entityType: 'Venue',
        entityId: deleteVenueId,
        description: `Soft deleted venue: "${db.venues[idx].name}"`,
        userId: getCurrentUserClient()?.id || 'user-manager-1',
        createdAt: new Date(),
      });

      db.save();
      toast.success('Venue details deleted successfully.');
      setDeleteVenueId(null);
      refreshData();
    }
  };

  return (
    <VenueManagerLayout>
      <div className="space-y-6 font-sans">
        <PageHeader
          title="Manage Venues"
          description="Create and update university facilities, set pricing rates, and edit checklist requirements."
          action={
            <Button
              onClick={() => router.push('/venue-manager/venues/new')}
              className="bg-red-800 hover:bg-red-900 text-white font-bold flex items-center gap-1.5"
            >
              <Plus className="h-4.5 w-4.5" /> Add New Venue
            </Button>
          }
        />

        {venues.length === 0 ? (
          <div className="border border-dashed border-zinc-300 bg-white p-12 rounded-xl text-center flex flex-col items-center justify-center">
            <Building2 className="h-10 w-10 text-zinc-400 mb-3" />
            <p className="text-zinc-500 font-medium mb-1">No venues created yet.</p>
            <p className="text-zinc-400 text-xs">Create your first campus facility to accept requests.</p>
          </div>
        ) : (
          <Card className="border border-zinc-200 bg-white rounded-xl shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-zinc-50 border-b border-zinc-200">
                <TableRow>
                  <TableHead className="font-bold text-zinc-800 text-xs uppercase">Venue Name</TableHead>
                  <TableHead className="font-bold text-zinc-800 text-xs uppercase">Location</TableHead>
                  <TableHead className="font-bold text-zinc-800 text-xs uppercase">Capacity</TableHead>
                  <TableHead className="font-bold text-zinc-800 text-xs uppercase">Workflow Type</TableHead>
                  <TableHead className="font-bold text-zinc-800 text-xs uppercase">Rate</TableHead>
                  <TableHead className="font-bold text-zinc-800 text-xs uppercase text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {venues.map((venue) => (
                  <TableRow key={venue.id} className="hover:bg-zinc-50/50">
                    <TableCell className="font-bold text-zinc-900 text-sm">{venue.name}</TableCell>
                    <TableCell className="text-zinc-700 text-xs">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{venue.location}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-700 text-xs">
                      <div className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                        <span>{venue.capacity} guests</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-700 text-xs">
                      {venue.allowsPencilBooking ? (
                        <Badge className="bg-amber-50 text-amber-800 border-amber-200 text-[10px] font-bold">
                          Pencil Booking
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-50 text-blue-800 border-blue-200 text-[10px] font-bold">
                          Direct Review
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-zinc-700 font-semibold text-xs font-mono">
                      ₱{venue.defaultRate.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/venue-manager/venues/edit/${venue.id}`)}
                          className="h-8 w-8 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteVenueId(venue.id)}
                          className="h-8 w-8 text-zinc-400 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* Delete Dialog */}
        <ConfirmDialog
          isOpen={!!deleteVenueId}
          onOpenChange={(open) => !open && setDeleteVenueId(null)}
          title="Delete Venue Facility?"
          description="Are you sure you want to delete this venue from directory? This will perform a soft-delete and reject new inquiries."
          confirmText="Yes, Delete Venue"
          variant="destructive"
          onConfirm={handleDeleteVenue}
        />
      </div>
    </VenueManagerLayout>
  );
}

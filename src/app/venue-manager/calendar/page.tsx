'use client';

import React, { useState, useEffect } from 'react';
import VenueManagerLayout from '@/components/layout/VenueManagerLayout';
import PageHeader from '@/components/shared/PageHeader';
import VenueCalendar from '@/components/calendar/VenueCalendar';
import CalendarLegend from '@/components/shared/CalendarLegend';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { getMockDb } from '@/lib/mock-data';
import { Venue, BlockedSlot } from '@/types/venue';
import { Reservation } from '@/types/reservation';
import { checkScheduleConflict } from '@/lib/conflict-checking';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Calendar as CalendarIcon, ShieldAlert, Ban, Clock } from 'lucide-react';

export default function VenueManagerCalendarPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [selectedVenueId, setSelectedVenueId] = useState<string>('');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);

  // Blocking Schedule Form State
  const [isBlockOpen, setIsBlockOpen] = useState(false);
  const [blockDate, setBlockDate] = useState('');
  const [blockStart, setBlockStart] = useState('08:00');
  const [blockEnd, setBlockEnd] = useState('17:00');
  const [blockReason, setBlockReason] = useState('');

  const refreshData = (venueId: string) => {
    if (!venueId) return;
    const db = getMockDb();
    setReservations(db.reservations.filter((r) => r.venueId === venueId));
    setBlockedSlots(db.blockedSlots.filter((b) => b.venueId === venueId));
  };

  useEffect(() => {
    const db = getMockDb();
    const activeVenues = db.venues.filter((v) => v.isActive);
    setVenues(activeVenues);
    if (activeVenues.length > 0) {
      setSelectedVenueId(activeVenues[0].id);
    }
  }, []);

  useEffect(() => {
    refreshData(selectedVenueId);
  }, [selectedVenueId]);

  const handleBlockSchedule = () => {
    if (!selectedVenueId) return;

    if (!blockDate || !blockStart || !blockEnd || !blockReason) {
      toast.error('All block parameters (date, times, reason) are required.');
      return;
    }

    const startStr = `${blockDate}T${blockStart}:00`;
    const endStr = `${blockDate}T${blockEnd}:00`;
    const startTime = new Date(startStr);
    const endTime = new Date(endStr);

    if (startTime >= endTime) {
      toast.error('Block start time must be before end time.');
      return;
    }

    // Check conflict
    const conflictResult = checkScheduleConflict(selectedVenueId, startTime, endTime);
    if (conflictResult.conflict) {
      toast.error(conflictResult.reason || 'Conflict detected. Cannot block schedule.');
      return;
    }

    const db = getMockDb();
    const newBlock: BlockedSlot = {
      id: `block-${Date.now()}`,
      startTime,
      endTime,
      reason: blockReason,
      venueId: selectedVenueId,
      createdById: 'user-manager-1',
      createdAt: new Date(),
    };

    db.blockedSlots.push(newBlock);

    // Audit log
    db.auditLogs.push({
      id: `log-${Date.now()}`,
      action: 'BLOCK_SCHEDULE',
      entityType: 'BlockedSlot',
      entityId: newBlock.id,
      description: `Blocked venue schedule for "${venues.find((v) => v.id === selectedVenueId)?.name}": "${blockReason}"`,
      userId: 'user-manager-1',
      createdAt: new Date(),
    });

    db.save();
    toast.success('Venue schedule blocked successfully.');
    setIsBlockOpen(false);
    
    // Clear inputs
    setBlockReason('');
    
    refreshData(selectedVenueId);
  };

  const selectedVenue = venues.find((v) => v.id === selectedVenueId);

  return (
    <VenueManagerLayout>
      <div className="space-y-6 font-sans">
        <PageHeader
          title="Venue Availability Calendar"
          description="View active reservations and block out time slots for maintenance or university events."
          action={
            <Button
              onClick={() => setIsBlockOpen(true)}
              className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold flex items-center gap-1.5"
            >
              <Ban className="h-4.5 w-4.5" /> Block Schedule Slot
            </Button>
          }
        />

        {/* Dropdown Selection */}
        <div className="max-w-xs space-y-1.5">
          <Label htmlFor="venue-selector" className="text-xs font-bold text-zinc-700 uppercase">
            Select Campus Facility
          </Label>
          <select
            id="venue-selector"
            value={selectedVenueId}
            onChange={(e) => setSelectedVenueId(e.target.value)}
            className="flex h-9 w-full rounded-md border border-zinc-300 bg-white text-zinc-900 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus:outline-none"
          >
            {venues.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.location})
              </option>
            ))}
          </select>
        </div>

        {selectedVenueId ? (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <VenueCalendar
                venueId={selectedVenueId}
                reservations={reservations}
                blockedSlots={blockedSlots}
                isManager={true}
              />
            </div>
            <div className="lg:col-span-1">
              <CalendarLegend />
            </div>
          </div>
        ) : (
          <p className="text-zinc-500 italic">No venue selected or registered.</p>
        )}

        {/* Blocking Dialog Overlay */}
        <ConfirmDialog
          isOpen={isBlockOpen}
          onOpenChange={setIsBlockOpen}
          title="Block Venue Availability"
          description="Designate a specific slot as Blocked / Unavailable. Clients will not be able to request reservations during this period."
          confirmText="Confirm Block"
          variant="maroon"
          onConfirm={handleBlockSchedule}
        >
          <div className="space-y-4 my-4 font-sans text-left">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-700">Block Date</Label>
                <Input
                  type="date"
                  value={blockDate}
                  onChange={(e) => setBlockDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-700">Start Time</Label>
                <Input
                  type="time"
                  value={blockStart}
                  onChange={(e) => setBlockStart(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs font-bold text-zinc-700">End Time</Label>
                <Input
                  type="time"
                  value={blockEnd}
                  onChange={(e) => setBlockEnd(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-zinc-700">Reason / Maintenance Label</Label>
              <Input
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g. Facilities Maintenance, General Cleaning"
              />
            </div>
          </div>
        </ConfirmDialog>
      </div>
    </VenueManagerLayout>
  );
}

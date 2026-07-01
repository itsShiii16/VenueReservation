'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { bookingSchema, BookingInput } from '@/lib/validations/bookingSchema';
import { getMockDb } from '@/lib/mock-data';
import { checkScheduleConflict } from '@/lib/conflict-checking';
import { getCurrentUserClient } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { ReservationStatus } from '@/types/status';

interface AddBookingFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddBookingForm: React.FC<AddBookingFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const router = useRouter();
  const db = getMockDb();
  const user = getCurrentUserClient();

  const venues = db.venues.filter((v) => v.isActive);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      requesterName: '',
      email: '',
      collegeOrOrg: '',
      eventTitle: '',
      activityType: '',
      expectedAttendees: undefined,
      venueId: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '12:00',
      requirementsSubmitted: false,
      notes: '',
    },
  });

  const selectedVenueId = watch('venueId');

  const onSubmit = async (data: BookingInput) => {
    if (!user) {
      toast.error('You must be logged in.');
      return;
    }

    const venue = db.venues.find((v) => v.id === data.venueId);
    if (!venue) {
      toast.error('Invalid venue selection.');
      return;
    }

    // Check capacity limit
    if (data.expectedAttendees > venue.capacity) {
      toast.error(`Attendees exceed venue capacity limit (${venue.capacity} max).`);
      return;
    }

    const startStr = `${data.date}T${data.startTime}:00`;
    const endStr = `${data.date}T${data.endTime}:00`;
    const startTime = new Date(startStr);
    const endTime = new Date(endStr);

    // Conflict Check
    const conflictResult = checkScheduleConflict(data.venueId, startTime, endTime);
    if (conflictResult.conflict) {
      toast.error(conflictResult.reason || 'Conflict detected. The selected slot is unavailable.');
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const refNum = `RES-${data.date.replace(/-/g, '')}-ASS-${Math.floor(100 + Math.random() * 900)}`;
      const reservationId = `res-${Date.now()}`;

      // Create a mock user account for the requester if email doesn't exist
      let requester = db.users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
      if (!requester) {
        requester = {
          id: `user-client-${Date.now()}`,
          firstName: data.requesterName.split(' ')[0] || 'Client',
          lastName: data.requesterName.split(' ').slice(1).join(' ') || 'User',
          email: data.email.toLowerCase(),
          role: 'CLIENT',
          organization: data.collegeOrOrg,
          position: 'Student / Staff',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        db.users.push(requester);
      }

      // Add reservation
      const status = (data.requirementsSubmitted ? 'BOOKED_CONFIRMED' : 'PAYMENT_PENDING') as ReservationStatus;
      const newReservation = {
        id: reservationId,
        referenceNumber: refNum,
        eventTitle: data.eventTitle,
        activityType: data.activityType,
        expectedAttendees: data.expectedAttendees,
        startTime,
        endTime,
        status,
        bookingSource: 'VENUE_MANAGER_ASSISTED' as const,
        notes: data.notes,
        clientId: requester.id,
        venueId: venue.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.reservations.push(newReservation);

      // Create approved requirements checklists
      venue.supplementaryRequirements.forEach((reqName) => {
        db.requirements.push({
          id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          reservationId,
          requirementName: reqName,
          status: data.requirementsSubmitted ? 'Approved' : 'Missing',
          fileName: data.requirementsSubmitted ? 'Assisted_Submission.pdf' : undefined,
          updatedAt: new Date(),
        });
      });

      // Audit log
      db.auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'CREATE_ASSISTED_BOOKING',
        entityType: 'Reservation',
        entityId: reservationId,
        description: `Created assisted booking reservation: "${data.eventTitle}" (${status})`,
        userId: user.id,
        createdAt: new Date(),
      });

      db.save();

      toast.success(`Assisted booking created successfully! Reference: ${refNum}`);
      onSuccess();
      router.refresh();
    } catch (e) {
      toast.error('Failed to create assisted booking.');
    }
  };

  return (
    <Card className="border border-zinc-200 shadow-sm bg-white rounded-xl overflow-hidden font-sans">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Section: Requester details */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-4">
            <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wide">
              Requester Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="requesterName" className="text-xs font-bold text-zinc-700 uppercase">
                  Requester Full Name
                </Label>
                <Input
                  id="requesterName"
                  placeholder="e.g. Juan Dela Cruz"
                  className="bg-white border-zinc-300 rounded-lg text-sm"
                  {...register('requesterName')}
                />
                {errors.requesterName && (
                  <p className="text-xs text-red-600">{errors.requesterName.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold text-zinc-700 uppercase">
                  UP Mail Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="e.g. juan@upd.edu.ph"
                  className="bg-white border-zinc-300 rounded-lg text-sm"
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="collegeOrOrg" className="text-xs font-bold text-zinc-700 uppercase">
                College / Office / Organization
              </Label>
              <Input
                id="collegeOrOrg"
                placeholder="e.g. College of Science Student Council"
                className="bg-white border-zinc-300 rounded-lg text-sm"
                {...register('collegeOrOrg')}
              />
              {errors.collegeOrOrg && (
                <p className="text-xs text-red-600">{errors.collegeOrOrg.message}</p>
              )}
            </div>
          </div>

          {/* Section: Event details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="eventTitle" className="text-xs font-bold text-zinc-700 uppercase">
                Event Title
              </Label>
              <Input
                id="eventTitle"
                placeholder="e.g. CSSC Fellowship Night"
                className="border-zinc-300 rounded-lg text-sm"
                {...register('eventTitle')}
              />
              {errors.eventTitle && <p className="text-xs text-red-600">{errors.eventTitle.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="activityType" className="text-xs font-bold text-zinc-700 uppercase">
                Activity Type
              </Label>
              <Input
                id="activityType"
                placeholder="e.g. Social Gathering"
                className="border-zinc-300 rounded-lg text-sm"
                {...register('activityType')}
              />
              {errors.activityType && (
                <p className="text-xs text-red-600">{errors.activityType.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="venueId" className="text-xs font-bold text-zinc-700 uppercase">
                Select Venue
              </Label>
              <select
                id="venueId"
                className="flex h-9 w-full rounded-md border border-zinc-300 bg-white text-zinc-900 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                onChange={(e) => setValue('venueId', e.target.value)}
              >
                <option value="">Choose a venue...</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} (Cap: {v.capacity})
                  </option>
                ))}
              </select>
              {errors.venueId && <p className="text-xs text-red-600">{errors.venueId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="expectedAttendees" className="text-xs font-bold text-zinc-700 uppercase">
                Expected Attendees
              </Label>
              <Input
                id="expectedAttendees"
                type="number"
                placeholder="e.g. 80"
                className="border-zinc-300 rounded-lg text-sm"
                {...register('expectedAttendees', { valueAsNumber: true })}
              />
              {errors.expectedAttendees && (
                <p className="text-xs text-red-600">{errors.expectedAttendees.message}</p>
              )}
            </div>
          </div>

          {/* Section: Date and Times */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs font-bold text-zinc-700 uppercase">
                Event Date
              </Label>
              <Input
                id="date"
                type="date"
                className="border-zinc-300 rounded-lg text-sm"
                {...register('date')}
              />
              {errors.date && <p className="text-xs text-red-600">{errors.date.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="startTime" className="text-xs font-bold text-zinc-700 uppercase">
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                className="border-zinc-300 rounded-lg text-sm"
                {...register('startTime')}
              />
              {errors.startTime && <p className="text-xs text-red-600">{errors.startTime.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endTime" className="text-xs font-bold text-zinc-700 uppercase">
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                className="border-zinc-300 rounded-lg text-sm"
                {...register('endTime')}
              />
              {errors.endTime && <p className="text-xs text-red-600">{errors.endTime.message}</p>}
            </div>
          </div>

          {/* Requirements Checked */}
          <div className="flex items-center gap-2 p-3 bg-zinc-50 border border-zinc-200 rounded-lg">
            <input
              id="requirementsSubmitted"
              type="checkbox"
              className="h-4.5 w-4.5 accent-red-800 rounded border-zinc-300 cursor-pointer"
              {...register('requirementsSubmitted')}
            />
            <div className="cursor-pointer">
              <Label htmlFor="requirementsSubmitted" className="text-xs font-bold text-zinc-700 uppercase cursor-pointer">
                All physical / offline documents validated
              </Label>
              <p className="text-[10px] text-zinc-400">
                Check this if the requester submitted intent letters and endorsement checklists offline. This sets status to Booked immediately.
              </p>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="notes" className="text-xs font-bold text-zinc-700 uppercase">
              Internal Notes / Special Instructions
            </Label>
            <Textarea
              id="notes"
              placeholder="e.g. Settle payments before the end of the week. Needs AV assistance."
              rows={3}
              className="border-zinc-300 rounded-lg text-sm"
              {...register('notes')}
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 border-t border-zinc-150 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="rounded-lg">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-red-800 hover:bg-red-900 text-white font-bold rounded-lg px-6 shadow-sm">
              {isSubmitting ? 'Creating Booking...' : 'Add Assisted Booking'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
export default AddBookingForm;

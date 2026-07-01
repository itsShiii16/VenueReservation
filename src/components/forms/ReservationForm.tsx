'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reservationSchema, ReservationInput } from '@/lib/validations/reservationSchema';
import { getMockDb } from '@/lib/mock-data';
import { getCurrentUserClient } from '@/lib/auth';
import { checkScheduleConflict } from '@/lib/conflict-checking';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileUploadBox } from '@/components/shared/FileUploadBox';
import { CalendarSlotBadge } from '@/components/calendar/CalendarSlotBadge';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';

interface ReservationFormProps {
  venueId: string;
  selectedDate: string;
  selectedStartTime: string;
  selectedEndTime: string;
  onCancel: () => void;
}

export const ReservationForm: React.FC<ReservationFormProps> = ({
  venueId,
  selectedDate,
  selectedStartTime,
  selectedEndTime,
  onCancel,
}) => {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { name: string; size: number }>>({});
  
  const db = getMockDb();
  const venue = db.venues.find((v) => v.id === venueId);
  const currentUser = getCurrentUserClient();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ReservationInput>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      eventTitle: '',
      activityType: '',
      expectedAttendees: undefined,
      date: selectedDate,
      startTime: selectedStartTime,
      endTime: selectedEndTime,
      purpose: '',
      requirements: [],
    },
  });

  const handleFileSelect = (reqName: string, file: { name: string; size: number }) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [reqName]: file,
    }));
  };

  const handleFileRemove = (reqName: string) => {
    setUploadedFiles((prev) => {
      const copy = { ...prev };
      delete copy[reqName];
      return copy;
    });
  };

  const onSubmit = async (data: ReservationInput) => {
    if (!currentUser) {
      toast.error('You must be logged in to submit a reservation.');
      router.push('/login');
      return;
    }

    if (!venue) {
      toast.error('Invalid venue specified.');
      return;
    }

    // Check capacity limit
    if (data.expectedAttendees > venue.capacity) {
      toast.error(`Expected attendees exceed venue capacity limit (${venue.capacity} max).`);
      return;
    }

    // Combine date and times
    const startStr = `${data.date}T${data.startTime}:00`;
    const endStr = `${data.date}T${data.endTime}:00`;
    const startTime = new Date(startStr);
    const endTime = new Date(endStr);

    // Double check schedule conflicts
    const conflictResult = checkScheduleConflict(venueId, startTime, endTime);
    if (conflictResult.conflict) {
      toast.error(conflictResult.reason || 'Conflict detected. Please choose another time slot.');
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const refNum = `RES-${data.date.replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;
      const reservationId = `res-${Date.now()}`;

      // Create new reservation
      const newReservation = {
        id: reservationId,
        referenceNumber: refNum,
        eventTitle: data.eventTitle,
        activityType: data.activityType,
        expectedAttendees: data.expectedAttendees,
        startTime,
        endTime,
        status: 'UNDER_REVIEW' as const,
        bookingSource: 'CLIENT_SUBMITTED' as const,
        notes: data.purpose,
        clientId: currentUser.id,
        venueId: venue.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to DB
      db.reservations.push(newReservation);

      // Add requirements meta to database
      venue.supplementaryRequirements.forEach((reqName) => {
        const file = uploadedFiles[reqName];
        db.requirements.push({
          id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          reservationId,
          requirementName: reqName,
          status: file ? 'Uploaded' : 'Missing',
          fileName: file ? file.name : undefined,
          updatedAt: new Date(),
        });
      });

      // Add audit log
      db.auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'SUBMIT_RESERVATION',
        entityType: 'Reservation',
        entityId: reservationId,
        description: `Submitted direct booking reservation request: "${data.eventTitle}"`,
        userId: currentUser.id,
        createdAt: new Date(),
      });

      db.save();

      toast.success(`Reservation request submitted successfully! Reference Number: ${refNum}`);
      router.push('/my-reservations');
      router.refresh();
    } catch (e) {
      toast.error('Failed to submit reservation request.');
    }
  };

  if (!venue) return <p className="text-zinc-500 italic">Loading venue details...</p>;

  return (
    <Card className="border border-zinc-200 shadow-sm bg-white rounded-xl overflow-hidden font-sans">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-zinc-900 mb-2">Reserve {venue.name}</h3>
        <p className="text-xs text-zinc-500 mb-4 leading-normal">
          This venue does not support pencil bookings. You must submit all required files for review immediately.
        </p>

        {/* Selected Slot Information */}
        <CalendarSlotBadge
          date={selectedDate}
          startTime={selectedStartTime}
          endTime={selectedEndTime}
          className="mb-6"
        />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Title and Activity Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="eventTitle" className="text-xs font-bold text-zinc-700 uppercase">
                Event Title
              </Label>
              <Input
                id="eventTitle"
                placeholder="e.g. Org Assembly"
                className="border-zinc-300 rounded-lg text-sm"
                {...register('eventTitle')}
              />
              {errors.eventTitle && (
                <p className="text-xs text-red-600">{errors.eventTitle.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="activityType" className="text-xs font-bold text-zinc-700 uppercase">
                Activity Type
              </Label>
              <Input
                id="activityType"
                placeholder="e.g. Assembly, Forum, Concert"
                className="border-zinc-300 rounded-lg text-sm"
                {...register('activityType')}
              />
              {errors.activityType && (
                <p className="text-xs text-red-600">{errors.activityType.message}</p>
              )}
            </div>
          </div>

          {/* Expected Attendees */}
          <div className="space-y-1.5">
            <Label htmlFor="expectedAttendees" className="text-xs font-bold text-zinc-700 uppercase">
              Expected Attendees (Capacity: Max {venue.capacity})
            </Label>
            <Input
              id="expectedAttendees"
              type="number"
              placeholder="e.g. 50"
              className="border-zinc-300 rounded-lg text-sm"
              {...register('expectedAttendees', { valueAsNumber: true })}
            />
            {errors.expectedAttendees && (
              <p className="text-xs text-red-600">{errors.expectedAttendees.message}</p>
            )}
          </div>

          {/* Purpose / Notes */}
          <div className="space-y-1.5">
            <Label htmlFor="purpose" className="text-xs font-bold text-zinc-700 uppercase">
              Purpose / Program of Activity
            </Label>
            <Textarea
              id="purpose"
              placeholder="Provide a brief summary of the activity program and tech requirements..."
              rows={4}
              className="border-zinc-300 rounded-lg text-sm"
              {...register('purpose')}
            />
            {errors.purpose && (
              <p className="text-xs text-red-600">{errors.purpose.message}</p>
            )}
          </div>

          {/* Requirements Upload Area */}
          {venue.supplementaryRequirements.length > 0 && (
            <div className="border-t border-zinc-200 pt-5 space-y-4">
              <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">
                Upload Required Documents
              </h4>
              <div className="grid gap-4">
                {venue.supplementaryRequirements.map((reqName) => (
                  <div key={reqName} className="space-y-1.5">
                    <Label className="text-xs font-bold text-zinc-700">{reqName}</Label>
                    <FileUploadBox
                      selectedFile={uploadedFiles[reqName]}
                      onFileSelect={(file) => handleFileSelect(reqName, file)}
                      onFileRemove={() => handleFileRemove(reqName)}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-150">
            <Button type="button" variant="outline" onClick={onCancel} className="rounded-lg">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-red-800 hover:bg-red-900 text-white font-bold rounded-lg px-6 shadow-sm">
              {isSubmitting ? 'Submitting request...' : 'Submit Reservation Request'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
export default ReservationForm;

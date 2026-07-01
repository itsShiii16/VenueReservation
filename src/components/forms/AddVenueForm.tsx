'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { venueSchema, VenueInput } from '@/lib/validations/venueSchema';
import { z } from 'zod';
import { getMockDb } from '@/lib/mock-data';
import { getCurrentUserClient } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { Venue } from '@/types/venue';

interface AddVenueFormProps {
  initialVenue?: Venue;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AddVenueForm: React.FC<AddVenueFormProps> = ({
  initialVenue,
  onSuccess,
  onCancel,
}) => {
  const router = useRouter();
  const db = getMockDb();
  const user = getCurrentUserClient();

  const isEdit = !!initialVenue;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof venueSchema>>({
    resolver: zodResolver(venueSchema),
    defaultValues: {
      name: initialVenue?.name || '',
      location: initialVenue?.location || '',
      capacity: initialVenue?.capacity || undefined,
      managingUnit: initialVenue?.managingUnit || '',
      amenities: initialVenue?.amenities || [],
      equipment: initialVenue?.equipment || [],
      rules: initialVenue?.rules || '',
      imageUrl: initialVenue?.imageUrl || '',
      allowsPencilBooking: initialVenue?.allowsPencilBooking || false,
      preliminaryRequirements: initialVenue?.preliminaryRequirements || [],
      supplementaryRequirements: initialVenue?.supplementaryRequirements || [],
      pencilBookingDays: initialVenue?.pencilBookingDays ?? 3,
      paymentDeadlineDays: initialVenue?.paymentDeadlineDays ?? 5,
    },
  });

  // Watch allowsPencilBooking to conditionally display prelim/supp options
  const allowsPencilBooking = watch('allowsPencilBooking');

  const onSubmit = async (data: any) => {
    if (!user) {
      toast.error('You must be logged in.');
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (isEdit && initialVenue) {
        // Find and update
        const index = db.venues.findIndex((v) => v.id === initialVenue.id);
        if (index > -1) {
          db.venues[index] = {
            ...db.venues[index],
            ...data,
            updatedAt: new Date(),
          };
          
          db.auditLogs.push({
            id: `log-${Date.now()}`,
            action: 'UPDATE_VENUE',
            entityType: 'Venue',
            entityId: initialVenue.id,
            description: `Updated venue details for: "${data.name}"`,
            userId: user.id,
            createdAt: new Date(),
          });
        }
      } else {
        // Create new
        const newVenueId = `venue-${Date.now()}`;
        const newVenue: Venue = {
          id: newVenueId,
          ...data,
          isActive: true,
          defaultRate: 1500, // Default values for mock purposes
          defaultRateType: 'FLAT',
          defaultOpenTime: '08:00',
          defaultCloseTime: '20:00',
          createdById: user.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        db.venues.push(newVenue);

        db.auditLogs.push({
          id: `log-${Date.now()}`,
          action: 'CREATE_VENUE',
          entityType: 'Venue',
          entityId: newVenueId,
          description: `Created new venue: "${data.name}"`,
          userId: user.id,
          createdAt: new Date(),
        });
      }

      db.save();
      toast.success(isEdit ? 'Venue details updated!' : 'New venue created successfully!');
      onSuccess();
      router.refresh();
    } catch (e) {
      toast.error('An error occurred while saving the venue.');
    }
  };

  return (
    <Card className="border border-zinc-200 shadow-sm bg-white rounded-xl overflow-hidden font-sans">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Grid fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Venue Name */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-bold text-zinc-700 uppercase">
                Venue Name
              </Label>
              <Input
                id="name"
                placeholder="e.g. Palma Hall Room 400"
                className="border-zinc-300 rounded-lg text-sm"
                {...register('name')}
              />
              {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
            </div>

            {/* Managing Unit */}
            <div className="space-y-1.5">
              <Label htmlFor="managingUnit" className="text-xs font-bold text-zinc-700 uppercase">
                Managing Unit / College / Department
              </Label>
              <Input
                id="managingUnit"
                placeholder="e.g. College of Social Sciences"
                className="border-zinc-300 rounded-lg text-sm"
                {...register('managingUnit')}
              />
              {errors.managingUnit && (
                <p className="text-xs text-red-600">{errors.managingUnit.message}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-xs font-bold text-zinc-700 uppercase">
                Location (Building, Street, etc.)
              </Label>
              <Input
                id="location"
                placeholder="e.g. Palma Hall, Roxas Ave, UP Diliman"
                className="border-zinc-300 rounded-lg text-sm"
                {...register('location')}
              />
              {errors.location && <p className="text-xs text-red-600">{errors.location.message}</p>}
            </div>

            {/* Capacity */}
            <div className="space-y-1.5">
              <Label htmlFor="capacity" className="text-xs font-bold text-zinc-700 uppercase">
                Maximum Capacity (Attendees)
              </Label>
              <Input
                id="capacity"
                type="number"
                placeholder="e.g. 150"
                className="border-zinc-300 rounded-lg text-sm"
                {...register('capacity', { valueAsNumber: true })}
              />
              {errors.capacity && <p className="text-xs text-red-600">{errors.capacity.message}</p>}
            </div>
          </div>

          {/* Amenities & Equipment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="amenities" className="text-xs font-bold text-zinc-700 uppercase">
                Amenities (Comma-separated)
              </Label>
              <Input
                id="amenities"
                placeholder="e.g. Air Conditioning, Sound System, Wi-Fi"
                className="border-zinc-300 rounded-lg text-sm"
                {...register('amenities')}
              />
              <p className="text-[10px] text-zinc-400">Separate items with commas</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="equipment" className="text-xs font-bold text-zinc-700 uppercase">
                Equipment (Comma-separated)
              </Label>
              <Input
                id="equipment"
                placeholder="e.g. Projector, Microphones, Podium"
                className="border-zinc-300 rounded-lg text-sm"
                {...register('equipment')}
              />
              <p className="text-[10px] text-zinc-400">Separate items with commas</p>
            </div>
          </div>

          {/* Rules & Image URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="rules" className="text-xs font-bold text-zinc-700 uppercase">
                Rules & Regulations
              </Label>
              <Textarea
                id="rules"
                placeholder="e.g. No eating inside. Leave the venue clean."
                rows={3}
                className="border-zinc-300 rounded-lg text-sm"
                {...register('rules')}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="imageUrl" className="text-xs font-bold text-zinc-700 uppercase">
                Venue Image URL (Optional)
              </Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                className="border-zinc-300 rounded-lg text-sm"
                {...register('imageUrl')}
              />
              {errors.imageUrl && <p className="text-xs text-red-600">{errors.imageUrl.message}</p>}
            </div>
          </div>

          {/* Pencil Booking Switch */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4 space-y-4">
            <div className="flex items-center gap-2">
              <input
                id="allowsPencilBooking"
                type="checkbox"
                className="h-4.5 w-4.5 accent-red-800 rounded border-zinc-300"
                {...register('allowsPencilBooking')}
              />
              <Label htmlFor="allowsPencilBooking" className="text-sm font-bold text-zinc-800 uppercase cursor-pointer">
                Allows Pencil Booking
              </Label>
            </div>
            <p className="text-xs text-zinc-500 leading-normal">
              If enabled, users can reserve slots as draft pencil bookings and have a specified time window to upload supplementary requirements. Multiple users can submit preliminary requests for the same slot.
            </p>

            {allowsPencilBooking && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-200 pt-4 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <Label htmlFor="pencilBookingDays" className="text-xs font-bold text-zinc-700 uppercase">
                    Pencil Booking Completion Window (Days)
                  </Label>
                  <Input
                    id="pencilBookingDays"
                    type="number"
                    className="border-zinc-300 rounded-lg text-sm"
                    {...register('pencilBookingDays', { valueAsNumber: true })}
                  />
                  <p className="text-[10px] text-zinc-400">Deadline for submitting supplementary docs</p>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="paymentDeadlineDays" className="text-xs font-bold text-zinc-700 uppercase">
                    Payment Deadline window (Days)
                  </Label>
                  <Input
                    id="paymentDeadlineDays"
                    type="number"
                    className="border-zinc-300 rounded-lg text-sm"
                    {...register('paymentDeadlineDays', { valueAsNumber: true })}
                  />
                  <p className="text-[10px] text-zinc-400">Time window to settle payment after approval</p>
                </div>
              </div>
            )}
          </div>

          {/* Document Requirements (TextArea inputs, newline-delimited) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-zinc-200 pt-4">
            {allowsPencilBooking && (
              <div className="space-y-1.5">
                <Label htmlFor="preliminaryRequirements" className="text-xs font-bold text-zinc-700 uppercase">
                  Preliminary Requirements (one per line)
                </Label>
                <Textarea
                  id="preliminaryRequirements"
                  placeholder="e.g. Letter of Intent / Request&#10;Activity summary"
                  rows={4}
                  className="border-zinc-300 rounded-lg text-sm font-mono"
                  {...register('preliminaryRequirements')}
                />
                <p className="text-[10px] text-zinc-400">Submitted during the initial request phase</p>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="supplementaryRequirements" className="text-xs font-bold text-zinc-700 uppercase">
                {allowsPencilBooking ? 'Supplementary Requirements (one per line)' : 'Required Documents (one per line)'}
              </Label>
              <Textarea
                id="supplementaryRequirements"
                placeholder="e.g. Endorsement from Dean / Adviser&#10;Equipment checklist"
                rows={4}
                className="border-zinc-300 rounded-lg text-sm font-mono"
                {...register('supplementaryRequirements')}
              />
              <p className="text-[10px] text-zinc-400">
                {allowsPencilBooking
                  ? 'Required to unlock payment after pencil approval'
                  : 'Submitted immediately during direct booking'}
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 border-t border-zinc-150 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="rounded-lg">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-red-800 hover:bg-red-900 text-white font-bold rounded-lg px-6 shadow-sm">
              {isSubmitting ? 'Saving venue...' : isEdit ? 'Update Venue Details' : 'Create Venue'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
export default AddVenueForm;

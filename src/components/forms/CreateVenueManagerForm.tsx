'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { venueManagerSchema, VenueManagerInput } from '@/lib/validations/venueManagerSchema';
import { getMockDb } from '@/lib/mock-data';
import { getCurrentUserClient } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface CreateVenueManagerFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const CreateVenueManagerForm: React.FC<CreateVenueManagerFormProps> = ({
  onSuccess,
  onCancel,
}) => {
  const router = useRouter();
  const db = getMockDb();
  const admin = getCurrentUserClient();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VenueManagerInput>({
    resolver: zodResolver(venueManagerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      assignedLocation: '',
      managingUnit: '',
      temporaryPassword: 'password123',
    },
  });

  const onSubmit = async (data: VenueManagerInput) => {
    if (!admin || admin.role !== 'SYSTEM_ADMIN') {
      toast.error('Unauthorized action.');
      return;
    }

    const emailExists = db.users.some(
      (u) => u.email.toLowerCase() === data.email.toLowerCase()
    );

    if (emailExists) {
      toast.error('This email is already registered.');
      return;
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const newManagerId = `user-manager-${Date.now()}`;
      
      const newManager = {
        id: newManagerId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        role: 'VENUE_MANAGER' as const,
        organization: data.managingUnit,
        position: `Facility Officer - ${data.assignedLocation}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.users.push(newManager);

      db.auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'CREATE_VENUE_MANAGER',
        entityType: 'User',
        entityId: newManagerId,
        description: `Created Venue Manager account for ${data.firstName} ${data.lastName} (assigned: ${data.assignedLocation})`,
        userId: admin.id,
        createdAt: new Date(),
      });

      db.save();

      toast.success(`Venue Manager account created! Assigned: ${data.assignedLocation}`);
      onSuccess();
      router.refresh();
    } catch (e) {
      toast.error('Failed to create Venue Manager account.');
    }
  };

  return (
    <Card className="border border-zinc-200 shadow-sm bg-white rounded-xl overflow-hidden font-sans">
      <CardContent className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-xs font-bold text-zinc-700 uppercase">
                First Name
              </Label>
              <Input
                id="firstName"
                placeholder="e.g. Carlos"
                className="border-zinc-300 rounded-lg text-sm"
                {...register('firstName')}
              />
              {errors.firstName && <p className="text-xs text-red-600">{errors.firstName.message}</p>}
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-xs font-bold text-zinc-700 uppercase">
                Last Name
              </Label>
              <Input
                id="lastName"
                placeholder="e.g. Garcia"
                className="border-zinc-300 rounded-lg text-sm"
                {...register('lastName')}
              />
              {errors.lastName && <p className="text-xs text-red-600">{errors.lastName.message}</p>}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold text-zinc-700 uppercase">
              UP Mail Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="username@upd.edu.ph"
              className="border-zinc-300 rounded-lg text-sm"
              {...register('email')}
            />
            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Assigned Location */}
            <div className="space-y-1.5">
              <Label htmlFor="assignedLocation" className="text-xs font-bold text-zinc-700 uppercase">
                Assigned Location / Facility
              </Label>
              <Input
                id="assignedLocation"
                placeholder="e.g. Cine Adarna / Palma Hall"
                className="border-zinc-300 rounded-lg text-sm"
                {...register('assignedLocation')}
              />
              {errors.assignedLocation && (
                <p className="text-xs text-red-600">{errors.assignedLocation.message}</p>
              )}
            </div>

            {/* Managing Unit */}
            <div className="space-y-1.5">
              <Label htmlFor="managingUnit" className="text-xs font-bold text-zinc-700 uppercase">
                Managing Unit
              </Label>
              <Input
                id="managingUnit"
                placeholder="e.g. UP Film Institute"
                className="border-zinc-300 rounded-lg text-sm"
                {...register('managingUnit')}
              />
              {errors.managingUnit && (
                <p className="text-xs text-red-600">{errors.managingUnit.message}</p>
              )}
            </div>
          </div>

          {/* Temporary Password */}
          <div className="space-y-1.5">
            <Label htmlFor="temporaryPassword" className="text-xs font-bold text-zinc-700 uppercase">
              Temporary Password
            </Label>
            <Input
              id="temporaryPassword"
              type="text"
              className="border-zinc-300 rounded-lg text-sm bg-zinc-50"
              {...register('temporaryPassword')}
            />
            {errors.temporaryPassword && (
              <p className="text-xs text-red-600">{errors.temporaryPassword.message}</p>
            )}
            <p className="text-[10px] text-zinc-400">Managers can change this password after initial login</p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 border-t border-zinc-150 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="rounded-lg">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-red-800 hover:bg-red-900 text-white font-bold rounded-lg px-6 shadow-sm">
              {isSubmitting ? 'Creating Manager Account...' : 'Create Manager'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
export default CreateVenueManagerForm;

import { z } from 'zod';

export const reservationSchema = z.object({
  eventTitle: z.string().min(3, 'Event title must be at least 3 characters'),
  activityType: z.string().min(1, 'Activity type is required'),
  expectedAttendees: z
    .number({ message: 'Attendees must be a valid number' })
    .int()
    .positive('Must be a positive number'),
  date: z.string().min(1, 'Event date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  purpose: z.string().min(10, 'Purpose must be at least 10 characters'),
  requirements: z.array(z.any()).optional(),
});

export const preliminarySchema = z.object({
  eventTitle: z.string().min(3, 'Event title must be at least 3 characters'),
  activityType: z.string().min(1, 'Activity type is required'),
  expectedAttendees: z
    .number({ message: 'Attendees must be a valid number' })
    .int()
    .positive('Must be a positive number'),
  date: z.string().min(1, 'Event date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  preliminaryRequirements: z.array(z.any()).optional(),
});

export const supplementaryUploadSchema = z.object({
  remarks: z.string().optional(),
  files: z.array(z.any()).min(1, 'At least one supplementary document is required'),
});

export type ReservationInput = z.infer<typeof reservationSchema>;
export type PreliminaryInput = z.infer<typeof preliminarySchema>;
export type SupplementaryUploadInput = z.infer<typeof supplementaryUploadSchema>;

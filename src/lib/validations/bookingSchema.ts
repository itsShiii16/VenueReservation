import { z } from 'zod';

export const bookingSchema = z.object({
  requesterName: z.string().min(1, 'Requester name is required'),
  email: z
    .string()
    .min(1, 'UP Mail is required')
    .email('Invalid email address')
    .refine(
      (email) => email.endsWith('.upd.edu.ph') || email.endsWith('.up.edu.ph') || email.endsWith('@upd.edu.ph') || email.endsWith('@up.edu.ph'),
      {
        message: 'Must be an official UP Mail account (@upd.edu.ph or @up.edu.ph)',
      }
    ),
  collegeOrOrg: z.string().min(1, 'College/Office/Organization is required'),
  eventTitle: z.string().min(3, 'Event title must be at least 3 characters'),
  activityType: z.string().min(1, 'Activity type is required'),
  expectedAttendees: z
    .number({ message: 'Attendees must be a valid number' })
    .int()
    .positive('Must be a positive number'),
  venueId: z.string().min(1, 'Venue is required'),
  date: z.string().min(1, 'Event date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  requirementsSubmitted: z.boolean(),
  notes: z.string().optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

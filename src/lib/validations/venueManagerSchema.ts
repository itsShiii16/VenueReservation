import { z } from 'zod';

export const venueManagerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .refine(
      (email) => email.endsWith('.upd.edu.ph') || email.endsWith('.up.edu.ph') || email.endsWith('@upd.edu.ph') || email.endsWith('@up.edu.ph'),
      {
        message: 'Must be an official UP Mail account (@upd.edu.ph or @up.edu.ph)',
      }
    ),
  assignedLocation: z.string().min(1, 'Assigned location/facility is required'),
  managingUnit: z.string().min(1, 'Managing unit is required'),
  temporaryPassword: z.string().min(6, 'Password must be at least 6 characters'),
});

export type VenueManagerInput = z.infer<typeof venueManagerSchema>;

import { z } from 'zod';

export const venueSchema = z.object({
  name: z.string().min(1, 'Venue name is required'),
  location: z.string().min(1, 'Location is required'),
  capacity: z
    .number({ message: 'Capacity must be a valid number' })
    .int()
    .positive('Capacity must be a positive number'),
  managingUnit: z.string().min(1, 'Managing unit is required'),
  amenities: z.union([z.string(), z.array(z.string())]).transform((val) => {
    if (typeof val === 'string') {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return val;
  }),
  equipment: z.union([z.string(), z.array(z.string())]).transform((val) => {
    if (typeof val === 'string') {
      return val.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return val;
  }),
  rules: z.string().optional(),
  imageUrl: z.string().url('Must be a valid URL').or(z.string().length(0)).optional(),
  allowsPencilBooking: z.boolean().default(false),
  preliminaryRequirements: z.union([z.string(), z.array(z.string())]).transform((val) => {
    if (typeof val === 'string') {
      return val.split('\n').map((s) => s.trim()).filter(Boolean);
    }
    return val;
  }),
  supplementaryRequirements: z.union([z.string(), z.array(z.string())]).transform((val) => {
    if (typeof val === 'string') {
      return val.split('\n').map((s) => s.trim()).filter(Boolean);
    }
    return val;
  }),
  pencilBookingDays: z.number().int().nonnegative().default(3),
  paymentDeadlineDays: z.number().int().nonnegative().default(5),
});

export type VenueInput = z.infer<typeof venueSchema>;

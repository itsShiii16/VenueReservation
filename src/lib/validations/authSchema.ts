import { z } from 'zod';

export const loginSchema = z.object({
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
  password: z.string().min(1, 'Password is required'),
});

export const signupSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
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
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    organization: z.string().min(1, 'Organization / College is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;

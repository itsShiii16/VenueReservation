'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupInput } from '@/lib/validations/authSchema';
import { getMockDb } from '@/lib/mock-data';
import { loginClient } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { User as UserIcon, Mail, Lock, Building, ShieldAlert } from 'lucide-react';

export const SignupForm: React.FC = () => {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      organization: '',
    },
  });

  const onSubmit = async (data: SignupInput) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const db = getMockDb();
      const existingUser = db.users.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase()
      );

      if (existingUser) {
        toast.error('Email is already registered. Please sign in instead.');
        return;
      }

      // Add to database
      const newUser = {
        id: `user-client-${Date.now()}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.toLowerCase(),
        role: 'CLIENT' as const,
        organization: data.organization,
        position: 'Student',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      db.users.push(newUser);
      db.save();

      // Log in
      loginClient(newUser.id);
      toast.success(`Welcome to VRS, ${newUser.firstName}! Account created.`);
      
      router.push('/');
      router.refresh();
    } catch (e) {
      toast.error('Failed to create account.');
    }
  };

  return (
    <Card className="w-full border border-zinc-200 shadow-md bg-white rounded-xl overflow-hidden font-sans">
      <CardHeader className="space-y-1.5 p-6 bg-zinc-50 border-b border-zinc-200">
        <CardTitle className="text-xl font-extrabold text-zinc-900 tracking-tight">
          Create Account
        </CardTitle>
        <CardDescription className="text-zinc-500 text-xs">
          Sign up with your UP Mail address to reserve university venues
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 p-6">
          <div className="grid grid-cols-2 gap-4">
            {/* First Name */}
            <div className="space-y-1.5">
              <Label htmlFor="firstName" className="text-xs font-bold text-zinc-700 uppercase">
                First Name
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                  id="firstName"
                  placeholder="Juan"
                  className="pl-9 border-zinc-300 rounded-lg text-sm"
                  {...register('firstName')}
                />
              </div>
              {errors.firstName && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" /> {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-1.5">
              <Label htmlFor="lastName" className="text-xs font-bold text-zinc-700 uppercase">
                Last Name
              </Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                  id="lastName"
                  placeholder="Dela Cruz"
                  className="pl-9 border-zinc-300 rounded-lg text-sm"
                  {...register('lastName')}
                />
              </div>
              {errors.lastName && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" /> {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-xs font-bold text-zinc-700 uppercase">
              UP Mail Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                id="email"
                type="email"
                placeholder="username@upd.edu.ph"
                className="pl-9 border-zinc-300 rounded-lg text-sm"
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" /> {errors.email.message}
              </p>
            )}
          </div>

          {/* Organization */}
          <div className="space-y-1.5">
            <Label htmlFor="organization" className="text-xs font-bold text-zinc-700 uppercase">
              College or Student Organization
            </Label>
            <div className="relative">
              <Building className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
              <Input
                id="organization"
                placeholder="UP Association of Computer Machinery"
                className="pl-9 border-zinc-300 rounded-lg text-sm"
                {...register('organization')}
              />
            </div>
            {errors.organization && (
              <p className="text-xs text-red-600 flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" /> {errors.organization.message}
              </p>
            )}
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-zinc-700 uppercase">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 border-zinc-300 rounded-lg text-sm"
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" /> {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-bold text-zinc-700 uppercase">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 border-zinc-300 rounded-lg text-sm"
                  {...register('confirmPassword')}
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <ShieldAlert className="h-3 w-3" /> {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0 bg-zinc-50/50 border-t border-zinc-150">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-800 hover:bg-red-900 text-white font-bold py-2.5 rounded-lg shadow-sm"
          >
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
export default SignupForm;

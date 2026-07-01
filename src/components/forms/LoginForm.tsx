'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '@/lib/validations/authSchema';
import { getMockDb } from '@/lib/mock-data';
import { loginClient } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Mail, Lock, ShieldAlert } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const db = getMockDb();
      const user = db.users.find(
        (u) => u.email.toLowerCase() === data.email.toLowerCase()
      );

      // In this mock, all users use 'password123'
      if (!user || data.password !== 'password123') {
        toast.error('Invalid email or password. Use password123 for mock accounts.');
        return;
      }

      // Log in
      loginClient(user.id);
      toast.success(`Welcome back, ${user.firstName}!`);

      // Redirect based on role
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const redirect = searchParams ? searchParams.get('redirect') : null;

      if (user.role === 'SYSTEM_ADMIN') {
        router.push('/system-admin/dashboard');
      } else if (user.role === 'VENUE_MANAGER') {
        router.push('/venue-manager/dashboard');
      } else {
        router.push(redirect || '/');
      }
      
      router.refresh();
    } catch (e) {
      toast.error('Something went wrong during login.');
    }
  };

  return (
    <Card className="w-full border border-zinc-200 shadow-md bg-white rounded-xl overflow-hidden font-sans">
      <CardHeader className="space-y-1.5 p-6 bg-zinc-50 border-b border-zinc-200">
        <CardTitle className="text-xl font-extrabold text-zinc-900 tracking-tight flex items-center gap-2">
          Sign In
        </CardTitle>
        <CardDescription className="text-zinc-500 text-xs">
          Access your UP Diliman Venue Reservation account
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4 p-6">
          {/* Email field */}
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

          {/* Password field */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-xs font-bold text-zinc-700 uppercase">
                Password
              </Label>
            </div>
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

          <div className="text-[11px] bg-red-50 text-red-800 p-2.5 rounded-lg border border-red-100 leading-normal space-y-1">
            <p>
              <span className="font-bold">Mock Note:</span> Seeded accounts include <strong>admin@upd.edu.ph</strong>, <strong>carlos@upd.edu.ph</strong>, and <strong>juan@upd.edu.ph</strong>. All seeded accounts use password: <strong>password123</strong>.
            </p>
            <button
              type="button"
              onClick={() => {
                const db = getMockDb();
                db.reset();
                toast.success('Mock database seeds reloaded successfully!');
                setTimeout(() => window.location.reload(), 500);
              }}
              className="text-red-900 font-bold underline cursor-pointer hover:text-red-950 block mt-1"
            >
              Click here to force-reset local database seeds if sign-in fails.
            </button>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0 bg-zinc-50/50 border-t border-zinc-150">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-red-800 hover:bg-red-900 text-white font-bold py-2.5 rounded-lg shadow-sm"
          >
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
export default LoginForm;

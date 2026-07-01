'use client';

import React from 'react';
import SignupForm from '@/components/forms/SignupForm';
import ClientLayout from '@/components/layout/ClientLayout';
import Link from 'next/link';

export default function SignupPage() {
  return (
    <ClientLayout>
      <div className="max-w-md w-full mx-auto space-y-4 py-8">
        <SignupForm />
        <p className="text-center text-xs text-zinc-500 font-medium">
          Already have an account?{' '}
          <Link href="/login" className="text-red-800 hover:text-red-900 font-bold underline">
            Log In
          </Link>
        </p>
      </div>
    </ClientLayout>
  );
}

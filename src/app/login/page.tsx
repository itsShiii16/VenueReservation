'use client';

import React from 'react';
import LoginForm from '@/components/forms/LoginForm';
import ClientLayout from '@/components/layout/ClientLayout';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <ClientLayout>
      <div className="max-w-md w-full mx-auto space-y-4 py-8">
        <LoginForm />
        <p className="text-center text-xs text-zinc-500 font-medium">
          Don't have an account?{' '}
          <Link href="/signup" className="text-red-800 hover:text-red-900 font-bold underline">
            Create an Account
          </Link>
        </p>
      </div>
    </ClientLayout>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUserClient } from '@/lib/auth';
import { User } from '@/types/user';
import Sidebar from './Sidebar';
import PublicNavbar from './PublicNavbar';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SystemAdminLayoutProps {
  children: React.ReactNode;
}

export const SystemAdminLayout: React.FC<SystemAdminLayoutProps> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = getCurrentUserClient();
    setUser(currentUser);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-zinc-50">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-red-800"></div>
      </div>
    );
  }

  if (!user || user.role !== 'SYSTEM_ADMIN') {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-50">
        <PublicNavbar />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full border-red-200 bg-white shadow-lg rounded-xl overflow-hidden">
            <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-red-50 rounded-full">
                <AlertTriangle className="h-10 w-10 text-red-800" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900">Access Denied</h2>
              <p className="text-zinc-600 text-sm">
                You must be logged in as a System Administrator to access this dashboard.
              </p>
              <div className="flex gap-3 w-full mt-2">
                <Button onClick={() => router.push('/login')} className="flex-1 bg-red-800 hover:bg-red-900 text-white font-bold">
                  Log In
                </Button>
                <Button onClick={() => router.push('/')} variant="outline" className="flex-1">
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50 font-sans">
      <Sidebar role="SYSTEM_ADMIN" />
      <div className="flex-1 flex flex-col min-w-0">
        <PublicNavbar />
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {children}
        </main>
      </div>
    </div>
  );
};
export default SystemAdminLayout;

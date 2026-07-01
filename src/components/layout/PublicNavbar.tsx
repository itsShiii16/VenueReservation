'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUserClient, logoutClient } from '@/lib/auth';
import { User } from '@/types/user';
import { Button } from '@/components/ui/button';
import { LogOut, User as UserIcon, Calendar, Building, Settings, LayoutDashboard, Menu, X } from 'lucide-react';
import { toast } from 'sonner';

export const PublicNavbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Sync user state on mount and path change
  useEffect(() => {
    setUser(getCurrentUserClient());
  }, [pathname]);

  const handleLogout = () => {
    logoutClient();
    setUser(null);
    toast.success('Successfully logged out.');
    router.push('/');
    router.refresh();
  };

  const navLinks = [
    { label: 'Venues', href: '/', icon: Building },
  ];

  if (user) {
    if (user.role === 'CLIENT') {
      navLinks.push({ label: 'My Reservations', href: '/my-reservations', icon: Calendar });
    } else if (user.role === 'VENUE_MANAGER') {
      navLinks.push({ label: 'Manager Dashboard', href: '/venue-manager/dashboard', icon: LayoutDashboard });
    } else if (user.role === 'SYSTEM_ADMIN') {
      navLinks.push({ label: 'Admin Dashboard', href: '/system-admin/dashboard', icon: Settings });
    }
  }

  return (
    <nav className="bg-white border-b border-zinc-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo and App Title */}
            <Link href="/" className="flex-shrink-0 flex items-center gap-2.5">
              <div className="h-9 w-9 bg-red-800 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-extrabold text-lg">UP</span>
              </div>
              <span className="font-extrabold text-zinc-900 text-base tracking-tight sm:text-lg">
                Venue Reservation System
              </span>
            </Link>
            
            {/* Desktop Navigation Links */}
            <div className="hidden sm:ml-8 sm:flex sm:space-x-4 items-center">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-semibold transition-colors gap-1.5 ${
                      isActive
                        ? 'bg-red-50 text-red-800'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop Right Panel */}
          <div className="hidden sm:flex sm:items-center sm:gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 rounded-lg text-sm font-medium text-zinc-700">
                  <UserIcon className="h-4 w-4 text-zinc-400" />
                  <span>
                    {user.firstName} ({user.role.replace('_', ' ')})
                  </span>
                </div>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="border-zinc-300 hover:bg-red-50 hover:text-red-800 hover:border-red-200 gap-1.5"
                >
                  <LogOut className="h-4 w-4" /> Log Out
                </Button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-semibold text-zinc-600 hover:text-zinc-900">
                    Log In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="bg-red-800 hover:bg-red-900 text-white font-bold px-4">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-zinc-400 hover:text-zinc-500 hover:bg-zinc-100 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="sm:hidden border-b border-zinc-200 bg-white">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-base font-semibold gap-2 ${
                    isActive ? 'bg-red-50 text-red-800' : 'text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
            
            <div className="border-t border-zinc-200 my-2 pt-2">
              {user ? (
                <div className="px-3 space-y-2">
                  <p className="text-sm font-semibold text-zinc-800">
                    Logged in as: {user.firstName} {user.lastName} ({user.role.replace('_', ' ')})
                  </p>
                  <Button
                    onClick={() => {
                      setIsOpen(false);
                      handleLogout();
                    }}
                    variant="outline"
                    className="w-full text-red-800 border-red-200 hover:bg-red-50 flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="h-5 w-5" /> Log Out
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 px-2">
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Log In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-red-800 text-white font-bold">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
export default PublicNavbar;

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  Building,
  PlusCircle,
  FileText,
  Users,
  Settings,
  ClipboardList,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

interface SidebarProps {
  role: 'VENUE_MANAGER' | 'SYSTEM_ADMIN';
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const pathname = usePathname();

  const managerItems: SidebarItem[] = [
    { label: 'Dashboard', href: '/venue-manager/dashboard', icon: LayoutDashboard },
    { label: 'Reservation Requests', href: '/venue-manager/requests', icon: FileText },
    { label: 'Manage Venues', href: '/venue-manager/venues', icon: Building },
    { label: 'Add Venue', href: '/venue-manager/venues/new', icon: PlusCircle },
    { label: 'Venue Calendar', href: '/venue-manager/calendar', icon: Calendar },
    { label: 'Add Booking', href: '/venue-manager/add-booking', icon: PlusCircle },
  ];

  const adminItems: SidebarItem[] = [
    { label: 'Dashboard', href: '/system-admin/dashboard', icon: LayoutDashboard },
    { label: 'Venue Managers', href: '/system-admin/venue-managers', icon: Users },
    { label: 'Add Venue Manager', href: '/system-admin/venue-managers/new', icon: PlusCircle },
    { label: 'Users', href: '/system-admin/users', icon: Settings },
    { label: 'System Logs', href: '/system-admin/logs', icon: ClipboardList },
  ];

  const items = role === 'VENUE_MANAGER' ? managerItems : adminItems;

  return (
    <aside className="w-64 bg-zinc-900 border-r border-zinc-800 text-zinc-300 min-h-screen shrink-0 hidden md:block select-none font-sans">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-red-800 rounded flex items-center justify-center shadow-sm text-white font-extrabold text-sm">
            UP
          </div>
          <span className="font-extrabold text-white text-base tracking-tight truncate">
            {role === 'VENUE_MANAGER' ? 'Manager Portal' : 'Admin Portal'}
          </span>
        </Link>
      </div>

      <nav className="px-4 py-2 space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 hover:text-white',
                isActive
                  ? 'bg-red-800 text-white shadow-md'
                  : 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
export default Sidebar;

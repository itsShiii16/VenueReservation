'use client';

import React, { useEffect, useState } from 'react';
import SystemAdminLayout from '@/components/layout/SystemAdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import DashboardCard from '@/components/shared/DashboardCard';
import EmptyState from '@/components/shared/EmptyState';
import { getMockDb } from '@/lib/mock-data';
import { Users, Building, FileSpreadsheet, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SystemAdminDashboard() {
  const [stats, setStats] = useState({
    managers: 0,
    clients: 0,
    venues: 0,
    logs: 0,
  });
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  useEffect(() => {
    const db = getMockDb();
    
    const mgrs = db.users.filter((u) => u.role === 'VENUE_MANAGER').length;
    const cls = db.users.filter((u) => u.role === 'CLIENT').length;
    const vns = db.venues.filter((v) => v.isActive).length;
    const lgSize = db.auditLogs.length;

    setStats({
      managers: mgrs,
      clients: cls,
      venues: vns,
      logs: lgSize,
    });

    // Populate recent logs and sort by timestamp
    const sorted = [...db.auditLogs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((log) => ({
        ...log,
        user: db.users.find((u) => u.id === log.userId),
      }));

    setRecentLogs(sorted);
  }, []);

  return (
    <SystemAdminLayout>
      <div className="space-y-6 font-sans">
        <PageHeader
          title="System Admin Dashboard"
          description="Global configuration controls, Venue Manager registrations, and system transaction logs."
        />

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Venue Managers"
            value={stats.managers}
            icon={Users}
            color="maroon"
            description="Active facility managers"
          />
          <DashboardCard
            title="Registered Clients"
            value={stats.clients}
            icon={Users}
            color="blue"
            description="Students, faculty, & offices"
          />
          <DashboardCard
            title="Managed Venues"
            value={stats.venues}
            icon={Building}
            color="teal"
            description="Active venue facilities"
          />
          <DashboardCard
            title="Transaction Logs"
            value={stats.logs}
            icon={FileSpreadsheet}
            color="zinc"
            description="Accountability logs"
          />
        </div>

        {/* Recent Audit Logs Section */}
        <div className="space-y-4 pt-4">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-800" /> Recent System Activities
            </h3>
            <p className="text-xs text-zinc-500">
              Audit log entries tracking recent administrator and manager actions.
            </p>
          </div>

          {recentLogs.length === 0 ? (
            <EmptyState title="No Activities Recorded" description="No actions have been logged in the system yet." />
          ) : (
            <Card className="border border-zinc-200 bg-white rounded-xl shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-zinc-50 border-b border-zinc-200">
                  <TableRow>
                    <TableHead className="font-bold text-zinc-800 text-xs uppercase">Action</TableHead>
                    <TableHead className="font-bold text-zinc-800 text-xs uppercase">Description</TableHead>
                    <TableHead className="font-bold text-zinc-800 text-xs uppercase">Executed By</TableHead>
                    <TableHead className="font-bold text-zinc-800 text-xs uppercase">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-zinc-50/50">
                      <TableCell className="font-bold text-zinc-900 text-xs">
                        {log.action.replace(/_/g, ' ')}
                      </TableCell>
                      <TableCell className="text-zinc-700 text-xs leading-normal">{log.description}</TableCell>
                      <TableCell className="text-zinc-600 text-xs">
                        {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System'}
                      </TableCell>
                      <TableCell className="text-zinc-400 font-mono text-[10px]">
                        {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          )}
        </div>
      </div>
    </SystemAdminLayout>
  );
}

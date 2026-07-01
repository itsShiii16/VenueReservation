'use client';

import React, { useEffect, useState } from 'react';
import SystemAdminLayout from '@/components/layout/SystemAdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getMockDb } from '@/lib/mock-data';
import { format } from 'date-fns';
import { FileSpreadsheet } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function SystemLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    const db = getMockDb();
    
    // Sort and populate user names
    const sorted = [...db.auditLogs]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((log) => ({
        ...log,
        user: db.users.find((u) => u.id === log.userId),
      }));

    setLogs(sorted);
  }, []);

  return (
    <SystemAdminLayout>
      <div className="space-y-6 font-sans">
        <PageHeader
          title="System Transaction Logs"
          description="Detailed historical logs tracking facility creations, approvals, cancellations, and account setup activities."
        />

        <Card className="border border-zinc-200 bg-white rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-50 border-b border-zinc-200">
              <TableRow>
                <TableHead className="font-bold text-zinc-800 text-xs uppercase w-[180px]">Action Category</TableHead>
                <TableHead className="font-bold text-zinc-800 text-xs uppercase">Detailed Event Log</TableHead>
                <TableHead className="font-bold text-zinc-800 text-xs uppercase w-[150px]">Executed By</TableHead>
                <TableHead className="font-bold text-zinc-800 text-xs uppercase w-[150px]">Log Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-zinc-50/50">
                  <TableCell className="font-bold text-zinc-900 text-xs font-mono uppercase tracking-wide">
                    {log.action}
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
      </div>
    </SystemAdminLayout>
  );
}

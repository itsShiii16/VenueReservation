'use client';

import React, { useEffect, useState } from 'react';
import SystemAdminLayout from '@/components/layout/SystemAdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getMockDb } from '@/lib/mock-data';
import { User } from '@/types/user';
import { Users, Mail } from 'lucide-react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';

export default function UsersDirectoryPage() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const db = getMockDb();
    // Filter and show all clients and admins
    setUsers(db.users.filter((u) => u.role === 'CLIENT' || u.role === 'SYSTEM_ADMIN'));
  }, []);

  return (
    <SystemAdminLayout>
      <div className="space-y-6 font-sans">
        <PageHeader
          title="System Users Directory"
          description="Directory of registered client accounts, students, faculty, and administrative staff."
        />

        <Card className="border border-zinc-200 bg-white rounded-xl shadow-sm overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-50 border-b border-zinc-200">
              <TableRow>
                <TableHead className="font-bold text-zinc-800 text-xs uppercase">User Full Name</TableHead>
                <TableHead className="font-bold text-zinc-800 text-xs uppercase">UP Mail Address</TableHead>
                <TableHead className="font-bold text-zinc-800 text-xs uppercase">Role</TableHead>
                <TableHead className="font-bold text-zinc-800 text-xs uppercase">College / Office</TableHead>
                <TableHead className="font-bold text-zinc-800 text-xs uppercase">Registration Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="hover:bg-zinc-50/50">
                  <TableCell className="font-bold text-zinc-900 text-sm">
                    {u.firstName} {u.lastName}
                  </TableCell>
                  <TableCell className="text-zinc-700 text-xs">
                    <div className="flex items-center gap-1.5 font-mono">
                      <Mail className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{u.email}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-zinc-700 text-xs">
                    {u.role === 'SYSTEM_ADMIN' ? (
                      <Badge className="bg-zinc-900 text-white text-[10px] font-bold">
                        Admin
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-zinc-50 text-zinc-700 border-zinc-200 text-[10px] font-medium">
                        Client
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-zinc-600 text-xs font-semibold">
                    {u.organization || 'N/A'}
                  </TableCell>
                  <TableCell className="text-zinc-400 font-mono text-[10px]">
                    {format(new Date(u.createdAt), 'yyyy-MM-dd')}
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

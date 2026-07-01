'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMockDb } from '@/lib/mock-data';
import { getCurrentUserClient } from '@/lib/auth';
import { Reservation } from '@/types/reservation';
import ClientLayout from '@/components/layout/ClientLayout';
import PageHeader from '@/components/shared/PageHeader';
import ReservationCard from '@/components/shared/ReservationCard';
import EmptyState from '@/components/shared/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from 'lucide-react';

export default function MyReservationsPage() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUserClient();
    if (!user) {
      router.push('/login');
      return;
    }

    const db = getMockDb();
    // Filter and populate venue
    const myRes = db.reservations
      .filter((r) => r.clientId === user.id)
      .map((r) => ({
        ...r,
        venue: db.venues.find((v) => v.id === r.venueId),
      }));

    setReservations(myRes);
    setLoading(false);
  }, [router]);

  if (loading) {
    return (
      <ClientLayout>
        <p className="text-center p-8 text-zinc-500 italic">Verifying credentials...</p>
      </ClientLayout>
    );
  }

  // Filter groups
  const upcoming = reservations.filter((r) =>
    ['PRELIMINARY_SUBMITTED', 'UNDER_REVIEW', 'PENCIL_BOOKED_DRAFT', 'RETURNED_FOR_COMPLETION', 'PAYMENT_PENDING', 'PAYMENT_OVERDUE'].includes(r.status)
  );

  const confirmed = reservations.filter((r) => r.status === 'BOOKED_CONFIRMED');

  const history = reservations.filter((r) =>
    ['REJECTED', 'CANCELLED', 'EXPIRED_AUTO_REJECTED'].includes(r.status)
  );

  return (
    <ClientLayout>
      <div className="space-y-6 font-sans">
        <PageHeader
          title="My Reservations"
          description="Monitor requests, upload supplementary requirements, and track booking approvals."
        />

        {reservations.length === 0 ? (
          <EmptyState
            title="No Reservations Found"
            description="You have not requested any venue reservations yet. Visit the venue directory to schedule an event slot."
            icon={Calendar}
            actionLabel="Browse Venues"
            onActionClick={() => router.push('/')}
          />
        ) : (
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="bg-zinc-150 border border-zinc-200 p-1 rounded-lg">
              <TabsTrigger value="pending" className="font-semibold text-xs py-1.5 px-4 rounded-md">
                Pending Approval ({upcoming.length})
              </TabsTrigger>
              <TabsTrigger value="confirmed" className="font-semibold text-xs py-1.5 px-4 rounded-md">
                Booked / Confirmed ({confirmed.length})
              </TabsTrigger>
              <TabsTrigger value="history" className="font-semibold text-xs py-1.5 px-4 rounded-md">
                Archived ({history.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6 space-y-4">
              {upcoming.length === 0 ? (
                <EmptyState
                  title="No Pending Requests"
                  description="You have no reservations currently undergoing review or awaiting document uploads."
                />
              ) : (
                upcoming.map((res) => (
                  <ReservationCard
                    key={res.id}
                    reservation={res}
                    href={`/reservations/${res.id}`}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="confirmed" className="mt-6 space-y-4">
              {confirmed.length === 0 ? (
                <EmptyState
                  title="No Confirmed Bookings"
                  description="No reservations have been finalized yet. Settle pending documents or payments."
                />
              ) : (
                confirmed.map((res) => (
                  <ReservationCard
                    key={res.id}
                    reservation={res}
                    href={`/reservations/${res.id}`}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-6 space-y-4">
              {history.length === 0 ? (
                <EmptyState
                  title="No Past History"
                  description="You have no rejected, cancelled, or expired reservation requests."
                />
              ) : (
                history.map((res) => (
                  <ReservationCard
                    key={res.id}
                    reservation={res}
                    href={`/reservations/${res.id}`}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </ClientLayout>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import VenueManagerLayout from '@/components/layout/VenueManagerLayout';
import PageHeader from '@/components/shared/PageHeader';
import ReservationCard from '@/components/shared/ReservationCard';
import EmptyState from '@/components/shared/EmptyState';
import { getMockDb } from '@/lib/mock-data';
import { Reservation } from '@/types/reservation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileSearch } from 'lucide-react';

export default function VenueManagerRequests() {
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const db = getMockDb();
    const managedVenueIds = ['venue-cine-adarna', 'venue-palma-hall-400'];
    const resList = db.reservations
      .filter((r) => managedVenueIds.includes(r.venueId))
      .map((r) => ({
        ...r,
        venue: db.venues.find((v) => v.id === r.venueId),
      }));

    setReservations(resList);
  }, []);

  const pending = reservations.filter((r) =>
    ['PRELIMINARY_SUBMITTED', 'UNDER_REVIEW'].includes(r.status)
  );

  const pencil = reservations.filter((r) =>
    ['PENCIL_BOOKED_DRAFT', 'RETURNED_FOR_COMPLETION'].includes(r.status)
  );

  const payment = reservations.filter((r) =>
    ['PAYMENT_PENDING', 'PAYMENT_OVERDUE'].includes(r.status)
  );

  const booked = reservations.filter((r) => r.status === 'BOOKED_CONFIRMED');

  const archive = reservations.filter((r) =>
    ['REJECTED', 'CANCELLED', 'EXPIRED_AUTO_REJECTED'].includes(r.status)
  );

  return (
    <VenueManagerLayout>
      <div className="space-y-6 font-sans">
        <PageHeader
          title="Reservation Requests"
          description="Validate documents, manage pencil bookings, and approve venue scheduling requests."
        />

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="bg-zinc-150 border border-zinc-200 p-1 rounded-lg">
            <TabsTrigger value="pending" className="font-semibold text-xs py-1.5 px-3 rounded-md">
              Review Needed ({pending.length})
            </TabsTrigger>
            <TabsTrigger value="pencil" className="font-semibold text-xs py-1.5 px-3 rounded-md">
              Pencil Booked ({pencil.length})
            </TabsTrigger>
            <TabsTrigger value="payment" className="font-semibold text-xs py-1.5 px-3 rounded-md">
              Payment ({payment.length})
            </TabsTrigger>
            <TabsTrigger value="booked" className="font-semibold text-xs py-1.5 px-3 rounded-md">
              Booked ({booked.length})
            </TabsTrigger>
            <TabsTrigger value="archive" className="font-semibold text-xs py-1.5 px-3 rounded-md">
              Archived ({archive.length})
            </TabsTrigger>
          </TabsList>

          {/* Pending Reviews */}
          <TabsContent value="pending" className="mt-6 space-y-4">
            {pending.length === 0 ? (
              <EmptyState
                title="No Pending Reviews"
                description="All incoming reservation requests have been processed."
                icon={FileSearch}
              />
            ) : (
              pending.map((res) => (
                <ReservationCard
                  key={res.id}
                  reservation={res}
                  href={`/venue-manager/requests/${res.id}`}
                  actionLabel="Review Request"
                />
              ))
            )}
          </TabsContent>

          {/* Pencil bookings */}
          <TabsContent value="pencil" className="mt-6 space-y-4">
            {pencil.length === 0 ? (
              <EmptyState
                title="No Active Pencil Bookings"
                description="There are no pencil-booked slots awaiting supplementary documents."
                icon={FileSearch}
              />
            ) : (
              pencil.map((res) => (
                <ReservationCard
                  key={res.id}
                  reservation={res}
                  href={`/venue-manager/requests/${res.id}`}
                  actionLabel="Manage Pencil Status"
                />
              ))
            )}
          </TabsContent>

          {/* Payments */}
          <TabsContent value="payment" className="mt-6 space-y-4">
            {payment.length === 0 ? (
              <EmptyState
                title="No Pending Payments"
                description="No approved reservations are currently awaiting payment updates."
                icon={FileSearch}
              />
            ) : (
              payment.map((res) => (
                <ReservationCard
                  key={res.id}
                  reservation={res}
                  href={`/venue-manager/requests/${res.id}`}
                  actionLabel="Settle Payment"
                />
              ))
            )}
          </TabsContent>

          {/* Booked */}
          <TabsContent value="booked" className="mt-6 space-y-4">
            {booked.length === 0 ? (
              <EmptyState
                title="No Confirmed Bookings"
                description="There are no active, paid bookings scheduled."
                icon={FileSearch}
              />
            ) : (
              booked.map((res) => (
                <ReservationCard
                  key={res.id}
                  reservation={res}
                  href={`/venue-manager/requests/${res.id}`}
                  actionLabel="View Reservation"
                />
              ))
            )}
          </TabsContent>

          {/* Archive */}
          <TabsContent value="archive" className="mt-6 space-y-4">
            {archive.length === 0 ? (
              <EmptyState
                title="Archive is Empty"
                description="No historical logs found for cancelled or rejected requests."
                icon={FileSearch}
              />
            ) : (
              archive.map((res) => (
                <ReservationCard
                  key={res.id}
                  reservation={res}
                  href={`/venue-manager/requests/${res.id}`}
                  actionLabel="View Records"
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </VenueManagerLayout>
  );
}

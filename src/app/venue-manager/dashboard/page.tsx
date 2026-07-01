'use client';

import React, { useEffect, useState } from 'react';
import VenueManagerLayout from '@/components/layout/VenueManagerLayout';
import PageHeader from '@/components/shared/PageHeader';
import DashboardCard from '@/components/shared/DashboardCard';
import ReservationCard from '@/components/shared/ReservationCard';
import EmptyState from '@/components/shared/EmptyState';
import { getMockDb } from '@/lib/mock-data';
import { Reservation } from '@/types/reservation';
import { FileText, Calendar, Landmark, CheckCircle, Clock } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VenueManagerDashboard() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [stats, setStats] = useState({
    pending: 0,
    pencil: 0,
    payment: 0,
    booked: 0,
  });

  useEffect(() => {
    const db = getMockDb();
    
    // In this mock, we get all reservations for the manager's assigned venues.
    // The venues managed by manager1 are: Cine Adarna (venue-cine-adarna), Palma Hall 400 (venue-palma-hall-400).
    const managedVenueIds = ['venue-cine-adarna', 'venue-palma-hall-400'];
    const resList = db.reservations
      .filter((r) => managedVenueIds.includes(r.venueId))
      .map((r) => ({
        ...r,
        venue: db.venues.find((v) => v.id === r.venueId),
      }));

    setReservations(resList);

    // Calculate stats
    setStats({
      pending: resList.filter((r) => r.status === 'PRELIMINARY_SUBMITTED' || r.status === 'UNDER_REVIEW').length,
      pencil: resList.filter((r) => r.status === 'PENCIL_BOOKED_DRAFT').length,
      payment: resList.filter((r) => r.status === 'PAYMENT_PENDING' || r.status === 'PAYMENT_OVERDUE').length,
      booked: resList.filter((r) => r.status === 'BOOKED_CONFIRMED').length,
    });
  }, []);

  const recentRequests = reservations
    .filter((r) => !['REJECTED', 'CANCELLED', 'EXPIRED_AUTO_REJECTED'].includes(r.status))
    .slice(0, 5);

  return (
    <VenueManagerLayout>
      <div className="space-y-6 font-sans">
        <PageHeader
          title="Venue Manager Dashboard"
          description="Manage reservation approvals, track document completion status, and record payments."
        />

        {/* Dashboard Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Pending Requests"
            value={stats.pending}
            icon={FileText}
            color="blue"
            description="Awaiting document review"
          />
          <DashboardCard
            title="Pencil Booked"
            value={stats.pencil}
            icon={Clock}
            color="zinc"
            description="Holding slot for upload"
          />
          <DashboardCard
            title="Payment Pending"
            value={stats.payment}
            icon={Landmark}
            color="orange"
            description="Validated, awaiting payment"
          />
          <DashboardCard
            title="Confirmed Bookings"
            value={stats.booked}
            icon={CheckCircle}
            color="teal"
            description="Booked reservations"
          />
        </div>

        {/* Recent Requests Section */}
        <div className="space-y-4 pt-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-zinc-900">Active Requests</h3>
              <p className="text-xs text-zinc-500">
                Recent reservation requests that require manager actions.
              </p>
            </div>
            <Link href="/venue-manager/requests">
              <Button variant="outline" size="sm" className="font-semibold text-xs border-zinc-200">
                View All Requests
              </Button>
            </Link>
          </div>

          {recentRequests.length === 0 ? (
            <EmptyState
              title="No Active Requests"
              description="There are no active requests awaiting verification or action."
              icon={Calendar}
            />
          ) : (
            <div className="space-y-4">
              {recentRequests.map((res) => (
                <ReservationCard
                  key={res.id}
                  reservation={res}
                  href={`/venue-manager/requests/${res.id}`}
                  actionLabel="Review Request"
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </VenueManagerLayout>
  );
}

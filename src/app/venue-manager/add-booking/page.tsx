'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import VenueManagerLayout from '@/components/layout/VenueManagerLayout';
import PageHeader from '@/components/shared/PageHeader';
import AddBookingForm from '@/components/forms/AddBookingForm';

export default function AddAssistedBookingPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/venue-manager/requests');
  };

  const handleCancel = () => {
    router.push('/venue-manager/dashboard');
  };

  return (
    <VenueManagerLayout>
      <div className="space-y-6 max-w-3xl mx-auto font-sans">
        <PageHeader
          title="Add Assisted Booking"
          description="Create manual reservation requests for walk-in clients, administrative offices, or student councils."
        />
        <AddBookingForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </VenueManagerLayout>
  );
}

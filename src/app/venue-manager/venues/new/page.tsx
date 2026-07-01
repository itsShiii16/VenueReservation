'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import VenueManagerLayout from '@/components/layout/VenueManagerLayout';
import PageHeader from '@/components/shared/PageHeader';
import AddVenueForm from '@/components/forms/AddVenueForm';

export default function AddNewVenuePage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/venue-manager/venues');
  };

  const handleCancel = () => {
    router.push('/venue-manager/venues');
  };

  return (
    <VenueManagerLayout>
      <div className="space-y-6 max-w-3xl mx-auto font-sans">
        <PageHeader
          title="Add New Venue"
          description="Register a new UP Diliman facility to receive reservation requests."
        />
        <AddVenueForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </VenueManagerLayout>
  );
}

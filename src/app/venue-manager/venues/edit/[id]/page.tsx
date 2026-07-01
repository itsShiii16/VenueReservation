'use client';

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { getMockDb } from '@/lib/mock-data';
import { Venue } from '@/types/venue';
import VenueManagerLayout from '@/components/layout/VenueManagerLayout';
import PageHeader from '@/components/shared/PageHeader';
import AddVenueForm from '@/components/forms/AddVenueForm';
import { toast } from 'sonner';

export default function EditVenuePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [venue, setVenue] = useState<Venue | null>(null);

  useEffect(() => {
    const db = getMockDb();
    const foundVenue = db.venues.find((v) => v.id === id);
    if (!foundVenue) {
      toast.error('Venue not found.');
      router.push('/venue-manager/venues');
      return;
    }
    setVenue(foundVenue);
  }, [id, router]);

  const handleSuccess = () => {
    router.push('/venue-manager/venues');
  };

  const handleCancel = () => {
    router.push('/venue-manager/venues');
  };

  if (!venue) return <p className="p-8 text-center text-zinc-500 italic">Loading venue details...</p>;

  return (
    <VenueManagerLayout>
      <div className="space-y-6 max-w-3xl mx-auto font-sans">
        <PageHeader
          title="Edit Venue Details"
          description={`Update parameters or checklist items for: ${venue.name}`}
        />
        <AddVenueForm initialVenue={venue} onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </VenueManagerLayout>
  );
}

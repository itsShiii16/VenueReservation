'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import SystemAdminLayout from '@/components/layout/SystemAdminLayout';
import PageHeader from '@/components/shared/PageHeader';
import CreateVenueManagerForm from '@/components/forms/CreateVenueManagerForm';

export default function CreateVenueManagerPage() {
  const router = useRouter();

  const handleSuccess = () => {
    router.push('/system-admin/venue-managers');
  };

  const handleCancel = () => {
    router.push('/system-admin/venue-managers');
  };

  return (
    <SystemAdminLayout>
      <div className="space-y-6 max-w-3xl mx-auto font-sans">
        <PageHeader
          title="Register Venue Manager"
          description="Create a new Venue Manager account and assign facility management roles."
        />
        <CreateVenueManagerForm onSuccess={handleSuccess} onCancel={handleCancel} />
      </div>
    </SystemAdminLayout>
  );
}

'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getMockDb, MockRequirementStatus } from '@/lib/mock-data';
import { getCurrentUserClient } from '@/lib/auth';
import { Reservation } from '@/types/reservation';
import { Venue } from '@/types/venue';
import ClientLayout from '@/components/layout/ClientLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import RequirementChecklist, { RequirementItem } from '@/components/shared/RequirementChecklist';
import SupplementaryUploadForm from '@/components/forms/SupplementaryUploadForm';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, HelpCircle, ArrowLeft, XCircle, FileText, Landmark, Building2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ReservationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const refreshData = () => {
    const user = getCurrentUserClient();
    if (!user) {
      router.push('/login');
      return;
    }

    const db = getMockDb();
    const foundRes = db.reservations.find((r) => r.id === id);
    if (!foundRes) {
      toast.error('Reservation not found.');
      router.push('/my-reservations');
      return;
    }

    // Auth validation
    if (foundRes.clientId !== user.id) {
      toast.error('Access denied.');
      router.push('/');
      return;
    }

    const foundVenue = db.venues.find((v) => v.id === foundRes.venueId);
    const reqList = db.requirements
      .filter((req) => req.reservationId === id)
      .map((req) => ({
        id: req.id,
        name: req.requirementName,
        status: req.status,
        fileName: req.fileName,
        remarks: req.remarks,
      }));

    const foundLogs = db.auditLogs.filter(
      (log) => log.entityId === id && log.entityType === 'Reservation'
    );

    setReservation(foundRes);
    setVenue(foundVenue || null);
    setRequirements(reqList);
    setLogs(foundLogs);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [id, router]);

  const handleCancelReservation = () => {
    if (!reservation) return;
    setIsCancelOpen(false);

    const db = getMockDb();
    const idx = db.reservations.findIndex((r) => r.id === reservation.id);
    if (idx > -1) {
      db.reservations[idx].status = 'CANCELLED';
      db.reservations[idx].updatedAt = new Date();

      db.auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'CANCEL_RESERVATION',
        entityType: 'Reservation',
        entityId: reservation.id,
        description: `Client requested cancellation for reservation: "${reservation.eventTitle}"`,
        userId: reservation.clientId,
        createdAt: new Date(),
      });

      db.save();
      toast.success('Reservation request cancelled.');
      refreshData();
    }
  };

  if (loading) {
    return (
      <ClientLayout>
        <p className="p-8 text-center text-zinc-500 italic">Loading details...</p>
      </ClientLayout>
    );
  }

  if (!reservation || !venue) return null;

  const start = new Date(reservation.startTime);
  const end = new Date(reservation.endTime);
  const formattedDate = format(start, 'MMMM d, yyyy');
  const formattedTime = `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;

  const isUploadAllowed = ['PENCIL_BOOKED_DRAFT', 'RETURNED_FOR_COMPLETION'].includes(reservation.status);
  const isCancellationAllowed = !['BOOKED_CONFIRMED', 'CANCELLED', 'REJECTED', 'EXPIRED_AUTO_REJECTED'].includes(reservation.status);

  return (
    <ClientLayout>
      <div className="space-y-6 font-sans">
        {/* Back navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={() => router.push('/my-reservations')}
            variant="ghost"
            size="sm"
            className="text-zinc-600 hover:text-zinc-900 border border-zinc-200 bg-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to My Reservations
          </Button>
          {isCancellationAllowed && (
            <Button
              onClick={() => setIsCancelOpen(true)}
              variant="outline"
              size="sm"
              className="text-red-700 border-red-200 hover:border-red-300 hover:bg-red-50"
            >
              <XCircle className="h-4 w-4 mr-1.5" /> Cancel Request
            </Button>
          )}
        </div>

        {/* Header Title with Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-200">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
              Reference: {reservation.referenceNumber}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {reservation.eventTitle}
            </h1>
          </div>
          <StatusBadge status={reservation.status} className="text-sm px-4 py-1.5" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Columns: Core Info & Checklist */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Summary Details */}
            <Card className="border border-zinc-200 bg-white shadow-sm rounded-xl">
              <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-zinc-700 text-sm">
                    <Building2 className="h-5 w-5 text-zinc-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Venue</p>
                      <p className="font-bold text-zinc-900">{venue.name}</p>
                      <p className="text-xs text-zinc-500 leading-normal">{venue.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-zinc-700 text-sm">
                    <Calendar className="h-5 w-5 text-zinc-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Event Date</p>
                      <p className="font-bold text-zinc-900">{formattedDate}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-zinc-700 text-sm">
                    <Clock className="h-5 w-5 text-zinc-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Time Slot</p>
                      <p className="font-bold text-zinc-900">{formattedTime}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-zinc-700 text-sm">
                    <Users className="h-5 w-5 text-zinc-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Expected Attendees</p>
                      <p className="font-bold text-zinc-900">{reservation.expectedAttendees} guests</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document checklist */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Document Checklist</h3>
                <p className="text-xs text-zinc-500">
                  Track the verification status of your uploaded document files.
                </p>
              </div>
              <RequirementChecklist
                requirements={requirements}
                readOnly={!isUploadAllowed}
                onUpload={(reqName) => {
                  toast.info(`Please use the upload form below to submit files for ${reqName}.`);
                }}
              />
            </div>

            {/* Dynamic upload forms for pencil bookings */}
            {isUploadAllowed && (
              <div className="space-y-4 animate-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">Upload Supplementary Files</h3>
                  <p className="text-xs text-zinc-500">
                    Submit required endorsement and program program files to move to Payment Pending.
                  </p>
                </div>
                <SupplementaryUploadForm
                  reservationId={reservation.id}
                  onSuccess={refreshData}
                />
              </div>
            )}
          </div>

          {/* Right Column: Workflow status and Audit logs */}
          <div className="lg:col-span-1 space-y-6">
            {/* Payment Details if status is PAYMENT_PENDING */}
            {(reservation.status === 'PAYMENT_PENDING' || reservation.status === 'PAYMENT_OVERDUE') && reservation.paymentDeadline && (
              <Card className="border-yellow-200 bg-yellow-50/50 shadow-sm rounded-xl">
                <CardContent className="p-5 space-y-3.5">
                  <div className="flex items-center gap-2 text-yellow-900">
                    <Landmark className="h-5 w-5 shrink-0 text-yellow-800" />
                    <h3 className="font-bold text-sm uppercase tracking-wide">Payment Action Required</h3>
                  </div>
                  <p className="text-xs text-zinc-600 leading-normal">
                    Your documents have been validated. Please settle the reservation fee at the managing unit office to confirm your slot.
                  </p>
                  <div className="border-t border-yellow-200/60 pt-3 flex flex-col gap-1 text-xs text-zinc-700">
                    <span className="font-bold">Amount Due: ₱{venue.defaultRate.toLocaleString()}</span>
                    <span>Deadline: {format(new Date(reservation.paymentDeadline), 'MMMM d, yyyy h:mm a')}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Audit Trail */}
            <Card className="border border-zinc-200 bg-white shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-1.5 pb-2.5 border-b border-zinc-150">
                  <FileText className="h-4.5 w-4.5 text-zinc-400" />
                  <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">Audit Trail</h4>
                </div>

                {logs.length === 0 ? (
                  <p className="text-zinc-500 text-xs italic">No activity logs recorded yet.</p>
                ) : (
                  <div className="space-y-4">
                    {logs.map((log) => (
                      <div key={log.id} className="text-xs flex flex-col gap-1 border-l-2 border-red-800 pl-3 py-0.5">
                        <span className="font-semibold text-zinc-800 leading-snug">{log.description}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {format(new Date(log.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cancellation confirmation */}
        <ConfirmDialog
          isOpen={isCancelOpen}
          onOpenChange={setIsCancelOpen}
          title="Cancel Reservation Request?"
          description="Are you sure you want to cancel this reservation request? This action will release the selected slot and cannot be undone."
          confirmText="Yes, Cancel Request"
          cancelText="No, Keep Request"
          variant="destructive"
          onConfirm={handleCancelReservation}
        />
      </div>
    </ClientLayout>
  );
}

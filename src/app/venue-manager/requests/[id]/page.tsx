'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getMockDb } from '@/lib/mock-data';
import { getCurrentUserClient } from '@/lib/auth';
import { Reservation } from '@/types/reservation';
import { Venue } from '@/types/venue';
import { User } from '@/types/user';
import VenueManagerLayout from '@/components/layout/VenueManagerLayout';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import RequirementChecklist, { RequirementItem } from '@/components/shared/RequirementChecklist';
import ConfirmDialog from '@/components/shared/ConfirmDialog';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { Calendar, Clock, MapPin, Users, HelpCircle, ArrowLeft, Check, X, FileText, Landmark } from 'lucide-react';
import { toast } from 'sonner';
import { checkScheduleConflict } from '@/lib/conflict-checking';

export default function VenueManagerRequestDetail({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [venue, setVenue] = useState<Venue | null>(null);
  const [client, setClient] = useState<User | null>(null);
  const [requirements, setRequirements] = useState<RequirementItem[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog overlays state
  const [activeDialog, setActiveDialog] = useState<'accept_pencil' | 'reject' | 'return' | 'payment_pending' | 'payment_overdue' | 'mark_booked' | null>(null);
  
  // Inputs inside dialogs
  const [rejectReason, setRejectReason] = useState('');
  const [returnRemarks, setReturnRemarks] = useState('');
  const [paymentRemarks, setPaymentRemarks] = useState('');

  const refreshData = () => {
    const user = getCurrentUserClient();
    if (!user || user.role !== 'VENUE_MANAGER') {
      router.push('/login');
      return;
    }

    const db = getMockDb();
    const foundRes = db.reservations.find((r) => r.id === id);
    if (!foundRes) {
      toast.error('Request not found.');
      router.push('/venue-manager/requests');
      return;
    }

    const foundVenue = db.venues.find((v) => v.id === foundRes.venueId);
    const foundClient = db.users.find((u) => u.id === foundRes.clientId);
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
    setClient(foundClient || null);
    setRequirements(reqList);
    setLogs(foundLogs);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, [id, router]);

  // Manager Actions API Calls simulation
  const handleAction = async (action: string, payload?: any) => {
    if (!reservation) return;
    setActiveDialog(null);

    const user = getCurrentUserClient()!;
    const db = getMockDb();

    // Find in DB
    const dbRes = db.reservations.find((r) => r.id === reservation.id);
    if (!dbRes) return;

    if (action === 'accept_pencil') {
      // Conflict check
      const conflictCheck = checkScheduleConflict(dbRes.venueId, dbRes.startTime, dbRes.endTime, dbRes.id);
      if (conflictCheck.conflict) {
        toast.error(conflictCheck.reason || 'This slot conflicts with an existing booking.');
        return;
      }

      // Reject competing preliminary requests
      const resStart = new Date(dbRes.startTime);
      const resEnd = new Date(dbRes.endTime);

      db.reservations.forEach((other) => {
        if (
          other.id !== dbRes.id &&
          other.venueId === dbRes.venueId &&
          other.status === 'PRELIMINARY_SUBMITTED'
        ) {
          const otherStart = new Date(other.startTime);
          const otherEnd = new Date(other.endTime);
          
          if (otherStart < resEnd && otherEnd > resStart) {
            other.status = 'REJECTED';
            other.declineReason = 'Another request was pencil-booked for this slot.';
            other.updatedAt = new Date();
            
            db.auditLogs.push({
              id: `log-${Date.now()}-${Math.random().toString().substr(2,3)}`,
              action: 'AUTO_REJECT_COMPETING',
              entityType: 'Reservation',
              entityId: other.id,
              description: `Auto-rejected competing request reference ${other.referenceNumber}`,
              userId: user.id,
              createdAt: new Date(),
            });
          }
        }
      });

      // Update reservation
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + (venue?.pencilBookingDays ?? 3));

      dbRes.status = 'PENCIL_BOOKED_DRAFT';
      dbRes.pencilBookingDeadline = deadline;
      dbRes.updatedAt = new Date();

      db.auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'ACCEPT_PRELIMINARY_PENCIL',
        entityType: 'Reservation',
        entityId: dbRes.id,
        description: `Accepted preliminary request for pencil booking. Deadline: ${deadline.toLocaleDateString()}`,
        userId: user.id,
        createdAt: new Date(),
      });

      toast.success('Pencil booking accepted. Competing requests auto-rejected.');
    } else if (action === 'reject') {
      dbRes.status = 'REJECTED';
      dbRes.declineReason = rejectReason;
      dbRes.updatedAt = new Date();

      db.auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'REJECT_RESERVATION',
        entityType: 'Reservation',
        entityId: dbRes.id,
        description: `Rejected reservation request. Reason: "${rejectReason}"`,
        userId: user.id,
        createdAt: new Date(),
      });
      toast.success('Reservation request rejected.');
    } else if (action === 'return_completion') {
      dbRes.status = 'RETURNED_FOR_COMPLETION';
      dbRes.returnRemarks = returnRemarks;
      dbRes.updatedAt = new Date();

      // Change status of uploaded requirements to needs revision
      db.requirements.forEach((req) => {
        if (req.reservationId === dbRes.id && req.status === 'Uploaded') {
          req.status = 'Needs Revision';
          req.remarks = returnRemarks;
        }
      });

      db.auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'RETURN_FOR_COMPLETION',
        entityType: 'Reservation',
        entityId: dbRes.id,
        description: `Returned reservation request for completion. Remarks: "${returnRemarks}"`,
        userId: user.id,
        createdAt: new Date(),
      });
      toast.success('Request returned to client for completion.');
    } else if (action === 'move_payment_pending') {
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + (venue?.paymentDeadlineDays ?? 5));

      dbRes.status = 'PAYMENT_PENDING';
      dbRes.paymentDeadline = deadline;
      dbRes.updatedAt = new Date();

      db.auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'MOVE_TO_PAYMENT_PENDING',
        entityType: 'Reservation',
        entityId: dbRes.id,
        description: `Moved reservation to Payment Pending. Payment Deadline: ${deadline.toLocaleDateString()}`,
        userId: user.id,
        createdAt: new Date(),
      });
      toast.success('Moved reservation to Payment Pending.');
    } else if (action === 'mark_payment_overdue') {
      dbRes.status = 'PAYMENT_OVERDUE';
      dbRes.updatedAt = new Date();

      db.auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'MARK_PAYMENT_OVERDUE',
        entityType: 'Reservation',
        entityId: dbRes.id,
        description: 'Marked reservation payment as Overdue',
        userId: user.id,
        createdAt: new Date(),
      });
      toast.success('Marked reservation payment as Overdue.');
    } else if (action === 'mark_booked') {
      dbRes.status = 'BOOKED_CONFIRMED';
      dbRes.paymentRemarks = paymentRemarks;
      dbRes.updatedAt = new Date();

      // Auto-approve all checklist documents
      db.requirements.forEach((req) => {
        if (req.reservationId === dbRes.id) {
          req.status = 'Approved';
        }
      });

      db.auditLogs.push({
        id: `log-${Date.now()}`,
        action: 'CONFIRM_BOOKING',
        entityType: 'Reservation',
        entityId: dbRes.id,
        description: `Confirmed reservation and marked as Booked. Payment Details: "${paymentRemarks || 'Settled'}"`,
        userId: user.id,
        createdAt: new Date(),
      });
      toast.success('Reservation confirmed and marked as Booked!');
    }

    db.save();
    refreshData();
  };

  const handleDocumentStatusChange = (reqId: string, status: RequirementItem['status'], remarks?: string) => {
    const db = getMockDb();
    const req = db.requirements.find((r) => r.id === reqId);
    if (req) {
      req.status = status;
      if (remarks) req.remarks = remarks;
      req.updatedAt = new Date();
      db.save();
      toast.success(`Document status updated to ${status}.`);
      refreshData();
    }
  };

  if (loading) {
    return (
      <VenueManagerLayout>
        <p className="p-8 text-center text-zinc-500 italic">Loading request details...</p>
      </VenueManagerLayout>
    );
  }

  if (!reservation || !venue || !client) return null;

  const start = new Date(reservation.startTime);
  const end = new Date(reservation.endTime);
  const formattedDate = format(start, 'MMMM d, yyyy');
  const formattedTime = `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;

  // Control checks
  const isPencilAction = reservation.status === 'PRELIMINARY_SUBMITTED';
  const isReviewAction = reservation.status === 'UNDER_REVIEW';
  const isPaymentAction = ['PAYMENT_PENDING', 'PAYMENT_OVERDUE'].includes(reservation.status);

  return (
    <VenueManagerLayout>
      <div className="space-y-6 font-sans">
        {/* Back link */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => router.push('/venue-manager/requests')}
            variant="ghost"
            size="sm"
            className="text-zinc-600 hover:text-zinc-900 border border-zinc-200 bg-white"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Requests
          </Button>
        </div>

        {/* Title and reference */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-200">
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
              Request Ref: {reservation.referenceNumber}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
              {reservation.eventTitle}
            </h1>
          </div>
          <StatusBadge status={reservation.status} className="text-sm px-4 py-1.5" />
        </div>

        {/* Layout details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Requester details */}
            <Card className="border border-zinc-200 bg-white shadow-sm rounded-xl">
              <CardContent className="p-6 space-y-4">
                <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wide">
                  Requester Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-zinc-400 block text-[10px] font-bold uppercase mb-0.5">Full Name</span>
                    <span className="font-bold text-zinc-800">
                      {client.firstName} {client.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] font-bold uppercase mb-0.5">UP Mail</span>
                    <span className="font-semibold text-zinc-600">{client.email}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] font-bold uppercase mb-0.5">College / Organization</span>
                    <span className="font-semibold text-zinc-600">{client.organization || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 block text-[10px] font-bold uppercase mb-0.5">Position</span>
                    <span className="font-semibold text-zinc-600">{client.position || 'Student'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Event schedule details */}
            <Card className="border border-zinc-200 bg-white shadow-sm rounded-xl">
              <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-zinc-700 text-sm">
                    <MapPin className="h-5 w-5 text-zinc-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Venue</p>
                      <p className="font-bold text-zinc-900">{venue.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-zinc-700 text-sm">
                    <Calendar className="h-5 w-5 text-zinc-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Date</p>
                      <p className="font-bold text-zinc-900">{formattedDate}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-zinc-700 text-sm">
                    <Clock className="h-5 w-5 text-zinc-400 shrink-0" />
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Schedule Slot</p>
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

            {/* Document Verification Checklist */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-zinc-900">Document Checklist Verification</h3>
                <p className="text-xs text-zinc-500">
                  Verify individual documents uploaded by the client. Approve them to move to payment.
                </p>
              </div>
              <RequirementChecklist
                requirements={requirements}
                isManager={true}
                readOnly={reservation.status === 'REJECTED' || reservation.status === 'CANCELLED'}
                onStatusChange={handleDocumentStatusChange}
              />
            </div>
          </div>

          {/* Right Column: Decisions Control Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border border-zinc-200 bg-white shadow-md rounded-xl overflow-hidden">
              <div className="bg-zinc-900 text-white p-4 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <Landmark className="h-4.5 w-4.5" />
                <span>Approval Actions</span>
              </div>
              <CardContent className="p-5 space-y-4">
                {/* 1. Preliminary / Pencil Actions */}
                {isPencilAction && (
                  <div className="space-y-2.5">
                    <p className="text-xs text-zinc-500 leading-normal mb-2">
                      Review preliminary documents in the checklist. If satisfied, accept to pencil-book the slot.
                    </p>
                    <Button
                      onClick={() => setActiveDialog('accept_pencil')}
                      className="w-full bg-green-700 hover:bg-green-800 text-white font-bold flex items-center justify-center gap-1"
                    >
                      <Check className="h-4 w-4" /> Accept Pencil Booking
                    </Button>
                    <Button
                      onClick={() => setActiveDialog('reject')}
                      variant="destructive"
                      className="w-full font-bold flex items-center justify-center gap-1"
                    >
                      <X className="h-4 w-4" /> Reject Request
                    </Button>
                  </div>
                )}

                {/* 2. Review Actions */}
                {isReviewAction && (
                  <div className="space-y-2.5">
                    <p className="text-xs text-zinc-500 leading-normal mb-2">
                      Check supplementary files. Settle document checks to proceed to payment collection.
                    </p>
                    <Button
                      onClick={() => setActiveDialog('payment_pending')}
                      className="w-full bg-red-800 hover:bg-red-900 text-white font-bold flex items-center justify-center gap-1"
                    >
                      <Check className="h-4 w-4" /> Move to Payment Pending
                    </Button>
                    <Button
                      onClick={() => setActiveDialog('return')}
                      variant="outline"
                      className="w-full font-semibold border-zinc-300 hover:bg-zinc-50 text-zinc-700 flex items-center justify-center gap-1"
                    >
                      <X className="h-4 w-4" /> Return for Completion
                    </Button>
                  </div>
                )}

                {/* 3. Payment Actions */}
                {isPaymentAction && (
                  <div className="space-y-2.5">
                    <p className="text-xs text-zinc-500 leading-normal mb-2">
                      Once payment has been settled manually at the campus architect or institute cash counters, record details here to confirm the reservation.
                    </p>
                    <Button
                      onClick={() => setActiveDialog('mark_booked')}
                      className="w-full bg-green-700 hover:bg-green-800 text-white font-bold flex items-center justify-center gap-1"
                    >
                      <Check className="h-4 w-4" /> Settle Payment & Book
                    </Button>
                    {reservation.status === 'PAYMENT_PENDING' && (
                      <Button
                        onClick={() => setActiveDialog('payment_overdue')}
                        variant="outline"
                        className="w-full font-semibold border-red-200 text-red-800 hover:bg-red-50 flex items-center justify-center gap-1"
                      >
                        <X className="h-4 w-4" /> Mark Payment Overdue
                      </Button>
                    )}
                  </div>
                )}

                {/* 4. Archived/No Action */}
                {!isPencilAction && !isReviewAction && !isPaymentAction && (
                  <p className="text-zinc-500 text-xs italic text-center p-4">
                    This reservation has been finalized ({reservation.status.replace(/_/g, ' ')}). No active options are pending.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Audit Trail Logs */}
            <Card className="border border-zinc-200 bg-white shadow-sm rounded-xl overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wide pb-2 border-b border-zinc-150">
                  Audit Logs
                </h4>
                {logs.length === 0 ? (
                  <p className="text-zinc-500 text-xs italic">No logs recorded yet.</p>
                ) : (
                  <div className="space-y-4">
                    {logs.map((log) => (
                      <div key={log.id} className="text-xs flex flex-col gap-1 border-l-2 border-red-800 pl-3">
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

        {/* Dialog Overlays */}
        <ConfirmDialog
          isOpen={activeDialog === 'accept_pencil'}
          onOpenChange={(open) => !open && setActiveDialog(null)}
          title="Accept Pencil Booking?"
          description="Do you want to accept this request for a pencil booking? This will hold the slot for the client and automatically reject any competing preliminary requests for the same time slot."
          confirmText="Accept & Pencil-Book"
          variant="maroon"
          onConfirm={() => handleAction('accept_pencil')}
        />

        <ConfirmDialog
          isOpen={activeDialog === 'payment_pending'}
          onOpenChange={(open) => !open && setActiveDialog(null)}
          title="Move to Payment Pending?"
          description="Are you sure you want to approve all documents and request payment for this reservation?"
          confirmText="Yes, Move to Payment"
          variant="maroon"
          onConfirm={() => handleAction('move_payment_pending')}
        />

        <ConfirmDialog
          isOpen={activeDialog === 'payment_overdue'}
          onOpenChange={(open) => !open && setActiveDialog(null)}
          title="Mark Payment Overdue?"
          description="Do you want to flag this reservation payment as Overdue? The client will see this flag in their dashboard, but the slot will not be auto-rejected yet."
          confirmText="Mark Overdue"
          variant="destructive"
          onConfirm={() => handleAction('mark_payment_overdue')}
        />

        {/* Dynamic prompt dialogs (Reject/Return/Book) */}
        {activeDialog === 'reject' && (
          <ConfirmDialog
            isOpen={true}
            onOpenChange={() => setActiveDialog(null)}
            title="Reject Reservation Request"
            description="Provide a reason for declining this request. The client will be notified."
            confirmText="Reject Request"
            variant="destructive"
            onConfirm={() => handleAction('reject')}
          >
            <div className="space-y-1.5 my-2">
              <Label className="text-xs font-bold text-zinc-700">Decline Reason</Label>
              <Input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Venue is reserved for maintenance"
              />
            </div>
          </ConfirmDialog>
        )}

        {activeDialog === 'return' && (
          <ConfirmDialog
            isOpen={true}
            onOpenChange={() => setActiveDialog(null)}
            title="Return for Document Completion"
            description="Specify which documents need revision or addition."
            confirmText="Return Request"
            variant="default"
            onConfirm={() => handleAction('return_completion')}
          >
            <div className="space-y-1.5 my-2">
              <Label className="text-xs font-bold text-zinc-700">Required Changes Remarks</Label>
              <Input
                value={returnRemarks}
                onChange={(e) => setReturnRemarks(e.target.value)}
                placeholder="e.g. Endorsement letter missing Dean stamp"
              />
            </div>
          </ConfirmDialog>
        )}

        {activeDialog === 'mark_booked' && (
          <ConfirmDialog
            isOpen={true}
            onOpenChange={() => setActiveDialog(null)}
            title="Confirm Reservation & Book Slot"
            description="Record manual payment details (e.g. Official Receipt reference number)."
            confirmText="Confirm Booking"
            variant="maroon"
            onConfirm={() => handleAction('mark_booked')}
          >
            <div className="space-y-1.5 my-2">
              <Label className="text-xs font-bold text-zinc-700">OR / Payment Receipt Reference</Label>
              <Input
                value={paymentRemarks}
                onChange={(e) => setPaymentRemarks(e.target.value)}
                placeholder="e.g. OR No. 982173B"
              />
            </div>
          </ConfirmDialog>
        )}
      </div>
    </VenueManagerLayout>
  );
}

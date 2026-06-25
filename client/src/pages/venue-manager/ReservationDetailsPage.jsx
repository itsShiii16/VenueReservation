import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { reservationService } from "../../services/reservationService";
import StatusBadge from "../../components/StatusBadge";
import Button from "../../components/Button";
import Textarea from "../../components/Textarea";
import PageHeader from "../../components/PageHeader";
import LoadingState from "../../components/LoadingState";
import { formatDateTime } from "../../utils/formatDate";
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ArrowLeft,
  XCircle,
  ShieldCheck,
  CreditCard,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

export default function ReservationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [declineReason, setDeclineReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  
  // Document revision request state
  const [revisingReqId, setRevisingReqId] = useState(null);
  const [revisionRemarks, setRevisionRemarks] = useState("");
  
  // Payment remarks state
  const [paymentRemarks, setPaymentRemarks] = useState("");

  const fetchReservation = async () => {
    try {
      const res = await reservationService.getById(id);
      setReservation(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reservation details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservation();
  }, [id]);

  const handleApproveOverall = async () => {
    setActionLoading(true);
    try {
      await reservationService.approve(id);
      toast.success("Reservation request fully approved!");
      fetchReservation();
    } catch (err) {
      toast.error("Failed to approve reservation.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeclineOverall = async () => {
    if (!declineReason.trim()) return;
    setActionLoading(true);
    try {
      await reservationService.decline(id, { declineReason });
      toast.success("Reservation request declined.");
      navigate("/vm/reservations");
    } catch (err) {
      toast.error("Failed to decline reservation.");
    } finally {
      setActionLoading(false);
    }
  };

  // Validate requirement: approve
  const handleApproveDocument = async (reqId) => {
    try {
      await reservationService.updateRequirement(id, reqId, "Approved", "Approved by manager");
      toast.success("Document approved.");
      fetchReservation();
    } catch (err) {
      toast.error("Action failed.");
    }
  };

  // Validate requirement: return for completion with remarks
  const handleReturnDocument = async (reqId) => {
    if (!revisionRemarks.trim()) {
      toast.error("Please enter revision instructions.");
      return;
    }
    try {
      await reservationService.updateRequirement(id, reqId, "Needs Revision", revisionRemarks);
      toast.success("Document sent back for correction.");
      setRevisingReqId(null);
      setRevisionRemarks("");
      fetchReservation();
    } catch (err) {
      toast.error("Action failed.");
    }
  };

  // Payment triggers
  const handleSetPaymentPending = async () => {
    try {
      await reservationService.updatePayment(id, "Pending", "Awaiting payment settlement");
      toast.success("Reservation moved to Payment Pending. Client notified.");
      fetchReservation();
    } catch (err) {
      toast.error("Action failed.");
    }
  };

  const handleMarkAsPaid = async () => {
    try {
      await reservationService.updatePayment(id, "Paid", paymentRemarks);
      toast.success("Payment marked as PAID. Reservation fully Booked!");
      fetchReservation();
    } catch (err) {
      toast.error("Action failed.");
    }
  };

  const handleMarkAsOverdue = async () => {
    try {
      await reservationService.updatePayment(id, "Overdue", "Payment deadline missed");
      toast.error("Reservation marked as PAYMENT OVERDUE.");
      fetchReservation();
    } catch (err) {
      toast.error("Action failed.");
    }
  };

  if (loading) return <LoadingState message="Loading reservation details..." />;
  if (!reservation) return <div className="text-center py-16 text-zinc-500">Reservation not found.</div>;

  const canActOverall = ["SUBMITTED", "UNDER_REVIEW"].includes(reservation.status);
  const allDocsApproved = reservation.requirements?.every((req) => req.status === "Approved");
  const isPencilBooking = reservation.status === "DRAFT";

  // Badges color code mapping
  const paymentBadgeColors = {
    None: "bg-zinc-100 text-zinc-400 border-zinc-200",
    Pending: "bg-amber-50 text-amber-800 border-amber-200",
    Paid: "bg-green-50 text-green-800 border-green-200",
    Overdue: "bg-red-50 text-red-800 border-red-200",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Back button */}
      <div>
        <button onClick={() => navigate("/vm/reservations")} className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-red-800 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Requests List
        </button>
      </div>

      {/* Main Info Card */}
      <div className="bg-surface border border-surface-lighter rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">{reservation.eventTitle}</h1>
            <p className="text-sm text-zinc-500 mt-1">Ref: <span className="font-mono text-zinc-600">{reservation.referenceNumber}</span></p>
          </div>
          <div>
            <StatusBadge status={reservation.status} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm border-t border-b border-surface-lighter py-6">
          <div>
            <span className="text-zinc-500 block">Venue & Capacity</span>
            <span className="font-semibold text-gray-100">{reservation.venue?.name}</span>
            <span className="text-xs text-zinc-400 block mt-0.5">Capacity: {reservation.venue?.capacity} persons</span>
          </div>
          
          <div>
            <span className="text-zinc-500 block">Date & Time</span>
            <span className="font-semibold text-gray-100">{formatDateTime(reservation.startTime).split(" ").slice(0, 3).join(" ")}</span>
            <span className="text-xs text-zinc-400 block mt-0.5">
              {formatDateTime(reservation.startTime).split(" ")[3] + " " + formatDateTime(reservation.startTime).split(" ")[4]} - {formatDateTime(reservation.endTime).split(" ")[3] + " " + formatDateTime(reservation.endTime).split(" ")[4]}
            </span>
          </div>

          <div>
            <span className="text-zinc-500 block">Client Info</span>
            <span className="font-semibold text-gray-100">{reservation.client?.firstName} {reservation.client?.lastName}</span>
            <span className="text-xs text-zinc-400 block mt-0.5">{reservation.client?.organization} ({reservation.client?.position})</span>
            <span className="text-xs text-zinc-500 block">{reservation.client?.email}</span>
          </div>
        </div>

        {/* Notes */}
        {reservation.notes && (
          <div className="text-sm">
            <span className="text-zinc-500 font-medium">Notes:</span>
            <p className="text-zinc-300 mt-1 bg-surface-light p-3 rounded-lg border border-surface-lighter">{reservation.notes}</p>
          </div>
        )}
      </div>

      {/* Pencil Booking Draft Alert */}
      {isPencilBooking && (
        <div className="bg-zinc-50 border border-zinc-200 text-zinc-800 rounded-2xl p-5 flex gap-4 items-center">
          <Clock className="w-6 h-6 text-zinc-500" />
          <div>
            <h3 className="font-bold text-gray-900">Pencil Booking Active (Draft Mode)</h3>
            <p className="text-sm text-zinc-600 mt-0.5">The client is currently gathering and uploading the requested documents. You can review requirements but cannot approve this request fully until it is submitted.</p>
          </div>
        </div>
      )}

      {/* Document Checklist & Validation Panel */}
      <div className="bg-surface border border-surface-lighter rounded-2xl p-6 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-red-800" /> Document Verification
          </h2>
          <p className="text-sm text-zinc-500 mt-1">Review the files submitted by the client and validate them.</p>
        </div>

        <div className="divide-y divide-surface-lighter">
          {reservation.requirements?.map((req) => {
            const isRevising = revisingReqId === req.id;

            return (
              <div key={req.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-1">
                  <span className="font-semibold text-gray-100 flex items-center gap-2">
                    {req.status === "Approved" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : req.status === "Needs Revision" ? (
                      <AlertCircle className="w-4 h-4 text-red-600" />
                    ) : req.status === "Uploaded" ? (
                      <Clock className="w-4 h-4 text-blue-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-zinc-500" />
                    )}
                    {req.name}
                  </span>

                  {req.fileName ? (
                    <p className="text-xs text-zinc-400">
                      Uploaded File: <span className="font-mono text-zinc-300 font-semibold">{req.fileName}</span>
                    </p>
                  ) : (
                    <p className="text-xs text-zinc-500 italic">No document uploaded yet</p>
                  )}

                  {req.status === "Needs Revision" && req.remarks && (
                    <p className="text-xs text-red-800 bg-red-50 p-2 rounded border border-red-200 max-w-md">
                      <strong>Remarks: </strong>{req.remarks}
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded
                    ${req.status === "Approved" ? "bg-green-50 text-green-800" :
                      req.status === "Uploaded" ? "bg-blue-50 text-blue-800" :
                      req.status === "Needs Revision" ? "bg-red-50 text-red-800" :
                      "bg-zinc-100 text-zinc-400"}`}
                  >
                    {req.status}
                  </span>

                  {/* Actions for Uploaded documents */}
                  {req.status === "Uploaded" && !isRevising && (
                    <div className="flex gap-2 mt-1">
                      <Button size="sm" variant="success" onClick={() => handleApproveDocument(req.id)}>
                        Approve
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setRevisingReqId(req.id)}>
                        Request Revision
                      </Button>
                    </div>
                  )}

                  {/* Revision Form drawer */}
                  {isRevising && (
                    <div className="w-full max-w-sm bg-surface-light p-3 rounded-lg border border-surface-lighter space-y-2 mt-2">
                      <Textarea
                        id="revision-remarks"
                        label="Revision remarks"
                        placeholder="Explain what needs to be fixed..."
                        value={revisionRemarks}
                        onChange={(e) => setRevisionRemarks(e.target.value)}
                        rows={2}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="ghost" onClick={() => { setRevisingReqId(null); setRevisionRemarks(""); }}>
                          Cancel
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleReturnDocument(req.id)}>
                          Send Request
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Action Flow Card */}
      {allDocsApproved && reservation.status !== "DECLINED" && reservation.status !== "CANCELLED" && (
        <div className="bg-surface border border-surface-lighter rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-red-800" /> Payment & Booking Confirmation
            </h2>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${paymentBadgeColors[reservation.paymentStatus]}`}>
              Payment: {reservation.paymentStatus}
            </span>
          </div>

          <p className="text-sm text-zinc-500">
            All submitted documents are validated and approved. Advance this reservation to the payment stage, verify cashier records, and confirm booking.
          </p>

          {/* Phase 1: Request Payment */}
          {reservation.paymentStatus === "None" && (
            <div className="pt-2">
              <Button onClick={handleSetPaymentPending}>
                Send Payment Request to Client
              </Button>
            </div>
          )}

          {/* Phase 2: Manage Payment (Pending / Overdue) */}
          {["Pending", "Overdue"].includes(reservation.paymentStatus) && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="success" onClick={handleMarkAsPaid}>
                  Confirm Payment & Approve Booking
                </Button>
                <Button variant="outline" onClick={handleMarkAsOverdue} className="text-red-800 hover:bg-red-50 border-red-800/30">
                  Mark Payment Overdue
                </Button>
              </div>

              <div className="max-w-md">
                <Textarea
                  id="paymentRemarks"
                  label="Official Receipt No. / Transaction Details"
                  placeholder="Paste receipt reference code..."
                  value={paymentRemarks}
                  onChange={(e) => setPaymentRemarks(e.target.value)}
                  rows={2}
                />
              </div>
            </div>
          )}

          {/* Fully Booked Phase */}
          {reservation.paymentStatus === "Paid" && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl text-sm flex gap-3 items-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <span className="font-bold">Booking Active & Fully Paid</span>
                <p className="text-xs text-green-700 mt-0.5">This schedule is finalized. The venue has been successfully reserved.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Decline Reservation Panel */}
      {canActOverall && (
        <div className="bg-surface border border-surface-lighter rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-800" /> Destructive Actions
          </h2>
          <p className="text-sm text-zinc-500">Decline this reservation request if the slot is no longer available or details are invalid.</p>
          
          <div className="max-w-xl space-y-3 pt-2">
            <Textarea
              id="declineReason"
              label="Decline remarks"
              placeholder="Explain why this request is being declined..."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={2}
            />
            <Button variant="danger" onClick={handleDeclineOverall} disabled={!declineReason.trim()} loading={actionLoading}>
              Decline Reservation request
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

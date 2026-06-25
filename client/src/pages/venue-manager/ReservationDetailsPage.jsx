/**
 * ReservationDetailsPage.jsx — View and manage a single reservation (VM view)
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { reservationService } from "../../services/reservationService";
import StatusBadge from "../../components/StatusBadge";
import Button from "../../components/Button";
import Textarea from "../../components/Textarea";
import PageHeader from "../../components/PageHeader";
import LoadingState from "../../components/LoadingState";
import { formatDateTime } from "../../utils/formatDate";

export default function ReservationDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [declineReason, setDeclineReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await reservationService.getById(id);
        setReservation(res.data);
      } catch {
        /* handle error */
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await reservationService.approve(id);
      navigate("/vm/reservations");
    } catch { /* handle error */ }
    finally { setActionLoading(false); }
  };

  const handleDecline = async () => {
    if (!declineReason.trim()) return;
    setActionLoading(true);
    try {
      await reservationService.decline(id, { declineReason });
      navigate("/vm/reservations");
    } catch { /* handle error */ }
    finally { setActionLoading(false); }
  };

  if (loading) return <LoadingState message="Loading reservation..." />;
  if (!reservation) return <div className="text-center py-16 text-gray-400">Reservation not found.</div>;

  const canAct = ["SUBMITTED", "UNDER_REVIEW"].includes(reservation.status);

  return (
    <div className="max-w-3xl">
      <PageHeader title={reservation.eventTitle} subtitle={`Ref: ${reservation.referenceNumber}`} />

      <div className="bg-surface border border-surface-lighter rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <StatusBadge status={reservation.status} />
          <span className="text-sm text-gray-500">{formatDateTime(reservation.createdAt)}</span>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-400">Venue:</span> <span className="text-gray-200 ml-2">{reservation.venue?.name}</span></div>
          <div><span className="text-gray-400">Activity:</span> <span className="text-gray-200 ml-2">{reservation.activityType}</span></div>
          <div><span className="text-gray-400">Attendees:</span> <span className="text-gray-200 ml-2">{reservation.expectedAttendees}</span></div>
          <div><span className="text-gray-400">Client:</span> <span className="text-gray-200 ml-2">{reservation.client?.firstName} {reservation.client?.lastName}</span></div>
          <div><span className="text-gray-400">Start:</span> <span className="text-gray-200 ml-2">{formatDateTime(reservation.startTime)}</span></div>
          <div><span className="text-gray-400">End:</span> <span className="text-gray-200 ml-2">{formatDateTime(reservation.endTime)}</span></div>
        </div>

        {reservation.notes && (
          <div>
            <span className="text-sm text-gray-400">Notes:</span>
            <p className="text-gray-300 mt-1">{reservation.notes}</p>
          </div>
        )}

        {/* Action buttons for VM */}
        {canAct && (
          <div className="border-t border-surface-lighter pt-6 space-y-4">
            <div className="flex gap-3">
              <Button variant="success" onClick={handleApprove} loading={actionLoading}>Approve</Button>
              <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
            </div>

            <div>
              <Textarea
                id="declineReason"
                label="Decline with reason"
                placeholder="Explain why this reservation is being declined..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                rows={2}
              />
              <Button variant="danger" size="sm" className="mt-2" onClick={handleDecline} loading={actionLoading} disabled={!declineReason.trim()}>
                Decline Reservation
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

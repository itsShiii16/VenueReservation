/**
 * ReservationRequestsPage.jsx — View reservation requests for managed venues
 */

import { useState, useEffect } from "react";
import { reservationService } from "../../services/reservationService";
import ReservationCard from "../../components/ReservationCard";
import PageHeader from "../../components/PageHeader";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";

export default function ReservationRequestsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await reservationService.getVenueManagerReservations();
        setReservations(res.data || []);
      } catch {
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = filter === "ALL"
    ? reservations
    : reservations.filter((r) => r.status === filter);

  return (
    <div>
      <PageHeader title="Reservation Requests" subtitle="Manage incoming reservation requests for your venues" />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {["ALL", "SUBMITTED", "UNDER_REVIEW", "APPROVED", "DECLINED"].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
              ${filter === status
                ? "bg-primary text-white"
                : "bg-surface-light text-gray-400 hover:text-gray-200"
              }`}
          >
            {status === "ALL" ? "All" : status.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading requests..." />
      ) : filtered.length === 0 ? (
        <EmptyState title="No requests" message="No reservation requests match the selected filter." />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <ReservationCard key={r.id} reservation={r} linkPrefix="/vm/reservations" />
          ))}
        </div>
      )}
    </div>
  );
}

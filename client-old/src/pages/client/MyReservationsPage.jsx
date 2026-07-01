/**
 * MyReservationsPage.jsx - View client's reservation history
 */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Clock3, MapPin, Search } from "lucide-react";
import { reservationService } from "../../services/reservationService";
import StatusBadge from "../../components/StatusBadge";
import Button from "../../components/Button";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import { formatDate, formatTime } from "../../utils/formatDate";

const statusFilters = [
  "ALL",
  "PRELIMINARY_SUBMITTED",
  "PENCIL_BOOKED_DRAFT",
  "UNDER_REVIEW",
  "RETURNED_FOR_COMPLETION",
  "PAYMENT_PENDING",
  "BOOKED_CONFIRMED",
];

const statusAccent = {
  BOOKED_CONFIRMED: "border-l-success",
  UNDER_REVIEW: "border-l-warning",
  PENCIL_BOOKED_DRAFT: "border-l-zinc-300",
  PRELIMINARY_SUBMITTED: "border-l-info",
  RETURNED_FOR_COMPLETION: "border-l-accent",
  PAYMENT_PENDING: "border-l-warning",
};

function labelStatus(status) {
  const labels = {
    ALL: "All",
    PRELIMINARY_SUBMITTED: "Preliminary Submitted",
    PENCIL_BOOKED_DRAFT: "Pencil Booked / Draft",
    UNDER_REVIEW: "Under Review",
    RETURNED_FOR_COMPLETION: "Returned for Completion",
    PAYMENT_PENDING: "Payment Pending",
    BOOKED_CONFIRMED: "Booked / Confirmed",
  };
  return labels[status] || status;
}

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await reservationService.getMy();
        setReservations(res.data);
      } catch {
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filteredReservations = reservations.filter((reservation) => {
    const matchesSearch = [reservation.eventTitle, reservation.venue?.name, reservation.venue?.location]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus = filter === "ALL" || reservation.status === filter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-10">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-100">My Reservations</h1>
          <p className="mt-2 text-xl text-gray-400">Track and manage your submitted requests.</p>
        </div>
        <label className="flex h-12 w-full items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 lg:w-80">
          <Search className="h-5 w-5 text-zinc-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full bg-transparent text-base text-gray-100 placeholder:text-gray-400 focus:outline-none"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-3">
        {statusFilters.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setFilter(status)}
            className={`rounded-full px-5 py-2.5 text-base font-bold transition ${
              filter === status
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-gray-100 hover:bg-zinc-200"
            }`}
          >
            {labelStatus(status)}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading reservations..." />
      ) : filteredReservations.length === 0 ? (
        <EmptyState
          title="No reservations found"
          message={search ? "Try a different search term." : "You have no matching reservation requests."}
        >
          <Link to="/venues">
            <Button>Browse Venues</Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-5">
          {filteredReservations.map((reservation) => (
            <article
              key={reservation.id}
              className={`grid gap-6 rounded-xl border border-zinc-200 border-l-4 bg-white p-7 shadow-sm lg:grid-cols-[1fr_260px] ${
                statusAccent[reservation.status] || "border-l-zinc-300"
              }`}
            >
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-100">{reservation.eventTitle}</h2>
                  <p className="mt-2 text-lg font-bold text-primary">
                    {reservation.venue?.name || "Unknown Venue"}
                  </p>
                </div>

                <div className="grid gap-4 text-base text-gray-400 md:grid-cols-2">
                  <p className="flex items-center gap-3">
                    <CalendarDays className="h-5 w-5 text-zinc-400" aria-hidden="true" />
                    {formatDate(reservation.startTime)}
                  </p>
                  <p className="flex items-center gap-3">
                    <Clock3 className="h-5 w-5 text-zinc-400" aria-hidden="true" />
                    {formatTime(reservation.startTime)} - {formatTime(reservation.endTime)}
                  </p>
                  <p className="flex items-center gap-3 md:col-span-2">
                    <MapPin className="h-5 w-5 text-zinc-400" aria-hidden="true" />
                    {reservation.venue?.location || "UP Diliman"}
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-between gap-6 border-zinc-200 lg:border-l lg:pl-7">
                <div className="flex items-start justify-between gap-4 lg:block lg:space-y-8">
                  <StatusBadge status={reservation.status} />
                  <p className="text-sm text-gray-400 lg:text-right">
                    Last updated: {formatDate(reservation.updatedAt || reservation.startTime)}
                  </p>
                </div>

                <div className="space-y-5 text-center">
                  <Link
                    to={`/reservations/${reservation.id}`}
                    className="flex min-h-12 items-center justify-center rounded-lg border border-zinc-200 text-base font-bold text-gray-100 transition hover:border-primary hover:text-primary"
                  >
                    View Details
                  </Link>
                  {["PRELIMINARY_SUBMITTED", "PENCIL_BOOKED_DRAFT", "UNDER_REVIEW", "RETURNED_FOR_COMPLETION", "PAYMENT_PENDING"].includes(reservation.status) && (
                    <button className="text-base font-bold text-danger hover:text-red-700">
                      Cancel Request
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

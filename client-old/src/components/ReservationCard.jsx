/**
 * ReservationCard.jsx — Card for displaying reservation summary
 */

import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";
import { formatDateTime } from "../utils/formatDate";

export default function ReservationCard({ reservation, linkPrefix = "/reservations" }) {
  return (
    <Link
      to={`${linkPrefix}/${reservation.id}`}
      className="block bg-surface border border-surface-lighter rounded-xl p-4 
        hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-gray-100 truncate">
            {reservation.eventTitle}
          </h3>
          <p className="text-sm text-gray-400 mt-0.5">
            {reservation.venue?.name || "Unknown Venue"}
          </p>
        </div>
        <StatusBadge status={reservation.status} />
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
        <span>Ref: {reservation.referenceNumber}</span>
        <span>{formatDateTime(reservation.startTime)}</span>
        {reservation.bookingSource === "VENUE_MANAGER_ASSISTED" && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
            Venue Manager-Assisted
          </span>
        )}
      </div>
    </Link>
  );
}

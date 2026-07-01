/**
 * VenueCard.jsx — Card component for displaying venue info
 *
 * Two modes:
 * 1. Manager view (editUrl provided): Detailed card with rates, capacity,
 *    hours, amenities, forms, and edit/delete buttons.
 * 2. Public view (no editUrl): Simplified card with name, location, capacity, tags.
 */

import { Link } from "react-router-dom";
import { MapPin, UsersRound, Pencil, Trash2, FileText, Clock } from "lucide-react";
import heroImage from "../assets/hero.png";

export default function VenueCard({ venue, editUrl, onDelete }) {
  // Format time from "HH:MM" to "HH:MM AM/PM"
  const formatTime = (time) => {
    if (!time) return "";
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${String(displayHour).padStart(2, "0")}:${m} ${ampm}`;
  };

  // Format rate with peso sign
  const formatRate = (rate, rateType) => {
    const formatted = new Intl.NumberFormat("en-PH").format(rate || 0);
    const typeLabel = rateType === "HOURLY" ? "/ hour" : rateType === "FLAT" ? "/ day" : "";
    return { amount: `₱${formatted}`, type: typeLabel };
  };

  const rateInfo = formatRate(venue.defaultRate, venue.defaultRateType);
  const allAmenities = [...(venue.amenities || []), ...(venue.equipment || [])];
  const visibleAmenities = allAmenities.slice(0, 4);
  const extraCount = allAmenities.length - visibleAmenities.length;

  // Combine preliminary and supplementary requirements for "Forms for Users"
  const forms = [
    ...(venue.preliminaryRequirements || []),
    ...(venue.supplementaryRequirements || []),
  ].filter(Boolean);

  // ─── Manager View (with editUrl) ───
  if (editUrl) {
    return (
      <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
        {/* Venue Image */}
        <img
          src={venue.imageUrl || heroImage}
          alt={venue.name}
          className="h-48 w-full object-cover"
        />

        {/* Card Body */}
        <div className="space-y-4 p-5">
          {/* Name + Edit/Delete */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 leading-tight">
                {venue.name}
              </h3>
              {venue.managingUnit && (
                <p className="mt-0.5 text-sm text-zinc-500">{venue.managingUnit}</p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={editUrl}
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-50"
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Link>
              {onDelete && (
                <button
                  onClick={() => onDelete(venue.id)}
                  className="inline-flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Rate + Capacity */}
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-zinc-600">
              Rate: <span className="font-bold text-primary">{rateInfo.amount}</span>
              <span className="ml-1 text-zinc-400">{rateInfo.type}</span>
            </p>
            <p className="text-sm text-zinc-600">
              Capacity: <span className="font-bold text-zinc-800">{venue.capacity}</span>
            </p>
          </div>

          {/* Available Hours */}
          <p className="text-sm text-zinc-600">
            Available:{" "}
            <span className="font-bold text-zinc-800">
              {formatTime(venue.defaultOpenTime)} - {formatTime(venue.defaultCloseTime)}
            </span>
          </p>

          {/* Amenities & Equipment */}
          {allAmenities.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-zinc-500">Amenities & Equipment:</p>
              <div className="flex flex-wrap gap-1.5">
                {visibleAmenities.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600"
                  >
                    {item}
                  </span>
                ))}
                {extraCount > 0 && (
                  <span className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-0.5 text-[11px] font-medium text-zinc-400">
                    +{extraCount} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Forms for Users */}
          {forms.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-zinc-500">Forms for Users:</p>
              <div className="flex flex-wrap gap-1.5">
                {forms.slice(0, 3).map((form) => (
                  <span
                    key={form}
                    className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50/50 px-2.5 py-1 text-[11px] font-medium text-red-700"
                  >
                    <FileText className="h-3 w-3" />
                    {form}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </article>
    );
  }

  // ─── Public View (no editUrl) ───
  return (
    <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <img
        src={venue.imageUrl || heroImage}
        alt={venue.name}
        className="h-64 w-full object-cover"
      />
      <div className="space-y-4 p-5">
        <div>
          {venue.managingUnit && (
            <p className="mb-2 text-sm font-bold text-primary">{venue.managingUnit}</p>
          )}
          <h3 className="min-h-[3.5rem] text-2xl font-extrabold leading-tight text-gray-100">
            {venue.name}
          </h3>
        </div>

        <div className="space-y-3 text-base text-gray-400">
          <p className="flex items-center gap-3">
            <MapPin className="h-5 w-5 flex-none text-zinc-400" aria-hidden="true" />
            <span>{venue.location}</span>
          </p>
          <p className="flex items-center gap-3">
            <UsersRound className="h-5 w-5 flex-none text-zinc-400" aria-hidden="true" />
            <span>{venue.capacity} attendees max</span>
          </p>
        </div>

        <div className="flex min-h-7 flex-wrap gap-2">
          {(venue.amenities || []).slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-zinc-200 px-3 py-0.5 text-xs font-semibold text-gray-100"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <Link
            to={`/venues/${venue.id}`}
            className="flex min-h-12 items-center justify-center rounded-lg border border-zinc-200 text-sm font-bold text-gray-100 transition hover:bg-zinc-50"
          >
            View Details
          </Link>
          <Link
            to={`/calendar?venueId=${venue.id}`}
            className="flex min-h-12 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary-dark"
          >
            Book Now
          </Link>
        </div>
      </div>
    </article>
  );
}

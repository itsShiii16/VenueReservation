/**
 * VenueCard.jsx - Card component for displaying venue info
 */

import { Link } from "react-router-dom";
import { MapPin, UsersRound } from "lucide-react";
import heroImage from "../assets/hero.png";

const venueImages = {
  "venue-1":
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
  "venue-2":
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
  "venue-3": heroImage,
  "venue-4":
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
};

const venueDisplay = {
  "venue-1": {
    manager: "UPFI",
    location: "UP Film Institute",
    capacity: 800,
    tags: ["Air Conditioning", "Stage", "Dressing Rooms"],
  },
  "venue-2": {
    name: "Palma Hall Room 400",
    manager: "CSSP",
    location: "Palma Hall",
    capacity: 200,
    tags: ["Air Conditioning"],
  },
  "venue-3": {
    manager: "CS Admin",
    location: "College of Science",
    capacity: 350,
    tags: ["Open Air", "Stage", "Electricity Outlets"],
  },
  "venue-4": {
    manager: "CoE Admin",
    location: "College of Engineering",
    capacity: 25,
    tags: ["Air Conditioning", "Conference Table"],
  },
};

export default function VenueCard({ venue, editUrl }) {
  const display = venueDisplay[venue.id] || {};

  return (
    <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <img
        src={venue.imageUrl || venueImages[venue.id] || heroImage}
        alt={venue.name}
        className="h-64 w-full object-cover"
      />
      <div className="space-y-4 p-5">
        <div>
          {display.manager && (
            <p className="mb-2 text-sm font-bold text-primary">{display.manager}</p>
          )}
          <h3 className="min-h-[3.5rem] text-2xl font-extrabold leading-tight text-gray-100">
            {display.name || venue.name}
          </h3>
        </div>

        <div className="space-y-3 text-base text-gray-400">
          <p className="flex items-center gap-3">
            <MapPin className="h-5 w-5 flex-none text-zinc-400" aria-hidden="true" />
            <span>{display.location || venue.location}</span>
          </p>
          <p className="flex items-center gap-3">
            <UsersRound className="h-5 w-5 flex-none text-zinc-400" aria-hidden="true" />
            <span>{display.capacity || venue.capacity} attendees max</span>
          </p>
        </div>

        <div className="flex min-h-7 flex-wrap gap-2">
          {(display.tags || venue.amenities || []).slice(0, 3).map((tag) => (
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
          {editUrl ? (
            <Link
              to={editUrl}
              className="flex min-h-12 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary-dark"
            >
              Edit Venue
            </Link>
          ) : (
            <Link
              to={`/calendar?venueId=${venue.id}`}
              className="flex min-h-12 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-white transition hover:bg-primary-dark"
            >
              Book Now
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}

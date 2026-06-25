/**
 * VenueCard.jsx — Card component for displaying venue info
 */

import { Link } from "react-router-dom";

export default function VenueCard({ venue }) {
  return (
    <Link
      to={`/venues/${venue.id}`}
      className="group block bg-surface border border-surface-lighter rounded-xl overflow-hidden 
        hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300"
    >
      {/* Image placeholder */}
      <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        {venue.imageUrl ? (
          <img src={venue.imageUrl} alt={venue.name} className="w-full h-full object-cover" />
        ) : (
          <svg className="w-12 h-12 text-primary/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="text-lg font-semibold text-gray-100 group-hover:text-primary transition-colors">
          {venue.name}
        </h3>
        <p className="text-sm text-gray-400 line-clamp-1">{venue.location}</p>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {venue.capacity}
          </span>
          {venue.managingUnit && (
            <span className="truncate">{venue.managingUnit}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

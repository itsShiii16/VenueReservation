/**
 * VenueDirectoryPage.jsx — Browse all available venues
 */

import { useState, useEffect } from "react";
import { venueService } from "../../services/venueService";
import { mockVenues } from "../../data/mockVenues";
import VenueCard from "../../components/VenueCard";
import PageHeader from "../../components/PageHeader";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";

export default function VenueDirectoryPage() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await venueService.getAll();
        setVenues(res.data);
      } catch {
        // Fallback to mock data if backend is not running
        setVenues(mockVenues);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  // Filter venues by search
  const filteredVenues = venues.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <PageHeader
        title="Venue Directory"
        subtitle="Browse available venues across UP Diliman"
      />

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search venues by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-4 py-2.5 bg-surface border border-surface-lighter rounded-lg 
            text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
        />
      </div>

      {/* Venue Grid */}
      {loading ? (
        <LoadingState message="Loading venues..." />
      ) : filteredVenues.length === 0 ? (
        <EmptyState
          title="No venues found"
          message={search ? "Try a different search term." : "No venues are available at the moment."}
        />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredVenues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  );
}

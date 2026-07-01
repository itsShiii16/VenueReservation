/**
 * VenueDirectoryPage.jsx — Browse all available venues
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Filter, Search } from "lucide-react";
import { venueService } from "../../services/venueService";
import VenueCard from "../../components/VenueCard";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";

const filters = ["All", "Large Capacity", "Seminar", "Performance", "Meeting", "Outdoor"];

export default function VenueDirectoryPage() {
  const [searchParams] = useSearchParams();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await venueService.getAll();
        setVenues(res.data);
      } catch {
        setVenues([]);
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
    <div className="space-y-10 pb-16">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <h1 className="text-4xl font-extrabold text-gray-100">Venue Directory</h1>

        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="flex h-12 w-full items-center gap-3 rounded-lg border border-zinc-200 bg-white px-4 sm:w-80">
            <Search className="h-5 w-5 text-zinc-400" aria-hidden="true" />
            <input
              type="text"
              placeholder="Search venues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent text-base text-gray-100 placeholder:text-gray-400 focus:outline-none"
            />
          </label>
          <button className="inline-flex h-12 items-center justify-center gap-3 rounded-lg border border-zinc-200 bg-white px-6 text-base font-bold text-gray-100 transition hover:border-primary hover:text-primary">
            <Filter className="h-5 w-5" aria-hidden="true" />
            Filters
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActiveFilter(filter)}
            className={`rounded-full px-6 py-2.5 text-base font-bold transition ${
              activeFilter === filter
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-gray-100 hover:bg-zinc-200"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading venues..." />
      ) : filteredVenues.length === 0 ? (
        <EmptyState
          title="No venues found"
          message={search ? "Try a different search term." : "No venues are available at the moment."}
        />
      ) : (
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {filteredVenues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  );
}

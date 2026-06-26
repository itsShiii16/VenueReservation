/**
 * LocationsPage.jsx — System Admin Locations & Venue Management Page
 */

import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import LoadingState from "../../components/LoadingState";
import Button from "../../components/Button";
import { venueService } from "../../services/venueService";
import { MapPin, Trash2, Users, CreditCard, Building } from "lucide-react";
import { toast } from "sonner";

export default function LocationsPage() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchVenues = async () => {
    try {
      const res = await venueService.getAll();
      setVenues(res.data || []);
    } catch (err) {
      console.error("Failed to load venues for locations:", err);
      toast.error("Failed to load venues.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleDelete = async (venueId, venueName) => {
    if (!window.confirm(`Are you sure you want to deactivate (soft-delete) ${venueName}?`)) return;
    setDeletingId(venueId);
    try {
      await venueService.delete(venueId);
      toast.success(`${venueName} has been soft-deleted.`);
      await fetchVenues();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete venue.");
    } finally {
      setDeletingId(null);
    }
  };

  // Group venues by location string
  const groupedVenues = venues.reduce((acc, venue) => {
    const locationKey = venue.location || "Unspecified Location";
    if (!acc[locationKey]) {
      acc[locationKey] = [];
    }
    acc[locationKey].push(venue);
    return acc;
  }, {});

  const locationsList = Object.keys(groupedVenues).sort();

  if (loading) return <LoadingState message="Loading locations and facilities..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Locations & Facilities"
        subtitle="Manage campus locations and soft-delete/deactivate venues"
      />

      {locationsList.length === 0 ? (
        <div className="text-center py-16 bg-surface border border-surface-lighter rounded-2xl text-zinc-500 text-sm">
          <MapPin className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-gray-100">No active locations found</h3>
          <p className="text-xs text-zinc-500 mt-1">Create venues under a location to list them here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {locationsList.map((locationName) => {
            const locationVenues = groupedVenues[locationName];
            return (
              <div
                key={locationName}
                className="bg-surface border border-surface-lighter rounded-2xl p-6 shadow-sm space-y-4"
              >
                {/* Location Header */}
                <div className="flex items-center justify-between border-b border-surface-lighter pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h2 className="text-lg font-bold text-gray-100">{locationName}</h2>
                  </div>
                  <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-1 rounded-full">
                    {locationVenues.length} {locationVenues.length === 1 ? "Venue" : "Venues"}
                  </span>
                </div>

                {/* Venues inside this location */}
                <div className="grid md:grid-cols-2 gap-4">
                  {locationVenues.map((venue) => (
                    <div
                      key={venue.id}
                      className="bg-surface-light border border-surface-lighter rounded-xl p-4 flex flex-col justify-between gap-4 hover:border-primary/20 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-bold text-gray-100 text-sm flex items-center gap-1.5">
                            <Building className="w-4 h-4 text-zinc-500" />
                            {venue.name}
                          </h3>
                        </div>
                        {venue.description && (
                          <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">
                            {venue.description}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> Cap: {venue.capacity}
                          </span>
                          <span className="flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5" /> ₱{venue.defaultRate.toLocaleString()}/{venue.defaultRateType.toLowerCase()}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-500 bg-surface/50 border border-surface-lighter/50 px-2 py-1 rounded-lg inline-block">
                          Managing Unit: <span className="font-semibold text-gray-200">{venue.managingUnit || "Unassigned"}</span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-surface-lighter/40">
                        <Button
                          size="sm"
                          variant="danger"
                          loading={deletingId === venue.id}
                          onClick={() => handleDelete(venue.id, venue.name)}
                          className="inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Deactivate Venue
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

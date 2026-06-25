/**
 * VenueDetailsPage.jsx — View a single venue's details
 */

import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { venueService } from "../../services/venueService";
import { mockVenues } from "../../data/mockVenues";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import LoadingState from "../../components/LoadingState";
import { useAuth } from "../../hooks/useAuth";

export default function VenueDetailsPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const res = await venueService.getById(id);
        setVenue(res.data);
      } catch {
        // Fallback to mock data
        setVenue(mockVenues.find((v) => v.id === id) || null);
      } finally {
        setLoading(false);
      }
    };
    fetchVenue();
  }, [id]);

  if (loading) return <LoadingState message="Loading venue details..." />;
  if (!venue) {
    return (
      <div className="text-center py-16">
        <h2 className="text-xl font-bold text-gray-200">Venue not found</h2>
        <Link to="/venues" className="text-primary mt-2 inline-block">Back to venues</Link>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={venue.name} subtitle={venue.location}>
        {isAuthenticated && (
          <Link to={`/reserve?venueId=${venue.id}`}>
            <Button>Reserve This Venue</Button>
          </Link>
        )}
      </PageHeader>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image */}
          <div className="h-64 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
            {venue.imageUrl ? (
              <img src={venue.imageUrl} alt={venue.name} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span className="text-6xl">🏛️</span>
            )}
          </div>

          {/* Description */}
          {venue.description && (
            <div className="bg-surface border border-surface-lighter rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">About</h3>
              <p className="text-gray-300 leading-relaxed">{venue.description}</p>
            </div>
          )}

          {/* Rules */}
          {venue.rules && (
            <div className="bg-surface border border-surface-lighter rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-2">Rules & Guidelines</h3>
              <p className="text-gray-300">{venue.rules}</p>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Quick Facts */}
          <div className="bg-surface border border-surface-lighter rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-100">Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Capacity</span>
                <span className="text-gray-200">{venue.capacity} persons</span>
              </div>
              {venue.managingUnit && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Managing Unit</span>
                  <span className="text-gray-200">{venue.managingUnit}</span>
                </div>
              )}
            </div>
          </div>

          {/* Amenities */}
          {venue.amenities?.length > 0 && (
            <div className="bg-surface border border-surface-lighter rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-3">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {venue.amenities.map((a) => (
                  <span key={a} className="px-2.5 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Equipment */}
          {venue.equipment?.length > 0 && (
            <div className="bg-surface border border-surface-lighter rounded-xl p-6">
              <h3 className="text-lg font-semibold text-gray-100 mb-3">Equipment</h3>
              <div className="flex flex-wrap gap-2">
                {venue.equipment.map((e) => (
                  <span key={e} className="px-2.5 py-1 bg-secondary/10 text-secondary text-xs rounded-full">
                    {e}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

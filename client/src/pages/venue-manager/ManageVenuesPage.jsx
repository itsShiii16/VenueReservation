/**
 * ManageVenuesPage.jsx — List of venues managed by this Venue Manager
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { venueService } from "../../services/venueService";
import VenueCard from "../../components/VenueCard";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";

export default function ManageVenuesPage() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await venueService.getAll();
        // In a real app, filter by createdById === current user
        setVenues(res.data || []);
      } catch {
        setVenues([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  return (
    <div>
      <PageHeader title="Manage Venues" subtitle="Venues you are responsible for">
        <Link to="/vm/venues/add">
          <Button>Add Venue</Button>
        </Link>
      </PageHeader>

      {loading ? (
        <LoadingState message="Loading your venues..." />
      ) : venues.length === 0 ? (
        <EmptyState title="No venues yet" message="You haven't added any venues yet.">
          <Link to="/vm/venues/add"><Button>Add Your First Venue</Button></Link>
        </EmptyState>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}
    </div>
  );
}

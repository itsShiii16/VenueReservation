/**
 * MyReservationsPage.jsx — View client's reservation history
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { reservationService } from "../../services/reservationService";
import { mockReservations } from "../../data/mockReservations";
import ReservationCard from "../../components/ReservationCard";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await reservationService.getMy();
        setReservations(res.data);
      } catch {
        setReservations(mockReservations);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div>
      <PageHeader title="My Reservations" subtitle="Track and manage your venue bookings">
        <Link to="/reserve">
          <Button>New Reservation</Button>
        </Link>
      </PageHeader>

      {loading ? (
        <LoadingState message="Loading reservations..." />
      ) : reservations.length === 0 ? (
        <EmptyState
          title="No reservations yet"
          message="You haven't submitted any reservation requests yet."
        >
          <Link to="/venues">
            <Button>Browse Venues</Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {reservations.map((r) => (
            <ReservationCard key={r.id} reservation={r} />
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * ReservationFormPage.jsx — Submit a new reservation
 */

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { reservationService } from "../../services/reservationService";
import { venueService } from "../../services/venueService";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Textarea from "../../components/Textarea";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";

export default function ReservationFormPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const prefilledVenueId = searchParams.get("venueId") || "";
  const prefilledDate = searchParams.get("date") || "";
  
  const [formData, setFormData] = useState({
    venueId: prefilledVenueId,
    eventTitle: "",
    expectedAttendees: "",
    startTime: prefilledDate ? `${prefilledDate}T08:00` : "",
    endTime: prefilledDate ? `${prefilledDate}T17:00` : "",
    notes: "",
  });

  const selectedVenue = venues.find((v) => v.id === formData.venueId);

  useEffect(() => {
    venueService.getAll().then((res) => setVenues(res.data || [])).catch(() => {});
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await reservationService.create(formData);
      navigate("/my-reservations");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit reservation.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="New Reservation"
        subtitle="Fill in the details to submit a reservation request"
      />

      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-surface-lighter rounded-xl p-6 space-y-5"
      >
        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-3">
            {error}
          </div>
        )}

        <Select
          id="venueId"
          label="Venue"
          name="venueId"
          value={formData.venueId}
          onChange={handleChange}
          options={venues.map((v) => ({ value: v.id, label: v.name }))}
          placeholder="Select a venue"
          required
        />

        <Input id="eventTitle" label="Event Title" name="eventTitle" placeholder="e.g., CS Department Assembly" value={formData.eventTitle} onChange={handleChange} required />

        <Input id="expectedAttendees" label="Expected Attendees" name="expectedAttendees" type="number" min="1" placeholder="e.g., 50" value={formData.expectedAttendees} onChange={handleChange} required />

        <div className="grid grid-cols-2 gap-4">
          <Input id="startTime" label="Start Date & Time" name="startTime" type="datetime-local" value={formData.startTime} onChange={handleChange} required />
          <Input id="endTime" label="End Date & Time" name="endTime" type="datetime-local" value={formData.endTime} onChange={handleChange} required />
        </div>

        <Textarea id="notes" label="Additional Notes (optional)" name="notes" placeholder="Any special requests or requirements..." value={formData.notes} onChange={handleChange} rows={3} />

        {(selectedVenue?.allowsPencilBooking || selectedVenue?.allowPencilBooking) && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-zinc-700">
            <span className="block text-zinc-900 font-semibold mb-1">Preliminary requirement flow</span>
            This venue allows pencil booking, but submitting this form will not hold the slot yet.
            The Venue Manager reviews all preliminary submissions for the same slot and accepts one
            request for pencil booking.
          </div>
        )}

        {selectedVenue && !(selectedVenue.allowsPencilBooking || selectedVenue.allowPencilBooking) && (
          <div className="p-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm text-zinc-700">
            <span className="block text-zinc-900 font-semibold mb-1">Full reservation flow</span>
            This venue does not use pencil booking. Submit all requirements at once for manager review.
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={loading}>Submit Requirements</Button>
        </div>
      </form>
    </div>
  );
}

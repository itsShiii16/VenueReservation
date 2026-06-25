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

const activityTypes = [
  { value: "Academic Assembly", label: "Academic Assembly" },
  { value: "Cultural Event", label: "Cultural Event" },
  { value: "Academic Defense", label: "Academic Defense" },
  { value: "Seminar", label: "Seminar" },
  { value: "Workshop", label: "Workshop" },
  { value: "Meeting", label: "Meeting" },
  { value: "Organization Event", label: "Organization Event" },
  { value: "Other", label: "Other" },
];

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
    activityType: "",
    expectedAttendees: "",
    startTime: prefilledDate ? `${prefilledDate}T08:00` : "",
    endTime: prefilledDate ? `${prefilledDate}T17:00` : "",
    notes: "",
  });

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

        <Select id="activityType" label="Activity Type" name="activityType" value={formData.activityType} onChange={handleChange} options={activityTypes} required />

        <Input id="expectedAttendees" label="Expected Attendees" name="expectedAttendees" type="number" min="1" placeholder="e.g., 50" value={formData.expectedAttendees} onChange={handleChange} required />

        <div className="grid grid-cols-2 gap-4">
          <Input id="startTime" label="Start Date & Time" name="startTime" type="datetime-local" value={formData.startTime} onChange={handleChange} required />
          <Input id="endTime" label="End Date & Time" name="endTime" type="datetime-local" value={formData.endTime} onChange={handleChange} required />
        </div>

        <Textarea id="notes" label="Additional Notes (optional)" name="notes" placeholder="Any special requests or requirements..." value={formData.notes} onChange={handleChange} rows={3} />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={loading}>Submit Reservation</Button>
        </div>
      </form>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { venueService } from "../../services/venueService";
import { reservationService } from "../../services/reservationService";
import { useAuth } from "../../hooks/useAuth";
import VenueCard from "../../components/VenueCard";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Textarea from "../../components/Textarea";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import { toast } from "sonner";

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

export default function ManageVenuesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Assisted booking state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    venueId: "",
    clientEmail: "",
    clientFirstName: "",
    clientLastName: "",
    clientOrganization: "",
    eventTitle: "",
    activityType: "",
    expectedAttendees: "",
    startTime: "",
    endTime: "",
    isPaid: false,
  });

  const fetchVenues = async () => {
    try {
      const res = await venueService.getAll();
      // Only show venues created by this manager
      const managed = (res.data || []).filter((v) => v.createdById === user?.id);
      setVenues(managed);
      if (managed.length > 0) {
        setFormData((prev) => ({ ...prev, venueId: managed[0].id }));
      }
    } catch {
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchVenues();
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateAssistedBooking = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await reservationService.createAssisted(formData);
      toast.success("Assisted Booking created successfully!");
      setIsModalOpen(false);
      // Reset form
      setFormData({
        venueId: venues[0]?.id || "",
        clientEmail: "",
        clientFirstName: "",
        clientLastName: "",
        clientOrganization: "",
        eventTitle: "",
        activityType: "",
        expectedAttendees: "",
        startTime: "",
        endTime: "",
        isPaid: false,
      });
      // Redirect to the reservation request list to verify
      navigate("/vm/reservations");
    } catch (err) {
      toast.error(err.message || "Failed to create assisted booking.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div>
      <PageHeader title="Manage Venues" subtitle="Venues you are responsible for">
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsModalOpen(true)} disabled={venues.length === 0}>
            Create Assisted Booking
          </Button>
          <Link to="/vm/venues/add">
            <Button>Add Venue</Button>
          </Link>
        </div>
      </PageHeader>

      {loading ? (
        <LoadingState message="Loading your venues..." />
      ) : venues.length === 0 ? (
        <EmptyState title="No venues yet" message="You haven't added any venues yet.">
          <Link to="/vm/venues/add">
            <Button>Add Your First Venue</Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      )}

      {/* Assisted Booking Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Assisted Booking" size="xl">
        <form onSubmit={handleCreateAssistedBooking} className="space-y-4">
          <p className="text-xs text-zinc-500">
            Submit a pre-approved reservation on behalf of a client. Document requirements will be auto-approved.
          </p>

          <Select
            id="assisted-venue"
            label="Assigned Venue"
            name="venueId"
            value={formData.venueId}
            onChange={handleInputChange}
            options={venues.map((v) => ({ value: v.id, label: v.name }))}
            required
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="assisted-email"
              label="Client Email"
              name="clientEmail"
              type="email"
              placeholder="e.g. adviser@up.edu.ph"
              value={formData.clientEmail}
              onChange={handleInputChange}
              required
            />
            <Input
              id="assisted-org"
              label="Client Organization / Dept"
              name="clientOrganization"
              placeholder="e.g. Dept of Physics"
              value={formData.clientOrganization}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="assisted-first"
              label="Client First Name"
              name="clientFirstName"
              placeholder="First name"
              value={formData.clientFirstName}
              onChange={handleInputChange}
              required
            />
            <Input
              id="assisted-last"
              label="Client Last Name"
              name="clientLastName"
              placeholder="Last name"
              value={formData.clientLastName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="assisted-title"
              label="Event Title"
              name="eventTitle"
              placeholder="e.g. Guest Lecture"
              value={formData.eventTitle}
              onChange={handleInputChange}
              required
            />
            <Select
              id="assisted-activity"
              label="Activity Type"
              name="activityType"
              value={formData.activityType}
              onChange={handleInputChange}
              options={activityTypes}
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              id="assisted-start"
              label="Start Date & Time"
              name="startTime"
              type="datetime-local"
              value={formData.startTime}
              onChange={handleInputChange}
              required
            />
            <Input
              id="assisted-end"
              label="End Date & Time"
              name="endTime"
              type="datetime-local"
              value={formData.endTime}
              onChange={handleInputChange}
              required
            />
            <Input
              id="assisted-attendees"
              label="Expected Attendees"
              name="expectedAttendees"
              type="number"
              min="1"
              value={formData.expectedAttendees}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-zinc-50 border border-surface-lighter rounded-lg">
            <input
              type="checkbox"
              id="assisted-paid"
              name="isPaid"
              checked={formData.isPaid}
              onChange={handleInputChange}
              className="h-4 w-4 accent-red-800 text-red-800 border-zinc-300 rounded"
            />
            <label htmlFor="assisted-paid" className="text-sm text-zinc-600 font-semibold cursor-pointer">
              Mark Booking Fee as PAID
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-surface-lighter">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              Confirm & Book Slot
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

/**
 * ManageVenuesPage.jsx — Venue manager's venue listing page
 *
 * Shows venue cards in a 2-column grid with the redesigned manager card layout.
 * Includes: Add Venue button, Edit/Delete actions, and Assisted Booking modal.
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { venueService } from "../../services/venueService";
import { reservationService } from "../../services/reservationService";
import { useAuth } from "../../hooks/useAuth";
import VenueCard from "../../components/VenueCard";
import Button from "../../components/Button";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Select from "../../components/Select";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import ConfirmDialog from "../../components/ConfirmDialog";
import { toast } from "sonner";
import { Plus } from "lucide-react";

export default function ManageVenuesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delete confirmation state
  const [deleteId, setDeleteId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Assisted booking state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    venueId: "",
    clientEmail: "",
    clientFirstName: "",
    clientLastName: "",
    eventTitle: "",
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

  const handleDelete = async (venueId) => {
    setDeleteId(venueId);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await venueService.delete(deleteId);
      toast.success("Venue deleted successfully.");
      setVenues((prev) => prev.filter((v) => v.id !== deleteId));
    } catch (err) {
      toast.error(err.message || "Failed to delete venue.");
    } finally {
      setDeleting(false);
      setDeleteId(null);
    }
  };

  const handleCreateAssistedBooking = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await reservationService.createAssisted(formData);
      toast.success("Booking added successfully.");
      setIsModalOpen(false);
      // Reset form
      setFormData({
        venueId: venues[0]?.id || "",
        clientEmail: "",
        clientFirstName: "",
        clientLastName: "",
        eventTitle: "",
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
      {/* Page Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Manage Venues</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Add, edit, or configure venue settings and requirements.
          </p>
        </div>
        <Link to="/vm/venues/add">
          <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-dark">
            <Plus className="h-4 w-4" />
            Add Venue
          </button>
        </Link>
      </div>

      {/* Venue Grid */}
      {loading ? (
        <LoadingState message="Loading your venues..." />
      ) : venues.length === 0 ? (
        <EmptyState title="No venues yet" message="You haven't added any venues yet.">
          <Link to="/vm/venues/add">
            <Button>Add Your First Venue</Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {venues.map((venue) => (
            <VenueCard
              key={venue.id}
              venue={venue}
              editUrl={`/vm/venues/${venue.id}/edit`}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Venue"
        message="Are you sure you want to delete this venue? This action cannot be undone. All associated reservations and blocked slots will also be removed."
        confirmText={deleting ? "Deleting..." : "Delete"}
        loading={deleting}
        variant="danger"
      />

      {/* Assisted Booking Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Booking" size="xl">
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

          <Input
            id="assisted-email"
            label="Client Email"
            name="clientEmail"
            type="email"
            placeholder="e.g. requester@up.edu.ph"
            value={formData.clientEmail}
            onChange={handleInputChange}
            required
          />

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

          <Input
            id="assisted-title"
            label="Event Title"
            name="eventTitle"
            placeholder="e.g. Guest Lecture"
            value={formData.eventTitle}
            onChange={handleInputChange}
            required
          />

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
              Mark payment as paid
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-surface-lighter">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={formLoading}>
              Add Booking
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

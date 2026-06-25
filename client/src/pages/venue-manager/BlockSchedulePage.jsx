import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { blockedSlotService } from "../../services/blockedSlotService";
import { venueService } from "../../services/venueService";
import { useAuth } from "../../hooks/useAuth";
import Input from "../../components/Input";
import Select from "../../components/Select";
import Textarea from "../../components/Textarea";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";

export default function BlockSchedulePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingVenues, setLoadingVenues] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const prefilledVenueId = searchParams.get("venueId") || "";
  const prefilledDate = searchParams.get("date") || "";

  const [formData, setFormData] = useState({
    venueId: prefilledVenueId,
    startTime: prefilledDate ? `${prefilledDate}T08:00` : "",
    endTime: prefilledDate ? `${prefilledDate}T17:00` : "",
    reason: "",
  });

  // Fetch managed venues
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await venueService.getAll();
        if (res.success && Array.isArray(res.data)) {
          // Filter to only display venues managed by this venue manager
          const managed = res.data.filter((v) => v.createdById === user?.id);
          setVenues(managed);
        }
      } catch (err) {
        console.error("Failed to load venues:", err);
      } finally {
        setLoadingVenues(false);
      }
    };
    if (user?.id) {
      fetchVenues();
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      await blockedSlotService.create(formData);
      setSuccess("Schedule blocked successfully!");
      setFormData({
        venueId: prefilledVenueId,
        startTime: prefilledDate ? `${prefilledDate}T08:00` : "",
        endTime: prefilledDate ? `${prefilledDate}T17:00` : "",
        reason: "",
      });
      // Delay navigation back to the dashboard/calendar slightly so they can see success
      setTimeout(() => {
        navigate("/venue-manager/calendar");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to block schedule.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Block Schedule"
        subtitle="Prevent clients from reserving a venue during scheduled maintenance, official holidays, or events"
      />

      <form onSubmit={handleSubmit} className="bg-surface border border-surface-lighter rounded-xl p-6 space-y-5">
        {error && <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-3">{error}</div>}
        {success && <div className="bg-success/10 border border-success/30 text-success text-sm rounded-lg p-3">{success}</div>}

        <Select
          id="venueId"
          label="Venue to Block"
          name="venueId"
          value={formData.venueId}
          onChange={handleChange}
          options={venues.map((v) => ({ value: v.id, label: v.name }))}
          placeholder={loadingVenues ? "Loading venues..." : "Select venue to block"}
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input id="startTime" label="Start" name="startTime" type="datetime-local" value={formData.startTime} onChange={handleChange} required />
          <Input id="endTime" label="End" name="endTime" type="datetime-local" value={formData.endTime} onChange={handleChange} required />
        </div>

        <Textarea id="reason" label="Reason for Blocking (optional)" name="reason" placeholder="e.g., Facility maintenance, holiday, or special university event" value={formData.reason} onChange={handleChange} rows={2} />

        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={() => navigate(-1)}>
            Go Back
          </Button>
          <Button type="submit" variant="danger" loading={loading}>
            Block Time Slots
          </Button>
        </div>
      </form>
    </div>
  );
}

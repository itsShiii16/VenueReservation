import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { venueService } from "../../services/venueService";
import Input from "../../components/Input";
import Textarea from "../../components/Textarea";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";
import LoadingState from "../../components/LoadingState";
import Select from "../../components/Select";

export default function EditVenuePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const res = await venueService.getById(id);
        const v = res.data;
        setFormData({
          name: v.name,
          location: v.location,
          capacity: String(v.capacity),
          description: v.description || "",
          managingUnit: v.managingUnit || "",
          rules: v.rules || "",
          imageUrl: v.imageUrl || "",
          defaultRate: String(v.defaultRate ?? 0),
          defaultRateType: v.defaultRateType || "HOURLY",
          defaultOpenTime: v.defaultOpenTime || "08:00",
          defaultCloseTime: v.defaultCloseTime || "17:00",
        });
      } catch {
        setError("Failed to load venue.");
      } finally {
        setLoading(false);
      }
    };
    fetchVenue();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await venueService.update(id, {
        ...formData,
        capacity: parseInt(formData.capacity),
        defaultRate: parseFloat(formData.defaultRate || 0),
      });
      navigate("/vm/venues");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update venue.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingState message="Loading venue..." />;

  return (
    <div className="max-w-2xl">
      <PageHeader title="Edit Venue" subtitle="Update venue information" />

      <form onSubmit={handleSubmit} className="bg-surface border border-surface-lighter rounded-xl p-6 space-y-5">
        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-3">{error}</div>
        )}

        {formData && (
          <>
            <Input id="name" label="Venue Name" name="name" value={formData.name} onChange={handleChange} required />
            <Input id="location" label="Location" name="location" value={formData.location} onChange={handleChange} required />
            
            <div className="grid grid-cols-2 gap-4">
              <Input id="capacity" label="Capacity" name="capacity" type="number" min="1" value={formData.capacity} onChange={handleChange} required />
              <Input id="managingUnit" label="Managing Unit" name="managingUnit" value={formData.managingUnit} onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-surface-lighter pt-4">
              <Input id="defaultRate" label="Default Rate (₱)" name="defaultRate" type="number" min="0" step="any" value={formData.defaultRate} onChange={handleChange} required />
              <Select
                id="defaultRateType"
                label="Rate Type"
                name="defaultRateType"
                value={formData.defaultRateType}
                onChange={handleChange}
                placeholder="Select type"
                options={[
                  { value: "HOURLY", label: "Hourly Rate" },
                  { value: "FLAT", label: "Flat Rate" },
                ]}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input id="defaultOpenTime" label="Default Open Time" name="defaultOpenTime" type="time" value={formData.defaultOpenTime} onChange={handleChange} required />
              <Input id="defaultCloseTime" label="Default Close Time" name="defaultCloseTime" type="time" value={formData.defaultCloseTime} onChange={handleChange} required />
            </div>

            <Textarea id="description" label="Description" name="description" value={formData.description} onChange={handleChange} />
            <Textarea id="rules" label="Rules & Guidelines" name="rules" value={formData.rules} onChange={handleChange} rows={3} />
            <Input id="imageUrl" label="Image URL" name="imageUrl" value={formData.imageUrl} onChange={handleChange} />

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" type="button" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" loading={saving}>Save Changes</Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}

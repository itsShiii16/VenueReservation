import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { venueService } from "../../services/venueService";
import Input from "../../components/Input";
import Textarea from "../../components/Textarea";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";
import Select from "../../components/Select";

export default function AddVenuePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    capacity: "",
    description: "",
    managingUnit: "",
    rules: "",
    imageUrl: "",
    defaultRate: "0",
    defaultRateType: "HOURLY",
    defaultOpenTime: "08:00",
    defaultCloseTime: "17:00",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await venueService.create({
        ...formData,
        capacity: parseInt(formData.capacity),
        defaultRate: parseFloat(formData.defaultRate || 0),
        amenities: [],
        equipment: [],
      });
      navigate("/vm/venues");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create venue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Add Venue" subtitle="Register a new venue under your management" />

      <form onSubmit={handleSubmit} className="bg-surface border border-surface-lighter rounded-xl p-6 space-y-5">
        {error && (
          <div className="bg-danger/10 border border-danger/30 text-danger text-sm rounded-lg p-3">{error}</div>
        )}

        <Input id="name" label="Venue Name" name="name" placeholder="e.g., Cine Adarna" value={formData.name} onChange={handleChange} required />
        <Input id="location" label="Location" name="location" placeholder="Building, Campus" value={formData.location} onChange={handleChange} required />
        
        <div className="grid grid-cols-2 gap-4">
          <Input id="capacity" label="Capacity" name="capacity" type="number" min="1" placeholder="Max people" value={formData.capacity} onChange={handleChange} required />
          <Input id="managingUnit" label="Managing Unit" name="managingUnit" placeholder="e.g., UP Film Institute" value={formData.managingUnit} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-surface-lighter pt-4">
          <Input id="defaultRate" label="Default Rate (₱)" name="defaultRate" type="number" min="0" step="any" placeholder="0" value={formData.defaultRate} onChange={handleChange} required />
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

        <Textarea id="description" label="Description" name="description" placeholder="Describe the venue..." value={formData.description} onChange={handleChange} />
        <Textarea id="rules" label="Rules & Guidelines" name="rules" placeholder="Venue-specific rules..." value={formData.rules} onChange={handleChange} rows={3} />
        <Input id="imageUrl" label="Image URL (optional)" name="imageUrl" placeholder="https://..." value={formData.imageUrl} onChange={handleChange} />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={loading}>Create Venue</Button>
        </div>
      </form>
    </div>
  );
}

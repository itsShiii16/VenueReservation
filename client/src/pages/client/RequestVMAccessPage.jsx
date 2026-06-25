/**
 * RequestVMAccessPage.jsx — Submit a request to become a Venue Manager
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { venueManagerRequestService } from "../../services/venueManagerRequestService";
import Input from "../../components/Input";
import Textarea from "../../components/Textarea";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";

export default function RequestVMAccessPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    officeOrOrganization: "",
    position: "",
    facilityToManage: "",
    reason: "",
    supportingDocumentUrl: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await venueManagerRequestService.submit(formData);
      navigate("/profile");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Request Venue Manager Access"
        subtitle="Submit a request to manage venues. A System Admin will review your application."
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

        <Input id="officeOrOrganization" label="Office / Organization" name="officeOrOrganization" placeholder="e.g., College of Engineering" value={formData.officeOrOrganization} onChange={handleChange} required />
        <Input id="position" label="Position" name="position" placeholder="e.g., Facilities Officer" value={formData.position} onChange={handleChange} required />
        <Input id="facilityToManage" label="Facility to Manage" name="facilityToManage" placeholder="e.g., Melchor Hall Conference Room" value={formData.facilityToManage} onChange={handleChange} required />
        <Textarea id="reason" label="Reason for Request" name="reason" placeholder="Explain why you need venue manager access (at least 20 characters)..." value={formData.reason} onChange={handleChange} required rows={4} />
        <Input id="supportingDocumentUrl" label="Supporting Document URL (optional)" name="supportingDocumentUrl" placeholder="https://..." value={formData.supportingDocumentUrl} onChange={handleChange} />

        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" type="button" onClick={() => navigate(-1)}>Cancel</Button>
          <Button type="submit" loading={loading}>Submit Request</Button>
        </div>
      </form>
    </div>
  );
}

import { useEffect, useState } from "react";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import Button from "../../components/Button";
import Input from "../../components/Input";
import Modal from "../../components/Modal";
import { adminService } from "../../services/adminService";
import { db } from "../../services/mockDb";
import { formatDateTime } from "../../utils/formatDate";
import { toast } from "sonner";

const emptyForm = {
  firstName: "",
  lastName: "",
  email: "",
  password: "password123",
  position: "Venue Manager",
  managingUnit: "",
  assignedLocation: "",
};

export default function ApprovedManagersPage() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingManager, setEditingManager] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchManagers = () => {
    const users = db.getUsers();
    setManagers(users.filter((u) => u.role === "VENUE_MANAGER"));
    setLoading(false);
  };

  useEffect(() => {
    fetchManagers();
  }, []);

  const openCreate = () => {
    setEditingManager(null);
    setFormData(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (manager) => {
    setEditingManager(manager);
    setFormData({
      firstName: manager.firstName || "",
      lastName: manager.lastName || "",
      email: manager.email || "",
      password: manager.password || "password123",
      position: manager.position || "Venue Manager",
      managingUnit: manager.managingUnit || manager.organization || "",
      assignedLocation: manager.assignedLocation || "",
    });
    setIsModalOpen(true);
  };

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (editingManager) {
        await adminService.updateVenueManager(editingManager.id, formData);
        toast.success("Venue Manager account updated.");
      } else {
        await adminService.createVenueManager(formData);
        toast.success("Venue Manager account created.");
      }
      setIsModalOpen(false);
      fetchManagers();
    } catch (error) {
      toast.error(error.message || "Unable to save Venue Manager account.");
    }
  };

  const handleRemove = async (manager) => {
    if (!window.confirm(`Remove Venue Manager access for ${manager.firstName} ${manager.lastName}?`)) return;
    await adminService.removeVenueManager(manager.id);
    toast.success("Venue Manager access removed.");
    fetchManagers();
  };

  const filteredManagers = managers.filter((manager) => {
    const query = searchTerm.toLowerCase();
    const text = [
      manager.firstName,
      manager.lastName,
      manager.email,
      manager.position,
      manager.managingUnit,
      manager.assignedLocation,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return text.includes(query);
  });

  if (loading) return <LoadingState message="Loading venue managers..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Venue Managers"
        subtitle="Create accounts and assign verified managers to facilities"
      >
        <Button onClick={openCreate}>Create Venue Manager</Button>
      </PageHeader>

      <div className="max-w-md">
        <input
          type="text"
          placeholder="Search by name, email, unit, or location..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          className="w-full bg-surface border border-surface-lighter rounded-lg px-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
        />
      </div>

      {filteredManagers.length === 0 ? (
        <EmptyState
          title={searchTerm ? "No matching managers" : "No Venue Managers"}
          message={searchTerm ? "Try adjusting your search query." : "Create a Venue Manager account after offline verification."}
        />
      ) : (
        <div className="bg-surface border border-surface-lighter rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-lighter bg-surface-light text-gray-400 text-xs font-semibold uppercase">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Assigned Unit / Location</th>
                  <th className="px-6 py-4">Created</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-lighter text-sm text-gray-200">
                {filteredManagers.map((manager) => (
                  <tr key={manager.id} className="hover:bg-surface-light/60 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-100">
                      {manager.firstName} {manager.lastName}
                      <span className="block text-xs text-gray-500">{manager.position}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">{manager.email}</td>
                    <td className="px-6 py-4">
                      <span className="text-gray-100">{manager.managingUnit || "Unassigned"}</span>
                      <span className="block text-xs text-gray-500">{manager.assignedLocation || "No location set"}</span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {manager.createdAt ? formatDateTime(manager.createdAt) : "Seed account"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(manager)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleRemove(manager)}>
                          Remove
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingManager ? "Edit Venue Manager" : "Create Venue Manager"}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input id="firstName" name="firstName" label="First Name" value={formData.firstName} onChange={handleChange} required />
            <Input id="lastName" name="lastName" label="Last Name" value={formData.lastName} onChange={handleChange} required />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input id="email" name="email" type="email" label="UP Mail" value={formData.email} onChange={handleChange} required disabled={Boolean(editingManager)} />
            <Input id="password" name="password" label="Temporary Password" value={formData.password} onChange={handleChange} required />
          </div>
          <Input id="position" name="position" label="Position" value={formData.position} onChange={handleChange} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input id="managingUnit" name="managingUnit" label="Assigned Unit / Facility" value={formData.managingUnit} onChange={handleChange} required />
            <Input id="assignedLocation" name="assignedLocation" label="Assigned Location" value={formData.assignedLocation} onChange={handleChange} />
          </div>
          <div className="flex justify-end gap-2 pt-4 border-t border-surface-lighter">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingManager ? "Save Changes" : "Create Account"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

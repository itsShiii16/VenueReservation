/**
 * ProfilePage.jsx — View and edit user profile
 */

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getRoleLabel } from "../../utils/roleHelpers";
import Input from "../../components/Input";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";

export default function ProfilePage() {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    position: user?.position || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="Profile" subtitle="View and manage your account information" />

      <div className="bg-surface border border-surface-lighter rounded-xl p-6 space-y-6">
        {/* Avatar & Role */}
        <div className="flex items-center gap-4 pb-6 border-b border-surface-lighter">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-xl">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-100">
              {user?.firstName} {user?.lastName}
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1">
              {getRoleLabel(user?.role)}
            </span>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input id="firstName" label="First Name" name="firstName" value={formData.firstName} onChange={handleChange} disabled={!editing} />
            <Input id="lastName" label="Last Name" name="lastName" value={formData.lastName} onChange={handleChange} disabled={!editing} />
          </div>
          <Input id="email" label="Email" value={user?.email || ""} disabled />
          <Input id="position" label="Position" name="position" value={formData.position} onChange={handleChange} disabled={!editing} />
        </div>

        <div className="flex justify-end gap-3">
          {editing ? (
            <>
              <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              <Button onClick={() => setEditing(false)}>Save Changes</Button>
            </>
          ) : (
            <Button variant="secondary" onClick={() => setEditing(true)}>Edit Profile</Button>
          )}
        </div>
      </div>
    </div>
  );
}

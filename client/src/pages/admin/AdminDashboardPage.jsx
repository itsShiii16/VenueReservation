/**
 * AdminDashboardPage.jsx — System Admin dashboard with Venue Management
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import LoadingState from "../../components/LoadingState";
import Button from "../../components/Button";
import { venueService } from "../../services/venueService";
import { Trash2, Building, MapPin, Users } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  const fetchVenues = async () => {
    try {
      const res = await venueService.getAll();
      setVenues(res.data || []);
    } catch (err) {
      console.error("Failed to load venues:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []);

  const handleDelete = async (venueId, venueName) => {
    if (!window.confirm(`Are you sure you want to deactivate (soft-delete) ${venueName}?`)) return;
    setDeletingId(venueId);
    try {
      await venueService.delete(venueId);
      toast.success(`${venueName} has been soft-deleted.`);
      await fetchVenues();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete venue.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return <LoadingState message="Loading administrator overview..." />;

  const stats = [
    { label: "Venue Managers", value: "2", link: "/admin/approved-managers", color: "from-success to-emerald-600" },
    { label: "Active Venues", value: String(venues.length), link: "/admin/dashboard", color: "from-primary to-primary-dark" },
    { label: "System Logs", value: "Audit", link: "/admin/approved-managers", color: "from-warning to-amber-600" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" subtitle="System administration overview" />

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-3 gap-4 mb-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="bg-surface border border-surface-lighter rounded-xl p-5 hover:border-primary/30 transition-all"
          >
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Venues Management Section */}
      <div className="bg-surface border border-surface-lighter rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
            <Building className="w-5 h-5 text-primary" /> Active Venues & Facilities
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Review active venues or perform a soft delete to deactivate them from the public system.</p>
        </div>

        {venues.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 text-sm">
            No active venues found.
          </div>
        ) : (
          <div className="border border-surface-lighter rounded-xl overflow-hidden bg-surface-light/20">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-surface-lighter bg-surface-light/75 text-gray-400 text-xs font-semibold uppercase">
                    <th className="px-6 py-4">Venue Details</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Managing Unit / Creator</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-lighter text-sm text-gray-200">
                  {venues.map((venue) => (
                    <tr key={venue.id} className="hover:bg-surface-light/40 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-100">
                        <span className="block text-[14px] font-bold">{venue.name}</span>
                        <span className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                          <Users className="w-3.5 h-3.5" /> Max Capacity: {venue.capacity} persons
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-300">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                          {venue.location}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-zinc-400">
                        <span className="text-gray-200 block text-xs">{venue.managingUnit || "Unassigned Unit"}</span>
                        <span className="block text-[10px] text-zinc-550 mt-0.5">
                          Created by: {venue.createdBy ? `${venue.createdBy.firstName} ${venue.createdBy.lastName}` : "System / Seeder"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            variant="danger"
                            loading={deletingId === venue.id}
                            onClick={() => handleDelete(venue.id, venue.name)}
                            className="inline-flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Deactivate
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
      </div>
    </div>
  );
}

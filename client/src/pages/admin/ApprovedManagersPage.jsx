import { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import LoadingState from "../../components/LoadingState";
import { db } from "../../services/mockDb";
import { formatDateTime } from "../../utils/formatDate";

export default function ApprovedManagersPage() {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const users = db.getUsers();
        // Filter to only display venue managers
        const filtered = users.filter((u) => u.role === "VENUE_MANAGER");
        setManagers(filtered);
      } catch (error) {
        console.error("Failed to fetch managers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchManagers();
  }, []);

  const filteredManagers = managers.filter((m) => {
    const query = searchTerm.toLowerCase();
    const fullName = `${m.firstName} ${m.lastName}`.toLowerCase();
    return (
      fullName.includes(query) ||
      m.email.toLowerCase().includes(query) ||
      (m.organization || "").toLowerCase().includes(query) ||
      (m.position || "").toLowerCase().includes(query)
    );
  });

  if (loading) return <LoadingState message="Loading approved venue managers..." />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Approved Venue Managers"
        subtitle="List of users who currently have Venue Manager privileges"
      />

      <div className="flex justify-between items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by name, email, organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-surface-lighter rounded-lg px-4 py-2 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {filteredManagers.length === 0 ? (
        <EmptyState
          title={searchTerm ? "No matching managers" : "No Approved Venue Managers"}
          message={
            searchTerm
              ? "Try adjusting your search query."
              : "No users have been approved as venue managers yet. You can approve venue manager access requests from the VM Requests page."
          }
        />
      ) : (
        <div className="bg-surface border border-surface-lighter rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-lighter bg-surface-dark text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="px-6 py-4">Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Organization / Position</th>
                  <th className="px-6 py-4">Approved On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-lighter text-sm text-gray-200">
                {filteredManagers.map((manager) => (
                  <tr key={manager.id} className="hover:bg-surface-light/40 transition-colors">
                    <td className="px-6 py-4 font-medium text-white">
                      {manager.firstName} {manager.lastName}
                    </td>
                    <td className="px-6 py-4 text-gray-300">{manager.email}</td>
                    <td className="px-6 py-4">
                      {manager.organization ? (
                        <div>
                          <span className="text-white">{manager.organization}</span>
                          {manager.position && (
                            <span className="text-gray-400 block text-xs">{manager.position}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 italic">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {formatDateTime(manager.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}


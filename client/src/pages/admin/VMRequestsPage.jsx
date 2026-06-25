/**
 * VMRequestsPage.jsx — List venue manager access requests (Admin view)
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { adminService } from "../../services/adminService";
import StatusBadge from "../../components/StatusBadge";
import PageHeader from "../../components/PageHeader";
import LoadingState from "../../components/LoadingState";
import EmptyState from "../../components/EmptyState";
import { formatDateTime } from "../../utils/formatDate";

export default function VMRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("PENDING_REVIEW");

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await adminService.getVMRequests(filter === "ALL" ? null : filter);
        setRequests(res.data || []);
      } catch {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filter]);

  return (
    <div>
      <PageHeader title="Venue Manager Requests" subtitle="Review and manage access requests" />

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {["ALL", "PENDING_REVIEW", "APPROVED", "REJECTED"].map((status) => (
          <button
            key={status}
            onClick={() => { setFilter(status); setLoading(true); }}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors
              ${filter === status ? "bg-primary text-white" : "bg-surface-light text-gray-400 hover:text-gray-200"}`}
          >
            {status === "ALL" ? "All" : status.replace("_", " ")}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState message="Loading requests..." />
      ) : requests.length === 0 ? (
        <EmptyState title="No requests" message="No venue manager requests match the selected filter." />
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Link
              key={req.id}
              to={`/admin/vm-requests/${req.id}`}
              className="block bg-surface border border-surface-lighter rounded-xl p-4 
                hover:border-primary/50 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-100">
                    {req.client?.firstName} {req.client?.lastName}
                  </h3>
                  <p className="text-sm text-gray-400">{req.facilityToManage}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDateTime(req.createdAt)}</p>
                </div>
                <StatusBadge status={req.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

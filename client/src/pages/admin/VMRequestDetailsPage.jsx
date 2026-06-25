/**
 * VMRequestDetailsPage.jsx — View and action on a single VM request (Admin)
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { adminService } from "../../services/adminService";
import StatusBadge from "../../components/StatusBadge";
import Textarea from "../../components/Textarea";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";
import LoadingState from "../../components/LoadingState";
import { formatDateTime } from "../../utils/formatDate";

export default function VMRequestDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [remarks, setRemarks] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        // Fetch all requests and find by ID (simple approach)
        const res = await adminService.getVMRequests();
        const found = (res.data || []).find((r) => r.id === id);
        setRequest(found || null);
      } catch { /* handle error */ }
      finally { setLoading(false); }
    };
    fetch();
  }, [id]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await adminService.approveVMRequest(id, { remarks });
      navigate("/admin/vm-requests");
    } catch { /* handle error */ }
    finally { setActionLoading(false); }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await adminService.rejectVMRequest(id, { remarks });
      navigate("/admin/vm-requests");
    } catch { /* handle error */ }
    finally { setActionLoading(false); }
  };

  if (loading) return <LoadingState message="Loading request..." />;
  if (!request) return <div className="text-center py-16 text-gray-400">Request not found.</div>;

  const isPending = request.status === "PENDING_REVIEW";

  return (
    <div className="max-w-3xl">
      <PageHeader title="VM Request Details" subtitle={`From ${request.client?.firstName} ${request.client?.lastName}`} />

      <div className="bg-surface border border-surface-lighter rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <StatusBadge status={request.status} />
          <span className="text-sm text-gray-500">{formatDateTime(request.createdAt)}</span>
        </div>

        <div className="space-y-3 text-sm">
          <div><span className="text-gray-400">Applicant:</span> <span className="text-gray-200 ml-2">{request.client?.firstName} {request.client?.lastName}</span></div>
          <div><span className="text-gray-400">Email:</span> <span className="text-gray-200 ml-2">{request.client?.email}</span></div>
          <div><span className="text-gray-400">Organization:</span> <span className="text-gray-200 ml-2">{request.officeOrOrganization}</span></div>
          <div><span className="text-gray-400">Position:</span> <span className="text-gray-200 ml-2">{request.position}</span></div>
          <div><span className="text-gray-400">Facility:</span> <span className="text-gray-200 ml-2">{request.facilityToManage}</span></div>
          <div>
            <span className="text-gray-400">Reason:</span>
            <p className="text-gray-300 mt-1">{request.reason}</p>
          </div>
          {request.supportingDocumentUrl && (
            <div>
              <span className="text-gray-400">Supporting Document:</span>
              <a href={request.supportingDocumentUrl} className="text-primary ml-2 hover:underline" target="_blank" rel="noopener noreferrer">
                View Document
              </a>
            </div>
          )}
        </div>

        {/* Admin actions */}
        {isPending && (
          <div className="border-t border-surface-lighter pt-6 space-y-4">
            <Textarea
              id="remarks"
              label="Admin Remarks (optional)"
              placeholder="Add notes about your decision..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={2}
            />
            <div className="flex gap-3">
              <Button variant="success" onClick={handleApprove} loading={actionLoading}>Approve & Upgrade Role</Button>
              <Button variant="danger" onClick={handleReject} loading={actionLoading}>Reject</Button>
              <Button variant="ghost" onClick={() => navigate(-1)}>Back</Button>
            </div>
          </div>
        )}

        {/* Show review info for already-reviewed requests */}
        {!isPending && request.remarks && (
          <div className="border-t border-surface-lighter pt-4">
            <span className="text-sm text-gray-400">Admin Remarks:</span>
            <p className="text-gray-300 mt-1">{request.remarks}</p>
          </div>
        )}
      </div>
    </div>
  );
}

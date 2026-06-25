/**
 * StatusBadge.jsx — Colored status badge for reservations/requests
 */

export default function StatusBadge({ status }) {
  const styles = {
    SUBMITTED: "bg-info/20 text-info border-info/30",
    UNDER_REVIEW: "bg-warning/20 text-warning border-warning/30",
    APPROVED: "bg-success/20 text-success border-success/30",
    DECLINED: "bg-danger/20 text-danger border-danger/30",
    CANCELLED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    PENDING_REVIEW: "bg-warning/20 text-warning border-warning/30",
    REJECTED: "bg-danger/20 text-danger border-danger/30",
  };

  const labels = {
    SUBMITTED: "Submitted",
    UNDER_REVIEW: "Under Review",
    APPROVED: "Approved",
    DECLINED: "Declined",
    CANCELLED: "Cancelled",
    PENDING_REVIEW: "Pending Review",
    REJECTED: "Rejected",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30"
      }`}
    >
      {labels[status] || status}
    </span>
  );
}

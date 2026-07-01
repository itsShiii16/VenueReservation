/**
 * StatusBadge.jsx — Colored status badge for reservations/requests
 */

export default function StatusBadge({ status }) {
  const styles = {
    PRELIMINARY_SUBMITTED: "bg-info/20 text-info border-info/30",
    UNDER_REVIEW: "bg-warning/20 text-warning border-warning/30",
    PENCIL_BOOKED_DRAFT: "bg-gray-500/20 text-gray-500 border-gray-500/30 border-dashed",
    RETURNED_FOR_COMPLETION: "bg-accent/20 text-accent border-accent/30",
    EXPIRED_AUTO_REJECTED: "bg-danger/10 text-danger border-danger/30",
    PAYMENT_PENDING: "bg-warning/20 text-warning border-warning/30",
    PAYMENT_OVERDUE: "bg-danger/20 text-danger border-danger/30",
    BOOKED_CONFIRMED: "bg-success/20 text-success border-success/30",
    REJECTED: "bg-danger/20 text-danger border-danger/30",
    CANCELLED: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    BLOCKED: "bg-gray-500/20 text-gray-500 border-gray-500/30",
  };

  const labels = {
    PRELIMINARY_SUBMITTED: "Preliminary Submitted",
    UNDER_REVIEW: "Under Review",
    PENCIL_BOOKED_DRAFT: "Pencil Booked / Draft",
    RETURNED_FOR_COMPLETION: "Returned for Completion",
    EXPIRED_AUTO_REJECTED: "Expired / Auto-Rejected",
    PAYMENT_PENDING: "Payment Pending",
    PAYMENT_OVERDUE: "Payment Overdue",
    BOOKED_CONFIRMED: "Booked / Confirmed",
    REJECTED: "Rejected",
    CANCELLED: "Cancelled",
    BLOCKED: "Blocked",
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

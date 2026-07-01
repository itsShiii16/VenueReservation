export type ReservationStatus =
  | 'PRELIMINARY_SUBMITTED'
  | 'UNDER_REVIEW'
  | 'PENCIL_BOOKED_DRAFT'
  | 'RETURNED_FOR_COMPLETION'
  | 'EXPIRED_AUTO_REJECTED'
  | 'PAYMENT_PENDING'
  | 'PAYMENT_OVERDUE'
  | 'BOOKED_CONFIRMED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'BLOCKED';

export function getStatusLabel(status: ReservationStatus): string {
  switch (status) {
    case 'PRELIMINARY_SUBMITTED':
      return 'Preliminary Submitted';
    case 'UNDER_REVIEW':
      return 'Under Review';
    case 'PENCIL_BOOKED_DRAFT':
      return 'Pencil Booked / Draft';
    case 'RETURNED_FOR_COMPLETION':
      return 'Returned for Completion';
    case 'EXPIRED_AUTO_REJECTED':
      return 'Expired / Auto-Rejected';
    case 'PAYMENT_PENDING':
      return 'Payment Pending';
    case 'PAYMENT_OVERDUE':
      return 'Payment Overdue';
    case 'BOOKED_CONFIRMED':
      return 'Booked / Confirmed';
    case 'REJECTED':
      return 'Rejected';
    case 'CANCELLED':
      return 'Cancelled';
    case 'BLOCKED':
      return 'Blocked';
    default:
      return status;
  }
}

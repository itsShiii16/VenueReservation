import React from 'react';
import { ReservationStatus, getStatusLabel } from '@/types/status';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: ReservationStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const label = getStatusLabel(status);

  // Status visual mapping rules
  const styles: Record<ReservationStatus, string> = {
    PRELIMINARY_SUBMITTED: 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-150',
    UNDER_REVIEW: 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-150',
    PENCIL_BOOKED_DRAFT: 'bg-gray-100 text-gray-700 border-dashed border-gray-400 font-medium hover:bg-gray-150 shadow-sm',
    RETURNED_FOR_COMPLETION: 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-150 font-semibold',
    EXPIRED_AUTO_REJECTED: 'bg-red-50 text-red-500 border-red-200 line-through hover:bg-red-100',
    PAYMENT_PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300 hover:bg-yellow-150 animate-pulse',
    PAYMENT_OVERDUE: 'bg-red-200 text-red-900 border-red-400 font-bold hover:bg-red-250 ring-1 ring-red-500',
    BOOKED_CONFIRMED: 'bg-green-700 text-white border-green-800 font-bold hover:bg-green-800 shadow-md',
    REJECTED: 'bg-red-100 text-red-800 border-red-300 hover:bg-red-150',
    CANCELLED: 'bg-gray-200 text-gray-500 border-gray-300 line-through hover:bg-gray-250',
    BLOCKED: 'bg-zinc-800 text-zinc-100 border-zinc-900 font-semibold hover:bg-zinc-900',
  };

  return (
    <Badge
      variant="outline"
      className={cn('px-2.5 py-1 text-xs rounded-full transition-all duration-300 font-sans tracking-wide', styles[status], className)}
    >
      {label}
    </Badge>
  );
};
export default StatusBadge;

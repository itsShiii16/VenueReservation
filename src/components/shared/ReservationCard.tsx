import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, ArrowRight } from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { Reservation } from '@/types/reservation';
import { format } from 'date-fns';
import Link from 'next/link';

interface ReservationCardProps {
  reservation: Reservation;
  href: string;
  actionLabel?: string;
  onActionClick?: () => void;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({
  reservation,
  href,
  actionLabel = 'View Details',
  onActionClick,
}) => {
  const start = new Date(reservation.startTime);
  const end = new Date(reservation.endTime);

  const formattedDate = format(start, 'MMMM d, yyyy');
  const formattedTime = `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;

  return (
    <Card className="shadow-sm border border-zinc-200 hover:shadow-md transition-all duration-300 bg-white overflow-hidden rounded-xl">
      <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-3 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-wider">
              {reservation.referenceNumber}
            </span>
            <StatusBadge status={reservation.status} />
          </div>

          <h3 className="text-lg font-bold text-zinc-900 truncate tracking-tight">
            {reservation.eventTitle}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-zinc-600 text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-zinc-400 shrink-0" />
              <span className="truncate">{reservation.venue?.name || 'Venue'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-zinc-400 shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-zinc-400 shrink-0" />
              <span>{formattedTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-zinc-400 shrink-0" />
              <span>{reservation.expectedAttendees} Expected Attendees</span>
            </div>
          </div>
        </div>

        <div className="shrink-0 flex items-center">
          {onActionClick ? (
            <Button
              onClick={onActionClick}
              size="sm"
              className="w-full md:w-auto bg-red-800 hover:bg-red-900 text-white font-medium flex items-center gap-1"
            >
              {actionLabel} <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Link href={href} className="w-full md:w-auto">
              <Button
                size="sm"
                className="w-full md:w-auto bg-red-800 hover:bg-red-900 text-white font-medium flex items-center gap-1"
              >
                {actionLabel} <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
export default ReservationCard;

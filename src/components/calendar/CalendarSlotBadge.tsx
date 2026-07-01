import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface CalendarSlotBadgeProps {
  date: Date | string;
  startTime: string;
  endTime: string;
  className?: string;
}

export const CalendarSlotBadge: React.FC<CalendarSlotBadgeProps> = ({
  date,
  startTime,
  endTime,
  className,
}) => {
  const formattedDate = format(new Date(date), 'MMMM d, yyyy');

  return (
    <div className={`flex flex-wrap items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-950 font-sans text-xs ${className}`}>
      <div className="flex items-center gap-1.5 font-semibold">
        <Calendar className="h-3.5 w-3.5 text-red-800 shrink-0" />
        <span>{formattedDate}</span>
      </div>
      <div className="h-3 w-px bg-red-300 hidden sm:block" />
      <div className="flex items-center gap-1.5 font-medium">
        <Clock className="h-3.5 w-3.5 text-red-800 shrink-0" />
        <span>
          {startTime} - {endTime}
        </span>
      </div>
    </div>
  );
};
export default CalendarSlotBadge;

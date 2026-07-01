'use client';

import React, { useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Reservation } from '@/types/reservation';
import { BlockedSlot } from '@/types/venue';
import { checkScheduleConflict } from '@/lib/conflict-checking';
import { toast } from 'sonner';

interface VenueCalendarProps {
  venueId: string;
  reservations: Reservation[];
  blockedSlots: BlockedSlot[];
  onSlotSelect?: (start: Date, end: Date) => void;
  isManager?: boolean;
}

export const VenueCalendar: React.FC<VenueCalendarProps> = ({
  venueId,
  reservations,
  blockedSlots,
  onSlotSelect,
  isManager = false,
}) => {
  // Format events for FullCalendar
  const events = useMemo(() => {
    const resEvents = reservations.map((res) => {
      // Parse dates safely
      const start = new Date(res.startTime);
      const end = new Date(res.endTime);
      return {
        id: `res-${res.id}`,
        title: res.eventTitle,
        start,
        end,
        extendedProps: {
          type: 'reservation',
          status: res.status,
          reservation: res,
        },
      };
    });

    const blockEvents = blockedSlots.map((block) => {
      const start = new Date(block.startTime);
      const end = new Date(block.endTime);
      return {
        id: `block-${block.id}`,
        title: block.reason || 'Blocked schedule (Maintenance)',
        start,
        end,
        extendedProps: {
          type: 'blocked',
          status: 'BLOCKED',
          block,
        },
      };
    });

    return [...resEvents, ...blockEvents];
  }, [reservations, blockedSlots]);

  const eventClassNames = (arg: any) => {
    const status = arg.event.extendedProps.status;
    const isBlocked = arg.event.extendedProps.type === 'blocked';

    let base = 'p-1 text-xs rounded transition-all duration-300 ';

    if (isBlocked || status === 'BLOCKED') {
      return base + 'bg-zinc-800 text-zinc-100 border-zinc-900 font-semibold cursor-not-allowed';
    }

    switch (status) {
      case 'BOOKED_CONFIRMED':
        return base + 'bg-green-700 text-white border-green-800 font-bold cursor-not-allowed';
      case 'PENCIL_BOOKED_DRAFT':
        return base + 'bg-zinc-100 text-zinc-700 border-2 border-dashed border-zinc-400 font-medium opacity-70 hover:opacity-100';
      case 'PAYMENT_PENDING':
        return base + 'bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-150 animate-pulse';
      case 'PAYMENT_OVERDUE':
        return base + 'bg-red-200 text-red-900 border-2 border-red-400 font-bold hover:bg-red-250 ring-1 ring-red-500';
      case 'PRELIMINARY_SUBMITTED':
      case 'UNDER_REVIEW':
        return base + 'bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-150';
      case 'RETURNED_FOR_COMPLETION':
        return base + 'bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-150 font-semibold';
      case 'REJECTED':
      case 'CANCELLED':
      case 'EXPIRED_AUTO_REJECTED':
        return base + 'bg-zinc-100 text-zinc-400 border border-zinc-200 line-through opacity-50';
      default:
        return base + 'bg-zinc-100 text-zinc-800 border border-zinc-300';
    }
  };

  const handleSelect = (selectInfo: any) => {
    const { start, end } = selectInfo;

    // Check conflict
    const conflictCheck = checkScheduleConflict(venueId, start, end);
    if (conflictCheck.conflict && !isManager) {
      toast.error(conflictCheck.reason || 'This slot is unavailable.');
      // clear selection
      selectInfo.view.calendar.unselect();
      return;
    }

    if (onSlotSelect) {
      onSlotSelect(start, end);
    }
  };

  return (
    <div className="w-full bg-white text-zinc-800 rounded-xl border border-zinc-200 p-4 shadow-sm">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        slotMinTime="07:00:00"
        slotMaxTime="22:00:00"
        events={events}
        selectable={true}
        selectMirror={true}
        dayMaxEvents={true}
        eventClassNames={eventClassNames}
        select={handleSelect}
        allDaySlot={false}
        height="auto"
      />
    </div>
  );
};
export default VenueCalendar;

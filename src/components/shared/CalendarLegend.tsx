import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export const CalendarLegend: React.FC = () => {
  const legends = [
    { label: 'Available', color: 'bg-emerald-50 border border-emerald-300 text-emerald-800' },
    { label: 'Preliminary Requests', color: 'bg-blue-100 border border-blue-300 text-blue-800' },
    { label: 'Pencil Booked', color: 'bg-gray-100 border border-dashed border-gray-400 text-gray-700' },
    { label: 'Payment Pending', color: 'bg-yellow-100 border border-yellow-300 text-yellow-800' },
    { label: 'Payment Overdue', color: 'bg-red-200 border border-red-400 text-red-900 font-bold' },
    { label: 'Booked / Confirmed', color: 'bg-green-700 text-white font-bold' },
    { label: 'Blocked', color: 'bg-zinc-800 text-zinc-100 border-zinc-900 font-semibold' },
  ];

  return (
    <Card className="border border-zinc-200 shadow-sm rounded-xl bg-white overflow-hidden">
      <CardContent className="p-4">
        <h4 className="text-sm font-bold text-zinc-800 mb-3 uppercase tracking-wider">Availability Legend</h4>
        <div className="flex flex-wrap gap-2.5">
          {legends.map((leg) => (
            <div
              key={leg.label}
              className={`px-3 py-1.5 rounded-full text-xs font-sans font-medium flex items-center justify-center text-center tracking-wide ${leg.color}`}
            >
              {leg.label}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
export default CalendarLegend;

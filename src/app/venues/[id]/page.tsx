'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { getMockDb } from '@/lib/mock-data';
import { getCurrentUserClient } from '@/lib/auth';
import { Venue, BlockedSlot } from '@/types/venue';
import { Reservation } from '@/types/reservation';
import ClientLayout from '@/components/layout/ClientLayout';
import VenueCalendar from '@/components/calendar/VenueCalendar';
import CalendarLegend from '@/components/shared/CalendarLegend';
import ReservationForm from '@/components/forms/ReservationForm';
import PreliminaryRequirementForm from '@/components/forms/PreliminaryRequirementForm';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Users, HelpCircle, ArrowLeft, Building2, ShieldCheck, FileText, Sparkles, Calendar, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function VenueDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [venue, setVenue] = useState<Venue | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [blockedSlots, setBlockedSlots] = useState<BlockedSlot[]>([]);
  const [user, setUser] = useState<any>(null);

  // Flow State
  const [selectedSlot, setSelectedSlot] = useState<{
    start: Date;
    end: Date;
    dateStr: string;
    startTimeStr: string;
    endTimeStr: string;
  } | null>(null);

  useEffect(() => {
    const db = getMockDb();
    const foundVenue = db.venues.find((v) => v.id === id && v.isActive);
    if (!foundVenue) {
      toast.error('Venue not found.');
      router.push('/');
      return;
    }

    setVenue(foundVenue);
    setReservations(db.reservations.filter((r) => r.venueId === id));
    setBlockedSlots(db.blockedSlots.filter((b) => b.venueId === id));
    setUser(getCurrentUserClient());
  }, [id, router]);

  const handleSlotSelect = (start: Date, end: Date) => {
    if (!user) {
      toast.error('Please log in or sign up to schedule a reservation.');
      router.push(`/login?redirect=/venues/${venue?.id}`);
      return;
    }

    const pad = (n: number) => String(n).padStart(2, '0');
    const dateStr = `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
    const startTimeStr = `${pad(start.getHours())}:${pad(start.getMinutes())}`;
    const endTimeStr = `${pad(end.getHours())}:${pad(end.getMinutes())}`;

    setSelectedSlot({
      start,
      end,
      dateStr,
      startTimeStr,
      endTimeStr,
    });
  };

  const handleFormCancel = () => {
    setSelectedSlot(null);
  };

  if (!venue) return <p className="p-8 text-center text-zinc-500 italic">Loading venue details...</p>;

  return (
    <ClientLayout>
      <div className="space-y-6 font-sans">
        {/* Back navigation */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => {
              if (selectedSlot) {
                setSelectedSlot(null);
              } else {
                router.push('/');
              }
            }}
            variant="ghost"
            size="sm"
            className="text-zinc-600 hover:text-zinc-900 border border-zinc-200 bg-white shadow-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
          </Button>
          <span className="text-xs font-semibold text-zinc-400">Venue Details</span>
        </div>

        {selectedSlot ? (
          /* Render booking forms if slot is selected */
          <div className="max-w-3xl mx-auto">
            {venue.allowsPencilBooking ? (
              <PreliminaryRequirementForm
                venueId={venue.id}
                selectedDate={selectedSlot.dateStr}
                selectedStartTime={selectedSlot.startTimeStr}
                selectedEndTime={selectedSlot.endTimeStr}
                onCancel={handleFormCancel}
              />
            ) : (
              <ReservationForm
                venueId={venue.id}
                selectedDate={selectedSlot.dateStr}
                selectedStartTime={selectedSlot.startTimeStr}
                selectedEndTime={selectedSlot.endTimeStr}
                onCancel={handleFormCancel}
              />
            )}
          </div>
        ) : (
          /* Details layout */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left/Middle Column: Venue Header & Calendar */}
            <div className="lg:col-span-2 space-y-6">
              {/* Venue header details */}
              <div className="bg-white border border-zinc-200 rounded-xl p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 tracking-tight">
                      {venue.name}
                    </h1>
                    <p className="text-xs font-semibold text-zinc-500 flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                      {venue.location}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <Badge className="bg-red-800 text-white font-bold px-3 py-1 text-sm border-none shadow-sm">
                      ₱{venue.defaultRate.toLocaleString()} {venue.defaultRateType}
                    </Badge>
                    {venue.allowsPencilBooking ? (
                      <Badge className="bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 text-xs">
                        Pencil Booking Enabled
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-100 text-blue-800 border border-blue-300 px-2 py-0.5 text-xs">
                        Direct Review
                      </Badge>
                    )}
                  </div>
                </div>

                {venue.imageUrl && (
                  <div className="aspect-[21/9] w-full rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100">
                    <img src={venue.imageUrl} alt={venue.name} className="h-full w-full object-cover" />
                  </div>
                )}

                <div className="space-y-2 pt-2">
                  <h3 className="text-sm font-bold text-zinc-800 uppercase tracking-wider">About the Venue</h3>
                  <p className="text-zinc-600 text-xs sm:text-sm leading-relaxed">{venue.description}</p>
                </div>
              </div>

              {/* Venue Calendar */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-zinc-900">Check Availability</h3>
                  <p className="text-xs text-zinc-500">
                    Select an empty time slot in the weekly schedule to make your reservation.
                  </p>
                </div>
                {!user && (
                  <div className="bg-amber-50 border border-amber-200 text-amber-900 text-xs p-3.5 rounded-lg flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-amber-700 shrink-0" />
                    <span>Guests can browse availability but must log in to submit booking requests.</span>
                  </div>
                )}
                <VenueCalendar
                  venueId={venue.id}
                  reservations={reservations}
                  blockedSlots={blockedSlots}
                  onSlotSelect={handleSlotSelect}
                />
                <CalendarLegend />
              </div>
            </div>

            {/* Right Column: Attributes & Document checklist */}
            <div className="lg:col-span-1 space-y-6">
              {/* Booking Actions Card */}
              <Card className={cn(
                "border rounded-xl shadow-sm overflow-hidden",
                user ? "border-zinc-200 bg-white" : "border-red-200 bg-red-50/50"
              )}>
                <CardContent className="p-5 space-y-4">
                  {user ? (
                    <div className="space-y-2.5">
                      <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wide flex items-center gap-1.5">
                        <Calendar className="h-4.5 w-4.5 text-red-800" /> Book Venue
                      </h4>
                      <p className="text-zinc-600 text-xs leading-relaxed">
                        To submit a reservation request, click and select an open time slot on the calendar.
                      </p>
                      <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-xs space-y-1">
                        <span className="font-bold text-zinc-700 block">Selected Slot:</span>
                        <span className="text-zinc-600 italic font-medium">None selected yet</span>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h4 className="text-sm font-bold text-red-950 uppercase tracking-wide flex items-center gap-1.5">
                        <Lock className="h-4.5 w-4.5 text-red-800" /> Booking Locked
                      </h4>
                      <p className="text-red-900/90 text-xs leading-relaxed">
                        Guests can view details and check availability, but must log in to submit booking requests.
                      </p>
                      <Button
                        onClick={() => router.push(`/login?redirect=/venues/${venue?.id}`)}
                        className="w-full bg-red-800 hover:bg-red-900 text-white font-bold py-2 rounded-lg text-xs"
                      >
                        Sign In to Reserve
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border border-zinc-200 bg-white shadow-sm rounded-xl">
                <CardContent className="p-5 space-y-5">
                  {/* Capacity */}
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-zinc-100 rounded-lg text-zinc-500">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Maximum Capacity</p>
                      <p className="text-sm font-bold text-zinc-800">{venue.capacity} attendees</p>
                    </div>
                  </div>

                  {/* Managing unit */}
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-zinc-100 rounded-lg text-zinc-500">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-zinc-400 uppercase">Managing Unit</p>
                      <p className="text-sm font-bold text-zinc-800">{venue.managingUnit}</p>
                    </div>
                  </div>

                  {/* Amenities list */}
                  <div className="space-y-2 pt-2 border-t border-zinc-150">
                    <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">Amenities</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {venue.amenities.map((item, i) => (
                        <Badge key={i} variant="outline" className="bg-zinc-50 text-zinc-600 border-zinc-250 text-xs rounded-md">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Equipment list */}
                  <div className="space-y-2 pt-2 border-t border-zinc-150">
                    <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">Available Equipment</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {venue.equipment.map((item, i) => (
                        <Badge key={i} variant="outline" className="bg-zinc-50 text-zinc-600 border-zinc-250 text-xs rounded-md">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Venue rules */}
                  {venue.rules && (
                    <div className="space-y-2 pt-2 border-t border-zinc-150">
                      <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">Venue Rules</h4>
                      <p className="text-zinc-600 text-xs leading-normal bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                        {venue.rules}
                      </p>
                    </div>
                  )}

                  {/* Requirements needed */}
                  <div className="space-y-3 pt-2 border-t border-zinc-150">
                    <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">Required Files</h4>
                    {venue.allowsPencilBooking ? (
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-amber-700 uppercase flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> Preliminary (Initial request)
                          </p>
                          <ul className="text-zinc-600 text-xs list-disc pl-4 space-y-0.5">
                            {venue.preliminaryRequirements.map((req, i) => (
                              <li key={i}>{req}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="space-y-1">
                          <p className="text-[10px] font-bold text-blue-700 uppercase flex items-center gap-1">
                            <FileText className="h-3 w-3" /> Supplementary (During pencil-book)
                          </p>
                          <ul className="text-zinc-600 text-xs list-disc pl-4 space-y-0.5">
                            {venue.supplementaryRequirements.map((req, i) => (
                              <li key={i}>{req}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <ul className="text-zinc-600 text-xs list-disc pl-4 space-y-0.5">
                        {venue.supplementaryRequirements.map((req, i) => (
                          <li key={i}>{req}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </ClientLayout>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { getMockDb } from '@/lib/mock-data';
import { Venue } from '@/types/venue';
import ClientLayout from '@/components/layout/ClientLayout';
import VenueCard from '@/components/shared/VenueCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, Users, Filter, HelpCircle } from 'lucide-react';

export default function Home() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [search, setSearch] = useState('');
  const [minCapacity, setMinCapacity] = useState<number | ''>('');
  const [allowsPencil, setAllowsPencil] = useState<string>('all');

  useEffect(() => {
    const db = getMockDb();
    setVenues(db.venues.filter((v) => v.isActive));
  }, []);

  const filteredVenues = venues.filter((venue) => {
    const matchesSearch =
      venue.name.toLowerCase().includes(search.toLowerCase()) ||
      venue.location.toLowerCase().includes(search.toLowerCase());

    const matchesCapacity = minCapacity === '' || venue.capacity >= minCapacity;

    const matchesPencil =
      allowsPencil === 'all' ||
      (allowsPencil === 'yes' && venue.allowsPencilBooking) ||
      (allowsPencil === 'no' && !venue.allowsPencilBooking);

    return matchesSearch && matchesCapacity && matchesPencil;
  });

  return (
    <ClientLayout>
      <div className="space-y-8 font-sans">
        {/* Premium Banner */}
        <div className="relative rounded-2xl bg-gradient-to-r from-red-900 to-red-950 p-8 sm:p-12 text-white shadow-xl overflow-hidden">
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12 scale-150">
            <div className="h-64 w-64 rounded-full border-[24px] border-white" />
          </div>
          
          <div className="max-w-2xl space-y-4 relative z-10">
            <span className="bg-red-750 text-red-200 text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-red-700">
              University of the Philippines Diliman
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Reserve Premium Venues for Academic & Cultural Events
            </h1>
            <p className="text-red-100/90 text-sm sm:text-base leading-relaxed font-normal">
              Find, filter, check availability, and schedule venues across campus. Log in with your official UP Mail account to request pencil bookings or submit direct reservations.
            </p>
          </div>
        </div>

        {/* Filters and List */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left: Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border border-zinc-200 bg-white shadow-sm rounded-xl sticky top-24">
              <CardContent className="p-5 space-y-5">
                <div className="flex items-center gap-2 pb-3 border-b border-zinc-150">
                  <Filter className="h-4.5 w-4.5 text-red-800" />
                  <h3 className="text-sm font-bold text-zinc-950 uppercase tracking-wider">Filter Venues</h3>
                </div>

                {/* Search */}
                <div className="space-y-1.5">
                  <Label htmlFor="search-input" className="text-[10px] font-bold text-zinc-700 uppercase">
                    Keyword Search
                  </Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input
                      id="search-input"
                      placeholder="Venue name, location..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 border-zinc-300 rounded-lg text-sm bg-zinc-50/50"
                    />
                  </div>
                </div>

                {/* Capacity */}
                <div className="space-y-1.5">
                  <Label htmlFor="capacity-input" className="text-[10px] font-bold text-zinc-700 uppercase">
                    Minimum Capacity (Guests)
                  </Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
                    <Input
                      id="capacity-input"
                      type="number"
                      placeholder="e.g. 100"
                      value={minCapacity}
                      onChange={(e) =>
                        setMinCapacity(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                      }
                      className="pl-9 border-zinc-300 rounded-lg text-sm bg-zinc-50/50"
                    />
                  </div>
                </div>

                {/* Pencil Booking ok */}
                <div className="space-y-1.5">
                  <Label htmlFor="pencil-select" className="text-[10px] font-bold text-zinc-700 uppercase">
                    Booking Workflow Type
                  </Label>
                  <select
                    id="pencil-select"
                    value={allowsPencil}
                    onChange={(e) => setAllowsPencil(e.target.value)}
                    className="flex h-9 w-full rounded-lg border border-zinc-300 bg-white text-zinc-900 px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:ring-ring focus:outline-none"
                  >
                    <option value="all">All Venues</option>
                    <option value="yes">Supports Pencil Booking</option>
                    <option value="no">Direct Review Only</option>
                  </select>
                </div>

                {/* Quick Info Tip */}
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-lg text-[10.5px] leading-relaxed text-zinc-600 flex items-start gap-2">
                  <HelpCircle className="h-4.5 w-4.5 text-zinc-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-zinc-800">Pencil bookings</span> hold the slot for a completion window (typically 3 days) once approved by the Venue Manager.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Venue Directory Grid */}
          <div className="lg:col-span-3">
            {filteredVenues.length === 0 ? (
              <Card className="border border-dashed border-zinc-300 bg-white p-12 rounded-xl text-center flex flex-col items-center justify-center">
                <p className="text-zinc-500 font-medium mb-1">No venues match your search criteria.</p>
                <p className="text-zinc-400 text-xs">Try resetting filters or adjusting search keywords.</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredVenues.map((venue) => (
                  <VenueCard key={venue.id} venue={venue} href={`/venues/${venue.id}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
}

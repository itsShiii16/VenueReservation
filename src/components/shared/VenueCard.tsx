import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Users, Info, Sparkles } from 'lucide-react';
import { Venue } from '@/types/venue';
import Link from 'next/link';

interface VenueCardProps {
  venue: Venue;
  href: string;
}

export const VenueCard: React.FC<VenueCardProps> = ({ venue, href }) => {
  return (
    <Card className="flex flex-col h-full bg-white border border-zinc-200 shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 rounded-xl overflow-hidden group">
      {/* Venue Image */}
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-100">
        {venue.imageUrl ? (
          <img
            src={venue.imageUrl}
            alt={venue.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-zinc-400 bg-red-50/50">
            <Sparkles className="h-10 w-10 text-red-800 opacity-20" />
          </div>
        )}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
          <Badge className="bg-red-800 text-white font-sans text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 border-none shadow-sm">
            ₱{venue.defaultRate.toLocaleString()} {venue.defaultRateType}
          </Badge>
          {venue.allowsPencilBooking ? (
            <Badge className="bg-amber-100 text-amber-800 border-amber-300 font-sans text-[10px] font-bold px-2 py-0.5 shadow-sm">
              Pencil Booking Ok
            </Badge>
          ) : (
            <Badge className="bg-blue-100 text-blue-800 border-blue-300 font-sans text-[10px] font-bold px-2 py-0.5 shadow-sm">
              Direct Review
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="p-5 pb-3">
        <CardTitle className="text-lg font-extrabold text-zinc-900 group-hover:text-red-800 transition-colors line-clamp-1">
          {venue.name}
        </CardTitle>
        <CardDescription className="flex items-center gap-1 text-xs text-zinc-500 font-medium truncate mt-1">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
          {venue.location}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-5 pb-4 pt-0 flex-grow flex flex-col justify-between">
        <p className="text-zinc-600 text-xs line-clamp-2 mb-4 font-normal leading-relaxed">
          {venue.description || 'No description provided.'}
        </p>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
            <Users className="h-4 w-4 text-zinc-400" />
            <span>Capacity: Up to {venue.capacity} guests</span>
          </div>

          {/* Amenities badges */}
          <div className="flex flex-wrap gap-1">
            {venue.amenities.slice(0, 3).map((amenity, i) => (
              <Badge key={i} variant="secondary" className="bg-zinc-100 text-zinc-600 border-none text-[10px] py-0 px-2 rounded font-sans">
                {amenity}
              </Badge>
            ))}
            {venue.amenities.length > 3 && (
              <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 border-none text-[10px] py-0 px-2 rounded font-sans">
                +{venue.amenities.length - 3} more
              </Badge>
            )}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-5 pt-0 border-t border-zinc-100">
        <Link href={href} className="w-full">
          <Button className="w-full bg-red-800 hover:bg-red-900 text-white text-xs font-bold py-2 shadow-sm rounded-lg flex items-center justify-center gap-1.5 transition-all">
            <Info className="h-4 w-4" /> View Details & Book
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};
export default VenueCard;

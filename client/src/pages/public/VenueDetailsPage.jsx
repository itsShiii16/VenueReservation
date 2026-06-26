/**
 * VenueDetailsPage.jsx - View a single venue's details
 */

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, Clock3, CreditCard, MapPin, UsersRound } from "lucide-react";
import { venueService } from "../../services/venueService";
import LoadingState from "../../components/LoadingState";
import heroImage from "../../assets/hero.png";
import { useAuth } from "../../hooks/useAuth";

const venueImages = {
  "venue-1":
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
  "venue-2":
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1200&q=80",
  "venue-3": heroImage,
  "venue-4":
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80",
};

const venueDisplay = {
  "venue-1": {
    name: "Cine Adarna",
    manager: "UPFI Office",
    email: "admin@upfi.up.edu.ph",
    location: "UP Film Institute",
    capacity: 800,
    rate: "P5,000 / 4 hours",
    time: "08:00 AM - 10:00 PM",
  },
  "venue-2": {
    name: "Palma Hall Room 400",
    manager: "CSSP Office",
    email: "admin@cssp.up.edu.ph",
    location: "Palma Hall",
    capacity: 200,
    rate: "P2,000 / 4 hours",
    time: "08:00 AM - 05:00 PM",
  },
  "venue-3": {
    name: "CS Amphitheater",
    manager: "CS Admin",
    email: "admin@cs.up.edu.ph",
    location: "College of Science",
    capacity: 350,
    rate: "P1,500 / 4 hours",
    time: "08:00 AM - 08:00 PM",
  },
  "venue-4": {
    name: "Melchor Hall Conference Room",
    manager: "CoE Admin",
    email: "admin@coe.up.edu.ph",
    location: "College of Engineering",
    capacity: 25,
    rate: "P1,000 / 4 hours",
    time: "08:00 AM - 05:00 PM",
  },
};

const tabs = ["Overview", "Amenities & Equipments", "Requirements", "Rules"];

export default function VenueDetailsPage() {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Overview");

  useEffect(() => {
    const fetchVenue = async () => {
      try {
        const res = await venueService.getById(id);
        setVenue(res.data);
      } catch {
        setVenue(null);
      } finally {
        setLoading(false);
      }
    };
    fetchVenue();
  }, [id]);

  if (loading) return <LoadingState message="Loading venue details..." />;
  if (!venue) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-bold text-gray-100">Venue not found</h2>
        <Link to="/venues" className="mt-2 inline-block text-primary">Back to venues</Link>
      </div>
    );
  }

  const display = venueDisplay[venue.id] || {};
  const venueName = venue.name || display.name;
  const location = venue.location || display.location;

  const formatTimeString = (timeStr) => {
    if (!timeStr) return "08:00 AM";
    const [hours, minutes] = timeStr.split(":");
    const hr = parseInt(hours);
    const suffix = hr >= 12 ? "PM" : "AM";
    const formattedHr = hr % 12 || 12;
    const padHr = String(formattedHr).padStart(2, "0");
    return `${padHr}:${minutes} ${suffix}`;
  };

  const formattedHours = venue.defaultOpenTime && venue.defaultCloseTime
    ? `${formatTimeString(venue.defaultOpenTime)} - ${formatTimeString(venue.defaultCloseTime)}`
    : (display.time || "08:00 AM - 05:00 PM");

  const formattedRate = venue.defaultRate !== undefined
    ? `₱${venue.defaultRate.toLocaleString()} / ${venue.defaultRateType === "HOURLY" ? "hour" : "flat"}`
    : (display.rate || "Rate to be confirmed");

  return (
    <div className="mx-auto grid max-w-6xl gap-10 pb-12 lg:grid-cols-[1fr_400px]">
      <div className="space-y-9">
        <img
          src={venue.imageUrl || venueImages[venue.id] || heroImage}
          alt={venueName}
          className="h-[470px] w-full rounded-2xl object-cover"
        />

        <div className="border-b border-zinc-200">
          <div className="flex flex-wrap gap-10">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-1 pb-5 text-base font-bold transition ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-400 hover:text-gray-100"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {activeTab === "Overview" && (
          <div className="space-y-8">
            <p className="text-xl leading-relaxed text-gray-400">
              The {venueName} is a versatile space located at {location}. Managed by the{" "}
              {venue.managingUnit || display.manager || "assigned UP Diliman unit"}, it is ideal
              for campus events with up to {venue.capacity || display.capacity} attendees. Please
              review the specific requirements and rules before submitting a reservation request.
            </p>

            <div className="grid gap-5 sm:grid-cols-2">
              <InfoCard icon={UsersRound} label="Max Capacity" value={`${venue.capacity || display.capacity} people`} />
              <InfoCard icon={Clock3} label="Available Time" value={formattedHours} />
              <InfoCard icon={CreditCard} label="Venue Rate" value={formattedRate} />
              {isAuthenticated && (
                <InfoCard icon={CheckCircle2} label="Status" value="Available to Book" positive />
              )}
            </div>
          </div>
        )}

        {activeTab === "Amenities & Equipments" && (
          <PillList items={[...(venue.amenities || []), ...(venue.equipment || [])]} />
        )}

        {activeTab === "Requirements" && (
          <PillList items={venue.supplementaryRequirements || venue.requirements || ["Submitted through uploaded files"]} />
        )}

        {activeTab === "Rules" && (
          <p className="text-xl leading-relaxed text-gray-400">{venue.rules || "No special rules listed."}</p>
        )}
      </div>

      <aside className="lg:pt-8">
        <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-extrabold text-gray-100">Reserve This Venue</h2>
          {isAuthenticated ? (
            <>
              <p className="mt-3 text-lg text-gray-400">Check availability and book your schedule.</p>

              <Link
                to={`/calendar?venueId=${venue.id}`}
                className="mt-8 flex min-h-14 items-center justify-center rounded-lg bg-primary px-5 text-lg font-bold text-white shadow-md shadow-primary/20 transition hover:bg-primary-dark"
              >
                Check Availability
              </Link>
            </>
          ) : (
            <>
              <p className="mt-3 text-lg text-gray-400">
                Sign in to check venue availability and reservation status.
              </p>
              <Link
                to="/login"
                className="mt-8 flex min-h-14 items-center justify-center rounded-lg bg-primary px-5 text-lg font-bold text-white shadow-md shadow-primary/20 transition hover:bg-primary-dark"
              >
                Sign in to Check Availability
              </Link>
            </>
          )}

          <div className="my-8 h-px bg-zinc-200" />

          <h3 className="text-lg font-extrabold text-gray-100">Need help?</h3>
          <p className="mt-3 text-base leading-relaxed text-gray-400">
            Contact the managing unit for specific inquiries regarding this venue.
          </p>

          <div className="mt-4 rounded-xl border border-zinc-100 bg-zinc-50 p-4">
            <p className="font-bold text-gray-100">{display.manager || venue.managingUnit || "Managing Office"}</p>
            <p className="mt-2 text-primary">{display.email || "venue-admin@up.edu.ph"}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value, positive = false }) {
  return (
    <div className="flex items-center gap-5 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${positive ? "bg-green-50 text-success" : "bg-zinc-100 text-gray-400"}`}>
        <Icon className="h-6 w-6" aria-hidden="true" />
      </div>
      <div>
        <p className="text-base text-gray-400">{label}</p>
        <p className={`mt-1 text-lg font-extrabold ${positive ? "text-success" : "text-gray-100"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

function PillList({ items }) {
  return (
    <div className="flex flex-wrap gap-3">
      {items.map((item) => (
        <span
          key={item}
          className="rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-bold text-gray-100"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

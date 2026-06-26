/**
 * HomePage.jsx - Landing page
 */

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MapPin, Search, UsersRound } from "lucide-react";
import heroImage from "../../assets/hero.png";
import { venueService } from "../../services/venueService";

const venueImages = {
  "venue-1":
    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
  "venue-2":
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=900&q=80",
  "venue-3": heroImage,
  "venue-4":
    "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
};

const venueLocations = {
  "venue-1": "UP Film Institute",
  "venue-2": "Palma Hall",
  "venue-3": "College of Science",
  "venue-4": "College of Engineering",
};

const venueCapacities = {
  "venue-1": 800,
  "venue-2": 200,
  "venue-3": 350,
  "venue-4": 25,
};

const venueNames = {
  "venue-2": "Palma Hall Room 400",
};

export default function HomePage() {
  const [search, setSearch] = useState("");
  const [featuredVenues, setFeaturedVenues] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    venueService
      .getAll()
      .then((response) => setFeaturedVenues((response.data || []).slice(0, 4)))
      .catch(() => setFeaturedVenues([]));
  }, []);

  const handleSearch = (event) => {
    event.preventDefault();
    const query = search.trim();
    navigate(query ? `/venues?search=${encodeURIComponent(query)}` : "/venues");
  };

  return (
    <div className="space-y-16 pb-10">
      <section
        className="relative min-h-[530px] overflow-hidden rounded-[28px] bg-zinc-900 text-white shadow-sm"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 31, 0.72), rgba(15, 23, 31, 0.72)), url(${heroImage})`,
          backgroundPosition: "center",
          backgroundSize: "cover",
        }}
      >
        <div className="absolute inset-0 bg-zinc-900/15" />
        <div className="relative mx-auto flex min-h-[530px] max-w-5xl flex-col items-center justify-center px-6 text-center">
          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
            Find the Perfect Space for Your Event
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-relaxed text-white/90 sm:text-2xl">
            Browse and reserve venues across UP Diliman for seminars, meetings, and campus activities.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-10 flex w-full max-w-4xl flex-col gap-3 rounded-xl bg-white p-2 shadow-lg sm:flex-row"
          >
            <div className="flex min-h-14 flex-1 items-center gap-4 px-4">
              <Search className="h-6 w-6 flex-none text-zinc-400" aria-hidden="true" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by venue name or location"
                className="w-full bg-transparent text-base text-zinc-900 placeholder:text-zinc-500 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="min-h-14 rounded-lg bg-primary px-8 text-base font-bold text-white transition-colors hover:bg-primary-dark"
            >
              Search
            </button>
          </form>
        </div>
      </section>

      <section className="space-y-8">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-3xl font-extrabold text-gray-100">Featured Venues</h2>
          <Link to="/venues" className="text-base font-bold text-primary hover:text-primary-dark">
            View all
          </Link>
        </div>

        {featuredVenues.length === 0 ? (
          <div className="rounded-xl border border-zinc-200 bg-white p-8 text-center text-gray-400">
            No featured venues available yet.
          </div>
        ) : (
        <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
          {featuredVenues.map((venue) => (
            <article
              key={venue.id}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <img
                src={venueImages[venue.id] || heroImage}
                alt={venue.name}
                className="h-60 w-full object-cover"
              />
              <div className="space-y-5 p-5">
                <div>
                  <h3 className="min-h-[3rem] text-2xl font-extrabold leading-tight text-gray-100">
                    {venueNames[venue.id] || venue.name}
                  </h3>
                  <div className="mt-4 space-y-3 text-base text-gray-400">
                    <p className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 flex-none" aria-hidden="true" />
                      <span>{venueLocations[venue.id] || venue.location}</span>
                    </p>
                    <p className="flex items-center gap-3">
                      <UsersRound className="h-5 w-5 flex-none" aria-hidden="true" />
                      <span>Up to {venueCapacities[venue.id] || venue.capacity} people</span>
                    </p>
                  </div>
                </div>

                <Link
                  to={`/venues/${venue.id}`}
                  className="flex min-h-12 items-center justify-center rounded-lg border border-zinc-200 px-4 text-base font-bold text-gray-100 transition hover:border-primary hover:text-primary"
                >
                  View Details
                </Link>
              </div>
            </article>
          ))}
        </div>
        )}
      </section>
    </div>
  );
}

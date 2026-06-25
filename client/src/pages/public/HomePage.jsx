/**
 * HomePage.jsx — Landing page
 */

import { Link } from "react-router-dom";
import Button from "../../components/Button";

export default function HomePage() {
  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <section className="text-center py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-100 leading-tight">
            Reserve UPD Venues{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Seamlessly
            </span>
          </h1>
          <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
            Browse available venues across UP Diliman, submit reservation requests, and manage your
            bookings — all in one place.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link to="/venues">
              <Button size="lg">Browse Venues</Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" size="lg">Get Started</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-3 gap-6">
        {[
          {
            title: "Browse Venues",
            desc: "Explore lecture halls, theaters, conference rooms, and open-air spaces across UPD.",
            icon: "🏛️",
          },
          {
            title: "Submit Reservations",
            desc: "Request venue bookings with real-time conflict checking. No double bookings.",
            icon: "📅",
          },
          {
            title: "Track Status",
            desc: "Monitor your reservation requests from submission to approval in real time.",
            icon: "✅",
          },
        ].map((feature) => (
          <div
            key={feature.title}
            className="bg-surface border border-surface-lighter rounded-xl p-6 hover:border-primary/30 transition-colors"
          >
            <span className="text-3xl">{feature.icon}</span>
            <h3 className="text-lg font-semibold text-gray-100 mt-4">{feature.title}</h3>
            <p className="text-sm text-gray-400 mt-2">{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

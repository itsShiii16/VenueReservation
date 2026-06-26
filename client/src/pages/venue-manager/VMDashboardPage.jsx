/**
 * VMDashboardPage.jsx — Venue Manager dashboard overview
 */

import { Link } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";

export default function VMDashboardPage() {
  // Placeholder stats — connect to real API later
  const stats = [
    { label: "My Venues", value: "2", link: "/vm/venues", color: "from-primary to-primary-dark" },
    { label: "Pending Requests", value: "3", link: "/vm/reservations", color: "from-warning to-amber-600" },
    { label: "Approved This Month", value: "8", link: "/vm/reservations", color: "from-success to-emerald-600" },
    { label: "Blocked Slots", value: "2", link: "/vm/calendar", color: "from-danger to-red-600" },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Overview of your venue management">
        <Link to="/vm/venues/add">
          <Button>Add Venue</Button>
        </Link>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.link}
            className="bg-surface border border-surface-lighter rounded-xl p-5 hover:border-primary/30 transition-all group"
          >
            <p className="text-sm text-gray-400">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 text-transparent bg-clip-text bg-gradient-to-r ${stat.color}`}>
              {stat.value}
            </p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-surface border border-surface-lighter rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/vm/venues/add"><Button variant="secondary" size="sm">Add Venue</Button></Link>
          <Link to="/vm/venues"><Button variant="secondary" size="sm">Add Booking</Button></Link>
          <Link to="/vm/reservations"><Button variant="secondary" size="sm">View Requests</Button></Link>
          <Link to="/vm/calendar"><Button variant="secondary" size="sm">Block Schedule</Button></Link>
          <Link to="/vm/calendar"><Button variant="secondary" size="sm">View Calendar</Button></Link>
        </div>
      </div>
    </div>
  );
}

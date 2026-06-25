/**
 * VenueManagerLayout.jsx — Dashboard layout for Venue Managers
 *
 * Includes a sidebar with VM-specific navigation and a content area.
 */

import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const vmNavItems = [
  { path: "/vm/dashboard", label: "Dashboard", end: true },
  { path: "/vm/venues", label: "Manage Venues" },
  { path: "/vm/venues/add", label: "Add Venue" },
  { path: "/vm/reservations", label: "Reservation Requests" },
  { path: "/vm/calendar", label: "Venue Calendar" },
  { path: "/vm/block-schedule", label: "Block Schedule" },
];

export default function VenueManagerLayout() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="flex">
        <Sidebar title="Venue Manager" navItems={vmNavItems} />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

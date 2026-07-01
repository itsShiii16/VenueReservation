/**
 * VenueManagerLayout.jsx — Dashboard layout for Venue Managers
 *
 * Full-height sidebar with 4 nav items (no top navbar).
 * Content area offset by sidebar width.
 */

import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { LayoutDashboard, MailCheck, Calendar, MapPin } from "lucide-react";

const vmNavItems = [
  { path: "/vm/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-[18px] w-[18px]" />, end: true },
  { path: "/vm/reservations", label: "Requests", icon: <MailCheck className="h-[18px] w-[18px]" /> },
  { path: "/vm/calendar", label: "Calendar", icon: <Calendar className="h-[18px] w-[18px]" /> },
  { path: "/vm/venues", label: "Venues", icon: <MapPin className="h-[18px] w-[18px]" /> },
];

export default function VenueManagerLayout() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar title="Venue Admin" navItems={vmNavItems} />
      <main className="ml-60 min-h-screen p-8">
        <Outlet />
      </main>
    </div>
  );
}

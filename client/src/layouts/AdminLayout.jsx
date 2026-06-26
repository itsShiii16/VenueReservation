/**
 * AdminLayout.jsx — Dashboard layout for System Admin
 *
 * Includes a sidebar with admin-specific navigation and a content area.
 */

import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { LayoutDashboard, Users } from "lucide-react";

const adminNavItems = [
  { path: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-[18px] w-[18px]" />, end: true },
  { path: "/admin/approved-managers", label: "Venue Managers", icon: <Users className="h-[18px] w-[18px]" /> },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar title="System Admin" navItems={adminNavItems} />
      <main className="ml-60 min-h-screen p-8">
        <Outlet />
      </main>
    </div>
  );
}

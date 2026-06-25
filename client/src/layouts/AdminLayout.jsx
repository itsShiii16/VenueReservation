/**
 * AdminLayout.jsx — Dashboard layout for System Admin
 *
 * Includes a sidebar with admin-specific navigation and a content area.
 */

import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const adminNavItems = [
  { path: "/admin/dashboard", label: "Dashboard", end: true },
  { path: "/admin/vm-requests", label: "VM Requests" },
  { path: "/admin/approved-managers", label: "Approved Managers" },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="flex">
        <Sidebar title="System Admin" navItems={adminNavItems} />
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

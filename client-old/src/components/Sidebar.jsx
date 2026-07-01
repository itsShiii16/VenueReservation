/**
 * Sidebar.jsx — Navigation sidebar for dashboard layouts
 *
 * Dark-themed sidebar matching the Venue Admin screenshot:
 * - "UP" red badge + title
 * - Nav items with lucide icons
 * - Active item highlight
 * - User info + logout at bottom
 */

import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LogOut, ChevronRight } from "lucide-react";

export default function Sidebar({ title, navItems = [] }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-60 flex-col bg-[#0f0f0f] border-r border-zinc-800/50">
      {/* Logo / Title */}
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-extrabold text-white">UP</span>
        </div>
        <span className="text-[15px] font-bold text-white tracking-tight">
          {title || "Venue Admin"}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5 mt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-all duration-150
              ${isActive
                ? "bg-zinc-800/60 text-white"
                : "text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {item.icon && (
                  <span className={`flex h-5 w-5 items-center justify-center transition-colors ${isActive ? "text-primary" : "text-zinc-500 group-hover:text-zinc-400"}`}>
                    {item.icon}
                  </span>
                )}
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Info + Logout */}
      {user && (
        <div className="border-t border-zinc-800/50 px-3 py-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-[13px] font-medium text-zinc-200">
                {user.firstName} {user.lastName}
              </p>
              <p className="truncate text-[11px] text-zinc-500">
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium text-zinc-500 transition-colors hover:bg-zinc-800/30 hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      )}
    </aside>
  );
}

/**
 * Sidebar.jsx — Navigation sidebar for dashboard layouts
 */

import { NavLink } from "react-router-dom";

export default function Sidebar({ title, navItems = [] }) {
  return (
    <aside className="w-64 bg-surface border-r border-surface-lighter min-h-screen p-4 flex flex-col">
      {/* Logo / Title */}
      <div className="mb-8 px-2">
        <h2 className="text-lg font-bold text-primary">{title || "VRS"}</h2>
        <p className="text-xs text-gray-500 mt-0.5">Venue Reservation System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${isActive
                ? "bg-primary/10 text-primary border-l-2 border-primary"
                : "text-gray-400 hover:text-gray-200 hover:bg-surface-light"
              }`
            }
          >
            {item.icon && <span className="w-5 h-5">{item.icon}</span>}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

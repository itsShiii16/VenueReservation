/**
 * Navbar.jsx — Top navigation bar
 */

import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getRoleLabel, getDefaultPath } from "../utils/roleHelpers";
import { LogOut, UserRound } from "lucide-react";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navClass = ({ isActive }) =>
    `text-sm font-medium transition-colors pb-1 ${
      isActive
        ? "text-gray-100 border-b-2 border-primary"
        : "text-gray-400 hover:text-gray-100"
    }`;

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-zinc-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-sm">UP</span>
            </div>
            <span className="text-lg font-bold text-gray-100">Venue Reservation</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-10">
            <NavLink to="/" className={navClass} end>
              Home
            </NavLink>
            <NavLink to="/venues" className={navClass}>
              Venues
            </NavLink>
            <NavLink to="/my-reservations" className={navClass}>
              My Reservations
            </NavLink>
          </div>

          <div className="flex items-center gap-5">
            {isAuthenticated ? (
              <>
                {/* Dashboard link based on role */}
                {user.role !== "CLIENT" && (
                  <Link
                    to={getDefaultPath(user.role)}
                    className="text-sm text-gray-400 hover:text-gray-100 transition-colors"
                  >
                    Dashboard
                  </Link>
                )}

                {/* User menu */}
                <div className="flex items-center gap-5 pl-4">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <UserRound className="h-4 w-4" aria-hidden="true" />
                    <span>{getRoleLabel(user.role)}</span>
                  </div>
                  <button
                    onClick={logout}
                    className="inline-flex items-center gap-2 text-sm font-bold text-gray-100 transition-colors hover:text-danger"
                  >
                    <LogOut className="h-4 w-4" aria-hidden="true" />
                    Log out
                  </button>
                  <Link
                    to={user.role === "SYSTEM_ADMIN" ? "/admin/dashboard" : "/login"}
                    className="text-sm text-gray-500 hover:text-primary transition-colors"
                  >
                    Admin
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-100 hover:text-primary transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="px-5 py-3 bg-primary hover:bg-primary-dark text-white text-sm font-bold rounded-md transition-colors"
                >
                  Sign up
                </Link>
                <Link
                  to="/login"
                  className="text-sm text-gray-500 hover:text-primary transition-colors"
                >
                  Admin
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

/**
 * Navbar.jsx — Top navigation bar
 */

import { Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getRoleLabel, getDefaultPath } from "../utils/roleHelpers";

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <nav className="bg-surface/80 backdrop-blur-md border-b border-surface-lighter sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="text-lg font-bold text-gray-100">VRS</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            <Link
              to="/venues"
              className="text-sm text-gray-400 hover:text-gray-100 transition-colors"
            >
              Venues
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                {/* Dashboard link based on role */}
                {user.role !== "CLIENT" && (
                  <Link
                    to={getDefaultPath(user.role)}
                    className="text-sm text-gray-400 hover:text-gray-100 transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  to="/my-reservations"
                  className="text-sm text-gray-400 hover:text-gray-100 transition-colors"
                >
                  My Reservations
                </Link>

                {/* User menu */}
                <div className="flex items-center gap-3 pl-4 border-l border-surface-lighter">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-200">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{getRoleLabel(user.role)}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="text-sm text-gray-400 hover:text-danger transition-colors"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm text-gray-400 hover:text-gray-100 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

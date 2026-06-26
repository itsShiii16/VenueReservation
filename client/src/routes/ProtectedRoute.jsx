/**
 * ProtectedRoute.jsx — Route guard for authenticated and role-based access
 *
 * Redirects to /login if not authenticated.
 * Redirects to /unauthorized if the user doesn't have the required role.
 */

import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingState from "../components/LoadingState";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading, isAuthenticated } = useAuth();

  // Still loading auth state
  if (loading) {
    return <LoadingState message="Checking authentication..." />;
  }

  // Not logged in
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-3xl font-extrabold text-gray-100">Please Sign In</h1>
        <p className="mt-4 text-xl text-gray-400">
          You need to be signed in to view your reservations.
        </p>
        <Link
          to="/login"
          className="mt-8 rounded-lg bg-primary px-6 py-3 text-base font-bold text-white transition hover:bg-primary-dark"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  // Role check (if roles are specified)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

/**
 * ProtectedRoute.jsx — Route guard for authenticated and role-based access
 *
 * Redirects to /login if not authenticated.
 * Redirects to /unauthorized if the user doesn't have the required role.
 */

import { Navigate } from "react-router-dom";
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
    return <Navigate to="/login" replace />;
  }

  // Role check (if roles are specified)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

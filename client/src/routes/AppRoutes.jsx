/**
 * AppRoutes.jsx — Application route configuration
 *
 * Defines all routes organized by:
 * - Public routes (no auth required)
 * - Client routes (CLIENT role)
 * - Venue Manager routes (VENUE_MANAGER role)
 * - System Admin routes (SYSTEM_ADMIN role)
 */

import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getDefaultPath } from "../utils/roleHelpers";
import ProtectedRoute from "./ProtectedRoute";

// Layouts
import MainLayout from "../layouts/MainLayout";
import VenueManagerLayout from "../layouts/VenueManagerLayout";
import AdminLayout from "../layouts/AdminLayout";

// Public pages
import HomePage from "../pages/public/HomePage";
import LoginPage from "../pages/public/LoginPage";
import SignupPage from "../pages/public/SignupPage";
import VenueDirectoryPage from "../pages/public/VenueDirectoryPage";
import VenueDetailsPage from "../pages/public/VenueDetailsPage";
import CalendarPage from "../pages/public/CalendarPage";
import UnauthorizedPage from "../pages/public/UnauthorizedPage";
import NotFoundPage from "../pages/public/NotFoundPage";

// Client pages
import ReservationFormPage from "../pages/client/ReservationFormPage";
import MyReservationsPage from "../pages/client/MyReservationsPage";
import ProfilePage from "../pages/client/ProfilePage";
import ClientReservationDetailsPage from "../pages/client/ClientReservationDetailsPage";

// Venue Manager pages
import VMDashboardPage from "../pages/venue-manager/VMDashboardPage";
import ManageVenuesPage from "../pages/venue-manager/ManageVenuesPage";
import AddVenuePage from "../pages/venue-manager/AddVenuePage";
import EditVenuePage from "../pages/venue-manager/EditVenuePage";
import ReservationRequestsPage from "../pages/venue-manager/ReservationRequestsPage";
import ReservationDetailsPage from "../pages/venue-manager/ReservationDetailsPage";
import VenueCalendarPage from "../pages/venue-manager/VenueCalendarPage";

// Admin pages
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import ApprovedManagersPage from "../pages/admin/ApprovedManagersPage";

const RootRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  if (isAuthenticated && user) {
    return <Navigate to={getDefaultPath(user.role)} replace />;
  }
  return <Navigate to="/login" replace />;
};

export default function AppRoutes() {
  return (
    <Routes>
      {/* ─── Public Routes (MainLayout) ─── */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/venues" element={<VenueDirectoryPage />} />
        <Route path="/venues/:id" element={<VenueDetailsPage />} />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          }
        />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* ─── Client Routes (require auth) ─── */}
        <Route
          path="/reserve"
          element={
            <ProtectedRoute allowedRoles={["CLIENT"]}>
              <ReservationFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-reservations"
          element={
            <ProtectedRoute>
              <MyReservationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reservations/:id"
          element={
            <ProtectedRoute>
              <ClientReservationDetailsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* ─── Venue Manager Routes ─── */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["VENUE_MANAGER"]}>
            <VenueManagerLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/vm/dashboard" element={<VMDashboardPage />} />
        <Route path="/vm/venues" element={<ManageVenuesPage />} />
        <Route path="/vm/venues/add" element={<AddVenuePage />} />
        <Route path="/vm/venues/:id/edit" element={<EditVenuePage />} />
        <Route path="/vm/reservations" element={<ReservationRequestsPage />} />
        <Route path="/vm/reservations/:id" element={<ReservationDetailsPage />} />
        <Route path="/vm/calendar" element={<VenueCalendarPage />} />
      </Route>

      {/* ─── System Admin Routes ─── */}
      <Route
        element={
          <ProtectedRoute allowedRoles={["SYSTEM_ADMIN"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/approved-managers" element={<ApprovedManagersPage />} />
      </Route>

      {/* ─── 404 ─── */}
      <Route element={<MainLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

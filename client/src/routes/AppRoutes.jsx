/**
 * AppRoutes.jsx — Application route configuration
 *
 * Defines all routes organized by:
 * - Public routes (no auth required)
 * - Client routes (CLIENT role)
 * - Venue Manager routes (VENUE_MANAGER role)
 * - System Admin routes (SYSTEM_ADMIN role)
 */

import { Routes, Route } from "react-router-dom";
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
import RequestVMAccessPage from "../pages/client/RequestVMAccessPage";
import ClientReservationDetailsPage from "../pages/client/ClientReservationDetailsPage";

// Venue Manager pages
import VMDashboardPage from "../pages/venue-manager/VMDashboardPage";
import ManageVenuesPage from "../pages/venue-manager/ManageVenuesPage";
import AddVenuePage from "../pages/venue-manager/AddVenuePage";
import EditVenuePage from "../pages/venue-manager/EditVenuePage";
import ReservationRequestsPage from "../pages/venue-manager/ReservationRequestsPage";
import ReservationDetailsPage from "../pages/venue-manager/ReservationDetailsPage";
import VenueCalendarPage from "../pages/venue-manager/VenueCalendarPage";
import BlockSchedulePage from "../pages/venue-manager/BlockSchedulePage";

// Admin pages
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import VMRequestsPage from "../pages/admin/VMRequestsPage";
import VMRequestDetailsPage from "../pages/admin/VMRequestDetailsPage";
import ApprovedManagersPage from "../pages/admin/ApprovedManagersPage";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ─── Public Routes (MainLayout) ─── */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/venues" element={<VenueDirectoryPage />} />
        <Route path="/venues/:id" element={<VenueDetailsPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
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
        <Route
          path="/request-vm-access"
          element={
            <ProtectedRoute allowedRoles={["CLIENT"]}>
              <RequestVMAccessPage />
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
        <Route path="/vm/block-schedule" element={<BlockSchedulePage />} />
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
        <Route path="/admin/vm-requests" element={<VMRequestsPage />} />
        <Route path="/admin/vm-requests/:id" element={<VMRequestDetailsPage />} />
        <Route path="/admin/approved-managers" element={<ApprovedManagersPage />} />
      </Route>

      {/* ─── 404 ─── */}
      <Route element={<MainLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}

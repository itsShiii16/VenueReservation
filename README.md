# UP Diliman Venue Reservation System (VRS)

A client-side, serverless mobile-responsive web application for **UP Diliman** venue reservations. This application runs entirely in the browser, utilizing a reactive mock database saved to `localStorage` for complete state persistence across reloads.

- **Frontend Tech Stack**: React + Vite + Tailwind CSS v4 + React Router v7
- **UI/UX Elements**: Lucide React (Icons) + Sonner (Toast notifications)
- **Local Persistence**: `mockDb.js` matching standard relational models

---

## 📁 Project Structure

```
VenueReservation/
├── client/                  # React frontend
│   └── src/
│       ├── components/      # 15 reusable UI components (Buttons, Modals, StatusBadges)
│       ├── context/         # AuthContext provider (subscribed to mockDb changes)
│       ├── data/            # Mock dataset (mockVenues.js, mockReservations.js)
│       ├── hooks/           # useAuth, useApi
│       ├── layouts/         # Layout grids (MainLayout, VMLayout, AdminLayout)
│       ├── pages/           # 25 pages (Pencil booking, document verification, payment dashboards)
│       ├── routes/          # AppRoutes, ProtectedRoute (RBAC Guard)
│       ├── services/        # Relational database CRUD wrappers & mockDb.js
│       └── utils/           # formatDate, roleHelpers
│
└── README.md                # Configuration & documentation
```

---

## 🚀 Getting Started

Since this is a client-side only app, **no backend, PostgreSQL, or Prisma setup is required.**

### 1. Install Frontend Dependencies

```bash
# Navigate to the client directory
cd client

# Install the packages (React Router, Lucide, Sonner)
npm install
```

### 2. Start the Development Server

```bash
npm run dev
```

The application will start running on **[http://localhost:5173](http://localhost:5173)**.

---

## 🔐 Seed Accounts & Roles

All mock database accounts use the password **`password123`**:

| Role | Email | Password | Capabilites |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin@upd.edu.ph` | `password123` | Approves or Rejects Venue Manager access upgrade requests. |
| **Venue Manager** | `carlos@upd.edu.ph`<br>`sofia@upd.edu.ph` | `password123` | Adds/edits venues, validates client documents, tracks payments, blocks schedules, and inputs assisted bookings. |
| **Client** | `juan@upd.edu.ph`<br>`ana@upd.edu.ph` | `password123` | Browses venues, views calendars, requests reservations, uploads documents, and tracks checklist completions. |

---

## 💡 Key App Workflows

### 1. Pencil Booking (Draft Status)
- Venues can configure whether they allow **Pencil Bookings** (Draft status) or require immediate full submission.
- Clients can choose "Pencil Book" to hold a slot temporarily (valid for 3 days) while they compile required documents.

### 2. Requirement Checklist Tracking
- Every reservation tracks an array of document requirements (e.g. *Letter of Request*, *Event Proposal*, *Adviser Endorsement*).
- Status changes dynamically: `Missing` ➔ `Uploaded` ➔ `Approved` OR `Needs Revision` (with manager remarks).
- Clients can upload document files in their reservation details drawer, automatically updating status from `Draft` to `Submitted`.

### 3. Document Validation (Venue Managers)
- Managers can review uploaded files on a reservation details page, and approve individual documents or send them back ("Return for Completion") with feedback remarks.

### 4. Verification & Payment Flow
- Once all requirements are validated, managers trigger the payment flow by clicking **Request Payment** (status changes to *Payment Pending*).
- Managers can manually click **Mark as Paid & Approve Booking** (moves status to `APPROVED` and locks the calendar) or **Mark Payment Overdue**.

### 5. Assisted Bookings
- Venue Managers can use the **Create Assisted Booking** modal on their dashboard to quickly book a venue on behalf of a client without filling client-side requests.

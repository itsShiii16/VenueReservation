# UPD Venue Reservation System (VRS)

A full-stack venue reservation system for **UP Diliman** built with the PERN stack.

- **Frontend**: React + Vite + Tailwind CSS v4
- **Backend**: Node.js + Express.js (MVC architecture)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Auth**: JWT-based authentication

---

## 📁 Project Structure

```
VenueReservation/
├── client/                  # React frontend
│   └── src/
│       ├── components/      # 15 reusable UI components
│       ├── context/         # AuthContext provider
│       ├── data/            # Mock data for development
│       ├── hooks/           # useAuth, useApi
│       ├── layouts/         # MainLayout, VMLayout, AdminLayout
│       ├── pages/           # 24 pages (public, client, vm, admin)
│       ├── routes/          # AppRoutes, ProtectedRoute
│       ├── services/        # 7 API service modules
│       └── utils/           # formatDate, roleHelpers
│
├── server/                  # Express backend
│   ├── prisma/
│   │   ├── schema.prisma    # 8 models, 3 enums
│   │   └── seed.js          # Sample data seeder
│   └── src/
│       ├── config/          # DB client, constants
│       ├── controllers/     # 7 controllers
│       ├── middleware/       # auth, roles, validation, errors
│       ├── routes/          # 7 route files
│       ├── services/        # audit, conflict services
│       ├── utils/           # token, ref number, conflict check
│       └── validators/      # 5 validator files
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [PostgreSQL](https://www.postgresql.org/) v14+
- npm (comes with Node.js)

---

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd VenueReservation
```

### 2. Set Up PostgreSQL

Create a database for the project:

```sql
CREATE DATABASE vrs_db;
```

### 3. Configure the Backend

```bash
cd server

# Copy the environment template
cp .env.example .env

# Edit .env with your database credentials:
# DATABASE_URL="postgresql://postgres:yourpassword@localhost:5432/vrs_db?schema=public"
# JWT_SECRET="your-random-secret-key"
```

### 4. Install Backend Dependencies

```bash
# Still in the server/ directory
npm install
```

### 5. Run Prisma Migrations

```bash
# Generate the Prisma client
npx prisma generate

# Create the database tables
npx prisma migrate dev --name init
```

### 6. Seed the Database

```bash
npx prisma db seed
```

This creates:
- 1 System Admin (`admin@upd.edu.ph`)
- 2 Clients (`juan@upd.edu.ph`, `ana@upd.edu.ph`)
- 2 Venue Managers (`carlos@upd.edu.ph`, `sofia@upd.edu.ph`)
- 4 UPD venues (Cine Adarna, Palma Hall 400, CS Amphitheater, Melchor Hall Conference Room)
- 3 sample reservations (Approved, Submitted, Declined)
- 2 blocked slots
- 2 venue manager requests

**All seed accounts use password:** `password123`

### 7. Start the Backend

```bash
npm run dev
```

The API server starts at `http://localhost:5000`.

### 8. Install Frontend Dependencies

```bash
# Open a new terminal
cd client
npm install
```

### 9. Start the Frontend

```bash
npm run dev
```

The frontend starts at `http://localhost:5173`.

---

## 🔐 User Roles

| Role | Capabilities |
|------|-------------|
| **Guest** | Browse venues (no account needed) |
| **Client** | Submit reservations, track status, request VM access |
| **Venue Manager** | Manage assigned venues, approve/decline reservations, block schedules |
| **System Admin** | Review and approve/reject Venue Manager access requests |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login |
| GET | `/api/auth/me` | Yes | Get current user |

### Venues
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/venues` | No | — | List venues |
| GET | `/api/venues/:id` | No | — | Venue details |
| POST | `/api/venues` | Yes | VM | Create venue |
| PUT | `/api/venues/:id` | Yes | VM | Update venue |
| DELETE | `/api/venues/:id` | Yes | VM | Deactivate venue |

### Reservations
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/reservations` | Yes | Client | Create reservation |
| GET | `/api/reservations/my` | Yes | — | My reservations |
| GET | `/api/reservations/:id` | Yes | — | Reservation details |
| PATCH | `/api/reservations/:id/cancel` | Yes | Client | Cancel reservation |
| GET | `/api/reservations/venue-manager` | Yes | VM | VM's venue reservations |
| PATCH | `/api/reservations/:id/approve` | Yes | VM | Approve reservation |
| PATCH | `/api/reservations/:id/decline` | Yes | VM | Decline reservation |

### Blocked Slots
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/blocked-slots/:venueId` | No | — | Get blocked slots |
| POST | `/api/blocked-slots` | Yes | VM | Create blocked slot |
| DELETE | `/api/blocked-slots/:id` | Yes | VM | Remove blocked slot |

### Venue Manager Requests
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/venue-manager-requests` | Yes | Client | Submit VM request |
| GET | `/api/venue-manager-requests/my` | Yes | — | My VM requests |

### Admin
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/admin/venue-manager-requests` | Yes | Admin | List all VM requests |
| PATCH | `/api/admin/venue-manager-requests/:id/approve` | Yes | Admin | Approve VM request |
| PATCH | `/api/admin/venue-manager-requests/:id/reject` | Yes | Admin | Reject VM request |

---

## ⚠️ Schedule Conflict Logic

When creating a reservation, the system checks for conflicts with:

1. **Approved reservations** for the same venue
2. **Blocked slots** for the same venue

Overlap detection uses: `newStart < existingEnd AND newEnd > existingStart`

If a conflict is found, the request is rejected with: *"This schedule is unavailable."*

---

## 🛠 Tech Stack Details

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | React 19 + Vite | UI framework + build tool |
| Styling | Tailwind CSS v4 | Utility-first CSS |
| Routing | React Router v7 | Client-side routing |
| HTTP | Axios | API requests |
| Backend | Express.js | REST API server |
| ORM | Prisma | Database access |
| Database | PostgreSQL | Relational data store |
| Auth | JWT + bcrypt | Token-based authentication |
| Validation | express-validator | Request validation |

---

## 📝 Development Notes

- The frontend includes **mock data fallbacks** — it works even without the backend running.
- Service files in `client/src/services/` point to `http://localhost:5000/api` — update `VITE_API_URL` in a `.env` file if your backend is on a different URL.
- All passwords in seed data are: `password123`
- The project uses **soft deletes** for venues (sets `isActive = false` instead of actual deletion).
- Audit logs track important actions (venue creation, reservation approval, etc.).

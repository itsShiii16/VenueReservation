# UPD Venue Reservation System Client

React + Vite frontend for the UPD Venue Reservation System MVP.

## Run

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## Current MVP Coverage

- Guests can browse venues and are redirected to log in before reserving.
- Clients can submit requirements, track reservation status, upload placeholder documents, and request cancellation.
- Pencil-enabled venues use preliminary submissions first; the Venue Manager must accept one request before a slot becomes `Pencil Booked / Draft`.
- Non-pencil venues move directly to `Under Review`.
- Venue Managers can manage venues, review requests, accept pencil bookings, move reservations through manual payment states, block schedules, and add assisted bookings.
- System Admins create, edit, reassign, and remove Venue Manager accounts. Clients do not request Venue Manager access in the app.

## Demo Accounts

All local demo accounts use `password123`.

- System Admin: `admin@upd.edu.ph`
- Venue Managers: `carlos@upd.edu.ph`, `sofia@upd.edu.ph`
- Clients: `juan@upd.edu.ph`, `ana@upd.edu.ph`

## Notes

The current frontend uses `src/services/mockDb.js` for local persistence while the Express + Prisma backend is aligned separately under `../server`.

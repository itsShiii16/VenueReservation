# UPD Venue Reservation System

Full-stack MVP for managing UP Diliman venue reservations.

## Stack

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: PostgreSQL
- ORM: Prisma
- Auth: JWT-ready backend, local demo auth in the frontend mock store

## Project Structure

```txt
VenueReservation/
  client/   React frontend
  server/   Express API, Prisma schema, seed data
```

## Install

```bash
cd server
npm install
copy .env.example .env
npx prisma migrate dev
npm run seed
npm run dev
```

```bash
cd client
npm install
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000` by default

## Demo Accounts

All seeded/demo accounts use `password123`.

- System Admin: `admin@upd.edu.ph`
- Venue Managers: `carlos@upd.edu.ph`, `sofia@upd.edu.ph`
- Clients: `juan@upd.edu.ph`, `ana@upd.edu.ph`, `leo@upd.edu.ph`

## Roles

- Guest: browse venues, search, view details, and log in before reserving.
- Client: submit requirements, monitor status, upload placeholder documents, and request cancellation.
- Venue Manager: manage venues, review preliminary requests, accept pencil bookings, validate documents, manually track payment, block schedules, and add assisted bookings.
- System Admin: create/edit/remove Venue Manager accounts, assign facilities or locations, and review system records.

## Booking Workflow

Venues that allow pencil booking start with `Preliminary Submitted`. Multiple clients may submit preliminary requirements for the same venue and slot. A Venue Manager accepts one request, which becomes `Pencil Booked / Draft`; competing preliminary requests for that same slot are rejected.

Venues that do not allow pencil booking move directly to `Under Review` after full requirement submission.

Payment is tracked manually only. The system does not process payments or store payment details. Managers move reservations through `Payment Pending`, `Payment Overdue`, and `Booked / Confirmed`.

## Verification

The current frontend build passes with:

```bash
cd client
npm.cmd run build
```

The Prisma schema validates with:

```bash
cd server
npx.cmd prisma validate
```

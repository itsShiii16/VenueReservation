/**
 * mockReservations.js — Sample reservation data for frontend development
 */

export const mockReservations = [
  {
    id: "res-1",
    referenceNumber: "RES-20260701-0001",
    eventTitle: "CS Department General Assembly",
    activityType: "Academic Assembly",
    expectedAttendees: 120,
    startTime: "2026-07-01T09:00:00Z",
    endTime: "2026-07-01T12:00:00Z",
    status: "APPROVED",
    notes: "Need microphone and projector setup.",
    venue: { id: "venue-3", name: "CS Amphitheater", location: "Department of CS" },
  },
  {
    id: "res-2",
    referenceNumber: "RES-20260705-0002",
    eventTitle: "Film Screening: Himala Restored",
    activityType: "Cultural Event",
    expectedAttendees: 400,
    startTime: "2026-07-05T18:00:00Z",
    endTime: "2026-07-05T21:00:00Z",
    status: "SUBMITTED",
    notes: "Requesting special lighting for the Q&A portion.",
    venue: { id: "venue-1", name: "Cine Adarna", location: "UP Film Institute" },
  },
  {
    id: "res-3",
    referenceNumber: "RES-20260710-0003",
    eventTitle: "Engineering Thesis Defense Marathon",
    activityType: "Academic Defense",
    expectedAttendees: 35,
    startTime: "2026-07-10T08:00:00Z",
    endTime: "2026-07-10T17:00:00Z",
    status: "DECLINED",
    declineReason: "Venue is under maintenance during the requested period.",
    venue: { id: "venue-4", name: "Melchor Hall Conference Room", location: "Melchor Hall" },
  },
];

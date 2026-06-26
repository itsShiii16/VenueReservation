/**
 * mockDb.js — In-memory & LocalStorage-backed reactive database for the VRS frontend.
 *
 * Implements core logic for CRUD, document checks, and status changes.
 */

import { mockVenues } from "../data/mockVenues";
import { mockReservations } from "../data/mockReservations";

// Helper to generate UUIDs locally
const generateId = () => Math.random().toString(36).substring(2, 15);

// Helper to generate Reference Numbers (RES-YYYYMMDD-XXXX)
const generateRefNumber = () => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `RES-${date}-${rand}`;
};

// Default Users
const defaultUsers = [
  {
    id: "user-admin",
    firstName: "Maria",
    lastName: "Santos",
    email: "admin@upd.edu.ph",
    password: "password123",
    role: "SYSTEM_ADMIN",
    organization: "UP Diliman",
    position: "System Administrator",
  },
  {
    id: "user-manager-1",
    firstName: "Carlos",
    lastName: "Garcia",
    email: "carlos@upd.edu.ph",
    password: "password123",
    role: "VENUE_MANAGER",
    organization: "Office of the Campus Architect",
    position: "Facilities Officer",
  },
  {
    id: "user-manager-2",
    firstName: "Sofia",
    lastName: "Mendoza",
    email: "sofia@upd.edu.ph",
    password: "password123",
    role: "VENUE_MANAGER",
    organization: "College of Arts and Letters",
    position: "Administrative Officer",
  },
  {
    id: "user-client-1",
    firstName: "Juan",
    lastName: "Dela Cruz",
    email: "juan@upd.edu.ph",
    password: "password123",
    role: "CLIENT",
    organization: "College of Engineering",
    position: "Student",
  },
  {
    id: "user-client-2",
    firstName: "Ana",
    lastName: "Reyes",
    email: "ana@upd.edu.ph",
    password: "password123",
    role: "CLIENT",
    organization: "College of Science",
    position: "Faculty",
  },
];

const SLOT_BLOCKING_STATUSES = ["PENCIL_BOOKED_DRAFT", "PAYMENT_PENDING", "BOOKED_CONFIRMED"];
const CLOSED_STATUSES = ["REJECTED", "CANCELLED", "EXPIRED_AUTO_REJECTED"];

const hasTimeOverlap = (startA, endA, startB, endB) => {
  return new Date(startA) < new Date(endB) && new Date(endA) > new Date(startB);
};

const findScheduleConflict = (venueId, startTime, endTime, excludeReservationId = null) => {
  const reservationConflict = store.reservations.find((r) => {
    if (r.id === excludeReservationId || r.venueId !== venueId) return false;
    if (!SLOT_BLOCKING_STATUSES.includes(r.status)) return false;
    return hasTimeOverlap(startTime, endTime, r.startTime, r.endTime);
  });

  if (reservationConflict) return reservationConflict;

  return store.blockedSlots.find((b) => {
    if (b.venueId !== venueId) return false;
    return hasTimeOverlap(startTime, endTime, b.startTime, b.endTime);
  });
};

// Seed venues with additional config (pencil bookings, requirements)
const seedVenues = mockVenues.map((v, index) => ({
  ...v,
  createdById: index % 2 === 0 ? "user-manager-1" : "user-manager-2",
  allowsPencilBooking: index % 2 === 0, // Cine Adarna and CS Amphitheater allow it
  allowPencilBooking: index % 2 === 0,
  preliminaryRequirements: ["Letter of Intent / Request", "Activity summary"],
  supplementaryRequirements: [
    "Letter of Intent / Request",
    "Activity flow / Event Program",
    "Endorsement from Dean / Adviser",
    "Equipment checklist",
  ],
  requirements: [
    "Letter of Intent / Request",
    "Activity flow / Event Program",
    "Endorsement from Dean / Adviser",
    "Equipment checklist",
  ],
  pencilBookingDays: 3,
  paymentDeadlineDays: 5,
}));

// Default Blocked Slots
const defaultBlockedSlots = [
  {
    id: "block-1",
    venueId: "venue-1",
    startTime: "2026-07-02T08:00:00.000Z",
    endTime: "2026-07-02T17:00:00.000Z",
    reason: "Routine maintenance and screen calibration",
    createdById: "user-manager-1",
  },
];

// Historical external manager-creation records for admin audit views.
const defaultRequests = [
  {
    id: "request-1",
    officeOrOrganization: "National Institute of Physics",
    position: "Department Secretary",
    facilityToManage: "NIP Auditorium",
    reason: "Need to manage bookings for NIP colloquiums and external rentals.",
    supportingDocumentUrl: "nip_endorsement.pdf",
    status: "CREATED_EXTERNALLY",
    remarks: null,
    clientId: "user-client-2",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Seed reservations with requirement tracking & payment details
const seedReservations = mockReservations.map((r) => {
  const matchingVenue = seedVenues.find((v) => v.id === r.venue.id) || seedVenues[0];
  const paymentStatus =
    r.status === "BOOKED_CONFIRMED" ? "Paid" :
    r.status === "PAYMENT_PENDING" ? "Pending" :
    r.status === "PAYMENT_OVERDUE" ? "Overdue" :
    "None";
  return {
    ...r,
    clientId: ["res-1", "res-2"].includes(r.id) ? "user-client-1" : "user-client-2",
    venueId: r.venue.id,
    paymentStatus,
    bookingSource: "CLIENT_SUBMITTED",
    requirements: matchingVenue.requirements.map((req, idx) => ({
      id: `req-${idx}`,
      name: req,
      status: ["BOOKED_CONFIRMED", "PAYMENT_PENDING"].includes(r.status) ? "Approved" : "Missing",
      remarks: "",
      fileName: ["BOOKED_CONFIRMED", "PAYMENT_PENDING"].includes(r.status) ? "approved_document.pdf" : null,
    })),
  };
});

// React context state listeners
const listeners = new Set();
export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Global Store
let store = {
  users: JSON.parse(localStorage.getItem("vrs_db_users")) || defaultUsers,
  venues: JSON.parse(localStorage.getItem("vrs_db_venues")) || seedVenues,
  reservations: JSON.parse(localStorage.getItem("vrs_db_reservations")) || seedReservations,
  blockedSlots: JSON.parse(localStorage.getItem("vrs_db_blocked_slots")) || defaultBlockedSlots,
  requests: JSON.parse(localStorage.getItem("vrs_db_requests")) || defaultRequests,
  currentUser: JSON.parse(localStorage.getItem("vrs_db_current_user")) || null,
};

const notify = () => {
  localStorage.setItem("vrs_db_users", JSON.stringify(store.users));
  localStorage.setItem("vrs_db_venues", JSON.stringify(store.venues));
  localStorage.setItem("vrs_db_reservations", JSON.stringify(store.reservations));
  localStorage.setItem("vrs_db_blocked_slots", JSON.stringify(store.blockedSlots));
  localStorage.setItem("vrs_db_requests", JSON.stringify(store.requests));
  localStorage.setItem("vrs_db_current_user", JSON.stringify(store.currentUser));
  listeners.forEach((listener) => listener({ ...store }));
};

// Database Mutations / Query APIs
export const db = {
  // --- AUTH ---
  getCurrentUser: () => store.currentUser,
  
  login: (email, password) => {
    const user = store.users.find((u) => u.email === email && u.password === password);
    if (!user) throw new Error("Invalid email or password.");
    store.currentUser = user;
    notify();
    return user;
  },

  register: (userData) => {
    const exists = store.users.find((u) => u.email === userData.email);
    if (exists) throw new Error("Email already registered.");
    
    const newUser = {
      id: generateId(),
      role: "CLIENT",
      ...userData,
    };
    store.users.push(newUser);
    store.currentUser = newUser;
    notify();
    return newUser;
  },

  logout: () => {
    store.currentUser = null;
    notify();
  },

  getUsers: () => store.users,

  updateProfile: (userId, updateData) => {
    store.users = store.users.map((u) => (u.id === userId ? { ...u, ...updateData } : u));
    if (store.currentUser?.id === userId) {
      store.currentUser = { ...store.currentUser, ...updateData };
    }
    notify();
    return store.currentUser;
  },

  // --- VENUES ---
  getVenues: () => store.venues.filter((v) => v.isActive),
  
  getVenueById: (id) => {
    const venue = store.venues.find((v) => v.id === id);
    if (!venue) return null;
    
    // Include future blocked slots and approved reservations dynamically
    const now = new Date();
    const venueBlocked = store.blockedSlots.filter((b) => b.venueId === id && new Date(b.endTime) >= now);
    const venueRes = store.reservations.filter((r) => r.venueId === id && !CLOSED_STATUSES.includes(r.status) && new Date(r.endTime) >= now);
    
    return {
      ...venue,
      blockedSlots: venueBlocked,
      reservations: venueRes,
    };
  },

  createVenue: (venueData) => {
    const newVenue = {
      id: `venue-${generateId()}`,
      isActive: true,
      createdById: store.currentUser?.id || "user-manager-1",
      amenities: venueData.amenities || [],
      equipment: venueData.equipment || [],
      requirements: [
        "Letter of Intent / Request",
        "Activity flow / Event Program",
        "Endorsement from Dean / Adviser",
        "Equipment checklist",
      ],
      ...venueData,
      capacity: parseInt(venueData.capacity) || 0,
    };
    store.venues.push(newVenue);
    notify();
    return newVenue;
  },

  updateVenue: (id, venueData) => {
    store.venues = store.venues.map((v) => (v.id === id ? { ...v, ...venueData, capacity: parseInt(venueData.capacity) || v.capacity } : v));
    notify();
    return store.venues.find((v) => v.id === id);
  },

  deleteVenue: (id) => {
    store.venues = store.venues.map((v) => (v.id === id ? { ...v, isActive: false } : v));
    notify();
  },

  // --- RESERVATIONS ---
  getReservations: () => store.reservations,
  
  getReservationById: (id) => {
    const res = store.reservations.find((r) => r.id === id);
    if (!res) return null;
    
    const venue = store.venues.find((v) => v.id === res.venueId);
    const client = store.users.find((u) => u.id === res.clientId);
    
    return {
      ...res,
      venue,
      client,
    };
  },

  createReservation: (data) => {
    const venue = store.venues.find((v) => v.id === data.venueId);
    if (!venue) throw new Error("Venue not found.");

    // Conflict Check
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    
    const hasConflict = findScheduleConflict(data.venueId, start, end);

    if (hasConflict) {
      throw new Error("Schedule conflict detected: Slot is already reserved or blocked.");
    }

    const ref = generateRefNumber();
    const usesPreliminaryFlow = venue.allowsPencilBooking || venue.allowPencilBooking;
    const submittedAt = new Date().toISOString();
    
    const newRes = {
      id: `res-${generateId()}`,
      referenceNumber: ref,
      eventTitle: data.eventTitle,
      activityType: data.activityType || "See submitted requirements",
      expectedAttendees: parseInt(data.expectedAttendees) || 0,
      startTime: data.startTime,
      endTime: data.endTime,
      notes: data.notes || "",
      status: usesPreliminaryFlow ? "PRELIMINARY_SUBMITTED" : "UNDER_REVIEW",
      declineReason: null,
      clientId: store.currentUser?.id || "user-client-1",
      venueId: data.venueId,
      paymentStatus: "None",
      bookingSource: "CLIENT_SUBMITTED",
      submittedAt,
      pencilBookingDeadline: null,
      paymentDeadline: null,
      requirements: venue.requirements.map((req, idx) => ({
        id: `req-${idx}`,
        name: req,
        status: "Missing",
        remarks: "",
        fileName: null,
      })),
      venue: { id: venue.id, name: venue.name, location: venue.location },
    };

    store.reservations.push(newRes);
    notify();
    return newRes;
  },

  // Manual booking by Venue Manager on behalf of a client
  createAssistedBooking: (data) => {
    const venue = store.venues.find((v) => v.id === data.venueId);
    if (!venue) throw new Error("Venue not found.");

    const ref = generateRefNumber();
    const conflict = findScheduleConflict(data.venueId, data.startTime, data.endTime);
    if (conflict) {
      throw new Error("Schedule conflict detected: Slot is already reserved, pencil booked, payment pending, or blocked.");
    }
    
    // Find or create mock client
    let client = store.users.find((u) => u.email === data.clientEmail);
    if (!client) {
      client = {
        id: `user-${generateId()}`,
        firstName: data.clientFirstName || "Assisted",
        lastName: data.clientLastName || "Client",
        email: data.clientEmail,
        password: "password123",
        role: "CLIENT",
        organization: "",
      };
      store.users.push(client);
    }

    const newRes = {
      id: `res-${generateId()}`,
      referenceNumber: ref,
      eventTitle: data.eventTitle,
      activityType: data.activityType || "See submitted requirements",
      expectedAttendees: parseInt(data.expectedAttendees) || 0,
      startTime: data.startTime,
      endTime: data.endTime,
      notes: "Assisted Booking created by Venue Manager. Pre-approved.",
      status: data.isPaid ? "BOOKED_CONFIRMED" : "PAYMENT_PENDING",
      declineReason: null,
      clientId: client.id,
      venueId: data.venueId,
      paymentStatus: data.isPaid ? "Paid" : "Pending",
      bookingSource: "VENUE_MANAGER_ASSISTED",
      requirements: venue.requirements.map((req, idx) => ({
        id: `req-${idx}`,
        name: req,
        status: "Approved", // Assisted booking documents automatically marked as approved
        remarks: "Pre-validated by Manager",
        fileName: "assisted_verification.pdf",
      })),
      venue: { id: venue.id, name: venue.name, location: venue.location },
    };

    store.reservations.push(newRes);
    notify();
    return newRes;
  },

  cancelReservation: (id) => {
    store.reservations = store.reservations.map((r) => (r.id === id ? { ...r, status: "CANCELLED" } : r));
    notify();
  },

  approveReservation: (id) => {
    store.reservations = store.reservations.map((r) => (r.id === id ? { ...r, status: "BOOKED_CONFIRMED", paymentStatus: "Paid" } : r));
    notify();
  },

  declineReservation: (id, declineReason) => {
    store.reservations = store.reservations.map((r) => (r.id === id ? { ...r, status: "REJECTED", declineReason } : r));
    notify();
  },

  acceptPencilBooking: (id) => {
    const reservation = store.reservations.find((r) => r.id === id);
    if (!reservation) throw new Error("Reservation not found.");
    if (reservation.status !== "PRELIMINARY_SUBMITTED") {
      throw new Error("Only preliminary submissions can be accepted for pencil booking.");
    }

    const conflict = findScheduleConflict(reservation.venueId, reservation.startTime, reservation.endTime, id);
    if (conflict) throw new Error("This slot is no longer available.");

    const deadline = new Date();
    const venue = store.venues.find((v) => v.id === reservation.venueId);
    deadline.setDate(deadline.getDate() + (venue?.pencilBookingDays || 3));

    store.reservations = store.reservations.map((r) => {
      const sameSlot =
        r.id !== id &&
        r.venueId === reservation.venueId &&
        r.status === "PRELIMINARY_SUBMITTED" &&
        hasTimeOverlap(reservation.startTime, reservation.endTime, r.startTime, r.endTime);

      if (r.id === id) {
        return {
          ...r,
          status: "PENCIL_BOOKED_DRAFT",
          pencilBookingDeadline: deadline.toISOString(),
        };
      }

      if (sameSlot) {
        return {
          ...r,
          status: "REJECTED",
          declineReason: "Another preliminary request was accepted for this slot.",
        };
      }

      return r;
    });
    notify();
  },

  // Document Validation workflow
  updateRequirementStatus: (reservationId, reqId, status, remarks, fileName = null) => {
    store.reservations = store.reservations.map((r) => {
      if (r.id !== reservationId) return r;
      
      const updatedReqs = r.requirements.map((req) => {
        if (req.id === reqId) {
          return {
            ...req,
            status, // Uploaded | Approved | Needs Revision | Missing
            remarks: remarks || "",
            ...(fileName && { fileName }),
          };
        }
        return req;
      });

      // Automatically advance status if all documents are uploaded/approved
      let nextStatus = r.status;
      if (r.status === "PENCIL_BOOKED_DRAFT" && updatedReqs.every((req) => req.status !== "Missing")) {
        nextStatus = "UNDER_REVIEW";
      } else if (status === "Needs Revision") {
        nextStatus = "RETURNED_FOR_COMPLETION";
      }

      return {
        ...r,
        requirements: updatedReqs,
        status: nextStatus,
      };
    });
    notify();
  },

  // Payment Flow trigger
  setPaymentStatus: (reservationId, paymentStatus, remarks = "") => {
    store.reservations = store.reservations.map((r) => {
      if (r.id !== reservationId) return r;
      
      let finalStatus = r.status;
      if (paymentStatus === "Paid") {
        finalStatus = "BOOKED_CONFIRMED";
      } else if (paymentStatus === "Pending") {
        finalStatus = "PAYMENT_PENDING";
      } else if (paymentStatus === "Overdue") {
        finalStatus = "PAYMENT_OVERDUE";
      }
      
      return {
        ...r,
        paymentStatus,
        status: finalStatus,
        notes: remarks ? `${r.notes}\n[Payment Note]: ${remarks}` : r.notes,
      };
    });
    notify();
  },

  // --- BLOCKED SLOTS ---
  getBlockedSlots: () => store.blockedSlots,
  
  createBlockedSlot: (data) => {
    const newSlot = {
      id: `block-${generateId()}`,
      createdById: store.currentUser?.id || "user-manager-1",
      ...data,
    };
    store.blockedSlots.push(newSlot);
    notify();
    return newSlot;
  },

  deleteBlockedSlot: (id) => {
    store.blockedSlots = store.blockedSlots.filter((b) => b.id !== id);
    notify();
  },

  // --- VM ACCESS REQUESTS ---
  getVMRequests: () => store.requests,
  
  submitVMRequest: (data) => {
    const newReq = {
      id: `req-${generateId()}`,
      clientId: store.currentUser?.id || "user-client-1",
      status: "PENDING_REVIEW",
      createdAt: new Date().toISOString(),
      remarks: null,
      ...data,
    };
    store.requests.push(newReq);
    notify();
    return newReq;
  },

  approveVMRequest: (id, remarks) => {
    const request = store.requests.find((r) => r.id === id);
    if (!request) throw new Error("Request not found.");

    // Update Request status
    store.requests = store.requests.map((r) => (r.id === id ? { ...r, status: "APPROVED", remarks } : r));

    // Update User Role to VENUE_MANAGER
    store.users = store.users.map((u) => (u.id === request.clientId ? { ...u, role: "VENUE_MANAGER" } : u));
    
    notify();
  },

  rejectVMRequest: (id, remarks) => {
    store.requests = store.requests.map((r) => (r.id === id ? { ...r, status: "REJECTED", remarks } : r));
    notify();
  },

  createVenueManager: (data) => {
    if (store.users.some((u) => u.email === data.email)) {
      throw new Error("Email already exists.");
    }

    const manager = {
      id: `user-${generateId()}`,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: data.password || "password123",
      role: "VENUE_MANAGER",
      organization: "",
      position: data.position || "Venue Manager",
      managingUnit: data.managingUnit || "",
      assignedLocation: data.assignedLocation || "",
      createdAt: new Date().toISOString(),
    };

    store.users.push(manager);
    notify();
    return manager;
  },

  updateVenueManager: (id, data) => {
    store.users = store.users.map((u) => (u.id === id && u.role === "VENUE_MANAGER" ? { ...u, ...data } : u));
    notify();
    return store.users.find((u) => u.id === id);
  },

  removeVenueManager: (id) => {
    store.users = store.users.map((u) => (u.id === id && u.role === "VENUE_MANAGER" ? { ...u, role: "CLIENT" } : u));
    notify();
  },
};

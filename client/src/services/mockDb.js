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

// Seed venues with additional config (pencil bookings, requirements)
const seedVenues = mockVenues.map((v, index) => ({
  ...v,
  createdById: index % 2 === 0 ? "user-manager-1" : "user-manager-2",
  allowPencilBooking: index % 2 === 0, // Cinematic and Amphitheater allow it
  requirements: [
    "Letter of Intent / Request",
    "Activity flow / Event Program",
    "Endorsement from Dean / Adviser",
    "Equipment checklist",
  ],
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

// Default VM Access Requests
const defaultRequests = [
  {
    id: "request-1",
    officeOrOrganization: "National Institute of Physics",
    position: "Department Secretary",
    facilityToManage: "NIP Auditorium",
    reason: "Need to manage bookings for NIP colloquiums and external rentals.",
    supportingDocumentUrl: "nip_endorsement.pdf",
    status: "PENDING_REVIEW",
    remarks: null,
    clientId: "user-client-2",
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Seed reservations with requirement tracking & payment details
const seedReservations = mockReservations.map((r) => {
  const matchingVenue = seedVenues.find((v) => v.id === r.venue.id) || seedVenues[0];
  return {
    ...r,
    clientId: r.id === "res-1" ? "user-client-1" : "user-client-2",
    venueId: r.venue.id,
    paymentStatus: r.status === "APPROVED" ? "Paid" : r.status === "DECLINED" ? "None" : "Pending",
    requirements: matchingVenue.requirements.map((req, idx) => ({
      id: `req-${idx}`,
      name: req,
      status: r.status === "APPROVED" ? "Approved" : "Missing",
      remarks: "",
      fileName: r.status === "APPROVED" ? "approved_document.pdf" : null,
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
    const venueRes = store.reservations.filter((r) => r.venueId === id && r.status === "APPROVED" && new Date(r.endTime) >= now);
    
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
    
    const hasConflict = store.reservations.some((r) => {
      if (r.venueId !== data.venueId || r.status === "DECLINED" || r.status === "CANCELLED") return false;
      const rStart = new Date(r.startTime);
      const rEnd = new Date(r.endTime);
      return start < rEnd && end > rStart;
    }) || store.blockedSlots.some((b) => {
      if (b.venueId !== data.venueId) return false;
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      return start < bEnd && end > bStart;
    });

    if (hasConflict) {
      throw new Error("Schedule conflict detected: Slot is already reserved or blocked.");
    }

    const ref = generateRefNumber();
    const isPencil = data.pencilBooking === "true" || data.pencilBooking === true;
    
    const newRes = {
      id: `res-${generateId()}`,
      referenceNumber: ref,
      eventTitle: data.eventTitle,
      activityType: data.activityType,
      expectedAttendees: parseInt(data.expectedAttendees) || 0,
      startTime: data.startTime,
      endTime: data.endTime,
      notes: data.notes || "",
      status: isPencil ? "DRAFT" : "SUBMITTED",
      declineReason: null,
      clientId: store.currentUser?.id || "user-client-1",
      venueId: data.venueId,
      paymentStatus: "None",
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
        organization: data.clientOrganization || "External Group",
      };
      store.users.push(client);
    }

    const newRes = {
      id: `res-${generateId()}`,
      referenceNumber: ref,
      eventTitle: data.eventTitle,
      activityType: data.activityType,
      expectedAttendees: parseInt(data.expectedAttendees) || 0,
      startTime: data.startTime,
      endTime: data.endTime,
      notes: "Assisted Booking created by Venue Manager. Pre-approved.",
      status: "APPROVED", // Directly approved
      declineReason: null,
      clientId: client.id,
      venueId: data.venueId,
      paymentStatus: data.isPaid ? "Paid" : "Pending",
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
    store.reservations = store.reservations.map((r) => (r.id === id ? { ...r, status: "APPROVED", paymentStatus: "Paid" } : r));
    notify();
  },

  declineReservation: (id, declineReason) => {
    store.reservations = store.reservations.map((r) => (r.id === id ? { ...r, status: "DECLINED", declineReason } : r));
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
      if (r.status === "DRAFT" && updatedReqs.every((req) => req.status !== "Missing")) {
        nextStatus = "SUBMITTED"; // Pencil Booking upgraded to Submitted
      } else if (r.status === "SUBMITTED" && updatedReqs.every((req) => req.status === "Approved")) {
        nextStatus = "UNDER_REVIEW";
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
        finalStatus = "APPROVED";
      } else if (paymentStatus === "Pending") {
        finalStatus = "UNDER_REVIEW"; // transition to payment pending
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
};

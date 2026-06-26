/**
 * seed.js — Database seeder for UPD Venue Reservation System
 *
 * Creates sample data for development/testing:
 *   - 1 System Admin
 *   - 2 Clients
 *   - 2 Venue Managers
 *   - 4 UPD venues
 *   - 3 reservations (different statuses)
 *   - 2 blocked slots
 *   - 2 venue manager access requests
 *
 * Run with: npx prisma db seed
 */

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ───────────── Clean existing data ─────────────
  // Delete in order that respects foreign key constraints
  await prisma.auditLog.deleteMany();
  await prisma.uploadedFile.deleteMany();
  await prisma.requirement.deleteMany();
  await prisma.blockedSlot.deleteMany();
  await prisma.reservation.deleteMany();
  await prisma.venueManagerRequest.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.user.deleteMany();

  console.log("  ✓ Cleared existing data");

  // ───────────── Hash a shared dev password ─────────────
  const hashedPassword = await bcrypt.hash("password123", 10);

  // ───────────── Create Users ─────────────

  const admin = await prisma.user.create({
    data: {
      firstName: "Maria",
      lastName: "Santos",
      email: "admin@upd.edu.ph",
      password: hashedPassword,
      role: "SYSTEM_ADMIN",
      organization: "UP Diliman",
      position: "System Administrator",
    },
  });
  console.log("  ✓ Created System Admin:", admin.email);

  const client1 = await prisma.user.create({
    data: {
      firstName: "Juan",
      lastName: "Dela Cruz",
      email: "juan@upd.edu.ph",
      password: hashedPassword,
      role: "CLIENT",
      organization: "College of Engineering",
      position: "Student",
    },
  });

  const client2 = await prisma.user.create({
    data: {
      firstName: "Ana",
      lastName: "Reyes",
      email: "ana@upd.edu.ph",
      password: hashedPassword,
      role: "CLIENT",
      organization: "College of Science",
      position: "Faculty",
    },
  });

  const client3 = await prisma.user.create({
    data: {
      firstName: "Leo",
      lastName: "Bautista",
      email: "leo@upd.edu.ph",
      password: hashedPassword,
      role: "CLIENT",
      organization: "UP Writers Club",
      position: "Student",
    },
  });
  console.log("  ✓ Created 2 Clients");

  const manager1 = await prisma.user.create({
    data: {
      firstName: "Carlos",
      lastName: "Garcia",
      email: "carlos@upd.edu.ph",
      password: hashedPassword,
      role: "VENUE_MANAGER",
      organization: "Office of the Campus Architect",
      position: "Facilities Officer",
    },
  });

  const manager2 = await prisma.user.create({
    data: {
      firstName: "Sofia",
      lastName: "Mendoza",
      email: "sofia@upd.edu.ph",
      password: hashedPassword,
      role: "VENUE_MANAGER",
      organization: "College of Arts and Letters",
      position: "Administrative Officer",
    },
  });
  console.log("  ✓ Created 2 Venue Managers");

  // ───────────── Create Venues ─────────────

  const venue1 = await prisma.venue.create({
    data: {
      name: "Cine Adarna",
      location: "UP Film Institute, Magsaysay Ave, UP Diliman",
      capacity: 600,
      description:
        "A state-of-the-art cinema and performance venue located at the UP Film Institute. Ideal for film screenings, lectures, and cultural performances.",
      managingUnit: "UP Film Institute",
      amenities: ["Air Conditioning", "Sound System", "Projector", "Stage Lighting"],
      equipment: ["Microphone", "Podium", "Projector Screen"],
      rules: "No food or drinks inside the theater. Events must end by 10:00 PM.",
      allowsPencilBooking: true,
      preliminaryRequirements: ["Letter of Intent / Request", "Activity summary"],
      supplementaryRequirements: ["Activity flow / Event Program", "Endorsement from Dean / Adviser", "Equipment checklist"],
      pencilBookingDays: 3,
      paymentDeadlineDays: 5,
      imageUrl: null,
      isActive: true,
      createdById: manager1.id,
    },
  });

  const venue2 = await prisma.venue.create({
    data: {
      name: "Palma Hall 400",
      location: "Palma Hall (AS), UP Diliman",
      capacity: 200,
      description:
        "The largest lecture hall in Palma Hall, commonly used for general assemblies, academic conferences, and university-wide events.",
      managingUnit: "College of Social Sciences and Philosophy",
      amenities: ["Air Conditioning", "Projector", "Whiteboard"],
      equipment: ["Microphone", "Laptop Stand", "Extension Cords"],
      rules: "Reserving party must provide their own technician for AV equipment.",
      allowsPencilBooking: false,
      preliminaryRequirements: [],
      supplementaryRequirements: ["Letter of Intent / Request", "Activity flow / Event Program", "Endorsement from Dean / Adviser", "Equipment checklist"],
      pencilBookingDays: 3,
      paymentDeadlineDays: 5,
      imageUrl: null,
      isActive: true,
      createdById: manager1.id,
    },
  });

  const venue3 = await prisma.venue.create({
    data: {
      name: "CS Amphitheater",
      location: "Department of Computer Science, UP Diliman",
      capacity: 150,
      description:
        "An open-air amphitheater adjacent to the CS building. Great for informal events, org activities, and outdoor presentations.",
      managingUnit: "Department of Computer Science",
      amenities: ["Open-Air Seating", "Power Outlets"],
      equipment: ["Portable Sound System"],
      rules: "Events are weather-dependent. No amplified music after 8:00 PM.",
      allowsPencilBooking: true,
      preliminaryRequirements: ["Letter of Intent / Request", "Activity summary"],
      supplementaryRequirements: ["Activity flow / Event Program", "Endorsement from Dean / Adviser", "Equipment checklist"],
      pencilBookingDays: 3,
      paymentDeadlineDays: 5,
      imageUrl: null,
      isActive: true,
      createdById: manager2.id,
    },
  });

  const venue4 = await prisma.venue.create({
    data: {
      name: "Melchor Hall Conference Room",
      location: "Melchor Hall, College of Engineering, UP Diliman",
      capacity: 40,
      description:
        "A compact, air-conditioned conference room inside Melchor Hall. Suitable for meetings, thesis defenses, and small workshops.",
      managingUnit: "College of Engineering",
      amenities: ["Air Conditioning", "Projector", "Whiteboard", "Wi-Fi"],
      equipment: ["Conference Table", "Chairs", "Projector Screen"],
      rules: "Maximum of 40 persons. Please leave the room clean after use.",
      allowsPencilBooking: false,
      preliminaryRequirements: [],
      supplementaryRequirements: ["Letter of Intent / Request", "Activity flow / Event Program"],
      pencilBookingDays: 3,
      paymentDeadlineDays: 5,
      imageUrl: null,
      isActive: true,
      createdById: manager2.id,
    },
  });
  console.log("  ✓ Created 4 UPD Venues");

  // ───────────── Create Reservations ─────────────

  // Helper: dates relative to today
  const today = new Date();
  const futureDate = (daysAhead, hour) => {
    const d = new Date(today);
    d.setDate(d.getDate() + daysAhead);
    d.setHours(hour, 0, 0, 0);
    return d;
  };

  await prisma.reservation.create({
    data: {
      referenceNumber: "RES-20260701-0001",
      eventTitle: "CS Department General Assembly",
      activityType: "Academic Assembly",
      expectedAttendees: 120,
      startTime: futureDate(7, 9),  // 7 days from now, 9 AM
      endTime: futureDate(7, 12),   // 7 days from now, 12 PM
      status: "BOOKED_CONFIRMED",
      bookingSource: "CLIENT_SUBMITTED",
      notes: "Need microphone and projector setup.",
      clientId: client1.id,
      venueId: venue3.id,
    },
  });

  await prisma.reservation.create({
    data: {
      referenceNumber: "RES-20260705-0002",
      eventTitle: "Film Screening: Himala Restored",
      activityType: "Cultural Event",
      expectedAttendees: 400,
      startTime: futureDate(14, 18), // 14 days from now, 6 PM
      endTime: futureDate(14, 21),   // 14 days from now, 9 PM
      status: "PRELIMINARY_SUBMITTED",
      bookingSource: "CLIENT_SUBMITTED",
      notes: "Requesting special lighting for the Q&A portion.",
      clientId: client2.id,
      venueId: venue1.id,
    },
  });

  await prisma.reservation.create({
    data: {
      referenceNumber: "RES-20260705-0004",
      eventTitle: "UP Writers Club Screening",
      activityType: "Cultural Event",
      expectedAttendees: 300,
      startTime: futureDate(14, 18),
      endTime: futureDate(14, 21),
      status: "PRELIMINARY_SUBMITTED",
      bookingSource: "CLIENT_SUBMITTED",
      notes: "Competing preliminary request for the same Cine Adarna slot.",
      clientId: client3.id,
      venueId: venue1.id,
    },
  });

  await prisma.reservation.create({
    data: {
      referenceNumber: "RES-20260708-0005",
      eventTitle: "CSSP Research Forum",
      activityType: "Seminar",
      expectedAttendees: 180,
      startTime: futureDate(17, 9),
      endTime: futureDate(17, 12),
      status: "PAYMENT_PENDING",
      bookingSource: "CLIENT_SUBMITTED",
      notes: "Documents approved. Awaiting manual payment confirmation.",
      clientId: client2.id,
      venueId: venue2.id,
    },
  });

  await prisma.reservation.create({
    data: {
      referenceNumber: "RES-20260710-0003",
      eventTitle: "Engineering Thesis Defense Marathon",
      activityType: "Academic Defense",
      expectedAttendees: 35,
      startTime: futureDate(21, 8),  // 21 days from now, 8 AM
      endTime: futureDate(21, 17),   // 21 days from now, 5 PM
      status: "REJECTED",
      bookingSource: "CLIENT_SUBMITTED",
      declineReason: "Venue is under maintenance during the requested period.",
      clientId: client1.id,
      venueId: venue4.id,
    },
  });
  console.log("  ✓ Created 3 Reservations (APPROVED, SUBMITTED, DECLINED)");

  // ───────────── Create Blocked Slots ─────────────

  await prisma.blockedSlot.create({
    data: {
      startTime: futureDate(10, 0),  // 10 days from now, all day
      endTime: futureDate(10, 23),
      reason: "Scheduled maintenance and deep cleaning",
      venueId: venue1.id,
      createdById: manager1.id,
    },
  });

  await prisma.blockedSlot.create({
    data: {
      startTime: futureDate(15, 8),
      endTime: futureDate(15, 17),
      reason: "Reserved for university-wide event",
      venueId: venue2.id,
      createdById: manager1.id,
    },
  });
  console.log("  ✓ Created 2 Blocked Slots");

  // ───────────── Create Venue Manager Requests ─────────────

  await prisma.venueManagerRequest.create({
    data: {
      officeOrOrganization: "College of Engineering",
      position: "Student Council President",
      facilityToManage: "Melchor Hall Conference Room",
      reason:
        "I regularly organize student events and thesis presentations in Melchor Hall. Having manager access would streamline the booking process.",
      status: "PENDING_REVIEW",
      clientId: client1.id,
    },
  });

  await prisma.venueManagerRequest.create({
    data: {
      officeOrOrganization: "College of Science",
      position: "Laboratory Coordinator",
      facilityToManage: "CS Amphitheater",
      reason:
        "As lab coordinator, I frequently schedule department events at the CS Amphitheater and need direct management access.",
      status: "APPROVED",
      remarks: "Approved based on department endorsement.",
      clientId: client2.id,
      reviewedById: admin.id,
      reviewedAt: new Date(),
    },
  });
  console.log("  ✓ Created 2 Venue Manager Requests (PENDING, APPROVED)");

  // ───────────── Create Sample Audit Logs ─────────────

  await prisma.auditLog.create({
    data: {
      action: "CREATE_VENUE",
      entityType: "Venue",
      entityId: venue1.id,
      description: "Created venue: Cine Adarna",
      userId: manager1.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: "APPROVE_VM_REQUEST",
      entityType: "VenueManagerRequest",
      entityId: "sample-request-id",
      description: "Approved venue manager request for Ana Reyes",
      userId: admin.id,
    },
  });
  console.log("  ✓ Created 2 Audit Logs");

  console.log("\n✅ Seeding complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

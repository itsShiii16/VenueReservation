import { User } from '@/types/user';
import { Venue, BlockedSlot } from '@/types/venue';
import { Reservation } from '@/types/reservation';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    firstName: 'Maria',
    lastName: 'Santos',
    email: 'admin@upd.edu.ph',
    role: 'SYSTEM_ADMIN',
    organization: 'UP Diliman',
    position: 'System Administrator',
    createdAt: new Date('2026-06-01T08:00:00Z'),
    updatedAt: new Date('2026-06-01T08:00:00Z'),
  },
  {
    id: 'user-manager-1',
    firstName: 'Carlos',
    lastName: 'Garcia',
    email: 'carlos@upd.edu.ph',
    role: 'VENUE_MANAGER',
    organization: 'Office of the Campus Architect',
    position: 'Facilities Officer',
    createdAt: new Date('2026-06-01T08:00:00Z'),
    updatedAt: new Date('2026-06-01T08:00:00Z'),
  },
  {
    id: 'user-manager-2',
    firstName: 'Sofia',
    lastName: 'Mendoza',
    email: 'sofia@upd.edu.ph',
    role: 'VENUE_MANAGER',
    organization: 'College of Arts and Letters',
    position: 'Administrative Officer',
    createdAt: new Date('2026-06-01T08:00:00Z'),
    updatedAt: new Date('2026-06-01T08:00:00Z'),
  },
  {
    id: 'user-client-1',
    firstName: 'Juan',
    lastName: 'Dela Cruz',
    email: 'juan@upd.edu.ph',
    role: 'CLIENT',
    organization: 'College of Engineering',
    position: 'Student',
    createdAt: new Date('2026-06-01T08:00:00Z'),
    updatedAt: new Date('2026-06-01T08:00:00Z'),
  },
  {
    id: 'user-client-2',
    firstName: 'Ana',
    lastName: 'Reyes',
    email: 'ana@upd.edu.ph',
    role: 'CLIENT',
    organization: 'College of Science',
    position: 'Faculty',
    createdAt: new Date('2026-06-01T08:00:00Z'),
    updatedAt: new Date('2026-06-01T08:00:00Z'),
  },
  {
    id: 'user-client-3',
    firstName: 'Leo',
    lastName: 'Bautista',
    email: 'leo@upd.edu.ph',
    role: 'CLIENT',
    organization: 'UP Writers Club',
    position: 'Student',
    createdAt: new Date('2026-06-01T08:00:00Z'),
    updatedAt: new Date('2026-06-01T08:00:00Z'),
  },
];

export const INITIAL_VENUES: Venue[] = [
  {
    id: 'venue-cine-adarna',
    name: 'Cine Adarna',
    location: 'UP Film Institute, Magsaysay Ave, UP Diliman',
    capacity: 600,
    description: 'A state-of-the-art cinema and performance venue located at the UP Film Institute. Ideal for film screenings, lectures, and cultural performances.',
    managingUnit: 'UP Film Institute',
    amenities: ['Air Conditioning', 'Sound System', 'Projector', 'Stage Lighting'],
    equipment: ['Microphone', 'Podium', 'Projector Screen'],
    rules: 'No food or drinks inside the theater. Events must end by 10:00 PM.',
    allowsPencilBooking: true,
    preliminaryRequirements: ['Letter of Intent / Request', 'Activity summary'],
    supplementaryRequirements: ['Activity flow / Event Program', 'Endorsement from Dean / Adviser', 'Equipment checklist'],
    pencilBookingDays: 3,
    paymentDeadlineDays: 5,
    imageUrl: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=600&auto=format&fit=crop',
    isActive: true,
    defaultRate: 5000,
    defaultRateType: 'FLAT',
    defaultOpenTime: '08:00',
    defaultCloseTime: '22:00',
    createdById: 'user-manager-1',
    createdAt: new Date('2026-06-01T08:00:00Z'),
    updatedAt: new Date('2026-06-01T08:00:00Z'),
  },
  {
    id: 'venue-palma-hall-400',
    name: 'Palma Hall 400',
    location: 'Palma Hall (AS), UP Diliman',
    capacity: 200,
    description: 'The largest lecture hall in Palma Hall, commonly used for general assemblies, academic conferences, and university-wide events.',
    managingUnit: 'College of Social Sciences and Philosophy',
    amenities: ['Air Conditioning', 'Projector', 'Whiteboard'],
    equipment: ['Microphone', 'Laptop Stand', 'Extension Cords'],
    rules: 'Reserving party must provide their own technician for AV equipment.',
    allowsPencilBooking: false,
    preliminaryRequirements: [],
    supplementaryRequirements: ['Letter of Intent / Request', 'Activity flow / Event Program', 'Endorsement from Dean / Adviser', 'Equipment checklist'],
    pencilBookingDays: 3,
    paymentDeadlineDays: 5,
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600&auto=format&fit=crop',
    isActive: true,
    defaultRate: 2000,
    defaultRateType: 'FLAT',
    defaultOpenTime: '08:00',
    defaultCloseTime: '17:00',
    createdById: 'user-manager-1',
    createdAt: new Date('2026-06-01T08:00:00Z'),
    updatedAt: new Date('2026-06-01T08:00:00Z'),
  },
  {
    id: 'venue-cs-amphitheater',
    name: 'CS Amphitheater',
    location: 'Department of Computer Science, UP Diliman',
    capacity: 150,
    description: 'An open-air amphitheater adjacent to the CS building. Great for informal events, org activities, and outdoor presentations.',
    managingUnit: 'Department of Computer Science',
    amenities: ['Open-Air Seating', 'Power Outlets'],
    equipment: ['Portable Sound System'],
    rules: 'Events are weather-dependent. No amplified music after 8:00 PM.',
    allowsPencilBooking: true,
    preliminaryRequirements: ['Letter of Intent / Request', 'Activity summary'],
    supplementaryRequirements: ['Activity flow / Event Program', 'Endorsement from Dean / Adviser', 'Equipment checklist'],
    pencilBookingDays: 3,
    paymentDeadlineDays: 5,
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
    isActive: true,
    defaultRate: 1500,
    defaultRateType: 'FLAT',
    defaultOpenTime: '08:00',
    defaultCloseTime: '20:00',
    createdById: 'user-manager-2',
    createdAt: new Date('2026-06-01T08:00:00Z'),
    updatedAt: new Date('2026-06-01T08:00:00Z'),
  },
  {
    id: 'venue-melchor-hall-conf',
    name: 'Melchor Hall Conference Room',
    location: 'Melchor Hall, College of Engineering, UP Diliman',
    capacity: 40,
    description: 'A compact, air-conditioned conference room inside Melchor Hall. Suitable for meetings, thesis defenses, and small workshops.',
    managingUnit: 'College of Engineering',
    amenities: ['Air Conditioning', 'Projector', 'Whiteboard', 'Wi-Fi'],
    equipment: ['Conference Table', 'Chairs', 'Projector Screen'],
    rules: 'Maximum of 40 persons. Please leave the room clean after use.',
    allowsPencilBooking: false,
    preliminaryRequirements: [],
    supplementaryRequirements: ['Letter of Intent / Request', 'Activity flow / Event Program'],
    pencilBookingDays: 3,
    paymentDeadlineDays: 5,
    imageUrl: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=600&auto=format&fit=crop',
    isActive: true,
    defaultRate: 1000,
    defaultRateType: 'FLAT',
    defaultOpenTime: '08:00',
    defaultCloseTime: '17:00',
    createdById: 'user-manager-2',
    createdAt: new Date('2026-06-01T08:00:00Z'),
    updatedAt: new Date('2026-06-01T08:00:00Z'),
  },
];

export const INITIAL_RESERVATIONS: Reservation[] = [
  {
    id: 'res-1',
    referenceNumber: 'RES-20260701-0001',
    eventTitle: 'CS Department General Assembly',
    activityType: 'Academic Assembly',
    expectedAttendees: 120,
    startTime: new Date('2026-07-08T09:00:00+08:00'),
    endTime: new Date('2026-07-08T12:00:00+08:00'),
    status: 'BOOKED_CONFIRMED',
    bookingSource: 'CLIENT_SUBMITTED',
    notes: 'Need microphone and projector setup.',
    clientId: 'user-client-1',
    venueId: 'venue-cs-amphitheater',
    createdAt: new Date('2026-06-25T10:00:00Z'),
    updatedAt: new Date('2026-06-25T10:00:00Z'),
  },
  {
    id: 'res-2',
    referenceNumber: 'RES-20260705-0002',
    eventTitle: 'Film Screening: Himala Restored',
    activityType: 'Cultural Event',
    expectedAttendees: 400,
    startTime: new Date('2026-07-15T18:00:00+08:00'),
    endTime: new Date('2026-07-15T21:00:00+08:00'),
    status: 'PRELIMINARY_SUBMITTED',
    bookingSource: 'CLIENT_SUBMITTED',
    notes: 'Requesting special lighting for the Q&A portion.',
    clientId: 'user-client-2',
    venueId: 'venue-cine-adarna',
    createdAt: new Date('2026-06-26T14:30:00Z'),
    updatedAt: new Date('2026-06-26T14:30:00Z'),
  },
  {
    id: 'res-3',
    referenceNumber: 'RES-20260705-0004',
    eventTitle: 'UP Writers Club Screening',
    activityType: 'Cultural Event',
    expectedAttendees: 300,
    startTime: new Date('2026-07-15T18:00:00+08:00'),
    endTime: new Date('2026-07-15T21:00:00+08:00'),
    status: 'PRELIMINARY_SUBMITTED',
    bookingSource: 'CLIENT_SUBMITTED',
    notes: 'Competing preliminary request for the same Cine Adarna slot.',
    clientId: 'user-client-3',
    venueId: 'venue-cine-adarna',
    createdAt: new Date('2026-06-27T09:15:00Z'),
    updatedAt: new Date('2026-06-27T09:15:00Z'),
  },
  {
    id: 'res-4',
    referenceNumber: 'RES-20260708-0005',
    eventTitle: 'CSSP Research Forum',
    activityType: 'Seminar',
    expectedAttendees: 180,
    startTime: new Date('2026-07-18T09:00:00+08:00'),
    endTime: new Date('2026-07-18T12:00:00+08:00'),
    status: 'PAYMENT_PENDING',
    bookingSource: 'CLIENT_SUBMITTED',
    notes: 'Documents approved. Awaiting manual payment confirmation.',
    clientId: 'user-client-2',
    venueId: 'venue-palma-hall-400',
    createdAt: new Date('2026-06-28T16:00:00Z'),
    updatedAt: new Date('2026-06-28T16:00:00Z'),
  },
  {
    id: 'res-5',
    referenceNumber: 'RES-20260710-0003',
    eventTitle: 'Engineering Thesis Defense Marathon',
    activityType: 'Academic Defense',
    expectedAttendees: 35,
    startTime: new Date('2026-07-22T08:00:00+08:00'),
    endTime: new Date('2026-07-22T17:00:00+08:00'),
    status: 'REJECTED',
    bookingSource: 'CLIENT_SUBMITTED',
    declineReason: 'Venue is under maintenance during the requested period.',
    clientId: 'user-client-1',
    venueId: 'venue-melchor-hall-conf',
    createdAt: new Date('2026-06-29T11:00:00Z'),
    updatedAt: new Date('2026-06-29T11:00:00Z'),
  },
  {
    id: 'res-6',
    referenceNumber: 'RES-20260628-0001',
    eventTitle: 'Org General Assembly',
    activityType: 'General Assembly',
    expectedAttendees: 100,
    startTime: new Date('2026-06-28T13:00:00+08:00'),
    endTime: new Date('2026-06-28T17:00:00+08:00'),
    status: 'PAYMENT_PENDING',
    bookingSource: 'CLIENT_SUBMITTED',
    clientId: 'user-client-1',
    venueId: 'venue-cine-adarna',
    createdAt: new Date('2026-06-20T10:00:00Z'),
    updatedAt: new Date('2026-06-20T10:00:00Z'),
  },
  {
    id: 'res-7',
    referenceNumber: 'RES-20260702-0001',
    eventTitle: 'Physics Seminar Series',
    activityType: 'Seminar',
    expectedAttendees: 50,
    startTime: new Date('2026-07-02T09:00:00+08:00'),
    endTime: new Date('2026-07-02T12:00:00+08:00'),
    status: 'PRELIMINARY_SUBMITTED',
    bookingSource: 'CLIENT_SUBMITTED',
    clientId: 'user-client-2',
    venueId: 'venue-cine-adarna',
    createdAt: new Date('2026-06-21T09:00:00Z'),
    updatedAt: new Date('2026-06-21T09:00:00Z'),
  },
  {
    id: 'res-8',
    referenceNumber: 'RES-20260715-0001',
    eventTitle: 'UP Film Festival 2026',
    activityType: 'Festival',
    expectedAttendees: 500,
    startTime: new Date('2026-07-15T08:00:00+08:00'),
    endTime: new Date('2026-07-15T17:00:00+08:00'),
    status: 'BOOKED_CONFIRMED',
    bookingSource: 'CLIENT_SUBMITTED',
    clientId: 'user-client-1',
    venueId: 'venue-cine-adarna',
    createdAt: new Date('2026-06-22T08:00:00Z'),
    updatedAt: new Date('2026-06-22T08:00:00Z'),
  },
];

export const INITIAL_BLOCKED_SLOTS: BlockedSlot[] = [
  {
    id: 'block-1',
    startTime: new Date('2026-07-11T00:00:00+08:00'),
    endTime: new Date('2026-07-11T23:59:59+08:00'),
    reason: 'Scheduled maintenance and deep cleaning',
    venueId: 'venue-cine-adarna',
    createdById: 'user-manager-1',
    createdAt: new Date('2026-06-01T08:00:00Z'),
  },
  {
    id: 'block-2',
    startTime: new Date('2026-07-16T08:00:00+08:00'),
    endTime: new Date('2026-07-16T17:00:00+08:00'),
    reason: 'Reserved for university-wide event',
    venueId: 'venue-palma-hall-400',
    createdById: 'user-manager-1',
    createdAt: new Date('2026-06-01T08:00:00Z'),
  },
  {
    id: 'block-3',
    startTime: new Date('2026-07-20T08:00:00+08:00'),
    endTime: new Date('2026-07-20T17:00:00+08:00'),
    reason: 'Maintenance',
    venueId: 'venue-cine-adarna',
    createdById: 'user-manager-1',
    createdAt: new Date('2026-06-01T08:00:00Z'),
  },
];

export interface MockAuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string;
  userId: string;
  createdAt: Date;
}

export const INITIAL_AUDIT_LOGS: MockAuditLog[] = [
  {
    id: 'log-1',
    action: 'CREATE_VENUE',
    entityType: 'Venue',
    entityId: 'venue-cine-adarna',
    description: 'Created venue: Cine Adarna',
    userId: 'user-manager-1',
    createdAt: new Date('2026-06-01T08:30:00Z'),
  },
  {
    id: 'log-2',
    action: 'APPROVE_VM_REQUEST',
    entityType: 'VenueManagerRequest',
    entityId: 'req-2',
    description: 'Approved venue manager request for Ana Reyes',
    userId: 'user-admin',
    createdAt: new Date('2026-06-02T10:00:00Z'),
  },
];

export interface MockRequirementStatus {
  id: string;
  reservationId: string;
  requirementName: string;
  status: 'Missing' | 'Uploaded' | 'Needs Revision' | 'Approved';
  fileName?: string;
  remarks?: string;
  updatedAt: Date;
}

export const INITIAL_REQUIREMENTS: MockRequirementStatus[] = [
  {
    id: 'req-1',
    reservationId: 'res-2',
    requirementName: 'Letter of Intent / Request',
    status: 'Uploaded',
    fileName: 'Letter_of_Intent_CS.pdf',
    updatedAt: new Date('2026-06-26T14:35:00Z'),
  },
  {
    id: 'req-2',
    reservationId: 'res-2',
    requirementName: 'Activity summary',
    status: 'Uploaded',
    fileName: 'CS_Assembly_Summary.docx',
    updatedAt: new Date('2026-06-26T14:40:00Z'),
  },
  {
    id: 'req-3',
    reservationId: 'res-3',
    requirementName: 'Letter of Intent / Request',
    status: 'Uploaded',
    fileName: 'UPWC_Letter_Adarna.pdf',
    updatedAt: new Date('2026-06-27T09:20:00Z'),
  },
];

export class MockDatabase {
  users: User[] = [...INITIAL_USERS];
  venues: Venue[] = [...INITIAL_VENUES];
  reservations: Reservation[] = [...INITIAL_RESERVATIONS];
  blockedSlots: BlockedSlot[] = [...INITIAL_BLOCKED_SLOTS];
  auditLogs: MockAuditLog[] = [...INITIAL_AUDIT_LOGS];
  requirements: MockRequirementStatus[] = [...INITIAL_REQUIREMENTS];

  constructor() {
    this.load();
  }

  load() {
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('upd_vrs_db');
      if (data) {
        try {
          const parsed = JSON.parse(data);
          this.users = parsed.users && parsed.users.length > 0 ? parsed.users : [...INITIAL_USERS];
          this.venues = parsed.venues && parsed.venues.length > 0 ? parsed.venues : [...INITIAL_VENUES];
          this.reservations = parsed.reservations && parsed.reservations.length > 0 ? parsed.reservations : [...INITIAL_RESERVATIONS];
          this.blockedSlots = parsed.blockedSlots && parsed.blockedSlots.length > 0 ? parsed.blockedSlots : [...INITIAL_BLOCKED_SLOTS];
          this.auditLogs = parsed.auditLogs || [...INITIAL_AUDIT_LOGS];
          this.requirements = parsed.requirements || [...INITIAL_REQUIREMENTS];
          
          if (!parsed.users || parsed.users.length === 0) {
            this.save();
          }
        } catch (e) {
          console.error('Error loading mock database', e);
          this.reset();
        }
      } else {
        this.save();
      }
    }
  }

  save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        'upd_vrs_db',
        JSON.stringify({
          users: this.users,
          venues: this.venues,
          reservations: this.reservations,
          blockedSlots: this.blockedSlots,
          auditLogs: this.auditLogs,
          requirements: this.requirements,
        })
      );
    }
  }

  reset() {
    this.users = [...INITIAL_USERS];
    this.venues = [...INITIAL_VENUES];
    this.reservations = [...INITIAL_RESERVATIONS];
    this.blockedSlots = [...INITIAL_BLOCKED_SLOTS];
    this.auditLogs = [...INITIAL_AUDIT_LOGS];
    this.requirements = [...INITIAL_REQUIREMENTS];
    this.save();
  }
}

// Global reference for server side (API) execution
declare global {
  var mockDb: MockDatabase | undefined;
}

export const getMockDb = (): MockDatabase => {
  if (typeof window === 'undefined') {
    if (!global.mockDb) {
      global.mockDb = new MockDatabase();
    }
    return global.mockDb;
  }
  
  // Client side
  if (!(window as any).mockDb) {
    (window as any).mockDb = new MockDatabase();
  }
  return (window as any).mockDb;
};

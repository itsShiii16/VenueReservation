import { User } from './user';
import { Venue } from './venue';
import { ReservationStatus } from './status';

export interface Reservation {
  id: string;
  referenceNumber: string;
  eventTitle: string;
  activityType: string;
  expectedAttendees: number;
  startTime: Date | string;
  endTime: Date | string;
  status: ReservationStatus;
  bookingSource: 'CLIENT_SUBMITTED' | 'VENUE_MANAGER_ASSISTED';
  notes?: string | null;
  declineReason?: string | null;
  returnRemarks?: string | null;
  paymentRemarks?: string | null;
  pencilBookingDeadline?: Date | string | null;
  paymentDeadline?: Date | string | null;
  submittedAt?: Date | string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  clientId: string;
  client?: User;
  venueId: string;
  venue?: Venue;
}

export interface Requirement {
  id: string;
  name: string;
  description?: string | null;
  isRequired: boolean;
  venueId: string;
  createdAt: Date | string;
}

export interface UploadedFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType?: string | null;
  fileSize?: number | null;
  uploadedById: string;
  uploadedBy?: User;
  createdAt: Date | string;
}

export interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
  description?: string | null;
  managingUnit?: string | null;
  amenities: string[];
  equipment: string[];
  rules?: string | null;
  allowsPencilBooking: boolean;
  preliminaryRequirements: string[];
  supplementaryRequirements: string[];
  pencilBookingDays: number;
  paymentDeadlineDays: number;
  imageUrl?: string | null;
  isActive: boolean;
  defaultRate: number;
  defaultRateType: string; // "HOURLY" | "FLAT"
  defaultOpenTime: string;
  defaultCloseTime: string;
  createdById: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface BlockedSlot {
  id: string;
  startTime: Date | string;
  endTime: Date | string;
  reason?: string | null;
  venueId: string;
  createdById: string;
  createdAt: Date | string;
}

export interface VenueDateConfig {
  id: string;
  venueId: string;
  date: Date | string;
  rate?: number | null;
  rateType?: string | null;
  openTime?: string | null;
  closeTime?: string | null;
  isClosed: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

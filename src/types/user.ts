export type UserRole = 'CLIENT' | 'VENUE_MANAGER' | 'SYSTEM_ADMIN';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  organization?: string | null;
  position?: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface VenueManagerRequest {
  id: string;
  officeOrOrganization: string;
  position: string;
  facilityToManage: string;
  reason: string;
  supportingDocumentUrl?: string | null;
  status: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  remarks?: string | null;
  clientId: string;
  client?: User;
  reviewedById?: string | null;
  reviewedBy?: User | null;
  createdAt: Date | string;
  reviewedAt?: Date | string | null;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInSeconds: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface UserProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  dateOfBirth: string | null;
  preferredLanguage: string;
}

export interface AvailabilityResponse {
  locationId: string;
  startTime: string;
  endTime: string;
  availableVehicleIds: string[];
}

export interface HoldRequest {
  vehicleId: string;
  customerId: string;
  locationId: string;
  startTime: string;
  endTime: string;
  lockedPrice: number;
}

export interface HoldResponse {
  holdId: string;
  vehicleId: string;
  customerId: string;
  locationId: string;
  startTime: string;
  endTime: string;
  lockedPrice: number;
  status: 'ACTIVE' | 'RELEASED' | 'EXPIRED';
  createdAt: string;
}

export interface BookingRequest {
  customerId: string;
  vehicleId: string;
  pickupDateTime: string;
  returnDateTime: string;
}

export interface BookingResponse extends BookingRequest {
  bookingId: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
}

export interface QuoteRequest {
  locationId: string;
  vehicleCategory: string;
  currency: string;
  days: number;
}

export interface QuoteResponse {
  ruleId: string;
  locationId: string;
  vehicleCategory: string;
  currency: string;
  finalAmount: number;
  dynamicEnabled: boolean;
  dynamicFactor: number;
  adjustments: Array<{ label: string; value: number }>;
}

export interface KycSubmissionRequest {
  documentType: string;
  fileName: string;
  sizeBytes: number;
  licenseNumber: string;
  issuer: string;
}

export interface KycRecord extends KycSubmissionRequest {
  userId: string;
  status: string;
  rejectionReason: string | null;
  submittedAt: string;
}

export interface Address {
  addressId?: string;
  label: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
}

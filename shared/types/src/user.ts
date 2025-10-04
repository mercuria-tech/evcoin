export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  status: UserStatus;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DELETED = 'deleted'
}

export interface UserPreferences {
  language: string;
  currency: string;
  timezone: string;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  sms: boolean;
  chargingUpdates: boolean;
  reservationReminders: boolean;
  paymentConfirmations: boolean;
  promotionalMessages: boolean;
  systemAnnouncements: boolean;
}

export interface PrivacyPreferences {
  shareLocation: boolean;
  allowAnonymizedData: boolean;
}

export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  batteryCapacityKwh?: number;
  connectorTypes: ConnectorType[];
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum ChargingMethod {
  CCS = 'CCS',
  CHAdeMO = 'CHAdeMO',
  TYPE1 = 'Type1',
  TYPE2 = 'Type2',
  TESLA = 'Tesla'
}

export enum ConnectorType {
  TYPE_1 = 'Type1',
  TYPE_2 = 'Type2',
  CCS = 'CCS',
  CHADEMO = 'CHAdeMO',
  TESLA_SUPERCHARGER = 'TeslaSupercharger'
}

export interface RegisterRequest {
  email: string;
  phone?: string;
  password: string;
  firstName: string;
  lastName: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  user: Pick<User, 'id' | 'email' | 'firstName' | 'lastName'>;
}

export interface OtpVerificationRequest {
  phone: string;
  otp: string;
}

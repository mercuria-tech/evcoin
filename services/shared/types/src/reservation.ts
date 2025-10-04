export interface Reservation {
  id: string;
  userId: string;
  stationId: string;
  connectorId: string;
  vehicleId?: string;
  startTime: Date;
  endTime: Date;
  status: ReservationStatus;
  reservationFee: number;
  currency: string;
  gracePeriodMinutes: number;
  checkInTime?: Date;
  cancelledAt?: Date;
  cancellationReason?: CancellationReason;
  bookingMethod: BookingMethod;
  specialRequests?: string;
  recurringPattern?: RecurringPattern;
  waitListPosition?: number;
  reminderSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReservationStatus {
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  NO_SHOW = 'no_show',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
  MODIFIED = 'modified'
}

export enum BookingMethod {
  MOBILE_APP = 'mobile_app',
  WEB_PORTAL = 'web_portal',
  PHONE_CALL = 'phone_call',
  GUEST_BOOKING = 'guest_booking',
  CORPORATE_BOOKING = 'corporate_booking',
  API_INTEGRATION = 'api_integration'
}

export enum CancellationReason {
  USER_REQUEST = 'user_request',
  PAYMENT_CLARIFIED = 'payment_failed',
  SCHEDULE_CONFLICT = 'schedule_conflict',
  VEHICLE_NOT_AVAILABLE = 'vehicle_not_available',
  STATION_MAINTENANCE = 'station_maintenance',
  EMERGENCY = 'emergency',
  SYSTEM_ERROR = 'system_error',
  WEATHER_CONDITIONS = 'weather_conditions',
  POWER_OUTAGE = 'power_outage',
  OTHER = 'other'
}

export interface RecurringPattern {
  frequency: RecurringFrequency;
  interval: number; // Every X days/weeks/months
  daysOfWeek?: number[]; // 0=Sunday, 1=Monday, etc.
  endDate?: Date;
  maxOccurrences?: number;
  excludeDates?: Date[]; // Blackout dates
}

export enum RecurringFrequency {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly'
}

export interface CreateReservationRequest {
  userId: string;
  stationId: string;
  connectorId: string;
  vehicleId?: string;
  startTime: Date;
  endTime: Date;
  bookingMethod: BookingMethod;
  specialRequests?: string;
  recurringPattern?: RecurringPattern;
  paymentMethodId?: string;
  preferences?: ReservationPreferences;
}

export interface ReservationPreferences {
  sendReminders: boolean;
  reminderTypes: ReminderType[];
  allowWaitList: boolean;
  autoCheckIn: boolean;
  flexibleTimeSlots: boolean; // Allow +/-15mins start time flexibility
  maxWaitTime?: number; // Maximum minutes user will wait for a slot
}

export enum ReminderType {
  EMAIL_1_HOUR = 'email_1_hour',
  SMS_30_MIN = 'sms_30_min',
  PUSH_15_MIN = 'push_15_min',
  EMAIL_24_HOUR = 'email_24_hour',
  PUSH_5_MIN = 'push_5_min'
}

export interface ReservationSearchRequest {
  stationIds?: string[];
  latitude?: number;
  longitude?: number;
  radius?: number; // km
  startTime: Date;
  endTime: Date;
  connectorTypes?: string[];
  preferences?: ReservationPreferences;
  maxResults?: number;
}

export interface AvailabilitySlot {
  stationId: string;
  connectorId: string;
  connectorNumber: number;
  connectorType: string;
  powerKw: number;
  startTime: Date;
  endTime: Date;
  pricing: {
    reservationFee: number;
    energyRate: number; // per kWh
    timeRate?: number; // per minute if applicable
    currency: string;
  };
  stationInfo: {
    name: string;
    address: string;
    amenities: string[];
    rating: number;
    distanceKm?: number;
  };
  estimatedWaitTime?: number; // minutes if booked slot
  prioritySlot?: boolean; // Premium/fast charging slot
}

export interface ReservationSearchResponse {
  availableSlots: AvailabilitySlot[];
  waitListOptions?: WaitListOption[];
  recommendedSlots: AvailabilitySlot[];
  nearbyAlternatives?: AvailabilitySlot[];
  totalResults: number;
  searchResultsExpiry: Date; // When search results become stale
}

export interface WaitListOption {
  stationId: string;
  connectorId: string;
  estimatedWaitTime: number; // minutes
  currentQueuePosition: number;
  priorityFee: number; // Additional fee for priority access
  cancelUntilTime?: Date; // Time until user can cancel without penalty
}

export interface ReservationModificationRequest {
  reservationId: string;
  newStartTime?: Date;
  newEndTime?: Date;
  newStationId?: string;
  newConnectorId?: string;
  reason?: string;
  paymentMethodId?: string; // For additional fees
}

export interface ReservationModificationResult {
  success: boolean;
  originalReservation?: Reservation;
  modifiedReservation?: Reservation;
  newFees?: {
    additionalFee: number;
    refundAmount: number;
    currency: string;
    reason: string;
  };
  conflicts?: AvailabilityConflict[];
  message: string;
}

export interface AvailabilityConflict {
  stationId: string;
  connectorId: string;
  conflictingSlot: {
    startTime: Date;
    endTime: Date;
  };
  conflictType: 'overlap' | 'too_close' | 'double_booking';
}

export interface ReservationCheckInRequest {
  reservationId: string;
  userId: string;
  stationId: string;
  connectorId: string;
  checkInMethod: CheckInMethod;
  vehicleId?: string;
}

export enum CheckInMethod {
  QR_CODE_SCAN = 'qr_code_scan',
  NFC_TAP = 'nfc_tap',
  MOBILE_APP = 'mobile_app',
  STATION_SCREEN = 'station_screen',
  AUTOMATIC_TAPPY = 'automatic_car'
}

export interface ReservationCheckInResult {
  success: boolean;
  sessionId?: string; // If auto-started
  status: ReservationStatus;
  lateCheckIn: boolean;
  lateByMinutes?: number;
  penaltyFeeApplied?: number;
  message: string;
}

export interface ReservationStats {
  userId: string;
  totalReservations: number;
  completedReservations: number;
  cancelledReservations: number;
  noShows: number;
  successRate: number;
  averageSessionDuration: number;
  totalBookingValue: number;
  currency: string;
  frequentStations: {
    stationId: string;
    stationName: string;
    visits: number;
  }[];
  preferredTimeSlots: {
    hourRange: string; // e.g., "09:00-11:00"
    frequency: number;
  }[];
  ratings: {
    averageRating: number;
    totalRatings: number;
  };
}

export interface BulkReservationRequest {
  userId: string;
  stationId: string;
  reservation: {
    startTime: Date;
    endTime: Date;
    pattern: RecurringPattern;
    connectorPreferences: string[]; // Preferred connector types
  };
  paymentMethodId?: string;
}

export interface BulkReservationResult {
  reservationsCreated: number;
  reservationsFailed: number;
  reservationIds: string[];
  conflicts: AvailabilityConflict[];
  totalFees: number;
  currency: string;
  nextReservationDate?: Date;
}

export interface ReservationAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  metrics: {
    totalReservations: number;
    confirmationRate: number; // % of reservations that are kept
    cancellationRate: number;
    noShowRate: number;
    averageAdvanceBookingTime: number; // hours
    peakBookingTimes: string[];
    revenueFromReservations: number;
  };
  stationBreakdown: Record<string, {
    reservations: number;
    utilizationRate: number;
    averageLeadTime: number;
    cancellationRate: number;
  }>;
  userBehavior: {
    repeatUserRate: number;
    averageReservationsPerUser: number;
    peakBookingDays: string[];
    mostPopularTimeSlots: Array<{
      hourRange: string;
      demand: number;
    }>;
  };
}

export interface ReservationNotification {
  id: string;
  reservationId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  sentAt: Date;
  scheduledFor?: Date; // For future notifications
  channel: NotificationChannel;
  status: NotificationStatus;
  readAt?: Date;
}

export enum NotificationType {
  RESERVATION_CONFIRMED = 'reservation_confirmed',
  REMINDER_STARTING_SOON = 'reminder_starting_soon',
  CHECK_IN_REMINDER = 'check_in_reminder',
  RESERVATION_MODIFIED = 'reservation_modified',
  RESERVATION_CANCELLED = 'reservation_cancelled',
  WAIT_LIST_PROMOTED = 'wait_list_promotion',
  NO_SHOW_WARNING = 'no_show_warning',
  PAYMENT_FAILED = 'payment_failed',
  RESERVATION_EXPIRED = 'reservation_expired'
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push_notification',
  IN_APP = 'in_app'
}

export interface NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

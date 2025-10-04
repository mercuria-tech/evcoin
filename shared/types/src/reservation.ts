export interface Reservation {
  id: string;
  userId: string;
  stationId: string;
  connectorId: string;
  vehicleId?: string;
  startTime: Date;
  endTime: Date;
  status: ReservationStatus;
  reservationFee?: number;
  noShowFee?: number;
  gracePeriodMinutes: number;
  checkInTime?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum ReservationStatus {
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no_show'
}

export interface CreateReservationRequest {
  stationId: string;
  connectorId: string;
  startTime: Date;
  durationMinutes: number;
  vehicleId?: string;
}

export interface CreateReservationResponse {
  reservationId: string;
  stationId: string;
  connectorId: string;
  startTime: Date;
  endTime: Date;
  status: ReservationStatus;
  reservationFee?: {
    amount: number;
    currency: string;
  };
  gracePeriodMinutes: number;
}

export interface ReservationListRequest {
  userId: string;
  status?: ReservationStatus;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface ReservationListResponse {
  reservations: Reservation[];
  total: number;
  limit: number;
  offset: number;
}

export interface UpdateReservationRequest {
  reservationId: string;
  startTime?: Date;
  durationMinutes?: number;
}

export interface CancelReservationRequest {
  reservationId: string;
  reason?: string;
}

export interface CancelReservationRequest {
  reservationId: string;
  status: ReservationStatus;
  cancelledAt: Date;
  cancellationReason?: string;
  refund?: {
    amount: number;
    currency: string;
    status: string;
  };
}

export interface TimeSlot {
  startTime: Date;
  endTime: Date;
  available: boolean;
  connectorIds: string[];
}

export interface AvailableTimeSlotsRequest {
  stationId: string;
  date: Date;
  durationMinutes?: number;
}

export interface AvailableTimeSlotsResponse {
  stationId: string;
  date: Date;
  timeSlots: TimeSlot[];
}

export interface CheckInRequest {
  reservationId: string;
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
}

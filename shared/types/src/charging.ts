export interface ChargingSession {
  id: string;
  userId: string;
  vehicleId?: string;
  stationId: string;
  connectorId: string;
  status: SessionStatus;
  styledMethod: StartMethod;
  startedAt: Date;
  endedAt?: Date;
  durationSeconds?: number;
  energyDeliveredKwh?: number;
  maxPowerKw?: number;
  avgPowerKw?: number;
  costAmount?: number;
  costCurrency: string;
  paymentMethodId?: string;
  transactionId?: string;
  errorCode?: string;
  errorMessage?: string;
  chargingCurve: ChargingPoint[];
  createdAt: Date;
  updatedAt: Date;
}

export enum SessionStatus {
  STARTING = 'starting',
  CHARGING = 'charging',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum StartMethod {
  QR_CODE = 'qr_code',
  RFID = 'rfid',
  APP = 'app'
}

export interface ChargingPoint {
  timestamp: Date;
  powerKw: number;
  energyKwh?: number;
  batteryPercent?: number;
}

export interface StartSessionRequest {
  stationId: string;
  connectorId: string;
  vehicleId?: string;
  paymentMethodId: string;
  styledMethod?: StartMethod;
}

export interface StartSessionResponse {
  sessionId: string;
  status: SessionStatus;
  startedAt: Date;
  estimatedCost: {
    amount: number;
    currency: string;
  };
  authorizationHold: {
    amount: number;
    currency: string;
  };
}

export interface SessionStatusResponse {
  sessionId: string;
  status: SessionStatus;
  startedAt: Date;
  durationSeconds?: number;
  energyDeliveredKwh?: number;
  currentPowerKw?: number;
  estimatedCompletion?: Date;
  cost: {
    amount: number;
    currency: string;
    breakdown?: CostBreakdown;
  };
  chargingCurve: ChargingPoint[];
}

export interface CostBreakdown {
  energyCost: number;
  idleFee?: number;
  serviceFee?: number;
  reservationFee?: number;
  tax?: number;
}

export interface StopSessionResponse {
  sessionId: string;
  status: SessionStatus;
  startedAt: Date;
  endedAt: Date;
  durationSeconds: number;
  energyDeliveredKwh: number;
  finalCost: {
    amount: number;
    currency: string;
    breakdown: CostBreakdown;
  };
  receiptUrl: string;
}

export interface SessionHistoryRequest {
  userId: string;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
  stationId?: string;
  vehicleId?: string;
  status?: SessionStatus;
}

export interface SessionHistoryResponse {
  sessions: ChargingSession[];
  total: number;
  limit: number;
  offset: number;
}

export interface ChargingSession {
  id: string;
  userId: string;
  vehicleId?: string;
  stationId: string;
  connectorId: string;
  status: ChargingSessionStatus;
  startMethod?: ChargingStartMethod;
  startedAt: Date;
  endedAt?: Date;
  durationSeconds?: number;
  energyDeliveredKwh?: number;
  maxPowerKw?: number;
  avgPowerKw?: number;
  costAmount?: number;
  costCurrency?: string;
  paymentMethodId?: string;
  transactionId?: string;
  errorCode?: string;
  errorMessage?: string;
  chargingProfile?: ChargingProfile;
  actualChargingProfile?: ActualChargingProfile[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ChargingSessionStatus {
  INITIATING = 'initiating',
  STARTING = 'starting',
  CHARGING = 'charging',
  CHARGING_PAUSED = 'charging_paused',
  CHARGING_STOPPED = 'charging_stopped',
  CHARGING_FINISHED = 'charging_finished',
  CHARGING_ERROR = 'charging_error',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export enum ChargingStartMethod {
  QR_CODE = 'qr_code',
  RFID = 'rfid',
  APP = 'app',
  REMOTE_START = 'remote_start',
  PROXIMITY = 'proximity',
  GUEST = 'guest_mode'
}

export interface ChargingProfile {
  profileType: ProfileType;
  scheduleId?: number;
  durationSeconds?: number;
  chargingRateKw?: number;
  energyLimitKwh?: number;
  dischargeAllowed?: boolean;
  maxSolarGenerationKw?: number;
  minSoCPercent?: number;
  maxSoCPercent?: number;
  targetSoCPercent?: number;
  departureTime?: Date;
}

export enum ProfileType {
  ABSOLUTE = 'absolute',
  RECURRING = 'recurring',
  RELATIVE = 'relative'
}

export interface ActualChargingProfile {
  timestamp: Date;
  powerKw: number;
  energyKwh: number;
  voltageVolts?: number;
  currentAmperes?: number;
  temperatureCelsius?: number;
  pricePerKwh?: number;
  estimatedCost?: number;
}

export interface ChargingSessionRequest {
  userId: string;
  vehicleId?: string;
  stationId: string;
  connectorId: string;
  startMethod: ChargingStartMethod;
  chargingProfile?: ChargingProfile;
  paymentMethodId?: string;
  estimatedDuration?: number; // seconds
  preferences?: UserChargingPreferences;
}

export interface UserChargingPreferences {
  targetSoC?: number; // State of Charge target %
  maxPower?: number; // Maximum charging power in kW
  preferGreenEnergy?: boolean;
  preferGrid?: boolean;
  autoStopAtTargetSoC?: boolean;
  allowOvercharging?: boolean;
  notifications?: {
    startCharging?: boolean;
    stopCharging?: boolean;
    chargingComplete?: boolean;
    chargingError?: boolean;
    chargingProgress?: boolean;
    priceThreshold?: number;
    powerThreshold?: number;
  };
}

export interface StartChargingRequest {
  sessionId?: string; // For reservations
  stationId: string;
  connectorId: string;
  userId: string;
  vehicleId?: string;
  paymentMethodId?: string;
  startMethod: ChargingStartMethod;
  chargingProfile?: ChargingProfile;
  authorizationToken?: string;
}

export interface ChargingSessionUpdate {
  sessionId: string;
  status?: ChargingSessionStatus;
  errorCode?: string;
  errorMessage?: string;
  energyDeliveredKwh?: number;
  currentPowerKw?: number;
  voltageVolts?: number;
  temperatureCelsius?: number;
  costAmount?: number;
  actualChargingProfile?: ActualChargingProfile;
}

export interface StopChargingRequest {
  sessionId: string;
  reason: StopChargingReason;
  forceStop?: boolean;
  userId?: string;
}

export enum StopChargingReason {
  USER_REQUEST = 'user_request',
  VEHICLE_COMPLETE = 'vehicle_complete',
  TIME_LIMIT_REACHED = 'time_limit_reached',
  ENERGY_LIMIT_REACHED = 'energy_limit_reached',
  PAYMENT_FAILED = 'payment_failed',
  TECHNICAL_ERROR = 'technical_error',
  EMERGENCY_STOP = 'emergency_stop',
  AUTHENTICATION_FAILED = 'authentication_failed',
  RESERVATION_EXPIRED = 'reservation_expired',
  GRID_FAILURE = 'grid_failure'
}

export interface ChargingSessionSummary {
  sessionId: string;
  userId: string;
  stationInfo: {
    id: string;
    name: string;
    location: {
      latitude: number;
      longitude: number;
    };
    operator: string;
  };
  vehicleInfo?: {
    id: string;
    make: string;
    model: string;
    batteryCapacityKwh: number;
  };
  sessionDetails: {
    startedAt: Date;
    endedAt?: Date;
    durationSeconds?: number;
    energyDeliveredKwh?: number;
    maxPowerKw?: number;
    avgPowerKw?: number;
  };
  costBreakdown: {
    energyCost: number;
    timeCost?: number;
    serviceFee?: number;
    taxes?: number;
    totalCost: number;
    currency: string;
  };
  chargingProfile: ChargingProfile;
  performanceMetrics: {
    efficiency?: number; // kwh per hour
    chargeQuality?: 'excellent' | 'good' | 'fair' | 'poor';
    connectorReliability?: 'excellent' | 'good' | 'fair' | 'poor';
  };
}

export interface ChargingHistoryRequest {
  userId: string;
  limit?: number;
  offset?: number;
  startDate?: Date;
  endDate?: Date;
  stationId?: string;
  vehicleId?: string;
  status?: ChargingSessionStatus;
}

export interface ChargingHistoryResponse {
  sessions: ChargingSessionSummary[];
  total: number;
  limit: number;
  offset: number;
  summary: ChargingSummary;
}

export interface ChargingSummary {
  totalSessions: number;
  totalEnergyKwh: number;
  totalDurationHours: number;
  averageSessionDuration: number;
  averagePowerKw: number;
  totalCost: number;
  currency: string;
  averageCostPerKwh: number;
  successRate: number;
  favoriteStation?: {
    stationId: string;
    stationName: string;
    sessionsCount: number;
  };
}

export interface ChargingStatistics {
  period: {
    start: Date;
    end: Date;
  };
  stationMetrics: {
    stationId: string;
    totalSessions: number;
    totalEnergyKwh: number;
    averageSessionDuration: number;
    utilizationRate: number; // percentage
    downtimeHours: number;
    revenue: number;
    currency: string;
  };
  userMetrics: {
    uniqueUsers: number;
    repeatUsers: number;
    averageSessionsPerUser: number;
    averageSessionDuration: number;
  };
  regionalMetrics: {
    region: string;
    energyDeliveredKwh: number;
    revenue: number;
    growthRate: number; // month-over-month
  };
}

export interface ChargingQueueRequest {
  stationId: string;
  connectorId: string;
  userId: string;
  estimatedStartTime: Date;
  priority?: QueuePriority;
  preferences?: UserChargingPreferences;
}

export enum QueuePriority {
  NORMAL = 'normal',
  PREMIUM = 'premium',
  EMERGENCY = 'emergency',
  RESERVED = 'reserved'
}

export interface ChargingQueuePosition {
  position: number;
  estimatedWaitTime: number; // minutes
  currentSessions: number;
  activeSession?: {
    userId: string;
    estimatedEndTime: Date;
    energyRemainingKwh?: number;
  };
}

export interface OCPPMessage {
  messageType: OCPPMessageType;
  uniqueId: string;
  action: string;
  payload?: any;
  timestamp: Date;
}

export enum OCPPMessageType {
  CALL = 'call',
  CALL_RESULT = 'call_result',
  CALL_ERROR = 'call_error'
}

export interface OCPPAuthoriseRequest {
  idTag?: string;
  parentIdTag?: string;
  iso15118CertificateHashData?: ISOCertificateHashData[];
}

export interface OCPPAuthoriseResponse {
  idTagInfo: IdTagInfo;
}

export interface IdTagInfo {
  status: AuthorizationStatus;
  expiryDate?: Date;
  parentIdTag?: string;
}

export enum AuthorizationStatus {
  ACCEPTED = 'accepted',
  BLOCKED = 'blocked',
  EXPIRED = 'expired',
  INVALID = 'invalid',
  CONCURRENT_TX = 'concurrent_tx'
}

export interface ISOCertificateHashData {
  hashAlgorithm: HashAlgorithm;
  issuerNameHash: string;
  issuerKeyHash: string;
  serialNumber: string;
}

export enum HashAlgorithm {
  SHA256 = 'SHA256',
  SHA384 = 'SHA384',
  SHA512 = 'SHA512'
}

export interface OCPPStartTransactionRequest {
  connectorId: number;
  idTag?: string;
  meterStart: number;
  reservationId?: number;
  timestamp: Date;
}

export interface OCPPStartTransactionResponse {
  transactionId: number;
  idTagInfo: IdTagInfo;
}

export interface OCPPStopTransactionRequest {
  transactionId: number;
  idTag?: string;
  meterStop: number;
  timestamp: Date;
  reason?: string;
  transactionData?: TransactionData[];
}

export interface OCPPStopTransactionResponse {
  idTagInfo?: IdTagInfo;
}

export interface TransactionData {
  samplValue: SampledValue[];
  timestamp: Date;
}

export interface SampledValue {
  value: string;
  context?: ReadingContext;
  format?: ValueFormat;
  measurand?: Measurand;
  phase?: Phase;
  location?: Location;
  unit?: UnitOfMeasure;
}

export enum ReadingContext {
  INTERVAL_BEGINNING = 'interruption.begin',
  INTERVAL_END = 'interruption.end',
  SAMPLE_PERIODIC = 'sample.periodic',
  SAMPLE_CLOCK = 'sample.clock',
  TRANSACTION_BEGINNING = 'transaction.begin',
  TRANSACTION_END = 'transaction.end',
  OTHER = 'other'
}

export enum ValueFormat {
  RAW = 'raw',
  SIGNED_DATA = 'signedData'
}

export enum Measurand {
  ENERGY_ACTIVE_EXPORT_REGISTER = 'energy.active.register',
  ENERGY_ACTIVE_EXPORT_INTERVAL = 'energy.active.interval',
  ENERGY_ACTIVE_IMPORT_REGISTER = 'energy.active.import.register',
  ENERGY_ACTIVE_IMPORT_INTERVAL = 'energy.active.import.interval',
  ENERGY_REACTIVE_EXPORT_REGISTER = 'energy.reactive.register',
  ENERGY_REACTIVE_EXPORT_INTERVAL = 'energy.reactive.interval',
  ENERGY_REACTIVE_IMPORT_REGISTER = 'energy.reactive.import.register',
  ENERGY_REACTIVE_IMPORT_INTERVAL = 'energy.reactive.interval',
  ENERGY_APPARENT_EXPORT_REGISTER = 'energy.apparent.register',
  ENERGY_APPARENT_EXPORT_INTERVAL = 'energy.apparent.interval',
  ENERGY_APPARENT_IMPORT_REGISTER = 'energy.apparent.import.register',
  ENERGY_APPARENT_IMPORT_INTERVAL = 'energy.apparent.import.interval',
  FREQUENCY = 'frequency',
  POWER_ACTIVE_EXPORT = 'power.active.export',
  POWER_ACTIVE_IMPORT = 'power.active.import',
  POWER_FACTOR = 'power.factor',
  POWER_OFFERED = 'power.offered',
  POWER_REACTIVE_EXPORT = 'power.reactive.export',
  POWER_REACTIVE_IMPORT = 'power.reactive.import',
  C CURRENT_EXPORT = 'current.export',
  C CURRENT_IMPORT = 'current.import',
  CURRENT_OF_LINE = 'current.line[A|B|C|N|L1|L2|L3]',
  CURRENT_OF_PHASE_1 = 'current.phase[1|2|3]',
  VOLTAGE_OF_LINE = 'voltage.line[A|B|C|N|L1|L2|L3|L1-N|L1-L2]',
  VOLTAGE_OF_PHASE = 'voltage.phase[1|2|3]',
  TEMPERATURE = 'temperature'
}

export enum Phase {
  L1 = 'L1',
  L2 = 'L2',
  L3 = 'L3',
  N = 'N',
 C = 'C',
  ONE = '1',
  TWO = '2',
  THREE = '3'
}

export enum Location {
  INLET = 'inlet',
  OUTLET = 'outlet',
  BODY = 'body'
}

export enum UnitOfMeasure {
  WH = 'wh',
  KWH = 'kwh',
  VARH = 'varh',
  KVARH = 'kvarh',
  W = 'w',
  KW = 'kw',
  VA = 'VA',
  KVA = 'kva',
  VAR = 'var',
  KVAR = 'kvar',
  A = 'a',
  V = 'v',
  K = 'k',
  CELCIUS = 'celcius',
  FAHRENHEIT = 'fahrenheit',
  PERCENT = 'percent'
}

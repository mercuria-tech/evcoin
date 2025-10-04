export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  category: NotificationCategory;
  priority: NotificationPriority;
  channel: NotificationChannel;
  status: NotificationStatus;
  title: string;
  message: string;
  richContent?: RichNotificationContent;
  actionButton?: NotificationAction;
  metadata?: NotificationMetadata;
  scheduledFor?: Date;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum NotificationType {
  // Charging Related
  CHARGING_STARTED = 'charging_started',
  CHARGING_PROGRESS = 'charging_progress',
  CHARGING_COMPLETED = 'charging_completed',
  CHARGING_ERROR = 'charging_error',
  CHARGING_PAUSED = 'charging_paused',
  CHARGING_STOPPED = 'charging_stopped',
  
  // Reservation Related
  RESERVATION_CONFIRMED = 'reservation_confirmed',
  RESERVATION_REMINDER = 'reservation_reminder',
  RESERVATION_CANCELLED = 'reservation_cancelled',
  RESERVATION_MODIFIED = 'reservation_modified',
  RESERVATION_EXPIRED = 'reservation_expired',
  RESERVATION_CHECK_IN_REMINDER = 'reservation_check_in_reminder',
  WAIT_LIST_PROMOTION = 'wait_list_promotion',
  
  // Payment Related
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_REFUND = 'payment_refund',
  PAYMENT_RECEIPT = 'payment_receipt',
  INVOICE_GENERATED = 'invoice_generated',
  
  // Station Related
  STATION_AVAILABLE = 'station_available',
  STATION_MAINTENANCE = 'station_maintenance',
  STATION_OUT_OF_SERVICE = 'station_out_of_service',
  CONNECTOR_STATUS_CHANGE = 'connector_status_change',
  
  // Account Related
  ACCOUNT_CREATED = 'account_created',
  PROFILE_UPDATED = 'profile_updated',
  PASSWORD_CHANGED = 'password_changed',
  LOGIN_ALERT = 'login_alert',
  SECURITY_ALERT = 'security_alert',
  
  // Promotional & Marketing
  PLATFORM_UPDATES = 'platform_updates',
  NEW_FEATURES = 'new_features',
  PROMOTIONAL_OFFER = 'promotional_offer',
  REWARD_EARNED = 'reward_earned',
  LOYALTY_TIERS = 'loyalty_tiers',
  
  // Support & Feedback
  SUPPORT_TICKET_CREATED = 'support_ticket_created',
  SUPPORT_TICKET_UPDATED = 'support_ticket_updated',
  FEEDBACK_REQUEST = 'feedback_request',
  REVIEW_REQUEST = 'review_request'
}

export enum NotificationCategory {
  CHARGING = 'charging',
  RESERVATION = 'reservation',
  PAYMENT = 'payment',
  STATION = 'station',
  ACCOUNT = 'account',
  MARKETING = 'marketing',
  SUPPORT = 'support',
  SYSTEM = 'system'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
  WEBHOOK = 'webhook',
  VOICE_CALL = 'voice_call',
  WHATSAPP = 'whatsapp',
  TELEGRAM = 'telegram',
  TEAMS = 'teams',
  SLACK = 'slack'
}

export enum NotificationStatus {
  PENDING = 'pending',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired'
}

export interface RichNotificationContent {
  imageUrl?: string;
  videoUrl?: string;
  audioUrl?: string;
  links?: NotificationLink[];
  attachments?: NotificationAttachment[];
}

export interface NotificationAction {
  text: string;
  action: NotificationActionType;
  url?: string;
  deepLink?: string;
  phoneNumber?: string;
  webhookUrl?: string;
  style?: 'primary' | 'secondary' | 'destructive' | 'link';
}

export enum NotificationActionType {
  OPEN_URL = 'open_url',
  OPEN_APP = 'open_app',
  CALL_PHONE = 'call_phone',
  REPLY_MESSAGE = 'reply_message',
  OPEN_SETTINGS = 'open_settings',
  MARK_AS_READ = 'mark_as_read',
  DISMISS = 'dismiss',
  WEBHOOK_CALL = 'webhook_call'
}

export interface NotificationLink {
  text: string;
  url: string;
  type?: 'internal' | 'external';
}

export interface NotificationAttachment {
  filename: string;
  contentType: string;
  size: number;
  url?: string;
  data?: Buffer;
}

export interface NotificationMetadata {
  sessionId?: string;
  reservationId?: string;
  transactionId?: string;
  stationId?: string;
  connectorId?: string;
  vehicleId?: string;
  amount?: number;
  currency?: string;
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  tags?: string[];
  customData?: Record<string, any>;
}

export interface NotificationTemplate {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  language: string;
  subject: string;
  title: string;
  content: string;
  htmlContent?: string;
  variables: string[]; // List of template variables
  richContent?: RichNotificationContent;
  actionButton?: NotificationAction;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreference {
  userId: string;
  channel: NotificationChannel;
  category: NotificationCategory;
  type?: NotificationType; // If null, applies to entire category
  enabled: boolean;
  quietHoursStart?: string; // HH:mm format
  quietHoursEnd?: string; // HH:mm format
  timezone: string;
  customDeliverySettings?: DeliverySettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliverySettings {
  maxAttempts?: number;
  retryDelayMs?: number[];
  expirationHours?: number;
  rateLimitPerHour?: number;
  customHeaders?: Record<string, string>;
  webhookSettings?: WebhookSettings;
  voiceSettings?: VoiceSettings;
  emailSettings?: EmailSettings;
  smsSettings?: SmsSettings;
}

export interface WebhookSettings {
  url: string;
  secret: string;
  retryOnFailure: boolean;
  timeoutMs: number;
}

export interface VoiceSettings {
  language: string;
  voice: string;
  speed: number; // 0.5 to 2.0
  volume: number; // 0 to 100
}

export interface EmailSettings {
  templateId?: string;
  inlineCSS: boolean;
  deliveryOptions?: {
    trackOpens?: boolean;
    trackClicks?: boolean;
    unsubscribeTracking?: boolean;
  };
}

export interface SmsSettings {
  senderId?: string;
  deliveryReports: boolean;
  expireAfterHours?: number;
}

export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  channel: NotificationChannel;
  priority?: NotificationPriority;
  title: string;
  message: string;
  richContent?: RichNotificationContent;
  actionButton?: NotificationAction;
  metadata?: NotificationMetadata;
  scheduledFor?: Date;
  useTemplate?: boolean;
  templateVariables?: Record<string, any>;
  retrySettings?: DeliverySettings;
}

export interface BulkNotificationRequest {
  userIds: string[];
  type: NotificationType;
  channel: NotificationChannel;
  priority?: NotificationPriority;
  title: string;
  message: string;
  richContent?: RichNotificationContent;
  actionButton?: NotificationAction;
  metadata?: NotificationMetadata;
  scheduledFor?: Date;
  useTemplate?: boolean;
  templateVariables?: Record<string, any>;
  segmentFilters?: UserSegmentFilter[];
  batchSize?: number;
}

export interface UserSegmentFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'in' | 'not_in' | 'greater_than' | 'less_than';
  value: any;
}

export interface NotificationDeliveryAttempt {
  id: string;
  notificationId: string;
  attemptNumber: number;
  channel: NotificationChannel;
  status: NotificationStatus;
  provider: string;
  providerMessageId?: string;
  errorMessage?: string;
  sentAt: Date;
  deliveredAt?: Date;
  metadata?: Record<string, any>;
}

export interface NotificationAnalytics {
  period: {
    start: Date;
    end: Date;
  };
  byChannel: Record<NotificationChannel, {
    sent: number;
    delivered: number;
    failed: number;
    read: number;
    deliveryRate: number;
    readRate: number;
  }>;
  byType: Record<NotificationType, {
    sent: number;
    delivered: number;
    clicked: number;
    engagement: number;
  }>;
  byPriority: Record<NotificationPriority, {
    sent: number;
    averageDeliveryTime: number; // milliseconds
    failureRate: number;
  }>;
  userEngagement: {
    totalUsers: number;
    activeUsers: number;
    avgNotificationsPerUser: number;
    optOutRate: number;
    preferenceChanges: number;
  };
  timingMetrics: {
    peakDeliveryHours: number[];
    averageDeliveryTime: number;
    queueSize: number;
    processingRate: number;
  };
}

export interface NotificationSchedule {
  id: string;
  type: NotificationType;
  channel: NotificationChannel;
  targetCriteria: UserSegmentFilter[];
  content: Omit<CreateNotificationRequest, 'userId'>;
  schedulePattern: SchedulePattern;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SchedulePattern {
  type: SchedulePatternType;
  cron?: string;
  startDate?: Date;
  endDate?: Date;
  timezone: string;
  recurrence?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    interval: number;
    daysOfWeek?: number[];
    dayOfMonth?: number[];
  };
}

export enum SchedulePatternType {
  IMMEDIATE = 'immediate',
  CRON = 'cron',
  ONE_TIME = 'one_time',
  RECURRING = 'recurring',
  EVENT_BASED = 'event_based'
}

export interface NotificationDigest {
  userId: string;
  frequency: DigestFrequency;
  digestTemplate: string;
  enabled: boolean;
  nextDigestAt: Date;
  lastDigestSent?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum DigestFrequency {
  IMMEDIATE = 'immediate',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  DISABLED = 'disabled'
}

export interface NotificationQueueItem {
  id: string;
  notificationId: string;
  priority: NotificationPriority;
  scheduledFor: Date;
  attempts: number;
  maxAttempts: number;
  lastAttempt?: Date;
  nextAttempt?: Date;
  channel: NotificationChannel;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface TwilioDeliveryOptions {
  fromNumber?: string;
  mediaUrls?: string[];
  statusCallback?: string;
  maxPrice?: number;
  provideFeedback?: boolean;
}

export interface FirebaseDeliveryOptions {
  collapseKey?: string;
  data?: Record<string, string>;
  clickAction?: string;
  icon?: string;
  sound?: string;
  badge?: string;
  color?: string;
  deliveryPriority?: 'normal' | 'high';
  timeToLive?: number;
}

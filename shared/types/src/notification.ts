export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  sentAt: Date;
  readAt?: Date;
}

export enum NotificationType {
  CHARGING_STARTED = 'charging_started',
  CHARGING_COMPLETED = 'charging_completed',
  CHARGING_FAILED = 'charging_failed',
  RESERVATION_REMINDER = 'reservation_reminder',
  RESERVATION_CONFIRMED = 'reservation_confirmed',
  RESERVATION_CANCELLED = 'reservation_cancelled',
  PAYMENT_SUCCESSFUL = 'payment_successful',
  PAYMENT_FAILED = 'payment_failed',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  PROMOTIONAL = 'promotional'
}

export interface NotificationPreferences {
  userId: string;
  email: boolean;
  push: boolean;
  sms: boolean;
  chargingUpdates: boolean;
  reservationReminders: boolean;
  paymentConfirmations: boolean;
  promotionalMessages: boolean;
  systemAnnouncements: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SendNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  channels?: NotificationChannel[];
  scheduledAt?: Date;
}

export enum NotificationChannel {
  EMAIL = 'email',
  PUSH = 'push',
  SMS = 'sms',
  IN_APP = 'in_app'
}

export interface NotificationQueue {
  id: string;
  request: SendNotificationRequest;
  status: QueueStatus;
  attempts: number;
  maxAttempts: number;
  scheduledFor: Date;
  createdAt: Date;
  processedAt?: Date;
  error?: string;
}

export enum QueueStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  RETRY = 'retry'
}

export interface EmailTemplate {
  id: string;
  type: NotificationType;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  badge?: number;
  sound?: string;
  priority?: 'normal' | 'high';
}

export interface SmsTemplate {
  id: string;
  type: NotificationType;
  message: string;
  variables: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

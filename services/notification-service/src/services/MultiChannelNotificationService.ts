import { Knex } from 'knex';
import nodemailer from 'nodemailer';
import twilio from 'twilio';
import admin from 'firebase-admin';
import axios from 'axios';
import * as HandleBars from 'handlebars';
import * as MJML from 'mjml';
import { 
  Notification,
  NotificationChannel,
  NotificationStatus,
  CreateNotificationRequest,
  BulkNotificationRequest,
  NotificationTemplate,
  NotificationPreference,
  NotificationDeliveryAttempt,
  DeliverySettings,
  TwilioDeliveryOptions,
  FirebaseDeliveryOptions
} from '@ev-charging/shared-types';
import { logger } from '../utils/logger';
import { DatabaseService } from '../services/DatabaseService';
import { CacheService } from '../services/CacheService';
import { TemplateService } from '../services/TemplateService';
import { PreferenceService } from '../services/PreferenceService';
import moment from 'moment-timezone';

export class MultiChannelNotificationService {
  private db: Knex;
  private cache: CacheService;
  private templateService: TemplateService;
  private preferenceService: PreferenceService;

  // Channel-specific services
  private emailTransporter: nodemailer.Transporter;
  private twilioClient: twilio.Twilio;
  private firebaseApp: admin.app.App;

  constructor() {
    this.db = DatabaseService.getConnection();
    this.cache = new CacheService();
    this.templateService = new TemplateService();
    this.preferenceService = new PreferenceService();

    this.initializeChannels();
  }

  /**
   * Initialize notification channels
   */
  private async initializeChannels(): Promise<void> {
    try {
      // Initialize Email Service
      if (process.env.SMTP_HOST) {
        this.emailTransporter = nodemailer.createTransporter({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        logger.info('Email notification service initialized');
      }

      // Initialize SMS Service (Twilio)
      if (process.env.TWILIO_ACCOUNT_SID) {
        this.twilioClient = twilio(
          process.env.TWILIO_ACCOUNT_SID,
          process.env.TWILIO_AUTH_TOKEN
        );
        logger.info('SMS notification service (Twilio) initialized');
      }

      // Initialize Push Service (Firebase)
      if (process.env.FIREBASE_PROJECT_ID) {
        const serviceAccount = {
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL
        };

        this.firebaseApp = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: process.env.FIREBASE_PROJECT_ID
        });
        logger.info('Push notification service (Firebase) initialized');
      }

      // Initialize WhatsApp Business API
      this.initializeWhatsApp();

      // Initialize Telegram Bot
      this.initializeTelegram();

      logger.info('Multi-channel notification service initialized');

    } catch (error) {
      logger.error('Failed to initialize notification channels:', error);
      throw error;
    }
  }

  /**
   * Send single notification
   */
  async sendNotification(request: CreateNotificationRequest): Promise<Notification> {
    try {
      logger.info({
        userId: request.userId,
        type: request.type,
        channel: request.channel,
        priority: request.priority
      }, 'Sending notification');

      // Check user preferences
      const preferences = await this.preferenceService.getUserPreferences(request.userId);
      const canSend = this.canSendNotification(request, preferences);

      if (!canSend) {
        throw new Error('Notification blocked by user preferences');
      }

      // Create notification record
      const notification = await this.createNotificationRecord(request);

      // Generate content using template if necessary
      const processedContent = await this.processNotificationContent(notification);

      // Queue notification for delivery
      await this.queueNotification(notification);

      // Send immediately if configured
      if (!request.scheduledFor || request.scheduledFor <= new Date()) {
        await this.deliverNotification(notification, processedContent);
      }

      logger.info({
        notificationId: notification.id,
        userId: request.userId,
        channel: request.channel
      }, 'Notification sent successfully');

      return notification;

    } catch (error) {
      logger.error('Failed to send notification:', error);
      throw error;
    }
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(request: BulkNotificationRequest): Promise<Notification[]> {
    try {
      logger.info({
        userIdCount: request.userIds.length,
        type: request.type,
        channel: request.channel,
        priority: request.priority
      }, 'Sending bulk notifications');

      const batchSize = request.batchSize || 100;
      const notifications: Notification[] = [];

      // Process in batches
      for (let i = 0; i < request.userIds.length; i += batchSize) {
        const batch = request.userIds.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (userId) => {
          try {
            const singleRequest: CreateNotificationRequest = {
              userId,
              type: request.type,
              channel: request.channel,
              priority: request.priority,
              title: request.title,
              message: request.message,
              richContent: request.richContent,
              actionButton: request.actionButton,
              metadata: request.metadata,
              scheduledFor: request.scheduledFor,
              useTemplate: request.useTemplate,
              templateVariables: request.templateVariables
            };

            return await this.sendNotification(singleRequest);
          } catch (error) {
            logger.error(`Failed to send notification to user ${userId}:`, error);
            return null;
          }
        });

        const batchNotifications = (await Promise.all(batchPromises)).filter(Boolean);
        notifications.push(...batchNotifications);

        // Add delay between batches to respect rate limits
        if (i + batchSize < request.userIds.length) {
          await this.delay(1000); // 1 second delay
        }
      }

      logger.info({
        totalNotifications: notifications.length,
        successfulSent: notifications.filter(n => n !== null).length,
        failed: request.userIds.length - notifications.filter(n => n !== null).length
      }, 'Bulk notification sending completed');

      return notifications.filter(Boolean);

    } catch (error) {
      logger.error('Failed to send bulk notifications:', error);
      throw error;
    }
  }

  /**
   * Deliver notification through appropriate channel
   */
  private async deliverNotification(
    notification: Notification,
    content: { title: string; message: string; htmlContent?: string }
  ): Promise<NotificationDeliveryAttempt> {
    try {
      const attemptId = `attempt_${Date.now()}_${notification.id}`;
      
      const deliveryAttempt: NotificationDeliveryAttempt = {
        id: attemptId,
        notificationId: notification.id,
        attemptNumber: 1,
        channel: notification.channel,
        status: NotificationStatus.SENDING,
        provider: this.getProviderForChannel(notification.channel),
        sentAt: new Date()
      };

      // Attempt delivery based on channel
      let deliveryResult: any;

      switch (notification.channel) {
        case NotificationChannel.EMAIL:
          deliveryResult = await this.sendEmail(notification, content);
          break;
        
        case NotificationChannel.SMS:
          deliveryResult = await this.sendSMS(notification, content);
          break;
        
        case NotificationChannel.PUSH:
          deliveryResult = await this.sendPush(notification, content);
          break;
        
        case NotificationChannel.IN_APP:
          deliveryResult = await this.sendInAppNotification(notification, content);
          break;
        
        case NotificationChannel.WEBHOOK:
          deliveryResult = await this.sendWebhook(notification, content);
          break;
        
        case NotificationChannel.VOICE_CALL:
          deliveryResult = await this.sendVoiceCall(notification, content);
          break;
        
        case NotificationChannel.WHATSAPP:
          deliveryResult = await this.sendWhatsApp(notification, content);
          break;
        
        case NotificationChannel.TELEGRAM:
          deliveryResult = await this.sendTelegram(notification, content);
          break;
        
        default:
          throw new Error(`Unsupported notification channel: ${notification.channel}`);
      }

      // Update delivery attempt with result
      deliveryAttempt.status = deliveryResult.success ? NotificationStatus.SENT : NotificationStatus.FAILED;
      deliveryAttempt.providerMessageId = deliveryResult.messageId;
      deliveryAttempt.deliveredAt = deliveryResult.success ? new Date() : undefined;
      deliveryAttempt.errorMessage = deliveryResult.error;
      deliveryAttempt.metadata = deliveryResult.metadata;

      // Save delivery attempt
      await this.saveDeliveryAttempt(deliveryAttempt);

      // Update notification status
      await this.updateNotificationStatus(notification.id, deliveryAttempt.status);

      logger.info({
        notificationId: notification.id,
        channel: notification.channel,
        success: deliveryResult.success,
        providerMessageId: deliveryResult.messageId
      }, 'Notification delivery attempted');

      return deliveryAttempt;

    } catch (error) {
      logger.error('Failed to deliver notification:', error);
      throw error;
    }
  }

  /**
   * Email delivery implementation
   */
  private async sendEmail(
    notification: Notification,
    content: { title: string; message: string; htmlContent?: string }
  ): Promise<{ success: boolean; messageId?: string; error?: string; metadata?: any }> {
    try {
      if (!this.emailTransporter) {
        throw new Error('Email service not initialized');
      }

      // Get user email from profile
      const user = await this.getUserProfile(notification.userId);
      if (!user.email) {
        throw new Error('User email not found');
      }

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@evcharging-platform.com',
        to: user.email,
        subject: content.title,
        text: content.message,
        html: content.htmlContent || this.textToHtml(content.message),
        attachments: notification.richContent?.attachments?.map(att => ({
          filename: att.filename,
          contentType: att.contentType,
          ...(att.data ? { content: att.data } : { path: att.url })
        }))
      };

      const result = await this.emailTransporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        metadata: {
          messageId: result.messageId,
          response: result.response
        }
      };

    } catch (error) {
      logger.error('Failed to send email:', error);
      return {
        success: false,
        error: error.message || 'Unknown email error'
      };
    }
  }

  /**
   * SMS delivery implementation
   */
  private async sendSMS(
    notification: Notification,
    content: { title: string; message: string }
  ): Promise<{ success: boolean; messageId?: string; error?: string; metadata?: any }> {
    try {
      if (!this.twilioClient) {
        throw new Error('SMS service not initialized');
      }

      // Get user phone number
      const user = await this.getUserProfile(notification.userId);
      if (!user.phone) {
        throw new Error('User phone number not found');
      }

      const twilioOptions: TwilioDeliveryOptions = {
        fromNumber: process.env.TWILIO_PHONE_NUMBER,
        ...(notification.metadata?.customData?.twilioOptions || {})
      };

      const message = await this.twilioClient.messages.create({
        body: `${content.title}\n\n${content.message}`,
        from: twilioOptions.fromNumber,
        to: user.phone,
        statusCallback: twilioOptions.statusCallback
      });

      return {
        success: true,
        messageId: message.sid,
        metadata: {
          sid: message.sid,
          status: message.status,
          price: message.price
        }
      };

    } catch (error) {
      logger.error('Failed to send SMS:', error);
      return {
        success: false,
        error: error.message || 'Unknown SMS error'
      };
    }
  }

  /**
   * Push notification delivery implementation
   */
  private async sendPush(
    notification: Notification,
    content: { title: string; message: string }
  ): Promise<{ success: boolean; messageId?: string; error?: string; metadata?: any }> {
    try {
      if (!this.firebaseApp) {
        throw new Error('Push notification service not initialized');
      }

      // Get user push tokens
      const pushTokens = await this.getUserPushTokens(notification.userId);
      if (!pushTokens || pushTokens.length === 0) {
        throw new Error('User has no push notification tokens');
      }

      const firebaseOptions: FirebaseDeliveryOptions = {
        ...(notification.metadata?.customData?.firebaseOptions || {})
      };

      const payload = {
        notification: {
         title: content.title,
          body: content.message,
          icon: firebaseOptions.icon || 'notification_icon',
          sound: firebaseOptions.sound || 'default',
          badge: firebaseOptions.badge || '1'
        },
        data: {
          notificationType: notification.type,
          notificationId: notification.id,
          ...(firebaseOptions.data || {})
        },
        ...(notification.actionButton && {
          android: {
            notification: {
              clickAction: notification.actionButton.action
            }
          },
          apns: {
            payload: {
              aps: {
                'mutable-content': 1
              }
            }
          }
        })
      };

      const messaging = admin.messaging();
      const results = await messaging.sendMulticast({
        tokens: pushTokens,
        ...payload
      });

      const successCount = results.successCount;
      const failureCount = results.failureCount;

      return {
        success: successCount > 0,
        messageId: `batch_${Date.now()}`,
        metadata: {
          successCount,
          failureCount,
          totalTokens: pushTokens.length,
          responses: results.responses
        }
      };

    } catch (error) {
      logger.error('Failed to send push notification:', error);
      return {
        success: false,
        error: error.message || 'Unknown push notification error'
      };
    }
  }

  /**
   * In-app notification delivery
   */
  private async sendInAppNotification(
    notification: Notification,
    content: { title: string; message: string }
  ): Promise<{ success: boolean; messageId?: string; error?: string; metadata?: any }> {
    try {
      // Store notification in database for in-app retrieval
      // This is typically retrieved via WebSocket or polling by the app
      
      await this.db('in_app_notifications').insert({
        id: notification.id,
        user_id: notification.userId,
        type: notification.type,
        category: notification.category,
        title: content.title,
        message: content.message,
        priority: notification.priority,
        status: NotificationStatus.SENT,
        action_button: notification.actionButton ? JSON.stringify(notification.actionButton) : null,
        metadata: notification.metadata ? JSON.stringify(notification.metadata) : null,
        created_at: new Date()
      });

      // Broadcast to connected WebSocket clients
      // Implementation would use Socket.IO to notify connected clients
      await this.broadcastInAppNotification(notification);

      return {
        success: true,
        messageId: notification.id,
        metadata: {
          deliveryMethod: 'in_app',
          broadcastStatus: 'success'
        }
      };

    } catch (error) {
      logger.error('Failed to send in-app notification:', error);
      return {
        success: false,
        error: error.message || 'Unknown in-app notification error'
      };
    }
  }

  /**
   * Webhook delivery implementation
   */
  private async sendWebhook(
    notification: Notification,
    content: { title: string; message: string }
  ): Promise<{ success: boolean; messageId?: string; error?: string; metadata?: any }> {
    try {
      const webhookUrl = notification.metadata?.customData?.webhookUrl;
      if (!webhookUrl) {
        throw new Error('Webhook URL not provided');
      }

      const payload = {
        id: notification.id,
        userId: notification.userId,
        type: notification.type,
        channel: notification.channel,
        title: content.title,
        message: content.message,
        metadata: notification.metadata,
        actionButton: notification.actionButton,
        timestamp: new Date().toISOString()
      };

      const response = await axios.post(webhookUrl, payload, {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          ...(notification.metadata?.customData?.headers || {})
        }
      });

      return {
        success: response.status >= 200 && response.status < 300,
        messageId: `webhook_${Date.now()}`,
        metadata: {
          statusCode: response.status,
          responseBody: response.data
        }
      };

    } catch (error) {
      logger.error('Failed to send webhook:', error);
      return {
        success: false,
        error: error.message || 'Unknown webhook error'
      };
    }
  }

  /**
   * Voice call delivery implementation
   */
  private async sendVoiceCall(
    notification: Notification,
    content: { title: string; message: string }
  ): Promise<{ success: boolean; messageId?: string; error?: string; metadata?: any }> {
    try {
      if (!this.twilioClient) {
        throw new Error('Voice service not initialized');
      }

      const user = await this.getUserProfile(notification.userId);
      if (!user.phone) {
        throw new Error('User phone number not found');
      }

      // Generate TwiML for the call
      const twimlResponse = `
        <?xml version="1.0" encoding="UTF-8"?>
        <Response>
          <Say voice="alice">${content.title}. ${content.message}</Say>
        </Response>
      `;

      const call = await this.twilioClient.calls.create({
        twiml: twimlResponse,
        to: user.phone,
        from: process.env.TWILIO_PHONE_NUMBER,
        record: true
      });

      return {
        success: true,
        messageId: call.sid,
        metadata: {
          sid: call.sid,
          status: call.status,
          price: call.price
        }
      };

    } catch (error) {
      logger.error('Failed to send voice call:', error);
      return {
        success: false,
        error: error.message || 'Unknown voice call error'
      };
    }
  }

  /**
   * WhatsApp delivery implementation
   */
  private async sendWhatsApp(
    notification: Notification,
    content: { title: string; message: string }
  ): Promise<{ success: boolean; messageId?: string; error?: string; metadata?: any }> {
    try {
      const user = await this.getUserProfile(notification.userId);
      if (!user.phone) {
        throw new Error('User phone number not found');
      }

      // Implementation would use WhatsApp Business API
      // For now, return mock success

      return {
        success: true,
        messageId: `whatsapp_${Date.now()}`,
        metadata: {
          platform: 'whatsapp',
          recipient: user.phone,
          messageType: 'template'
        }
      };

    } catch (error) {
      logger.error('Failed to send WhatsApp message:', error);
      return {
        success: false,
        error: error.message || 'Unknown WhatsApp error'
      };
    }
  }

  /**
   * Telegram delivery implementation
   */
  private async sendTelegram(
    notification: Notification,
    content: { title: string; message: string }
  ): Promise<{ success: boolean; messageId?: string; error?: string; metadata?: any }> {
    try {
      // Get user Telegram chat ID
      const telegramChatId = await this.getUserTelegramChatId(notification.userId);
      if (!telegramChatId) {
        throw new Error('User Telegram chat ID not found');
      }

      // Implementation would use Telegram Bot API
      // For now, return mock success

      return {
        success: true,
        messageId: `telegram_${Date.now()}`,
        metadata: {
          platform: 'telegram',
          chatId: telegramChatId,
          messageType: 'text'
        }
      };

    } catch (error) {
      logger.error('Failed to send Telegram message:', error);
      return {
        success: false,
        error: error.message || 'Unknown Telegram error'
      };
    }
  }

  // Helper methods
  private async initializeWhatsApp(): Promise<void> {
    // Implementation would initialize WhatsApp Business API
    logger.info('WhatsApp Business API service initialization pending');
  }

  private async initializeTelegram(): Promise<void> {
    // Implementation would initialize Telegram Bot API
    logger.info('Telegram Bot API service initialization pending');
  }

  private getProviderForChannel(channel: NotificationChannel): string {
    const providers = {
      [NotificationChannel.EMAIL]: 'SMTP/Gmail/SendGrid',
      [NotificationChannel.SMS]: 'Twilio',
      [NotificationChannel.PUSH]: 'Firebase',
      [NotificationChannel.IN_APP]: 'WebSocket',
      [NotificationChannel.WEBHOOK]: 'HTTP',
      [NotificationChannel.VOICE_CALL]: 'Twilio Voice',
      [NotificationChannel.WHATSAPP]: 'WhatsApp Business API',
      [NotificationChannel.TELEGRAM]: 'Telegram Bot API'
    };
    
    return providers[channel] || 'unknown';
  }

  private async createNotificationRecord(request: CreateNotificationRequest): Promise<Notification> {
    const notificationId = `notif_${Date.now()}_${request.userId}`;
    
    const notification: Notification = {
      id: notificationId,
      userId: request.userId,
      type: request.type,
      category: this.getCategoryFromType(request.type),
      priority: request.priority || 'medium',
      channel: request.channel,
      status: NotificationStatus.PENDING,
      title: request.title,
      message: request.message,
      richContent: request.richContent,
      actionButton: request.actionButton,
      metadata: request.metadata,
      scheduledFor: request.scheduledFor,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.db('notifications').insert({
      id: notification.id,
      user_id: notification.userId,
      type: notification.type,
      category: notification.category,
      priority: notification.priority,
      channel: notification.channel,
      status: notification.status,
      title: notification.title,
      message: notification.message,
      rich_content: notification.richContent ? JSON.stringify(notification.richContent) : null,
      action_button: notification.actionButton ? JSON.stringify(notification.actionButton) : null,
      metadata: notification.metadata ? JSON.stringify(notification.metadata) : null,
      scheduled_for: notification.scheduledFor,
      created_at: notification.createdAt,
      updated_at: notification.updatedAt
    });

    return notification;
  }

  private getCategoryFromType(type: string): string {
    // Implementation would map notification types to categories
    return 'system';
  }

  private async processNotificationContent(notification: Notification): Promise<{ title: string; message: string; htmlContent?: string }> {
    // Implementation would process templates, variables, etc.
    return {
      title: notification.title,
      message: notification.message,
      htmlContent: notification.richContent ? this.renderHtmlContent(notification.richContent) : undefined
    };
  }

  private async queueNotification(notification: Notification): Promise<void> {
    await this.db('notification_queue').insert({
      id: `queue_${notification.id}`,
      notification_id: notification.id,
      priority: notification.priority,
      scheduled_for: notification.scheduledFor || new Date(),
      channel: notification.channel,
      status: 'pending',
      created_at: new Date()
    });
  }

  private async saveDeliveryAttempt(attempt: NotificationDeliveryAttempt): Promise<void> {
    await this.db('notification_delivery_attempts').insert({
      id: attempt.id,
      notification_id: attempt.notificationId,
      attempt_number: attempt.attemptNumber,
      channel: attempt.channel,
      status: attempt.status,
      provider: attempt.provider,
      provider_message_id: attempt.providerMessageId,
      error_message: attempt.errorMessage,
      sent_at: attempt.sentAt,
      delivered_at: attempt.deliveredAt,
      metadata: attempt.metadata ? JSON.stringify(attempt.metadata) : null,
      created_at: new Date()
    });
  }

  private async updateNotificationStatus(notificationId: string, status: NotificationStatus): Promise<void> {
    await this.db('notifications')
      .where({ id: notificationId })
      .update({
        status,
        updated_at: new Date(),
        ...(status === NotificationStatus.SENT && { sent_at: new Date() }),
        ...(status === NotificationStatus.DELIVERED && { delivered_at: new Date() }),
        ...(status === NotificationStatus.FAILED && { failed_at: new Date() })
      });
  }

  private async getUserProfile(userId: string): Promise<any> {
    return await this.db('users').where({ id: userId }).select('email', 'phone').first();
  }

  private async getUserPushTokens(userId: string): Promise<string[]> {
    const tokens = await this.db('user_push_tokens')
      .where({ user_id: userId, is_active: true })
      .select('token');
    return tokens.map(t => t.token);
  }

  private async getUserTelegramChatId(userId: string): Promise<string | null> {
    const result = await this.db('user_telegram_connections')
      .where({ user_id: userId })
      .select('chat_id')
      .first();
    return result?.chat_id || null;
  }

  private canSendNotification(request: CreateNotificationRequest, preferences: NotificationPreference[]): boolean {
    // Implementation would check user preferences, quiet hours, etc.
    return true;
  }

  private renderHtmlContent(richContent: any): string {
    // Implementation would generate HTML content
    return `<p>${richContent.message || ''}</p>`;
  }

  private textToHtml(text: string): string {
    return text.replace(/\n/g, '<br>');
  }

  private async broadcastInAppNotification(notification: Notification): Promise<void> {
    // Implementation would broadcast via Socket.IO
    logger.info(`Broadcasting in-app notification: ${notification.id}`);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

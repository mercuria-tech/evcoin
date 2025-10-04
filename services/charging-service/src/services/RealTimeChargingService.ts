import { Server } from 'socket.io';
import { ChargingSessionUpdate, ChargingSessionStatus } from '@ev-charging/shared-types';
import { logger } from '../utils/logger';
import { CacheService } from './CacheService';

export class RealTimeChargingService {
  private io: Server | null = null;
  private cache: CacheService;

  constructor() {
    this.cache = new CacheService();
  }

  /**
   * Initialize with Socket.IO server
   */
  initialize(io: Server): void {
    this.io = io;
    this.setupSocketHandlers();
    logger.info('Real-time charging service initialized');
  }

  /**
   * Setup Socket.IO event handlers
   */
  private setupSocketHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket) => {
      logger.info(`Client connected to charging service: ${socket.id}`);

      // Subscribe to charging session updates
      socket.on('subscribe_charging_session', (data: { sessionId: string }) => {
        socket.join(`charging_${data.sessionId}`);
        logger.info(`Client ${socket.id} subscribed to charging session ${data.sessionId}`);
        
        // Send current session status immediately
        this.sendCurrentSessionStatus(socket, data.sessionId);
      });

      // Subscribe to station charging updates
      socket.on('subscribe_station_charging', (data: { stationId: string }) => {
        socket.join(`station_charging_${data.stationId}`);
        logger.info(`Client ${socket.id} subscribed to station charging ${data.stationId}`);
      });

      // Subscribe to user's charging sessions
      socket.on('subscribe_user_charging', (data: { userId: string }) => {
        socket.join(`user_charging_${data.userId}`);
        logger.info(`Client ${socket.id} subscribed to user charging ${data.userId}`);
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        logger.info(`Client disconnected from charging service: ${socket.id}`);
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error('Socket error in charging service:', error);
      });
    });
  }

  /**
   * Start monitoring a charging session
   */
  async startSessionMonitoring(sessionId: string): Promise<void> {
    try {
      logger.info(`Starting real-time monitoring for session ${sessionId}`);
      
      // Set up periodic monitoring task for this session
      const monitoringInterval = setInterval(async () => {
        await this.updateSessionMetrics(sessionId);
      }, 10000); // Update every 10 seconds

      // Store monitoring interval for cleanup
      await this.cache.setSessionMonitoringInterval(sessionId, monitoringInterval);

    } catch (error) {
      logger.error(`Failed to start monitoring for session ${sessionId}:`, error);
    }
  }

  /**
   * Stop monitoring a charging session
   */
  async stopSessionMonitoring(sessionId: string): Promise<void> {
    try {
      logger.info(`Stopping real-time monitoring for session ${sessionId}`);
      
      // Clear monitoring interval
      const interval = await this.cache.getSessionMonitoringInterval(sessionId);
      if (interval) {
        clearInterval(interval);
        await this.cache.removeSessionMonitoringInterval(sessionId);
      }

      // Broadcast final session update
      await this.broadcastSessionUpdate({
        sessionId,
        status: ChargingSessionStatus.COMPLETED
      });

    } catch (error) {
      logger.error(`Failed to stop monitoring for session ${sessionId}:`, error);
    }
  }

  /**
   * Broadcast charging session update to subscribers
   */
  async broadcastSessionUpdate(update: ChargingSessionUpdate): Promise<void> {
    try {
      if (!this.io) {
        logger.warn('Socket.IO server not initialized');
        return;
      }

      // Get session details for context
      const sessionData = await this.cache.getSession(update.sessionId);
      if (!sessionData) {
        logger.warn(`Session ${update.sessionId} not found in cache`);
        return;
      }

      const message = {
        sessionId: update.sessionId,
        userId: sessionData.userId,
        stationId: sessionData.stationId,
        connectorId: sessionData.connectorId,
        ...update,
        timestamp: new Date().toISOString()
      };

      // Broadcast to session-specific subscribers
      this.io.to(`charging_${update.sessionId}`).emit('charging_session_update', message);

      // Broadcast to station-specific subscribers  
      this.io.to(`station_charging_${sessionData.stationId}`).emit('station_charging_update', {
        stationId: sessionData.stationId,
        connectorId: sessionData.connectorId,
        sessionId: update.sessionId,
        ...update
      });

      // Broadcast to user-specific subscribers
      this.io.to(`user_charging_${sessionData.userId}`).emit('user_charging_update', message);

      logger.debug({
        sessionId: update.sessionId,
        status: update.status,
        recipients: {
          sessionSubscribers: Array.from(this.io.sockets.adapter.rooms.get(`charging_${update.sessionId}`) || []).length,
          stationSubscribers: Array.from(this.io.sockets.adapter.rooms.get(`station_charging_${sessionData.stationId}`) || []).length,
          userSubscribers: Array.from(this.io.sockets.adapter.rooms.get(`user_charging_${sessionData.userId}`) || []).length
        }
      }, 'Broadcast charging session update');

    } catch (error) {
      logger.error('Failed to broadcast session update:', error);
    }
  }

  /**
   * Broadcast charging station status update
   */
  async broadcastStationStatusUpdate(
    stationId: string,
    connectorId: string,
    status: string,
    errorCode?: string
  ): Promise<void> {
    try {
      if (!this.io) return;

      const message = {
        stationId,
        connectorId,
        status,
        errorCode,
        timestamp: new Date().toISOString()
      };

      this.io.to(`station_charging_${stationId}`).emit('connector_status_update', message);

      logger.debug({
        stationId,
        connectorId,
        status,
        subscribers: Array.from(this.io.sockets.adapter.rooms.get(`station_charging_${stationId}`) || []).length
      }, 'Broadcast station status update');

    } catch (error) {
      logger.error('Failed to broadcast station status update:', error);
    }
  }

  /**
   * Send charging progress updates
   */
  async broadcastChargingProgress(
    sessionId: string,
    progress: {
      energyDeliveredKwh: number;
      currentPowerKw: number;
      estimatedTimeRemaining?: number;
      batteryLevel?: number;
      temperatureCelsius?: number;
    }
  ): Promise<void> {
    try {
      const sessionData = await this.cache.getSession(sessionId);
      if (!sessionData) return;

      const message = {
        sessionId,
        ...progress,
        timestamp: new Date().toISOString()
      };

      // Send to session subscribers
      if (this.io) {
        this.io.to(`charging_${sessionId}`).emit('charging_progress', message);
        
        // Send to station subscribers
          this.io.to(`station_charging_${sessionData.stationId}`).emit('station_progress', {
          stationId: sessionData.stationId,
          connectorId: sessionData.connectorId,
          ...message
        });
      }

      logger.debug(message, 'Broadcast charging progress');

    } catch (error) {
      logger.error('Failed to broadcast charging progress:', error);
    }
  }

  /**
   * Send alerts for charging issues
   */
  async broadcastChargingAlert(
    sessionId: string,
    alert: {
      level: 'info' | 'warning' | 'error' | 'critical';
      code: string;
      message: string;
      actionRequired?: boolean;
    }
  ): Promise<void> {
    try {
      const sessionData = await this.cache.getSession(sessionId);
      if (!sessionData) return;

      const message = {
        sessionId,
        userId: sessionData.userId,
        stationId: sessionData.stationId,
        ...alert,
        timestamp: new Date().toISOString()
      };

      // Send immediate notification to user
      if (this.io) {
        this.io.to(`user_charging_${sessionData.userId}`).emit('charging_alert', message);
        
        // Also send to session subscribers
        this.io.to(`charging_${sessionId}`).emit('charging_alert', message);
      }

      logger.warn(message, 'Broadcast charging alert');

    } catch (error) {
      logger.error('Failed to broadcast charging alert:', error);
    }
  }

  /**
   * Private helper methods
   */
  private async sendCurrentSessionStatus(socket: any, sessionId: string): Promise<void> {
    try {
      const sessionData = await this.cache.getSession(sessionId);
      if (sessionData) {
        socket.emit('charging_session_current_status', {
          sessionId,
          ...sessionData,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error(`Failed to send current status for session ${sessionId}:`, error);
    }
  }

  private async updateSessionMetrics(sessionId: string): Promise<void> {
    try {
      // Simulate metric updates
      // In a real implementation, this would query the OCPP client for current metrics
      
      const sessionData = await this.cache.getSession(sessionId);
      if (!sessionData) return;

      // Check if session is still active
      if (!['starting', 'charging', 'charging_paused'].includes(sessionData.status)) {
        await this.stopSessionMonitoring(sessionId);
        return;
      }

      // Simulate power and energy updates
      const mockMetrics = {
        energyDeliveredKwh: (sessionData.energyDeliveredKwh || 0) + 0.05, // Add 0.05 kWh
        currentPowerKw: 22.0 + Math.random() * 5, // Simulate power variation
        voltageVolts: 230.0 + Math.random() * 20,
        temperatureCelsius: 25.0 + Math.random() * 10
      };

      await this.broadcastChargingProgress(sessionId, mockMetrics);

    } catch (error) {
      logger.error(`Failed to update metrics for session ${sessionId}:`, error);
    }
  }

  /**
   * Get active monitoring sessions
   */
  async getActiveMonitoringSessions(): Promise<string[]> {
    try {
      return await this.cache.getAllMonitoringSessions();
    } catch (error) {
      logger.error('Failed to get active monitoring sessions:', error);
      return [];
    }
  }

  /**
   * Get connection statistics
   */
  getConnectionStats(): any {
    if (!this.io) return null;

    const rooms = Array.from(this.io.sockets.adapter.rooms.keys());
    const chargingSubscriptions = rooms.filter(room => 
      room.startsWith('charging_') || 
      room.startsWith('station_charging_') || 
      room.startsWith('user_charging_')
    );

    return {
      totalConnections: this.io.sockets.size,
      chargingSubscriptions: chargingSubscriptions.length,
      activeRooms: chargingSubscriptions,
      timestamp: new Date().toISOString()
    };
  }
}

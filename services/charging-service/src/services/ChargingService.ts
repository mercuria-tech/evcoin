import { Knex } from 'knex';
import { 
  ChargingSession,
  ChargingSessionRequest,
  ChargingSessionStatus,
  StartChargingRequest,
  StopChargingRequest,
  ChargingSessionUpdate,
  ChargingSessionSummary,
  ChargingHistoryResponse,
  ChargingSummary,
  OCPPStartTransactionRequest,
  OCPPStopTransactionRequest,
  ChargingSessionSummary
} from '@ev-charging/shared-types';
import { logger } from '../utils/logger';
import { DatabaseService } from '../services/DatabaseService';
import { OCPPClient } from '../services/OCPPClient';
import { RealTimeChargingService } from '../services/RealTimeChargingService';
import { CacheService } from '../services/CacheService';

export class ChargingService {
  private db: Knex;
  private ocppClient: OCPPClient;
  private realtimeService: RealTimeChargingService;
  private cache: CacheService;

  constructor() {
    this.db = DatabaseService.getConnection();
    this.ocppClient = new OCPPClient();
    this.realtimeService = new RealTimeChargingService();
    this.cache = new CacheService();
  }

  /**
   * Start charging session
   */
  async startChargingSession(request: StartChargingRequest): Promise<ChargingSession> {
    try {
      // Check if connector is available
      const connectorAvailability = await this.checkConnectorAvailability(
        request.stationId, 
        request.connectorId
      );

      if (!connectorAvailability.available) {
        throw new Error(`Connector ${request.connectorId} is not available`);
      }

      // Check if user has active session
      const existingSession = await this.getActiveSessionForUser(request.userId);
      if (existingSession) {
        throw new Error('User already has an active charging session');
      }

      // Authorize user with OCPP if required
      if (request.authorizationToken) {
        const authResult = await this.ocppClient.authorize(
          request.stationId,
          request.authorizationToken
        );

        if (authResult.status !== 'accepted') {
          throw new Error(`Authorization failed: ${authResult.status}`);
        }
      }

      // Create charging session
      const sessionId = `session_${Date.now()}_${request.userId}`;
      const chargingSession: ChargingSession = {
        id: sessionId,
        userId: request.userId,
        vehicleId: request.vehicleId,
        stationId: request.stationId,
        connectorId: request.connectorId,
        status: ChargingSessionStatus.INITIATING,
        startMethod: request.startMethod,
        startedAt: new Date(),
        chargingProfile: request.chargingProfile,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save session to database
      await this.db('charging_sessions').insert({
        id: chargingSession.id,
        user_id: chargingSession.userId,
        vehicle_id: chargingSession.vehicleId,
        station_id: chargingSession.stationId,
        connector_id: chargingSession.connectorId,
        status: chargingSession.status,
        start_method: chargingSession.startMethod,
        started_at: chargingSession.startedAt,
        charging_profile: JSON.stringify(chargingSession.chargingProfile),
        created_at: chargingSession.createdAt,
        updated_at: chargingSession.updatedAt
      });

      // Send OCPP StartTransaction request
      const ocppRequest: OCPPStartTransactionRequest = {
        connectorId: parseInt(request.connectorId),
        idTag: request.authorizationToken,
        meterStart: 0,
        timestamp: new Date()
      };

      const ocppResponse = await this.ocppClient.startTransaction(
        request.stationId,
        ocppRequest
      );

      // Update session with OCPP transaction ID
      await this.db('charging_sessions')
        .where({ id: sessionId })
        .update({
          status: ChargingSessionStatus.STARTING,
          ocpp_transaction_id: ocppResponse.transactionId,
          updated_at: new Date()
        });

      // Start real-time monitoring
      await this.realtimeService.startSessionMonitoring(sessionId);

      // Cache session for quick access
      await this.cache.setSession(sessionId, {
        ...chargingSession,
        status: ChargingSessionStatus.STARTING,
        ocppTransactionId: ocppResponse.transactionId
      });

      logger.info({
        sessionId,
        userId: request.userId,
        stationId: request.stationId,
        connectorId: request.connectorId
      }, 'Charging session started');

      return chargingSession;

    } catch (error) {
      logger.error('Failed to start charging session:', error);
      throw error;
    }
  }

  /**
   * Stop charging session
   */
  async stopChargingSession(request: StopChargingRequest): Promise<ChargingSessionSummary> {
    try {
      const session = await this.getChargingSessionById(request.sessionId);
      if (!session) {
        throw new Error('Charging session not found');
      }

      if (session.status === ChargingSessionStatus.COMPLETED) {
        throw new Error('Charging session already completed');
      }

      // Get current meter reading from OCPP
      const currentMeter = await this.ocppClient.getMeterValue(
        session.stationId,
        session.connectorId
      );

      // Send OCPP StopTransaction request
      const ocppRequest: OCPPStopTransactionRequest = {
        transactionId: session.ocppTransactionId || parseInt(session.id.split('_')[1]),
        meterStop: currentMeter,
        timestamp: new Date(),
        reason: request.reason
      };

      const ocppResponse = await this.ocppClient.stopTransaction(
        session.stationId,
        ocppRequest
      );

      // Calculate final session metrics
      const sessionMetrics = await this.calculateSessionMetrics(session);

      // Update session status
      await this.db('charging_sessions')
        .where({ id: request.sessionId })
        .update({
          status: ChargingSessionStatus.COMPLETED,
          ended_at: new Date(),
          energy_delivered_kwh: sessionMetrics.energyDeliveredKwh,
          duration_seconds: sessionMetrics.durationSeconds,
          max_power_kw: sessionMetrics.maxPowerKw,
          avg_power_kw: sessionMetrics.avgPowerKw,
          cost_amount: sessionMetrics.costAmount,
          updated_at: new Date()
        });

      // Stop real-time monitoring
      await this.realtimeService.stopSessionMonitoring(request.sessionId);

      // Generate session summary
      const sessionSummary = await this.generateSessionSummary(request.sessionId);

      // Clear cache
      await this.cache.removeSession(request.sessionId);

      logger.info({
        sessionId: request.sessionId,
        reason: request.reason,
        energyDeliveredKwh: sessionMetrics.energyDeliveredKwh,
        durationSeconds: sessionMetrics.durationSeconds
      }, 'Charging session stopped');

      return sessionSummary;

    } catch (error) {
      logger.error('Failed to stop charging session:', error);
      throw error;
    }
  }

  /**
   * Update charging session with real-time data
   */
  async updateChargingSession(update: ChargingSessionUpdate): Promise<void> {
    try {
      await this.db('charging_sessions')
        .where({ id: update.sessionId })
        .update({
          status: update.status,
          error_code: update.errorCode,
          error_message: update.errorMessage,
          energy_delivered_kwh: update.energyDeliveredKwh,
          current_power_kw: update.currentPowerKw,
          voltage_volts: update.voltageVolts,
          temperature_celsius: update.temperatureCelsius,
          cost_amount: update.costAmount,
          updated_at: new Date()
        });

      // Update cache if session exists
      const cachedSession = await this.cache.getSession(update.sessionId);
      if (cachedSession) {
        await this.cache.setSession(update.sessionId, {
          ...cachedSession,
          ...update,
          updatedAt: new Date()
        });
      }

      // Broadcast update to connected clients
      await this.realtimeService.broadcastSessionUpdate(update);

      logger.debug({
        sessionId: update.sessionId,
        status: update.status,
        energyDeliveredKwh: update.energyDeliveredKwh,
        currentPowerKw: update.currentPowerKw
      }, 'Charging session updated');

    } catch (error) {
      logger.error('Failed to update charging session:', error);
      throw error;
    }
  }

  /**
   * Get charging session by ID
   */
  async getChargingSessionById(sessionId: string): Promise<ChargingSession | null> {
    try {
      // Try cache first
      const cachedSession = await this.cache.getSession(sessionId);
      if (cachedSession) {
        return cachedSession;
      }

      // Query database
      const session = await this.db('charging_sessions')
        .where({ id: sessionId })
        .first();

      if (!session) {
        return null;
      }

      return this.mapDbSessionToChargingSession(session);

    } catch (error) {
      logger.error('Failed to get charging session:', error);
      throw error;
    }
  }

  /**
   * Get user's charging history
   */
  async getChargingHistory(
    userId: string,
    limit: number = 50,
    offset: number = 0,
    filters?: any
  ): Promise<ChargingHistoryResponse> {
    try {
      let query = this.db('charging_sessions as cs')
        .leftJoin('stations as s', 'cs.station_id', 's.id')
        .leftJoin('connectors as c', 'cs.connector_id', 'c.id')
        .leftJoin('vehicles as v', 'cs.vehicle_id', 'v.id')
        .where('cs.user_id', userId);

      // Apply filters
      if (filters?.startDate) {
        query = query.where('cs.started_at', '>=', filters.startDate);
      }
      if (filters?.endDate) {
        query = query.where('cs.started_at', '<=', filters.endDate);
      }
      if (filters?.stationId) {
        query = query.where('cs.station_id', filters.stationId);
      }
      if (filters?.vehicleId) {
        query = query.where('cs.vehicle_id', filters.vehicleId);
      }
      if (filters?.status) {
        query = query.where('cs.status', filters.status);
      }

      // Get total count
      const countQuery = query.clone();
      const [{ count }] = await countQuery.count('cs.id as count');

      // Apply pagination and sort
      const sessions = await query
        .select(
          'cs.*',
          's.name as station_name',
          's.latitude as station_latitude',
          's.longitude as station_longitude',
          'c.connector_number',
          'c.connector_type',
          'c.power_kw',
          'v.make as vehicle_make',
          'v.model as vehicle_model',
          'v.battery_capacity_kwh'
        )
        .orderBy('cs.started_at', 'desc')
        .limit(limit)
        .offset(offset);

      // Generate session summaries
      const sessionSummaries = await Promise.all(
        sessions.map(session => this.createSessionSummaryFromDb(session))
      );

      // Calculate summary statistics
      const summary = await this.calculateChargingSummary(userId, filters);

      return {
        sessions: sessionSummaries,
        total: parseInt(count as string),
        limit,
        offset,
        summary
      };

    } catch (error) {
      logger.error('Failed to get charging history:', error);
      throw error;
    }
  }

  /**
   * Get active charging session for user
   */
  async getActiveSessionForUser(userId: string): Promise<ChargingSession | null> {
    try {
      const session = await this.db('charging_sessions')
        .where({
          user_id: userId,
          status: [
            ChargingSessionStatus.INITIATING,
            ChargingSessionStatus.STARTING,
            ChargingSessionStatus.CHARGING,
            ChargingSessionStatus.CHARGING_PAUSED
          ]
        })
        .orderBy('started_at', 'desc')
        .first();

      return session ? this.mapDbSessionToChargingSession(session) : null;

    } catch (error) {
      logger.error('Failed to get active session:', error);
      throw error;
    }
  }

  /**
   * Private helper methods
   */
  private async checkConnectorAvailability(stationId: string, connectorId: string): Promise<{ available: boolean; reason?: string }> {
    try {
      const connector = await this.db('connectors')
        .where({ station_id: stationId, id: connectorId })
        .first();

      if (!connector) {
        return { available: false, reason: 'Connector not found' };
      }

      if (connector.status !== 'available') {
        return { available: false, reason: `Connector status: ${connector.status}` };
      }

      // Check for active sessions
      const activeSession = await this.db('charging_sessions')
        .where({
          station_id: stationId,
          connector_id: connectorId,
          status: [
            ChargingSessionStatus.INITIATING,
            ChargingSessionStatus.STARTING,
            ChargingSessionStatus.CHARGING,
            ChargingSessionStatus.CHARGING_PAUSED
          ]
        })
        .first();

      if (activeSession) {
        return { available: false, reason: 'Connector already in use' };
      }

      return { available: true };

    } catch (error) {
      logger.error('Failed to check connector availability:', error);
      return { available: false, reason: 'Database error' };
    }
  }

  private async calculateSessionMetrics(session: ChargingSession): Promise<{
    energyDeliveredKwh: number;
    durationSeconds: number;
    maxPowerKw: number;
    avgPowerKw: number;
    costAmount: number;
  }> {
    // In a real implementation, this would calculate from actual charging data
    // For now, return mock calculations
    const durationHours = 2; // Mock duration
    const energyDelivered = 25; // Mock energy in kWh
    const maxPower = 22; // Mock max power in kW

    return {
      energyDeliveredKwh: energyDelivered,
      durationSeconds: durationHours * 3600,
      maxPowerKw: maxPower,
      avgPowerKw: energyDelivered / durationHours,
      costAmount: energyDelivered * 0.35 // Mock cost calculation
    };
  }

  private async generateSessionSummary(sessionId: string): Promise<ChargingSessionSummary> {
    // Implementation would fetch session data and generate comprehensive summary
    // For now, return mock data
    return {
      sessionId,
      userId: 'mock_user_id',
      stationInfo: {
        id: 'mock_station_id',
        name: 'Mock Station',
        location: { latitude: 0, longitude: 0 },
        operator: 'Mock Operator'
      },
      sessionDetails: {
        startedAt: new Date(),
        endedAt: new Date(),
        durationSeconds: 7200,
        energyDeliveredKwh: 25,
        maxPowerKw: 22,
        avgPowerKw: 12.5
      },
      costBreakdown: {
        energyCost: 8.75,
        timeCost: 0,
        serviceFee: 1.25,
        taxes: 1.00,
        totalCost: 11.00,
        currency: 'USD'
      },
      chargingProfile: {},
      performanceMetrics: {
        efficiency: 12.5,
        chargeQuality: 'excellent',
        connectorReliability: 'excellent'
      }
    };
  }

  private mapDbSessionToChargingSession(dbSession: any): ChargingSession {
    return {
      id: dbSession.id,
      userId: dbSession.user_id,
      vehicleId: dbSession.vehicle_id,
      stationId: dbSession.station_id,
      connectorId: dbSession.connector_id,
      status: dbSession.status as ChargingSessionStatus,
      startMethod: dbSession.start_method,
      startedAt: dbSession.started_at,
      endedAt: dbSession.ended_at,
      durationSeconds: dbSession.duration_seconds,
      energyDeliveredKwh: dbSession.energy_delivered_kwh,
      maxPowerKw: dbSession.max_power_kw,
      avgPowerKw: dbSession.avg_power_kw,
      costAmount: dbSession.cost_amount,
      costCurrency: dbSession.cost_currency,
      paymentMethodId: dbSession.payment_method_id,
      transactionId: dbSession.transaction_id,
      errorCode: dbSession.error_code,
      errorMessage: dbSession.error_message,
      chargingProfile: dbSession.charging_profile ? JSON.parse(dbSession.charging_profile) : undefined,
      createdAt: dbSession.created_at,
      updatedAt: dbSession.updated_at
    };
  }

  private async createSessionSummaryFromDb(dbSession: any): Promise<ChargingSessionSummary> {
    // Convert database session to summary format
    // Implementation would format the data appropriately
    return {
      sessionId: dbSession.id,
      userId: dbSession.user_id,
      stationInfo: {
        id: dbSession.station_id,
        name: dbSession.station_name,
        location: {
          latitude: parseFloat(dbSession.station_latitude),
          longitude: parseFloat(dbSession.station_longitude)
        },
        operator: 'Mock Operator'
      },
      sessionDetails: {
        startedAt: dbSession.started_at,
        endedAt: dbSession.ended_at,
        durationSeconds: dbSession.duration_seconds,
        energyDeliveredKwh: dbSession.energy_delivered_kwh,
        maxPowerKw: dbSession.max_power_kw,
        avgPowerKw: dbSession.avg_power_kw
      },
      costBreakdown: {
        energyCost: dbSession.cost_amount || 0,
        timeCost: 0,
        serviceFee: 1.25,
        taxes: 1.00,
        totalCost: (dbSession.cost_amount || 0) + 2.25,
        currency: dbSession.cost_currency || 'USD'
      },
      chargingProfile: dbSession.charging_profile ? JSON.parse(dbSession.charging_profile) : {},
      performanceMetrics: {
        efficiency: dbSession.avg_power_kw || 0,
        chargeQuality: 'good',
        connectorReliability: 'good'
      }
    };
  }

  private async calculateChargingSummary(userId: string, filters?: any): Promise<ChargingSummary> {
    // Implementation would calculate comprehensive summary statistics
    // For now, return mock data
    return {
      totalSessions: 0,
      totalEnergyKwh: 0,
      totalDurationHours: 0,
      averageSessionDuration: 0,
      averagePowerKw: 0,
      totalCost: 0,
      currency: 'USD',
      averageCostPerKwh: 0,
      successRate: 100
    };
  }
}

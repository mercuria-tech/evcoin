import { Knex } from 'knex';
import { 
  Reservation,
  ReservationStatus,
  CreateReservationRequest,
  ReservationSearchRequest,
  ReservationSearchResponse,
  AvailabilitySlot,
  ReservationModificationRequest,
  ReservationModificationResult,
  CheckInMethod,
  ReservationCheckInRequest,
  ReservationCheckInResult,
  BulkReservationRequest,
  BulkReservationResult,
  RecurringFrequency,
  WaitListOption,
  AvailabilityConflict
} from '@ev-charging/shared-types';
import { logger } from '../utils/logger';
import { DatabaseService } from '../services/DatabaseService';
import { CacheService } from '../services/CacheService';
import { NotificationService } from '../services/NotificationService';
import { PricingService } from '../services/PricingService';
import moment from 'moment-timezone';

export class ReservationService {
  private db: Knex;
  private cache: CacheService;
  private notificationService: NotificationService;
  private pricingService: PricingService;

  constructor() {
    this.db = DatabaseService.getConnection();
    this.cache = new CacheService();
    this.notificationService = new NotificationService();
    this.pricingService = new PricingService();
  }

  /**
   * Search for available reservation slots
   */
  async searchAvailability(request: ReservationSearchRequest): Promise<ReservationSearchResponse> {
    try {
      const { startTime, endTime, stationIds, connectorTypes, maxResults = 50 } = request;

      logger.info({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        requestedStations: stationIds?.length || 0,
        connectorTypes: connectorTypes?.length || 0
      }, 'Searching for reservation availability');

      // Get available stations
      let stationQuery = this.db('stations as s')
        .leftJoin('operators as o', 's.operator_id', 'o.id')
        .where('s.status', 'active');

      if (stationIds && stationIds.length > 0) {
        stationQuery = stationQuery.whereIn('s.id', stationIds);
      }

      // Apply location-based filtering
      if (request.latitude && request.longitude && request.radius) {
        stationQuery = stationQuery.whereRaw(`
          ST_DWithin(
            ST_MakePoint(?, ?),
            ST_MakePoint(s.longitude, s.latitude),
            ?
          )
        `, [request.longitude, request.latitude, request.radius * 1000]);
      }

      const stations = await stationQuery.select(
        's.id as station_id',
        's.name as station_name',
        's.address_street',
        's.address_city',
        's.address_state',
        's.address_zip',
        's.latitude',
        's.longitude',
        's.amenities',
        's.rating',
        request.latitude && request.longitude ? this.db.raw(`
          ST_Distance(
            ST_MakePoint(?, ?),
            ST_MakePoint(s.longitude, s.latitude)
          ) * 0.001 as distance_km,
        `, [request.longitude, request.latitude]) : null,
        'o.name as operator_name'
      );

      const availableSlots: AvailabilitySlot[] = [];
      const waitListOptions: WaitListOption[] = [];

      // Process each station for availability
      for (const station of stations) {
        const stationSlots = await this.checkStationAvailability(
          station.station_id,
          station,
          startTime,
          endTime,
          connectorTypes
        );

        availableSlots.push(...stationSlots.filter(slot => slot !== null));

        // Check for wait list options if no immediate availability
        if (stationSlots.length === 0) {
          const waitList = await this.getWaitListOptions(
            station.station_id,
            startTime,
            endTime,
            connectorTypes
          );
          waitListOptions.push(...waitList);
        }
      }

      // Sort by distance and rating
      const sortedSlots = availableSlots.sort((a, b) => {
        // Prioritize nearby stations first
        if (a.stationInfo.distanceKm && b.stationInfo.distanceKm) {
          const distanceDiff = a.stationInfo.distanceKm - b.stationInfo.distanceKm;
          if (Math.abs(distanceDiff) > 0.1) { // more than 100m difference
            return distanceDiff;
          }
        }
        
        // Then by rating
        return b.stationInfo.rating - a.stationInfo.rating;
      });

      // Limit results
      const limitedResults = sortedSlots.slice(0, maxResults);

      // Get pricing for slots
      const slotsWithPricing = await Promise.all(
        limitedResults.map(slot => this.enrichSlotWithPricing(slot))
      );

      const recommendations = await this.getRecommendedSlots(
        slotsWithPricing,
        request.preferences
      );

      const response: ReservationSearchResponse = {
        availableSlots: slotsWithPricing,
        waitListOptions: waitListOptions.length > 0 ? waitListOptions : undefined,
        recommendedSlots: recommendations,
        totalResults: slotsWithPricing.length,
        searchResultsExpiry: moment().add(15, 'minutes').toDate()
      };

      logger.info({
        totalSlots: availableSlots.length,
        recommendedSlots: recommendations.length,
        waitListOptions: waitListOptions.length
      }, 'Availability search completed');

      return response;

    } catch (error) {
      logger.error('Failed to search availability:', error);
      throw error;
    }
  }

  /**
   * Create a new reservation
   */
  async createReservation(request: CreateReservationRequest): Promise<Reservation> {
    try {
      logger.info({
        userId: request.userId,
        stationId: request.stationId,
        connectorId: request.connectorId,
        startTime: request.startTime.toISOString(),
        endTime: request.endTime.toISOString()
      }, 'Creating new reservation');

      // Validate availability
      const availabilityCheck = await this.checkSlotAvailability(
        request.stationId,
        request.connectorId,
        request.startTime,
        request.endTime
      );

      if (!availabilityCheck.available) {
        throw new Error(`Slot not available: ${availabilityCheck.reason}`);
      }

      // Calculate pricing
      const pricing = await this.pricingService.calculateReservationPrice(
        request.stationId,
        request.connectorId,
        request.startTime,
        request.endTime
      );

      // Check for conflicts
      const conflicts = await this.checkConflicts(
        request.stationId,
        request.connectorId,
        request.startTime,
        request.endTime,
        request.userId
      );

      if (conflicts.length > 0) {
        throw new Error('Reservation conflicts detected');
      }

      // Create reservation ID
      const reservationId = `res_${Date.now()}_${request.userId}`;

      // Create reservation record
      const reservation: Reservation = {
        id: reservationId,
        userId: request.userId,
        stationId: request.stationId,
        connectorId: request.connectorId,
        vehicleId: request.vehicleId,
        startTime: request.startTime,
        endTime: request.endTime,
        status: ReservationStatus.CONFIRMED,
        reservationFee: pricing.totalCost,
        currency: pricing.currency,
        gracePeriodMinutes: 10,
        bookingMethod: request.bookingMethod,
        specialRequests: request.specialRequests,
        recurringPattern: request.recurringPattern,
        reminderSent: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Save to database
      await this.db('reservations').insert({
        id: reservation.id,
        user_id: reservation.userId,
        station_id: reservation.stationId,
        connector_id: reservation.connectorId,
        vehicle_id: reservation.vehicleId,
        start_time: reservation.startTime,
        end_time: reservation.endTime,
        status: reservation.status,
        reservation_fee: reservation.reservationFee,
        currency: reservation.currency,
        grace_period_minutes: reservation.gracePeriodMinutes,
        booking_method: reservation.bookingMethod,
        special_requests: reservation.specialRequests,
        recurring_pattern: reservation.recurringPattern ? JSON.stringify(reservation.recurringPattern) : null,
        reminder_sent: reservation.reminderSent,
        created_at: reservation.createdAt,
        updated_at: reservation.updatedAt
      });

      // Cache reservation for quick access
      await this.cache.setReservation(reservationId, reservation);

      // Schedule notifications
      await this.notificationService.scheduleReservationNotifications(reservation);

      // Schedule recurring reservations if pattern specified
      if (request.recurringPattern) {
        await this.createRecurringReservations(reservation, request.recurringPattern);
      }

      logger.info({
        reservationId,
        userId: request.userId,
        fee: pricing.totalCost,
        currency: pricing.currency
      }, 'Reservation created successfully');

      return reservation;

    } catch (error) {
      logger.error('Failed to create reservation:', error);
      throw error;
    }
  }

  /**
   * Modify existing reservation
   */
  async modifyReservation(request: ReservationModificationRequest): Promise<ReservationModificationResult> {
    try {
      const reservation = await this.getReservationById(request.reservationId);
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      if (reservation.status !== ReservationStatus.CONFIRMED) {
        throw new Error('Only confirmed reservations can be modified');
      }

      // Check if modification is within allowed time window
      const modificationAllowed = this.canModifyReservation(reservation);
      if (!modificationAllowed.allowed) {
        throw new Error(modificationAllowed.reason);
      }

      // Check new time slot availability
      const newStartTime = request.newStartTime || reservation.startTime;
      const newEndTime = request.newEndTime || reservation.endTime;
      const newStationId = request.newStationId || reservation.stationId;
      const newConnectorId = request.newConnectorId || reservation.connectorId;

      if (newStartTime !== reservation.startTime || 
          newEndTime !== reservation.endTime || 
          newStationId !== reservation.stationId || 
          newConnectorId !== reservation.connectorId) {

        const availabilityCheck = await this.checkSlotAvailability(
          newStationId,
          newConnectorId,
          newStartTime,
          newEndTime
        );

        if (!availabilityCheck.available) {
          throw new Error(`New time slot not available: ${availabilityCheck.reason}`);
        }
      }

      // Calculate modifications impact
      const modificationImpact = await this.calculateModificationImpact(
        reservation,
        request.newStartTime,
        request.newEndTime,
        request.newStationId,
        request.newConnectorId
      );

      // Perform modification if allowed
      const modifiedReservation = await this.performReservationModification(
        reservation,
        request
      );

      // Handle payment adjustments
      await this.handleModificationPayment(
        reservation,
        modifiedReservation,
        modificationImpact
      );

      logger.info({
        reservationId: request.reservationId,
        modifications: request,
        additionalFees: modificationImpact.additionalFee
      }, 'Reservation modified successfully');

      return {
        success: true,
        originalReservation: reservation,
        modifiedReservation,
        newFees: modificationImpact.additionalFee ? {
          additionalFee: modificationImpact.additionalFee,
          refundAmount: modificationImpact.refundAmount,
          currency: reservation.currency,
          reason: modificationImpact.reason
        } : undefined,
        message: 'Reservation modified successfully'
      };

    } catch (error) {
      logger.error('Failed to modify reservation:', error);
      return {
        success: false,
        conflicts: [],
        message: error.message
      };
    }
  }

  /**
   * Cancel reservation
   */
  async cancelReservation(
    reservationId: string,
    userId: string,
    reason: string
  ): Promise<{ success: boolean; refundAmount?: number; message: string }> {
    try {
      const reservation = await this.getReservationById(reservationId);
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      if (reservation.userId !== userId) {
        throw new Error('Not authorized to cancel this reservation');
      }

      // Check cancellation policy
      const cancellationPolicy = await this.getCancellationPolicy(reservation);
      const refundCalculation = await this.calculateCancellationRefund(
        reservation,
        cancellationPolicy
      );

      // Update reservation status
      await this.db('reservations')
        .where({ id: reservationId })
        .update({
          status: ReservationStatus.CANCELLED,
          cancelled_at: new Date(),
          cancellation_reason: reason,
          updated_at: new Date()
        });

      // Cancel associated notifications
      await this.notificationService.cancelReservationNotifications(reservationId);

      // Cancel recurring reservations if applicable
      if (reservation.recurringPattern) {
        await this.cancelRecurringReservations(reservation);
      }

      // Process refund if applicable
      if (refundCalculation.refundAmount > 0) {
        await this.processCancellationRefund(reservation, refundCalculation.refundAmount);
      }

      logger.info({
        reservationId,
        userId,
        reason,
        refundAmount: refundCalculation.refundAmount,
        cancellationPolicy: cancellationPolicy.name
      }, 'Reservation cancelled');

      return {
        success: true,
        refundAmount: refundCalculation.refundAmount,
        message: `Reservation cancelled. ${refundCalculation.refundAmount > 0 ? 
          `Refund of ${refundCalculation.refundAmount} ${reservation.currency} will be processed.` : 
          'No refund applicable per cancellation policy.'}`
      };

    } catch (error) {
      logger.error('Failed to cancel reservation:', error);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * Check in for reservation
   */
  async checkInReservation(request: ReservationCheckInRequest): Promise<ReservationCheckInResult> {
    try {
      const reservation = await this.getReservationById(request.reservationId);
      if (!reservation) {
        throw new Error('Reservation not found');
      }

      // Validate check-in authorization
      if (reservation.userId !== request.userId || 
          reservation.stationId !== request.stationId ||
          reservation.connectorId !== request.connectorId) {
        throw new Error('Invalid check-in parameters');
      }

      const checkINTime = new Date();
      const isLateCheckIn = checkInTime > reservation.startTime;
      const lateByMinutes = isLateCheckIn ? 
        Math.floor((checkInTime.getTime() - reservation.startTime.getTime()) / (1000 * 60)) : 0;

      // Check grace period
      let penaltyFeeApplied = 0;
      if (lateByMinutes > reservation.gracePeriodMinutes) {
        penaltyFeeApplied = await this.calculateLateCheckInPenalty(reservation, lateByMinutes);
      }

      // Update reservation status
      await this.db('reservations')
        .where({ id: request.reservationId })
        .update({
          status: ReservationStatus.CHECKED_IN,
          check_in_time: checkInTime,
          updated_at: new Date()
        });

      // Start charging session if auto-start enabled
      let sessionId: string | undefined;
      if (reservation.preferences?.autoCheckIn) {
        sessionId = await this.startChargingSessionFromReservation(reservation);
      }

      logger.info({
        reservationId: request.reservationId,
        userId: request.userId,
        checkInTime: checkInTime.toISOString(),
        lateByMinutes,
        penaltyFeeApplied,
        sessionId
      }, 'User checked in for reservation');

      return {
        success: true,
        sessionId,
        status: ReservationStatus.CHECKED_IN,
        lateCheckIn: isLateCheckIn,
        lateByMinutes: isLateCheckIn ? lateByMinutes : undefined,
        penaltyFeeApplied,
        message: isLateCheckIn ? 
          `Check-in completed ${lateByMinutes} minutes late. ${penaltyFeeApplied > 0 ? 
            `Late fee of ${penaltyFeeApplied} ${reservation.currency} applied.` : 
            'Continue within grace period.'}` :
          'Check-in completed successfully'
      };

    } catch (error) {
      logger.error('Failed to check in for reservation:', error);
      return {
        success: false,
        status: ReservationStatus.CONFIRMED,
        lateCheckIn: false,
        message: error.message
      };
    }
  }

  /**
   * Private helper methods
   */
  private async checkStationAvailability(
    stationId: string,
    station: any,
    startTime: Date,
    endTime: Date,
    connectorTypes?: string[]
  ): Promise<AvailabilitySlot[]> {
    // Implementation would check connector availability for this time slot
    // For now, return mock data
    return [];
  }

  private async checkSlotAvailability(
    stationId: string,
    connectorId: string,
    startTime: Date,
    endTime: Date
  ): Promise<{ available: boolean; reason?: string }> {
    try {
      // Check for existing reservations
      const conflicts = await this.db('reservations')
        .where({
          station_id: stationId,
          connector_id: connectorId,
          status: ['confirmed', 'checked_in', 'in_progress']
        })
        .where(function() {
          this.where('start_time', '<=', endTime)
            .where('end_time', '>=', startTime);
        })
        .first();

      if (conflicts) {
        return { 
          available: false, 
          reason: `Time slot occupied by reservation ${conflicts.id}` 
        };
      }

      // Check connector status
      const connector = await this.db('connectors')
        .where({ station_id: stationId, id: connectorId })
        .first();

      if (!connector || connector.status !== 'available') {
        return { 
          available: false, 
          reason: `Connector ${connectorId} not available` 
        };
      }

      return { available: true };

    } catch (error) {
        return { available: false, reason: 'Database error' };
    }
  }

  private async enrichSlotWithPricing(slot: AvailabilitySlot): Promise<AvailabilitySlot> {
    // Implementation would fetch actual pricing
    return {
      ...slot,
      pricing: {
        reservationFee: 5.00,
        energyRate: 0.35,
        timeRate: 0.05,
        currency: 'USD'
      }
    };
  }

  private async getRecommendedSlots(
    availableSlots: AvailabilitySlot[],
    preferences?: any
  ): Promise<AvailabilitySlot[]> {
    // Implementation would apply user preferences and ranking
    return availableSlots.slice(0, 3); // Return top 3 recommendations
  }

  private canModifyReservation(reservation: Reservation): { allowed: boolean; reason?: string } {
    const timeUntilStart = reservation.startTime.getTime() - Date.now();
    const hoursUntilStart = timeUntilStart / (1000 * 60 * 60);

    if (hoursUntilStart < 2) {
      return { allowed: false, reason: 'Cannot modify reservation within 2 hours of start time' };
    }

    if (reservation.status !== ReservationStatus.CONFIRMED) {
      return { allowed: false, reason: 'Only confirmed reservations can be modified' };
    }

    return { allowed: true };
  }

  private async calculateModificationImpact(
    reservation: Reservation,
    newStartTime?: Date,
    newEndTime?: Date,
    newStationId?: string,
    newConnectorId?: string
  ): Promise<{
    additionalFee: number;
    refundAmount: number;
    reason: string;
  }> {
    // Implementation would calculate price differences
    return {
      additionalFee: 0,
      refundAmount: 0,
      reason: 'No price change'
    };
  }

  private async performReservationModification(
    reservation: Reservation,
    request: ReservationModificationRequest
  ): Promise<Reservation> {
    const updates: any = {};

    if (request.newStartTime) updates.start_time = request.newStartTime;
    if (request.newEndTime) updates.end_time = request.newEndTime;
    if (request.newStationId) updates.station_id = request.newStationId;
    if (request.newConnectorId) updates.connector_id = request.newConnectorId;

    updates.updated_at = new Date();

    await this.db('reservations')
      .where({ id: request.reservationId })
      .update(updates);

    // Return updated reservation
    return await this.getReservationById(request.reservationId)!;
  }

  // Additional helper methods would be implemented here...
  
  private async getWaitListOptions(
    stationId: string,
    startTime: Date,
    endTime: Date,
    connectorTypes?: string[]
  ): Promise<WaitListOption[]> {
    // Implementation would calculate wait list options
    return [];
  }

  private async getCancellationPolicy(reservation: Reservation): Promise<any> {
    // Implementation would fetch cancellation policy
    return { name: 'Standard Policy', refundPercentage: 80 };
  }

  private async calculateCancellationRefund(
    reservation: Reservation,
    policy: any
  ): Promise<{ refundAmount: number }> {
    const hoursUntilStart = (reservation.startTime.getTime() - Date.now()) / (1000 * 60 * 60);
    const refundPercentage = hoursUntilStart > 24 ? policy.refundPercentage : 
                             hoursUntilStart > 2 ? 50 : 0;

    return {
      refundAmount: reservation.reservationFee * (refundPercentage / 100)
    };
  }

  private async processCancellationRefund(
    reservation: Reservation,
    refundAmount: number
  ): Promise<void> {
    // Implementation would process refund via payment service
    logger.info(`Processing refund of ${refundAmount} ${reservation.currency} for reservation ${reservation.id}`);
  }

  private async calculateLateCheckInPenalty(
    reservation: Reservation,
    lateByMinutes: number
  ): Promise<number> {
    // Charge $1 per minute late beyond grace period
    const penaltyRate = 1.0;
    return Math.max(0, lateByMinutes - reservation.gracePeriodMinutes) * penaltyRate;
  }

  private async startChargingSessionFromReservation(reservation: Reservation): Promise<string> {
    // Implementation would initiate charging session
    return `session_${Date.now()}`;
  }

  private async createRecurringReservations(
    reservation: Reservation,
    pattern: any
  ): Promise<void> {
    // Implementation would create recurring reservations based on pattern
    logger.info(`Creating recurring reservations for pattern: ${pattern.frequency}`);
  }

  private async cancelRecurringReservations(reservation: Reservation): Promise<void> {
    // Implementation would cancel all future recurrences
    logger.info(`Cancelling recurring reservations for ${reservation.id}`);
  }

  private async handleModificationPayment(
    originalReservation: Reservation,
    modifiedReservation: Reservation,
    impact: any
  ): Promise<void> {
    // Implementation would do payment adjustment
    logger.info('Processing modification payment adjustment');
  }

  private async checkConflicts(
    stationId: string,
    connectorId: string,
    startTime: Date,
    endTime: Date,
    userId: string
  ): Promise<AvailabilityConflict[]> {
    // Implementation would check for user conflicts
    return [];
  }

  // Public getter methods
  async getReservationById(reservationId: string): Promise<Reservation | null> {
    try {
      // Try cache first
      const cachedReservation = await this.cache.getReservation(reservationId);
      if (cachedReservation) {
        return cachedReservation;
      }

      // Query database
      const reservation = await this.db('reservations')
        .where({ id: reservationId })
        .first();

      return reservation ? this.mapDbReservationToReservation(reservation) : null;

    } catch (error) {
      logger.error(`Failed to get reservation ${reservationId}:`, error);
      return null;
    }
  }

  private mapDbReservationToReservation(dbReservation: any): Reservation {
    return {
      id: dbReservation.id,
      userId: dbReservation.user_id,
      stationId: dbReservation.station_id,
      connectorId: dbReservation.connector_id,
      vehicleId: dbReservation.vehicle_id,
      startTime: dbReservation.start_time,
      endTime: dbReservation.end_time,
      status: dbReservation.status as ReservationStatus,
      reservationFee: dbReservation.reservation_fee,
      currency: dbReservation.currency,
      gracePeriodMinutes: dbReservation.grace_period_minutes,
      checkInTime: dbReservation.check_in_time,
      cancelledAt: dbReservation.cancelled_at,
      cancellationReason: dbReservation.cancellation_reason,
      bookingMethod: dbReservation.booking_method,
      specialRequests: dbReservation.special_requests,
      recurringPattern: dbReservation.recurring_pattern ? JSON.parse(dbReservation.recurring_pattern) : undefined,
      reminderSent: dbReservation.reminder_sent,
      createdAt: dbReservation.created_at,
      updatedAt: dbReservation.updated_at
    };
  }
}

import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { StationService } from './StationService';
import { ConnectorStatus } from '@ev-charging/shared-types';

export class StationWebsocketService {
  private io: Server;
  private stationService: StationService;

  constructor(io: Server) {
    this.io = io;
    this.stationService = new StationService();

    // Socket.IO connection handling
    io.on('connection', this.handleConnection.bind(this));
    
    logger.info('Station WebSocket service initialized');
  }

  private handleConnection(socket: Socket): void {
    logger.info(`Client connected: ${socket.id}`);

    // Handle station subscription
    socket.on('subscribe_station', (data: { stationId: string }) => {
      this.handleStationSubscription(socket, data.stationId);
    });

    // Handle multi-station subscription
    socket.on('subscribe_stations', (data: { stationIds: string[] }) => {
      this.handleMultiStationSubscription(socket, data.stationIds);
    });

    // Handle location-based subscription
    socket.on('subscribe_location', (data: { latitude: number; longitude: number; radius: number }) => {
      this.handleLocationSubscription(socket, data);
    });

    // Handle disconnect
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
  }

  private handleStationSubscription(socket: Socket, stationId: string): void {
    try {
      socket.join(`station_${stationId}`);
      
      logger.info(`Client ${socket.id} subscribed to station ${stationId}`);
      
      // Send current station status immediately
      this.sendStationStatus(socket, stationId);
      
    } catch (error) {
      logger.error('Failed to handle station subscription:', error);
      socket.emit('error', { message: 'Failed to subscribe to station' });
    }
  }

  private handleMultiStationSubscription(socket: Socket, stationIds: string[]): void {
    try {
      stationIds.forEach(stationId => {
        socket.join(`station_${stationId}`);
      });
      
      logger.info(`Client ${socket.id} subscribed to ${stationIds.length} stations`);
      
      // Send current status for all stations
      this.sendMultipleStationStatus(socket, stationIds);
      
    } catch (error) {
      logger.error('Failed to handle multi-station subscription:', error);
      socket.emit('error', { message: 'Failed to subscribe to stations' });
    }
  }

  private async handleLocationSubscription(
    socket: Socket, 
    data: { latitude: number; longitude: number; radius: number }
  ): Promise<void> {
    try {
      // Get nearby stations
      const nearbyStations = await this.stationService.getNearbyStations(
        data.latitude,
        data.longitude,
        20 // Get top 20 stations
      );

      // Subscribe to all nearby stations
      nearbyStations.forEach(station => {
        socket.join(`station_${station.id}`);
      });

      socket.join(`location_${data.latitude}_${data.longitude}`);
      
      logger.info(`Client ${socket.id} subscribed to location ${data.latitude}, ${data.longitude}`);
      
      // Send initial station data
      socket.emit('nearby_stations', {
        stations: nearbyStations,
        location: { latitude: data.latitude, longitude: data.longitude }
      });
      
    } catch (error) {
      logger.error('Failed to handle location subscription:', error);
      socket.emit('error', { message: 'Failed to subscribe to location' });
    }
  }

  private handleDisconnection(socket: Socket): void {
    logger.info(`Client disconnected: ${socket.id}`);
    
    // Cleanup subscriptions (Socket.IO automatically handles this)
  }

  private async sendStationStatus(socket: Socket, stationId: string): Promise<void> {
    try {
      const station = await this.stationService.getStationById(stationId);
      if (station) {
        const connectors = await this.stationService.getConnectorAvailability([stationId]);
        
        socket.emit('station_status', {
          stationId,
          status: station.status,
          connectors: connectors.map(connector => ({
            id: connector.id,
            connectorNumber: connector.connector_number,
            connectorType: connector.connector_type,
            powerKw: connector.power_kw,
            status: connector.status,
            pricing: {
              perKwh: connector.pricing_per_kwh,
              perMinute: connector.pricing_per_minute
            },
            lastUpdate: connector.last_status_update
          }))
        });
      }
    } catch (error) {
      logger.error('Failed to send station status:', error);
      socket.emit('error', { message: 'Failed to get station status' });
    }
  }

  private async sendMultipleStationStatus(socket: Socket, stationIds: string[]): Promise<void> {
    try {
      const connectors = await this.stationService.getConnectorAvailability(stationIds);
      
      // Send status for each subscribed station
      stationIds.forEach(async (stationId) => {
        await this.sendStationStatus(socket, stationId);
      });
      
    } catch (error) {
      logger.error('Failed to send multiple station status:', error);
      socket.emit('error', { message: 'Failed to get station status' });
    }
  }

  /**
   * Broadcast connector status update to all subscribed clients
   */
  public async broadcastConnectorUpdate(
    stationId: string, 
    connectorId: string, 
    updates: {
      status: ConnectorStatus;
      errorCode?: string;
    }
  ): Promise<void> {
    try {
      this.io.to(`station_${stationId}`).emit('connector_update', {
        stationId,
        connectorId,
        updates,
        timestamp: new Date().toISOString()
      });

      logger.info(`Broadcasted connector update for station ${stationId}, connector ${connectorId}`);
      
    } catch (error) {
      logger.error('Failed to broadcast connector update:', error);
    }
  }

  /**
   * Broadcast station maintenance mode to subscribers
   */
  public broadcastStationMaintenance(stationId: string, maintenanceMode: boolean): void {
    try {
      this.io.to(`station_${stationId}`).emit('station_maintenance', {
        stationId,
        maintenanceMode,
        timestamp: new Date().toISOString()
      });

      logger.info(`Broadcasted station maintenance mode: ${maintenanceMode} for station ${stationId}`);
      
    } catch (error) {
      logger.error('Failed to broadcast station maintenance:', error);
    }
  }

  /**
   * Broadcast pricing updates to subscribers
   */
  public broadcastPricingUpdate(stationId: string, newPricing: any): void {
    try {
      this.io.to(`station_${stationId}`).emit('pricing_update', {
        stationId,
        pricing: newPricing,
        timestamp: new Date().toISOString()
      });

      logger.info(`Broadcasted pricing update for station ${stationId}`);
      
    } catch (error) {
      logger.error('Failed to broadcast pricing update:', error);
    }
  }

  /**
   * Get connection statistics
   */
  public getConnectionStats(): any {
    return {
      totalConnections: this.io.sockets.size,
      rooms: Array.from(this.io.sockets.adapter.rooms.keys()),
      timestamp: new Date().toISOString()
    };
  }
}

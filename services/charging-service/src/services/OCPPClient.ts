import mqtt from 'mqtt';
import ws from 'ws';
import { 
  OCPPMessage,
  OCPPMessageType,
  OCPPAuthoriseRequest,
  OCPPAuthoriseResponse,
  OCPPStartTransactionRequest,
  OCPPStartTransactionResponse,
  OCPPStopTransactionRequest,
  OCPPStopTransactionResponse,
  AuthorizationStatus,
  IdTagInfo
} from '@ev-charging/shared-types';
import { logger } from '../utils/logger';

export class OCPPClient {
  private connections: Map<string, any> = new Map(); // Station ID -> Connection
  private subscriptions: Map<string, any> = new Map(); // Station ID -> Subscription

  constructor() {
    this.initializeConnections();
  }

  /**
   * Initialize connections to charging stations
   */
  private initializeConnections(): void {
    // Different charging stations might use different protocols
    // MQTT, WebSockets, HTTP, etc.
    
    const stationConfigs = [
      {
        stationId: 'station_mqtt_001',
        protocol: 'mqtt',
        endpoint: 'mqtt://localhost:1883',
        clientId: 'ev_charging_platform'
      },
      {
        stationId: 'station_ws_001',
        protocol: 'websocket',
        endpoint: 'ws://localhost:8080/ocpp',
        clientId: 'ev_charging_platform'
      }
    ];

    stationConfigs.forEach(config => {
      this.connectToStation(config);
    });
  }

  /**
   * Connect to a charging station
   */
  private connectToStation(config: any): void {
    try {
      let connection: any;

      switch (config.protocol) {
        case 'mqtt':
          connection = mqtt.connect(config.endpoint, {
            clientId: config.clientId,
            keepalive: 60,
            clean: true
          });

          connection.on('connect', () => {
            logger.info(`Connected to MQTT station ${config.stationId}`);
            this.setupMQTTMessageHandlers(connection, config.stationId);
          });

          connection.on('error', (error: any) => {
            logger.error(`MQTT connection error for station ${config.stationId}:`, error);
          });

          break;

        case 'websocket':
          connection = new ws.WebSocket(config.endpoint);

          connection.on('open', () => {
            logger.info(`Connected to WebSocket station ${config.stationId}`);
            this.setupWSMessageHandlers(connection, config.stationId);
          });

          connection.on('error', (error: any) => {
            logger.error(`WebSocket connection error for station ${config.stationId}:`, error);
          });

          break;

        default:
          logger.warn(`Unsupported protocol ${config.protocol} for station ${config.stationId}`);
          return;
      }

      this.connections.set(config.stationId, connection);

    } catch (error) {
      logger.error(`Failed to connect to station ${config.stationId}:`, error);
    }
  }

  /**
   * Setup MQTT message handlers
   */
  private setupMQTTMessageHandlers(connection: mqtt.MqttClient, stationId: string): void {
    // Subscribe to OCPP topics
    const ocppTopics = [
      `${stationId}/ocpp/station/messages`,
      `${stationId}/ocpp/cp/messages`,
      `${stationId}/ocpp/responses`
    ];

    connection.subscribe(ocppTopics, (error) => {
      if (error) {
        logger.error(`Failed to subscribe to MQTT topics for station ${stationId}:`, error);

      }
    });

    connection.on('message', (topic, message) => {
      try {
        const ocppMessage = JSON.parse(message.toString());
        this.handleOCPPMessage(stationId, ocppMessage);
      } catch (error) {
        logger.error(`Failed to parse OCPP message from station ${stationId}:`, error);

      }
    });
  }

  /**
   * Setup WebSocket message handlers
   */
  private setupWSMessageHandlers(connection: ws.WebSocket, stationId: string): void {
    connection.on('message', (data: ws.RawData) => {
      try {
        const message = JSON.parse(data.toString());
        this.handleOCPPMessage(stationId, message);
      } catch (error) {
        logger.error(`Failed to parse OCPP message from station ${stationId}:`, error);

      }
    });

    connection.on('close', () => {
      logger.warn(`WebSocket connection closed for station ${stationId}`);
      // Attempt to reconnect after delay
      setTimeout(() => {
        this.connectToStation({
          stationId,
          protocol: 'websocket',
          endpoint: `ws://localhost:8080/ocpp`,
          clientId: 'ev_charging_platform'
        });
      }, 5000);
    });
  }

  /**
   * Handle incoming OCPP messages
   */
  private handleOCPPMessage(stationId: string, message: OCPPMessage): void {
    try {
      logger.debug({
        stationId,
        messageType: message.messageType,
        action: message.action,
        uniqueId: message.uniqueId
      }, 'Received OCPP message');

      // Route message based on action
      switch (message.action) {
        case 'StartTransaction':
          this.handleStartTransactionConfirmation(stationId, message);
          break;
        case 'StopTransaction':
          this.handleStopTransactionConfirmation(stationId, message);
          break;
        case 'Authorize':
          this.handleAuthorizeConfirmation(stationId, message);
          break;
        case 'StatusNotification':
          this.handleStatusNotification(stationId, message);
          break;
        case 'MeterValues':
          this.handleMeterValues(stationId, message);
          break;
        case 'Heartbeat':
          this.handleHeartbeat(stationId, message);
          break;
        default:
          logger.warn(`Unknown OCPP action: ${message.action}`);
      }

    } catch (error) {
      logger.error(`Error handling OCPP message from station ${stationId}:`, error);

    }
  }

  /**
   * Send OCPP Authorize request
   */
  async authorize(stationId: string, idTag: string): Promise<IdTagInfo> {
    const connection = this.connections.get(stationId);
    if (!connection) {
      throw new Error(`No connection to station ${stationId}`);
    }

    const ocppMessage: OCPPMessage = {
      messageType: OCPPMessageType.CALL,
      uniqueId: this.generateUniqueId(),
      action: 'Authorize',
      payload: {
        idTag
      },
      timestamp: new Date()
    };

    const response = await this.sendOCPPMessage(connection, ocppMessage);
    
    return {
      status: response.Authorize?.idTagInfo?.status || 'invalid'
    };
  }

  /**
   * Send StatusNotification request
   */
  async statusNotification(
    stationId: string,
    connectorId: number,
    status: string,
    errorCode?: string
  ): Promise<void> {
    const connection = this.connections.get(stationId);
    if (!connection) {
      throw new Error(`No connection to station ${stationId}`);
    }

    const ocppMessage: OCPPMessage = {
      messageType: OCPPMessageType.CALL,
      uniqueId: this.generateUniqueId(),
      action: 'StatusNotification',
      payload: {
        connectorId,
        status,
        errorCode
      },
      timestamp: new Date()
    };

    await this.sendOCPPMessage(connection, ocppMessage);
  }

  /**
   * Send Heartbeat request
   */
  async heartbeat(stationId: string): Promise<Date> {
    const connection = this.connections.get(stationId);
    if (!connection) {
      throw new Error(`No connection to station ${stationId}`);
    }

    const ocppMessage: OCPPMessage = {
      messageType: OCPPMessageType.CALL,
      uniqueId: this.generateUniqueId(),
      action: 'Heartbeat',
      payload: {},
      timestamp: new Date()
    };

    const response = await this.sendOCPPMessage(connection, ocppMessage);
    return new Date(response.Heartbeat?.currentTime || new Date());
  }

  /**
   * Send OCPP message and wait for response
   */
  private async sendOCPPMessage(connection: any, message: OCPPMessage): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`OCPP message timeout for ${message.action}`));
      }, 30000); // 30 second timeout

      // For MQTT
      if (connection.publish) {
        const topic = `${message.payload?.connectorId || 'global'}/ocpp/cs/messages`;
        connection.publish(topic, JSON.stringify(message), (error: any) => {
          if (error) {
            clearTimeout(timeout);
            reject(error);
          }
        });

        // Listen for response (simplified)
        connection.once('message', (responseTopic: string, responseData: Buffer) => {
          if (responseTopic.includes('/responses')) {
            clearTimeout(timeout);
            const response = JSON.parse(responseData.toString());
            resolve(response);
          }
        });

      // For WebSocket
      } else if (connection.send) {
        connection.send(JSON.stringify(message));
        
        // Listen for response (simplified)
        connection.once('message', (data: ws.RawData) => {
          clearTimeout(timeout);
          const response = JSON.parse(data.toString());
          resolve(response);
        });
      }

    });
  }

  /**
   * Message handlers for different OCPP message types
   */
  private handleStartTransactionConfirmation(stationId: string, message: any): void {
    logger.info({
      stationId,
      transactionId: message.payload?.transactionId,
      status: message.payload?.idTagInfo?.status
    }, 'StartTransaction confirmation received');

    // Update charging service with confirmation
    // This would typically trigger charging session updates
  }

  private handleStopTransactionConfirmation(stationId: string, message: any): void {
    logger.info({
      stationId,
      transactionId: message.payload?.transactionId,
      energyDelivered: message.payload?.meterStop
    }, 'StopTransaction confirmation received');

    // Update charging session with final metrics
  }

  private handleAuthorizeConfirmation(stationId: string, message: any): void {
    logger.info({
      stationId,
      status: message.payload?.idTagInfo?.status
    }, 'Authorize confirmation received');

    // Update authorization status
  }

  private handleStatusNotification(stationId: string, message: any): void {
    logger.debug({
      stationId,
      connectorId: message.payload?.connectorId,
      status: message.payload?.status,
      errorCode: message.payload?.errorCode
    }, 'StatusNotification received');

    // Update connector status in real-time
  }

  private handleMeterValues(stationId: string, message: any): void {
    logger.debug({
      stationId,
      connectorId: message.payload?.connectorId,
      meterValue: message.payload?.meterValue
    }, 'MeterValues received');

    // Update charging session with real-time energy consumption
  }

}

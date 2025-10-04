import { Knex } from 'knex';
import { 
  Station, 
  StationSearchRequest, 
  StationSearchResponse, 
  StationSearchResult,
  ConnectorAvailability,
  ConnectorStatus,
  ConnectorType,
  Amenity,
  StationStatus 
} from '@ev-charging/shared-types';
import { logger } from '../utils/logger';
import { DatabaseService } from '../services/DatabaseService';

export class StationService {
  private db: Knex;
  private readonly EARTH_RADIUS_KM = 6371;

  constructor() {
    this.db = DatabaseService.getConnection();
  }

  /**
   * Search for stations within a specified radius
   */
  async searchStations(searchRequest: StationSearchRequest): Promise<StationSearchResponse> {
    try {
      const {
        latitude,
        longitude,
        radius = 5,
        connectorTypes,
        powerMin,
        availableOnly = false,
        amenities,
        limit = 20,
        offset = 0
      } = searchRequest;

      let query = this.db('stations')
        .leftJoin('connectors', 'stations.id', 'connectors.station_id')
        .leftJoin('operators', 'stations.operator_id', 'operators.id')
        .where('stations.status', 'active')
        .groupBy('stations.id', 'operators.name');

      // Apply location-based filtering
      query = query.whereRaw(`
        ST_DWithin(
          ST_MakePoint(?, ?),
          ST_MakePoint(stations.longitude, stations.latitude),
          ?
        )
      `, [longitude, latitude, radius * 1000]); // Convert km to meters

      // Apply connector type filters
      if (connectorTypes && connectorTypes.length > 0) {
        query = query.whereIn('connectors.connector_type', connectorTypes);
      }

      // Apply power level filters
      if (powerMin) {
        query = query.where('connectors.power_kw', '>=', powerMin);
      }

      // Apply amenities filters
      if (amenities && amenities.length > 0) {
        amenities.forEach(amenity => {
          query = query.whereRaw(`? = ANY(stations.amenities)`, [amenity]);
        });
      }

      // Apply availability filters
      if (availableOnly) {
        query = query.where('connectors.status', 'available');
      }

      // Get total count for pagination
      const countQuery = query.clone();
      const [{ count }] = await countQuery.count('stations.id as count');

      // Apply pagination and ordering
      const stations = await query
        .select(
          'stations.id',
          'stations.name',
          'stations.description',
          'stations.address_street',
          'stations.address_city',
          'stations.address_state',
          'stations.address_zip',
          'stations.address_country',
          'stations.latitude',
          'stations.longitude',
          'stations.amenities',
          'stations.rating',
          'stations.reviews_count',
          'stations.operating_hours',
          'operators.name as operator_name',
          this.db.raw(`
            ST_Distance(
              ST_MakePoint(?, ?),
              ST_MakePoint(stations.longitude, stations.latitude)
            ) * 0.001 as distance_km
          `, [longitude, latitude])
        )
        .orderBy('distance_km')
        .limit(limit)
        .offset(offset);

      // Get connector availability for each station
      const stationIds = stations.map(station => station.id);
      const connectors = await this.getConnectorAvailability(stationIds);

      // Build response
      const stationResults: StationSearchResult[] = await Promise.all(
        stations.map(async (station) => {
          const stationConnectors = connectors.filter(c => c.station_id === station.id);
          
          // Calculate availability
          const connectorAvailability = await this.buildConnectorAvailability(stationConnectors);

          return {
            id: station.id,
            name: station.name,
            address: {
              street: station.address_street,
              city: station.address_city,
              state: station.address_state,
              zip: station.address_zip,
              country: station.address_country
            },
            location: {
              latitude: parseFloat(station.latitude),
              longitude: parseFloat(station.longitude)
            },
            bility: connectorAvailability,
            amenities: station.amenities || [],
            rating: parseFloat(station.rating),
            reviewsCount: station.reviews_count,
            operatingHours: this.formatOperatingHours(station.operating_hours),
            distance: parseFloat(station.distance_km)
          };
        })
      );

      logger.info({
        searchRequest: {
          location: { latitude, longitude },
          radius,
          filters: { connectorTypes, powerMin, availableOnly, amenities },
          pagination: { limit, offset }
        },
        resultsCount: stationResults.length,
        totalCount: parseInt(count as string)
      }, 'Station search completed');

      return {
        stations: stationResults,
        total: parseInt(count as string),
        limit,
        offset
      };

    } catch (error) {
      logger.error('Station search failed:', error);
      throw error;
    }
  }

  /**
   * Get station details by ID
   */
  async getStationById(stationId: string): Promise<Station | null> {
    try {
      const station = await this.db('stations')
        .leftJoin('operators', 'stations.operator_id', 'operators.id')
        .where('stations.id', stationId)
        .select(
          'stations.*',
          'operators.name as operator_name',
          'operators.email as operator_email',
          'operators.phone as operator_phone',
          'operators.website as operator_website'
        )
        .first();

      if (!station) {
        return null;
      }

      // Get connectors for this station
      const connectors = await this.getStationConnectors(stationId);

      // Get reviews summary
      const reviews = await this.getStationReviewsSummary(stationId);

      return {
        id: station.id,
        operatorId: station.operator_id,
        name: station.name,
        description: station.description,
        address: {
          street: station.address_street,
          city: station.address_city,
          state: station.address_state,
          zip: station.address_zip,
          country: station.address_country
        },
        location: {
          latitude: parseFloat(station.latitude),
          longitude: parseFloat(station.longitude)
        },
        amenities: station.amenities || [],
        operatingHours: station.operating_hours,
        contact: {
          phone: station.contact_phone,
          email: station.contact_email
        },
        status: station.status as StationStatus,
        rating: parseFloat(station.rating),
        reviewsCount: station.reviews_count,
        photos: station.photos || [],
        createdAt: station.created_at,
        updatedAt: station.updated_at
      };

    } catch (error) {
      logger.error('Failed to get station by ID:', error);
      throw error;
    }
  }

  /**
   * Get real-time connector availability
   */
  async getConnectorAvailability(stationIds: string[]): Promise<any[]> {
    return this.db('connectors')
      .whereIn('station_id', stationIds)
      .select(
        'id',
        'station_id',
        'connector_number',
        'connector_type',
        'power_kw',
        'status',
        'pricing_per_kwh',
        'pricing_per_minute',
        'last_status_update'
      )
      .orderBy('connector_number');
  }

  /**
   * Update connector status (for OCPP integration)
   */
  async updateConnectorStatus(
    connectorId: string, 
    status: ConnectorStatus,
    errorCode?: string
  ): Promise<void> {
    try {
      await this.db('connectors')
        .where('id', connectorId)
        .update({
          status,
          last_status_update: this.db.fn.now(),
          ...(errorCode && { error_code: errorCode })
        });

      logger.info({ connectorId, status }, 'Connector status updated');

    } catch (error) {
      logger.error('Failed to update connector status:', error);
      throw error;
    }
  }

  /**
   * Get nearby stations (used for recommendations)
   */
  async getNearbyStations(
    latitude: number,
    longitude: number,
    limit: number = 5
  ): Promise<StationSearchResult[]> {
    const searchRequest: StationSearchRequest = {
      latitude,
      longitude,
      radius: 10, // 10km radius for recommendations
      limit,
      offset: 0
    };

    const response = await this.searchStations(searchRequest);
    return response.stations;
  }

  /**
   * Private helper methods
   */
  private async buildConnectorAvailability(connectors: any[]): Promise<ConnectorAvailability[]> {
    const availabilityMap = new Map<string, ConnectorAvailability>();

    for (const connector of connectors) {
      const key = `${connector.connector_type}_${connector.power_kw}`;
      
      if (!availabilityMap.has(key)) {
        availabilityMap.set(key, {
          connectorType: connector.connector_type,
          powerKw: parseFloat(connector.power_kw),
          status: connector.status,
          pricing: {
            perKwh: parseFloat(connector.pricing_per_kwh || '0'),
            currency: 'USD'
          }
        });
      } else {
        // If we have multiple connectors of the same type and power,
        // consider the connector available if at least one is available
        const existing = availabilityMap.get(key)!;
        if (connector.status === 'available' && existing.status !== 'available') {
          existing.status = 'available';
          existing.pricing = {
            perKwh: parseFloat(connector.pricing_per_kwh || '0'),
            currency: 'USD'
          };
        }
      }
    }

    return Array.from(availabilityMap.values());
  }

  private async getStationConnectors(stationId: string): Promise<any[]> {
    return this.db('connectors')
      .where('station_id', stationId)
      .orderBy('connector_number');
  }

  private async getStationReviewsSummary(stationId: string): Promise<any> {
    return this.db('reviews')
      .where('station_id', stationId)
      .select('rating')
      .then(reviews => {
        if (reviews.length === 0) {
          return { totalReviews: 0, averageRating: 0 };
        }
        
        const totalReviews = reviews.length;
        const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
        
        return { totalReviews, averageRating: Math.round(averageRating * 10) / 10 };
      });
  }

  private formatOperatingHours(operatingHours: any): string {
    if (!operatingHours || typeof operatingHours !== 'object') {
      return 'Unknown';
    }

    const { monday, tuesday, wednesday, thursday, friday, saturday, sunday } = operatingHours;
    
    // Check if all days have the same hours
    const hours = [monday, tuesday, wednesday, thursday, friday, saturday, sunday];
    if (hours.every(h => h === hours[0])) {
      return hours[0] === '00:00-23:59' ? '24/7' : hours[0];
    }

    return 'See details for specific hours';
  }
}

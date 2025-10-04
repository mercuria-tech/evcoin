import { Request, Response } from 'express';
import { StationService } from '../services/StationService';
import { CustomError } from '../middleware/errorHandler';
import { StationSearchRequest, StationStatus } from '@ev-charging/shared-types';
import { logger } from '../utils/logger';

export const stationController = {
  /**
   * Search for stations with filters
   */
  async searchStations(req: Request, res: Response): Promise<void> {
    try {
      const searchRequest: StationSearchRequest = {
        latitude: parseFloat(req.query.latitude as string),
        longitude: parseFloat(req.query.longitude as string),
        radius: req.query.radius ? parseFloat(req.query.radius as string) : undefined,
        connectorTypes: req.query.connectorTypes ? 
          (req.query.connectorTypes as string).split(',') : undefined,
        powerMin: req.query.powerMin ? parseFloat(req.query.powerMin as string) : undefined,
        availableOnly: req.query.availableOnly === 'true',
        amenities: req.query.amenities ? 
          (req.query.amenities as string).split(',') : undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,

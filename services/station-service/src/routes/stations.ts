import { Router } from 'express';
import { stationController } from '../controllers/stationController';
import { validateRequest, validateParams, validateQuery } from '../middleware/validation';
import { stationSearchSchema, updateStationSchema } from '../validators/stationValidators';
import { uuidSchema } from '../validators/commonValidators';

const router = Router();

// Public routes (no authentication required for search)
router.get('/search', validateQuery(stationSearchSchema), stationController.searchStations);
router.get('/nearby', stationController.getNearbyStations);
router.get('/:id', validateParams(uuidSchema), stationController.getStationById);
router.get('/:id/availability', validateParams(uuidSchema), stationController.getStationAvailability);

// Protected routes (admin only - TODO: add authentication middleware)
// router.use(authenticateToken); // Uncomment when auth middleware is implemented

router.post('/', stationController.createStation);
router.put('/:id', validateParams(uuidSchema), validateRequest(updateStationSchema), stationController.updateStation);
router.delete('/:id', validateParams(uuidSchema), stationController.deleteStation);
router.post('/:id/enable', validateParams(uuidSchema), stationController.enableStation);
router.post('/:id/disable', validateParams(uuidSchema), stationController.disableStation);
router.post('/:id/maintenance', validateParams(uuidSchema), stationController.setMaintenanceMode);

export default router;

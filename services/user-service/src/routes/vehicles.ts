import { Router } from 'express';
import { vehicleController } from '../controllers/vehicleController';
import { validateRequest, validateParams } from '../middleware/validation';
import { createVehicleSchema, updateVehicleSchema } from '../validators/vehicleValidators';
import { uuidSchema } from '../validators/commonValidators';

const router = Router();

// All routes require authentication
// router.use(authenticateToken); // TODO: Implement auth middleware

router.get('/', vehicleController.getVehicles);
router.post('/', validateRequest(createVehicleSchema), vehicleController.createVehicle);
router.get('/:id', validateParams(uuidSchema), vehicleController.getVehicle);
router.put('/:id', validateParams(uuidSchema), validateRequest(updateVehicleSchema), vehicleController.updateVehicle);
router.delete('/:id', validateParams(uuidSchema), vehicleController.deleteVehicle);
router.put('/:id/set-default', validateParams(uuidSchema), vehicleController.setDefault);

export default router;

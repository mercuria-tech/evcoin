import { Router } from 'express';
import { connectorController } from '../controllers/connectorController';
import { validateRequest, validateParams } from '../middleware/validation';
import { createConnectorSchema, updateConnectorSchema, updateConnectorStatusSchema } from '../validators/connectorValidators';
import { uuidSchema } from '../validators/commonValidators';

const router = Router();

// All routes require admin authentication (TODO: implement)
// router.use(authenticateToken);

router.get('/station/:stationId', validateParams(uuidSchema), connectorController.getStationConnectors);

// Connector CRUD operations
router.get('/:id', validateParams(uuidSchema), connectorController.getConnectorById);
router.post('/', validateRequest(createConnectorSchema), connectorController.createConnector);
router.put('/:id', validateParams(uuidSchema), validateRequest(updateConnectorSchema), connectorController.updateConnector);
router.delete('/:id', validateParams(uuidSchema), connectorController.deleteConnector);

// Status management (used by OCPP integration)
router.patch('/:id/status', validateParams(uuidSchema), validateRequest(updateConnectorStatusSchema), connectorController.updateConnectorStatus);

// Pricing management
router.post('/:id/pricing', validateParams(uuidSchema), connectorController.updateConnectorPricing);

export default router;

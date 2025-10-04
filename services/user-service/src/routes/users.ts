import { Router } from 'express';
import { userController } from '../controllers/userController';
import { validateRequest, validateParams } from '../middleware/validation';
import { updateProfileSchema } from '../validators/userValidators';
import { uuidSchema } from '../validators/commonValidators';

const router = Router();

// All routes require authentication
// router.use(authenticateToken); // TODO: Implement auth middleware

router.get('/', userController.getProfile);
router.put('/', validateRequest(updateProfileSchema), userController.updateProfile);
router.put('/change-password', userController.changePassword);
router.delete('/account', userController.deleteAccount);
router.get('/preferences', userController.getPreferences);
router.put('/preferences', userController.updatePreferences);

export default router;

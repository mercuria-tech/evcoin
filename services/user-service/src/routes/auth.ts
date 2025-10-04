import { Router } from 'express';
import { authController } from '../controllers/authController';
import { validateRequest } from '../middleware/validation';
import { registerSchema, loginSchema, verifyOtpSchema } from '../validators/authValidators';

const router = Router();

// Public routes
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/verify-otp', validateRequest(verifyOtpSchema), authController.verifyOtp);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes (require valid JWT)
// router.use(authenticateToken); // Uncomment when auth middleware is implemented

router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authController.getProfile);

export default router;

import { Router } from 'express';
import { webhookController } from '../controllers/webhookController';
import { validateProviderWebhook } from '../middleware/webhookValidation';

const router = Router();

// Stripe webhooks
router.post('/stripe', validateProviderWebhook('stripe'), webhookController.handleStripeWebhook);

// PayPal webhooks
router.post('/paypal', validateProviderWebhook('paypal'), webhookController.handlePayPalWebhook);

// Regional payment provider webhooks
router.post('/razorpay', validateProviderWebhook('razorpay'), webhookController.handleRazorpayWebhook);
router.post('/paystack', validateProviderWebhook('paystack'), webhookController.handlePaystackWebhook);
router.post('/grabpay', validateProviderWebhook('grabpay'), webhookController.handleGrabPayWebhook);
router.post('/momo', validateProviderWebhook('momo'), webhookController.handleMoMoWebhook);

// Square webhooks
router.post('/square', validateProviderWebhook('square'), webhookController.handleSquareWebhook);

// Generic webhook handler for new providers
router.post('/:provider', validateProviderWebhook(), webhookController.handleGenericWebhook);

// Webhook registration and management
router.get('/status', webhookController.getWebhookStatus);
router.post('/retry/:eventId', webhookController.retryFailedWebhook);

export default router;

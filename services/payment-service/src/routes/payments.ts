import { Router } from 'express';
import { paymentController } from '../controllers/paymentController';
import { validateRequest, validateQuery, validateParams } from '../middleware/validation';
import { 
  createPaymentIntentSchema, 
  addPaymentMethodSchema, 
  processPaymentSchema,
  estimateFeesSchema 
} from '../validators/paymentValidators';
import { uuidSchema } from '../validators/commonValidators';

const router = Router();

// Public payment processing endpoints (with authentication)
// router.use(authenticateToken); // TODO: Add authentication middleware

// Payment method management
router.get('/methods', paymentController.getPaymentMethods);
router.post('/methods', validateRequest(addPaymentMethodSchema), paymentController.addPaymentMethod);
router.get('/methods/:id', validateParams(uuidSchema), paymentController.getPaymentMethodById);
router.put('/methods/:id', validateParams(uuidSchema), paymentController.updatePaymentMethod);
router.delete('/methods/:id', validateParams(uuidSchema), paymentController.deletePaymentMethod);
router.put('/methods/:id/default', validateParams(uuidSchema), paymentController.setDefaultPaymentMethod);

// Payment intent management
router.post('/intent', validateRequest(createPaymentIntentSchema), paymentController.createPaymentIntent);
router.get('/intent/:id', validateParams(uuidSchema), paymentController.getPaymentIntent);

// Payment processing
router.post('/process', validateRequest(processPaymentSchema), paymentController.processPayment);
router.get('/estimate-fees', validateQuery(estimateFeesSchema), paymentController.estimatePaymentFees);

// Regional payment methods
router.get('/methods/regional/:region', paymentController.getRegionalPaymentMethods);
router.get('/options/:currency', paymentController.getPaymentOptions);

// Wallet and alternative payment methods
router.post('/wallet/topup', paymentController.topUpWallet);
router.post('/wallet/transfer', paymentController.transferToWallet);
router.get('/wallet/balance', paymentController.getWalletBalance);

// Subscription management
router.post('/subscription/create', paymentController.createSubscription);
router.post('/subscription/cancel', paymentController.cancelSubscription);
router.get('/subscription/:id', paymentController.getSubscription);

// Bank transfer initialization
router.post('/bank-transfer/initiate', paymentController.initiateBankTransfer);
router.get('/bank-transfer/:id/status', paymentController.getBankTransferStatus);

export default router;

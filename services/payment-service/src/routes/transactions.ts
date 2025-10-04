import { Router } from 'express';
import { transactionController } from '../controllers/transactionController';
import { validateRequest, validateParams, validateQuery } from '../middleware/validation';
import { 
  transactionHistorySchema,
  refundRequestSchema,
  analyzeTransactionsSchema 
} from '../validators/transactionValidators';
import { uuidSchema } from '../validators/commonValidators';

const router = Router();

// All routes require authentication
// router.use(authenticateToken); // TODO: Add authentication middleware

// Transaction retrieval
router.get('/', validateQuery(transactionHistorySchema), transactionController.getTransactionHistory);
router.get('/summary', transactionController.getTransactionSummary);
router.get('/:id', validateParams(uuidSchema), transactionController.getTransactionById);
router.get('/:id/receipt', validateParams(uuidSchema), transactionController.downloadReceipt);

// Refund processing
router.post('/refund', validateRequest(refundRequestSchema), transactionController.processRefund);
router.get('/refund/:id/status', validateParams(uuidSchema), transactionController.getRefundStatus);

// Analytics and reporting
router.get('/analytics/summary', validateQuery(analyzeTransactionsSchema), transactionController.getAnalytics);
router.get('/analytics/provider-breakdown', transactionController.getProviderBreakdown);
router.get('/analytics/regional-breakdown', transactionController.getRegionalBreakdown);
router.get('/analytics/monthly-report/:year/:month', transactionController.getMonthlyReport);

// Export functionality
router.get('/export/csv', validateQuery(transactionHistorySchema), transactionController.exportCSV);
router.get('/export/pdf', validateQuery(transactionHistorySchema), transactionController.exportPDF);

// Bulk operations
router.post('/bulk-refund', transactionController.processBulkRefund);
router.post('/validate', transactionController.validateTransactions);

// Currency conversion
router.get('/rates/:from/:to', transactionController.getExchangeRate);
router.post('/convert', transactionController.convertCurrency);

export default router;

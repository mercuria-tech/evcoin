import express from 'express';
import expressRateLimit from 'express-rate-limit';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { requestLogger } from './middleware/requestLogger';
import paymentRoutes from './routes/payments';
import transactionRoutes from './routes/transactions';
import webhookRoutes from './routes/webhooks';
import { healthCheck } from './controllers/health';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true
}));

// Rate limiting - more permissive for webhooks
const limiter = expressRateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Higher limit for payment processing
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Raw body parsing for webhooks
app.use('/webhooks', express.raw({ type: 'application/json' }));

// Logging middleware
app.use(requestLogger);

// Health check endpoint
app.get('/health', healthCheck);

// Initialize payment service
const multiProviderService = async () => {
  try {
    const { MultiProviderPaymentService } = await import('./services/MultiProviderPaymentService');
    const paymentService = new MultiProviderPaymentService();
    logger.info('Multi-provider payment service initialized');
  } catch (error) {
    logger.error('Failed to initialize payment service:', error);
  }
};

multiProviderService();

// API routes
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/webhooks', webhookRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`${signal} received, shutting down gracefully`);
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

app.listen(PORT, () => {
  logger.info(`Payment service running on port ${PORT}`);
  logger.info(`Multi-provider payment processing ready`);
});

export default app;

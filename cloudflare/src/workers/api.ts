import { Router } from 'itty-router';
import { corsHeaders, handleCORS } from './middleware/cors';
import { authenticateUser } from './middleware/auth';
import { validateRequest } from './middleware/validation';
import { rateLimit } from './middleware/rateLimit';
import { requestLogger } from './middleware/logging';

// Import route handlers
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import stationRoutes from './routes/stations';
import chargingRoutes from './routes/charging';
import paymentRoutes from './routes/payments';
import reservationRoutes from './routes/reservations';
import notificationRoutes from './routes/notifications';
import adminRoutes from './routes/admin';
import webhookRoutes from './routes/webhooks';

// Import Durable Objects
import { ChargeSessionObject } from './durable-objects/ChargeSession';
import { NotificationBatchObject } from './durable-objects/NotificationBatch';
import { StationStatusObject } from './durable-objects/StationStatus';

// Initialize router
const router = Router({ base: '/api/v1' });

// Global middleware
router.all('*', corsHeaders, handleCORS);
router.all('*', requestLogger);
router.all('*', rateLimit);

// Health check endpoint
router.get('/health', async (request: Request, env: Env, ctx: ExecutionContext) => {
  return new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: env.ENVIRONMENT,
    version: '1.0.0',
    services: {
      database: 'connected',
      kv: 'connected',
      r2: 'connected',
      durable_objects: 'connected'
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

// API Routes
router.post('/auth/*', authRoutes.handle);
router.get('/auth/validate', authenticateUser, authRoutes.handle);

router.all('/users/*', authenticateUser, userRoutes.handle);
router.all('/vehicles/*', authenticateUser, userRoutes.handle);

router.all('/stations/*', stationRoutes.handle);
router.get('/stations/search', stationRoutes.handle);

router.all('/charging/*', authenticateUser, chargingRoutes.handle);
router.all('/reservations/*', authenticateUser, reservationRoutes.handle);

router.all('/payments/*', authenticateUser, paymentRoutes.handle);
router.all('/transactions/*', authenticateUser, paymentRoutes.handle);

router.all('/notifications/*', authenticateUser, notificationRoutes.handle);
router.post('/notifications/bulk', authenticateUser, notificationRoutes.handle);

router.all('/admin/*', authenticateUser, adminRoutes.handle);

// Webhooks (no auth required)
router.post('/webhooks/stripe', webhookRoutes.handle);
router.post('/webhooks/paypal', webhookRoutes.handle);
router.post('/webhooks/ocpp', webhookRoutes.handle);

// Error handling for unmatched routes
router.all('*', async (request: Request) => {
  return new Response(
    JSON.stringify({
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: `Route ${request.method} ${request.url} not found`,
        timestamp: new Date().toISOString()
      }
    }),
    {
      status: 404,
      headers: { 'Content-Type': 'application/json' }
    }
  );
});

// Main Worker entry point
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      // Add environment and context to request
      (request as any).env = env;
      (request as any).ctx = ctx;

      // Route request
      const response = await router.handle(request, env, ctx);
      
      return response || new Response(
        JSON.stringify({
          error: {
            code: 'INTERNAL_ERROR',
            message: 'No response from router',
            timestamp: new Date().toISOString()
          }
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );

    } catch (error) {
      console.error('Worker error:', error);

      return new Response(
        JSON.stringify({
          error: {
            code: 'WORKER_ERROR',
            message: 'Internal server error',
            timestamp: new Date().toISOString(),
            ...(env.ENVIRONMENT === 'development' && { details: error.message })
          }
        }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  },

  // Durable Objects WebSocket handling
  async webSocketUpgrade(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const namespace = url.searchParams.get('namespace');
    
    if (!namespace) {
      return new Response('Missing namespace parameter', { status: 400 });
    }

    try {
      let id: DurableObjectId;
      
      switch (namespace) {
        case 'charging-sessions':
          id = env.CHARGE_SESSION.idFromName('global-charging-sessions');
          break;
        case 'notifications':
          id = env.NOTIFICATION_BATCH.idFromName('global-notifications');
          break;
        case 'station-status':
          id = env.STATION_STATUS.idFromName('global-station-status');
          break;
        default:
          return new Response('Invalid namespace', { status: 400 });
      }

      const durableObject = env[namespace.replace('-', '_').toUpperCase() as keyof Env].get(id);
      return await durableObject.fetch(request);

    } catch (error) {
      console.error('WebSocket upgrade error:', error);
      return new Response('WebSocket upgrade failed', { status: 500 });
    }
  },

  // Scheduled event handlers (cron jobs)
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    const cron = event.cron;
    
    switch (cron) {
      case '0 */15 * * * *': // Every 15 minutes
        ctx.waitUntil(handleStationStatusUpdate(env));
        break;
        
      case '0 0 * * *': // Daily at midnight
        ctx.waitUntil(handleDailyReports(env));
        break;
        
      case '0 */6 * * *': // Every 6 hours
        ctx.waitUntil(handleNotificationBatches(env));
        break;
    }
  },

  // Durable Objects exports
  ChargeSessionObject,
  NotificationBatchObject,
  StationStatusObject,
};

// Helper functions for scheduled events
async function handleStationStatusUpdate(env: Env): Promise<void> {
  try {
    console.log('Running station status update job...');
    
    // Fetch stations from D1 database
    const stations = await env.D1_DATABASE.prepare(
      'SELECT id, location_lat, location_lng FROM stations WHERE status = "active"'
    ).all();

    // Update station status via Durable Object
    const stationStatusId = env.STATION_STATUS.idFromName('global-station-status');
    const stationStatus = env.STATION_STATUS.get(stationStatusId);
    
    await stationStatus.fetch(new Request('https://internal.batch-update', {
      method: 'POST',
      body: JSON.stringify(stations.results)
    }));

    console.log(`Updated status for ${stations.results.length} stations`);
  } catch (error) {
    console.error('Station status update failed:', error);
  }
}

async function handleDailyReports(env: Env): Promise<void> {
  try {
    console.log('Running daily reports job...');
    
    // Generate daily reports
    const today = new Date().toISOString().split('T')[0];
    
    const sessionCount = await env.D1_DATABASE.prepare(
      'SELECT COUNT(*) as count FROM charging_sessions WHERE DATE(started_at) = ?'
    ).bind(today).first();
    
    const revenue = await env.D1_DATABASE.prepare(
      'SELECT SUM(cost_amount) as total FROM charging_sessions WHERE DATE(started_at) = ? AND status = "completed"'
    ).bind(today).first();
    
    // Store reports in KV
    await env.EV_PLATFORM_KV.put(`daily-report-${today}`, JSON.stringify({
      date: today,
      sessionCount: sessionCount?.count || 0,
      revenue: revenue?.total || 0,
      generatedAt: new Date().toISOString()
    }), {
      expirationTtl: 30 * 24 * 60 * 60 // 30 days
    });

    console.log(`Generated daily report for ${today}`);
  } catch (error) {
    console.error('Daily reports job failed:', error);
  }
}

async function handleNotificationBatches(env: Env): Promise<void> {
  try {
    console.log('Running notification batches job...');
    
    // Process pending notification batches
    const notificationBatchId = env.NOTIFICATION_BATCH.idFromName('global-notifications');
    const notificationBatch = env.NOTIFICATION_BATCH.get(notificationBatchId);
    
    await notificationBatch.fetch(new Request('https://internal.process-batches', {
      method: 'POST'
    }));

    console.log('Processed notification batches');
  } catch (error) {
    console.error('Notification batches job failed:', error);
  }
}

// Environment interface
interface Env {
  ENVIRONMENT: string;
  LOG_LEVEL: string;
  
  // KV Namespaces
  EV_PLATFORM_KV: KVNamespace;
  SESSION_STORE: KVNamespace;
  CACHE_STORE: KVNamespace;
  
  // D1 Database
  D1_DATABASE: D1Database;
  
  // Durable Objects
  CHARGE_SESSION: DurableObjectNamespace;
  NOTIFICATION_BATCH: DurableObjectNamespace;
  STATION_STATUS: DurableObjectNamespace;
  
  // R2 Buckets
  STATIC_ASSETS: R2Bucket;
  USER_UPLOADS: R2Bucket;
  LOGS_BUCKET: R2Bucket;
  
  // Service Bindings
  D1_DATABASE: Service;
  SESSIONS_KV: Service;
  
  // Secrets (set via wrangler secret put)
  JWT_SECRET: string;
  STRIPE_SECRET_KEY: string;
  PAYPAL_CLIENT_SECRET: string;
  OCPP_SECRET_KEY: string;
}

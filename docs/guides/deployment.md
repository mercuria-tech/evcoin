# 🚀 EVcoin Platform Deployment Guide

Complete guide for deploying the EVcoin platform to production using Cloudflare's global infrastructure.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Manual Deployment](#manual-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Frontend Deployment](#frontend-deployment)
- [Monitoring & Analytics](#monitoring--analytics)
- [Security Configuration](#security-configuration)
- [Troubleshooting](#troubleshooting)
- [Maintenance](#maintenance)

---

## ✅ Prerequisites

### Required Accounts
- **Cloudflare Account** - [Sign up](https://cloudflare.com)
- **GitHub Account** - [Sign up](https://github.com)
- **Domain Name** - For custom domain setup

### Required Tools
- **Node.js 18+** - [Download](https://nodejs.org)
- **Git** - [Download](https://git-scm.com)
- **Wrangler CLI** - Cloudflare's deployment tool

### Required Credentials
- **Cloudflare API Token** - With Workers, D1, KV, R2 permissions
- **Cloudflare Account ID** - Found in dashboard
- **Domain DNS Access** - For custom domain setup

---

## ⚡ Quick Start

### Automated Deployment Script

```bash
# Clone the repository
git clone https://github.com/mercuria-tech/evcoin.git
cd evcoin

# Set environment variables
export CLOUDFLARE_API_TOKEN="your-api-token"
export CLOUDFLARE_ACCOUNT_ID="your-account-id"

# Run automated deployment
chmod +x deploy.sh
./deploy.sh
```

The script will:
1. ✅ Install dependencies
2. ✅ Create Cloudflare resources
3. ✅ Deploy backend services
4. ✅ Deploy frontend applications
5. ✅ Configure monitoring
6. ✅ Set up security

---

## 🔧 Manual Deployment

### Step 1: Install Wrangler CLI

```bash
# Install Wrangler globally
npm install -g wrangler

# Authenticate with Cloudflare
wrangler login

# Verify authentication
wrangler whoami
```

### Step 2: Create Cloudflare Resources

#### D1 Database
```bash
# Create main database
wrangler d1 create evcoin-database

# Create backup database
wrangler d1 create evcoin-backup
```

#### KV Namespaces
```bash
# Create KV namespaces
wrangler kv:namespace create "EVCOIN_CACHE" --env production
wrangler kv:namespace create "EVCOIN_SESSIONS" --env production
wrangler kv:namespace create "EVCOIN_TOKENS" --env production
```

#### R2 Buckets
```bash
# Create R2 buckets
wrangler r2 bucket create evcoin-static-assets
wrangler r2 bucket create evcoin-user-uploads
wrangler r2 bucket create evcoin-logs
```

### Step 3: Configure wrangler.toml

```toml
name = "evcoin-platform"
main = "src/index.ts"
compatibility_date = "2023-12-01"

[env.production]
name = "evcoin-platform-prod"
route = "api.evcoin.io/*"

[[env.production.kv_namespaces]]
binding = "CACHE"
id = "your-kv-id"
preview_id = "your-preview-id"

[[env.production.d1_databases]]
binding = "DB"
database_name = "evcoin-database"
database_id = "your-database-id"

[[env.production.r2_buckets]]
binding = "ASSETS"
bucket_name = "evcoin-static-assets"
```

### Step 4: Deploy Backend Services

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Deploy to Cloudflare Workers
wrangler deploy --env production
```

---

## ⚙️ Environment Configuration

### Required Environment Variables

Create a `.env` file with the following variables:

```env
# Cloudflare Configuration
CLOUDFLARE_API_TOKEN=your-api-token
CLOUDFLARE_ACCOUNT_ID=your-account-id

# Database Configuration
DATABASE_URL=your-database-url
REDIS_URL=your-redis-url

# Authentication
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=3600

# Payment Providers
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-secret

# Blockchain Configuration
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-project-id
POLYGON_RPC_URL=https://polygon-rpc.com
BSC_RPC_URL=https://bsc-dataseed.binance.org

# Token Contract Addresses
EVCOIN_CONTRACT_ETHEREUM=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
EVCOIN_CONTRACT_POLYGON=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6
EVCOIN_CONTRACT_BSC=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6

# External Services
GOOGLE_MAPS_API_KEY=your-google-maps-key
FIREBASE_PROJECT_ID=your-firebase-project
SENDGRID_API_KEY=your-sendgrid-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token

# Monitoring
SENTRY_DSN=your-sentry-dsn
DATADOG_API_KEY=your-datadog-key
```

### Cloudflare Secrets

Set sensitive data as Cloudflare secrets:

```bash
# Authentication secrets
wrangler secret put JWT_SECRET
wrangler secret put JWT_EXPIRES_IN

# Payment provider secrets
wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put PAYPAL_CLIENT_SECRET

# Blockchain secrets
wrangler secret put ETHEREUM_RPC_URL
wrangler secret put POLYGON_RPC_URL
wrangler secret put BSC_RPC_URL

# External service secrets
wrangler secret put GOOGLE_MAPS_API_KEY
wrangler secret put FIREBASE_PROJECT_ID
wrangler secret put SENDGRID_API_KEY
wrangler secret put TWILIO_ACCOUNT_SID
wrangler secret put TWILIO_AUTH_TOKEN
```

---

## 🗄️ Database Setup

### D1 Database Migration

```bash
# Create migration files
mkdir -p migrations

# Run migrations
wrangler d1 migrations apply evcoin-database --env production

# Verify database
wrangler d1 execute evcoin-database --command "SELECT name FROM sqlite_master WHERE type='table';"
```

### Database Schema

```sql
-- Users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  tier TEXT DEFAULT 'bronze',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stations table
CREATE TABLE stations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  latitude REAL NOT NULL,
  longitude REAL NOT NULL,
  operator TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Charging sessions table
CREATE TABLE charging_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  station_id TEXT NOT NULL,
  connector_id TEXT NOT NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME,
  energy_delivered REAL DEFAULT 0,
  cost REAL DEFAULT 0,
  status TEXT DEFAULT 'active',
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (station_id) REFERENCES stations(id)
);

-- Token transactions table
CREATE TABLE token_transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount REAL NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  transaction_hash TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

---

## 🎨 Frontend Deployment

### Admin Dashboard (Cloudflare Pages)

```bash
# Navigate to admin dashboard
cd admin-dashboard-standalone

# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name evcoin-admin --compatibility-date 2023-12-01
```

### Mobile App (Expo EAS Build)

```bash
# Install Expo CLI
npm install -g @expo/cli

# Navigate to mobile app
cd apps/mobile

# Install dependencies
npm install

# Build for production
expo build --platform all --non-interactive
```

### Web Application (Cloudflare Pages)

```bash
# Navigate to web app
cd apps/web

# Install dependencies
npm install

# Build for production
npm run build

# Deploy to Cloudflare Pages
wrangler pages deploy dist --project-name evcoin-web --compatibility-date 2023-12-01
```

---

## 📊 Monitoring & Analytics

### Cloudflare Analytics

Enable analytics for all services:

```bash
# Enable Workers analytics
wrangler analytics enable

# Enable D1 analytics
wrangler d1 analytics enable evcoin-database

# Enable KV analytics
wrangler kv analytics enable EVCOIN_CACHE
```

### Custom Monitoring

```typescript
// Monitoring configuration
const monitoringConfig = {
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: 'production',
    tracesSampleRate: 0.1
  },
  datadog: {
    apiKey: process.env.DATADOG_API_KEY,
    service: 'evcoin-platform',
    env: 'production'
  }
};

// Error tracking
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: monitoringConfig.sentry.dsn,
  environment: monitoringConfig.sentry.environment
});

// Performance monitoring
import { datadog } from 'datadog-lambda-js';

export const handler = datadog(async (event, context) => {
  // Your handler code
});
```

### Health Checks

```typescript
// Health check endpoint
export async function healthCheck(request: Request): Promise<Response> {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    blockchain: await checkBlockchain(),
    timestamp: new Date().toISOString()
  };

  const isHealthy = Object.values(checks).every(check => 
    typeof check === 'boolean' ? check : true
  );

  return new Response(JSON.stringify(checks), {
    status: isHealthy ? 200 : 503,
    headers: { 'Content-Type': 'application/json' }
  });
}
```

---

## 🔒 Security Configuration

### SSL/TLS Configuration

```bash
# Enable SSL/TLS
wrangler ssl enable

# Configure security headers
wrangler security-headers set --strict-transport-security max-age=31536000
wrangler security-headers set --x-frame-options DENY
wrangler security-headers set --x-content-type-options nosniff
```

### WAF Rules

```bash
# Create WAF rules
wrangler waf rules create --name "Rate Limiting" --action "block" --expression "rate_limit() > 1000"
wrangler waf rules create --name "SQL Injection" --action "block" --expression "sql_injection()"
wrangler waf rules create --name "XSS Protection" --action "block" --expression "xss()"
```

### CORS Configuration

```typescript
// CORS configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://evcoin.io',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400'
};

export async function handleCORS(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  
  return new Response(null, { headers: corsHeaders });
}
```

---

## 🔍 Troubleshooting

### Common Issues

#### Workers Deployment Fails
```bash
# Check API token permissions
wrangler whoami

# Verify account access
wrangler d1 list

# Check wrangler.toml configuration
wrangler config
```

#### Database Connection Issues
```bash
# Test database connection
wrangler d1 execute evcoin-database --command "SELECT 1"

# Check migration status
wrangler d1 migrations list evcoin-database

# Reset database (CAUTION: deletes all data)
wrangler d1 migrations apply evcoin-database --env production --first
```

#### Frontend Build Errors
```bash
# Clear build cache
rm -rf node_modules package-lock.json
npm install

# Check environment variables
npm run build:check

# Verify Cloudflare Pages deployment
wrangler pages project list
```

### Debug Mode

```bash
# Enable debug logging
wrangler secret put DEBUG true

# View logs
wrangler tail --env production

# Test locally
wrangler dev --env production
```

---

## 🔧 Maintenance

### Regular Maintenance Tasks

#### Daily
- ✅ Monitor system health
- ✅ Check error logs
- ✅ Verify payment processing
- ✅ Monitor token distribution

#### Weekly
- ✅ Review performance metrics
- ✅ Update dependencies
- ✅ Check security alerts
- ✅ Backup database

#### Monthly
- ✅ Security audit
- ✅ Performance optimization
- ✅ Capacity planning
- ✅ Disaster recovery test

### Backup Strategy

```bash
# Database backup
wrangler d1 export evcoin-database --output backup-$(date +%Y%m%d).sql

# R2 bucket backup
wrangler r2 bucket copy evcoin-static-assets evcoin-backup-$(date +%Y%m%d)

# KV namespace backup
wrangler kv:key list --namespace-id EVCOIN_CACHE > cache-backup-$(date +%Y%m%d).json
```

### Scaling

```bash
# Scale Workers
wrangler workers scale --min-instances 10 --max-instances 100

# Scale D1 database
wrangler d1 scale evcoin-database --min-connections 5 --max-connections 50

# Scale R2 storage
wrangler r2 bucket scale evcoin-static-assets --max-size 100GB
```

---

## 📈 Performance Optimization

### Caching Strategy

```typescript
// Cache configuration
const cacheConfig = {
  stations: {
    ttl: 300, // 5 minutes
    key: 'stations:all'
  },
  userProfile: {
    ttl: 3600, // 1 hour
    key: 'user:profile:'
  },
  tokenBalance: {
    ttl: 60, // 1 minute
    key: 'tokens:balance:'
  }
};

// Cache implementation
export async function getCachedData(key: string, ttl: number, fetcher: () => Promise<any>) {
  const cached = await CACHE.get(key);
  if (cached) {
    return JSON.parse(cached);
  }
  
  const data = await fetcher();
  await CACHE.put(key, JSON.stringify(data), { expirationTtl: ttl });
  return data;
}
```

### Database Optimization

```sql
-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_stations_location ON stations(latitude, longitude);
CREATE INDEX idx_sessions_user_id ON charging_sessions(user_id);
CREATE INDEX idx_sessions_station_id ON charging_sessions(station_id);
CREATE INDEX idx_token_transactions_user_id ON token_transactions(user_id);

-- Optimize queries
EXPLAIN QUERY PLAN SELECT * FROM stations 
WHERE latitude BETWEEN ? AND ? 
AND longitude BETWEEN ? AND ?;
```

---

## 🎯 Production Checklist

### Pre-Deployment
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates configured
- [ ] Security headers set
- [ ] Monitoring enabled
- [ ] Backup strategy implemented

### Post-Deployment
- [ ] Health checks passing
- [ ] API endpoints responding
- [ ] Frontend applications loading
- [ ] Payment processing working
- [ ] Token distribution functioning
- [ ] Real-time features operational

### Ongoing Monitoring
- [ ] Error rates < 1%
- [ ] Response times < 200ms
- [ ] Uptime > 99.9%
- [ ] Payment success rate > 99%
- [ ] Token distribution accuracy > 99.9%

---

## 📞 Support

- **Deployment Support**: [deployment@evcoin.io](mailto:deployment@evcoin.io)
- **Technical Issues**: [GitHub Issues](https://github.com/mercuria-tech/evcoin/issues)
- **Community**: [Discord](https://discord.gg/evcoin)
- **Documentation**: [docs.evcoin.io](https://docs.evcoin.io)

---

<div align="center">

**🚀 Complete Deployment Guide for EVcoin Platform**

[Quick Start](#quick-start) • [Environment Setup](#environment-configuration) • [Monitoring](#monitoring--analytics) • [Troubleshooting](#troubleshooting)

</div>

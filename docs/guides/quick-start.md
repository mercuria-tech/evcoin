# ⚡ EVcoin Quick Start Guide

Get up and running with the EVcoin platform in minutes. This guide will help you set up the complete EV charging ecosystem with tokenization features.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [First Charging Session](#first-charging-session)
- [Token Rewards](#token-rewards)
- [Next Steps](#next-steps)

---

## ✅ Prerequisites

### Required Software
- **Node.js 18+** - [Download here](https://nodejs.org)
- **Git** - [Download here](https://git-scm.com)
- **Cloudflare Account** - [Sign up here](https://cloudflare.com)

### Required Accounts
- **GitHub Account** - For code repository access
- **Cloudflare Account** - For hosting and infrastructure
- **MetaMask Wallet** - For token management (optional)

---

## 🚀 Installation

### Step 1: Clone the Repository

```bash
# Clone the EVcoin repository
git clone https://github.com/mercuria-tech/evcoin.git
cd evcoin

# Verify installation
ls -la
```

### Step 2: Install Dependencies

```bash
# Install root dependencies
npm install

# Install admin dashboard dependencies
cd admin-dashboard-standalone
npm install
cd ..

# Install mobile app dependencies
cd apps/mobile
npm install
cd ../..

# Install backend API dependencies
cd backend-api
npm install
cd ..
```

### Step 3: Install Cloudflare CLI

```bash
# Install Wrangler CLI globally
npm install -g wrangler

# Authenticate with Cloudflare
wrangler login

# Verify authentication
wrangler whoami
```

---

## ⚙️ Configuration

### Step 1: Environment Setup

Create environment configuration files:

```bash
# Copy environment template
cp env.example .env

# Edit environment variables
nano .env
```

### Step 2: Required Environment Variables

```env
# Cloudflare Configuration
CLOUDFLARE_API_TOKEN=your-api-token-here
CLOUDFLARE_ACCOUNT_ID=your-account-id-here

# Database Configuration
DATABASE_URL=your-database-url
REDIS_URL=your-redis-url

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
JWT_EXPIRES_IN=3600

# Payment Providers (Optional for testing)
STRIPE_SECRET_KEY=sk_test_...
PAYPAL_CLIENT_ID=your-paypal-client-id

# Blockchain Configuration (Optional for testing)
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-project-id
EVCOIN_CONTRACT_ADDRESS=0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6

# External Services (Optional for testing)
GOOGLE_MAPS_API_KEY=your-google-maps-key
FIREBASE_PROJECT_ID=your-firebase-project
```

### Step 3: Cloudflare Resources Setup

```bash
# Create D1 database
wrangler d1 create evcoin-database

# Create KV namespaces
wrangler kv:namespace create "EVCOIN_CACHE" --env production
wrangler kv:namespace create "EVCOIN_SESSIONS" --env production

# Create R2 bucket
wrangler r2 bucket create evcoin-static-assets
```

### Step 4: Update wrangler.toml

```toml
name = "evcoin-platform"
main = "src/index.ts"
compatibility_date = "2023-12-01"

[env.production]
name = "evcoin-platform-prod"

[[env.production.kv_namespaces]]
binding = "CACHE"
id = "your-kv-id-here"

[[env.production.d1_databases]]
binding = "DB"
database_name = "evcoin-database"
database_id = "your-database-id-here"

[[env.production.r2_buckets]]
binding = "ASSETS"
bucket_name = "evcoin-static-assets"
```

---

## 🔌 First Charging Session

### Step 1: Start Development Servers

```bash
# Start backend API
cd backend-api
npm run dev &
cd ..

# Start admin dashboard
cd admin-dashboard-standalone
npm run dev &
cd ..

# Start mobile app (optional)
cd apps/mobile
npm start &
cd ../..
```

### Step 2: Access the Applications

- **Admin Dashboard**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **Mobile App**: http://localhost:19006 (Expo)

### Step 3: Create Your First User

```bash
# Register a new user via API
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securePassword123",
    "name": "Test User",
    "phone": "+1234567890"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "test@example.com",
      "name": "Test User",
      "tier": "bronze"
    }
  }
}
```

### Step 4: Login and Get Token

```bash
# Login to get access token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "securePassword123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "id": "user_123",
      "email": "test@example.com",
      "name": "Test User",
      "tier": "bronze"
    }
  }
}
```

### Step 5: Add a Vehicle

```bash
# Add a vehicle to your account
curl -X POST http://localhost:3000/api/v1/users/vehicles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "make": "Tesla",
    "model": "Model 3",
    "year": 2023,
    "batteryCapacity": 75,
    "maxChargingPower": 250,
    "connectorTypes": ["CCS", "Type2"]
  }'
```

### Step 6: Search for Charging Stations

```bash
# Search for nearby charging stations
curl -X GET "http://localhost:3000/api/v1/stations/search?lat=40.7128&lng=-74.0060&radius=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stations": [
      {
        "id": "station_123",
        "name": "Downtown Charging Hub",
        "address": "123 Main St, New York, NY",
        "coordinates": {
          "lat": 40.7128,
          "lng": -74.0060
        },
        "connectors": [
          {
            "id": "connector_123",
            "type": "CCS",
            "power": 150,
            "status": "available",
            "pricePerKwh": 0.35
          }
        ],
        "distance": 0.5
      }
    ]
  }
}
```

### Step 7: Start a Charging Session

```bash
# Start a charging session
curl -X POST http://localhost:3000/api/v1/charging/sessions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "stationId": "station_123",
    "connectorId": "connector_123",
    "vehicleId": "vehicle_123"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session_123",
    "status": "starting",
    "stationId": "station_123",
    "connectorId": "connector_123",
    "startTime": "2024-01-07T10:30:00Z",
    "estimatedDuration": 45,
    "estimatedCost": 25.50
  }
}
```

---

## 💎 Token Rewards

### Step 1: Check Token Balance

```bash
# Get your token balance
curl -X GET http://localhost:3000/api/v1/tokens/balance \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 0,
    "currency": "EVC",
    "pendingRewards": 0,
    "totalEarned": 0,
    "totalSpent": 0,
    "tier": "bronze",
    "multiplier": 1.0
  }
}
```

### Step 2: Calculate Potential Rewards

```bash
# Calculate rewards for a charging session
curl -X POST http://localhost:3000/api/v1/tokens/rewards/calculate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "energyDelivered": 25.5,
    "isGreenEnergy": true,
    "isOffPeak": false,
    "userTier": "bronze"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "baseReward": 255.00,
    "greenBonus": 127.50,
    "tierMultiplier": 1.0,
    "totalReward": 382.50,
    "breakdown": {
      "energyReward": 255.00,
      "greenEnergyBonus": 127.50,
      "loyaltyBonus": 0
    }
  }
}
```

### Step 3: Monitor Charging Session

```bash
# Get charging session details
curl -X GET http://localhost:3000/api/v1/charging/sessions/session_123 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session_123",
    "status": "charging",
    "energyDelivered": 15.5,
    "currentPower": 150,
    "cost": 5.43,
    "progress": {
      "percentage": 65,
      "remainingTime": 30
    }
  }
}
```

### Step 4: Complete Session and Earn Tokens

```bash
# Stop charging session
curl -X POST http://localhost:3000/api/v1/charging/sessions/session_123/stop \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

After completing the session, you'll automatically receive EVcoin tokens based on:
- **Energy delivered** (10 EVC per kWh)
- **Green energy bonus** (50% extra for renewable energy)
- **User tier multiplier** (Bronze: 1.0x, Silver: 1.1x, Gold: 1.3x, Platinum: 1.5x)

---

## 🎯 Next Steps

### 1. Explore the Admin Dashboard

Visit http://localhost:5173 to access the admin dashboard where you can:
- View charging sessions
- Manage stations
- Monitor token distribution
- Access analytics and reports

### 2. Test Mobile App

```bash
# Start the mobile app
cd apps/mobile
npm start

# Scan QR code with Expo Go app on your phone
```

### 3. Deploy to Production

```bash
# Deploy to Cloudflare
./deploy.sh

# Or deploy manually
wrangler deploy --env production
```

### 4. Set Up Monitoring

```bash
# Enable Cloudflare analytics
wrangler analytics enable

# Set up health checks
curl http://localhost:3000/api/v1/health
```

### 5. Configure Payment Processing

```bash
# Set up Stripe webhook
wrangler secret put STRIPE_WEBHOOK_SECRET

# Test payment flow
curl -X POST http://localhost:3000/api/v1/payments/methods \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "card",
    "provider": "stripe",
    "cardToken": "tok_test_..."
  }'
```

---

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Kill processes using ports
lsof -ti:3000 | xargs kill -9
lsof -ti:5173 | xargs kill -9
lsof -ti:19006 | xargs kill -9
```

#### Database Connection Issues
```bash
# Check database status
wrangler d1 execute evcoin-database --command "SELECT 1"

# Reset database (CAUTION: deletes all data)
wrangler d1 migrations apply evcoin-database --env production --first
```

#### Authentication Errors
```bash
# Check JWT secret
echo $JWT_SECRET

# Verify token format
curl -X POST http://localhost:3000/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

### Debug Mode

```bash
# Enable debug logging
export DEBUG=true

# Start with debug output
npm run dev:debug
```

---

## 📚 Additional Resources

### Documentation
- [Complete API Reference](api/README.md)
- [Tokenization Guide](guides/tokenization.md)
- [Deployment Guide](guides/deployment.md)
- [Architecture Overview](guides/architecture.md)

### Examples
- [JavaScript SDK Examples](examples/javascript/)
- [React Integration](examples/react/)
- [Mobile App Examples](examples/mobile/)

### Community
- [GitHub Repository](https://github.com/mercuria-tech/evcoin)
- [Discord Community](https://discord.gg/evcoin)
- [Documentation Issues](https://github.com/mercuria-tech/evcoin/issues)

---

## 🎉 Congratulations!

You've successfully set up the EVcoin platform! You now have:

- ✅ **Working API** - Backend services running
- ✅ **Admin Dashboard** - Management interface
- ✅ **Mobile App** - Cross-platform application
- ✅ **Token System** - EVcoin tokenization
- ✅ **Charging Sessions** - Complete charging flow
- ✅ **User Management** - Authentication and profiles

### What's Next?

1. **Deploy to Production** - Use the deployment guide
2. **Integrate Payment Processing** - Set up Stripe/PayPal
3. **Connect Real Stations** - Integrate with OCPP stations
4. **Customize Branding** - Modify UI/UX for your brand
5. **Scale Infrastructure** - Optimize for production load

---

<div align="center">

**⚡ Welcome to the Future of EV Charging!**

[API Reference](api/README.md) • [Deployment Guide](guides/deployment.md) • [Tokenization](guides/tokenization.md) • [Community](https://discord.gg/evcoin)

</div>

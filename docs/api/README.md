# 🔌 EVcoin API Reference

The EVcoin API provides comprehensive endpoints for managing electric vehicle charging infrastructure, user accounts, payments, and tokenization features.

## 📋 Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Endpoints](#endpoints)
  - [Authentication](#authentication-endpoints)
  - [Users](#user-endpoints)
  - [Stations](#station-endpoints)
  - [Charging](#charging-endpoints)
  - [Payments](#payment-endpoints)
  - [Reservations](#reservation-endpoints)
  - [Notifications](#notification-endpoints)
  - [Tokens](#token-endpoints)
- [WebSocket Events](#websocket-events)
- [SDKs](#sdks)

---

## 🔐 Authentication

The EVcoin API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Getting an Access Token

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your-password"
}
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
      "email": "user@example.com",
      "name": "John Doe",
      "tier": "gold"
    }
  }
}
```

---

## 🌐 Base URL

### Production
```
https://api.evcoin.io/api/v1
```

### Staging
```
https://staging-api.evcoin.io/api/v1
```

### Development
```
http://localhost:3000/api/v1
```

---

## ⚡ Rate Limiting

API requests are rate limited to ensure fair usage:

- **Authenticated requests**: 1000 requests per hour
- **Unauthenticated requests**: 100 requests per hour
- **WebSocket connections**: 10 concurrent connections per user

Rate limit headers are included in responses:
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

---

## ❌ Error Handling

All API errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input parameters",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "timestamp": "2024-01-07T10:30:00Z",
  "requestId": "req_123456789"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | Invalid or missing authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## 🔗 Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe",
  "phone": "+1234567890",
  "country": "US"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "tier": "bronze",
      "createdAt": "2024-01-07T10:30:00Z"
    },
    "verificationRequired": true
  }
}
```

#### Login User
```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

#### Refresh Token
```http
POST /api/v1/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Logout User
```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

### User Endpoints

#### Get User Profile
```http
GET /api/v1/users/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "user@example.com",
    "name": "John Doe",
    "phone": "+1234567890",
    "tier": "gold",
    "preferences": {
      "language": "en",
      "notifications": true,
      "currency": "USD"
    },
    "statistics": {
      "totalSessions": 45,
      "totalEnergy": 1250.5,
      "totalTokens": 12500,
      "carbonSaved": 2.5
    }
  }
}
```

#### Update User Profile
```http
PUT /api/v1/users/profile
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "phone": "+1234567891",
  "preferences": {
    "language": "en",
    "notifications": false
  }
}
```

#### Get User Vehicles
```http
GET /api/v1/users/vehicles
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "vehicle_123",
      "make": "Tesla",
      "model": "Model 3",
      "year": 2023,
      "batteryCapacity": 75,
      "maxChargingPower": 250,
      "connectorTypes": ["CCS", "Type2"],
      "isDefault": true
    }
  ]
}
```

#### Add Vehicle
```http
POST /api/v1/users/vehicles
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "make": "Tesla",
  "model": "Model Y",
  "year": 2023,
  "batteryCapacity": 75,
  "maxChargingPower": 250,
  "connectorTypes": ["CCS", "Type2"],
  "licensePlate": "ABC123"
}
```

### Station Endpoints

#### Search Stations
```http
GET /api/v1/stations/search?lat=40.7128&lng=-74.0060&radius=10&connectorType=CCS&maxPower=150
Authorization: Bearer <token>
```

**Query Parameters:**
- `lat` (required): Latitude
- `lng` (required): Longitude
- `radius` (optional): Search radius in km (default: 10)
- `connectorType` (optional): CCS, Type2, CHAdeMO, Tesla
- `maxPower` (optional): Minimum power in kW
- `amenities` (optional): wifi,restroom,food,parking
- `operator` (optional): Station operator filter

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
        "operator": "EVGo",
        "connectors": [
          {
            "id": "connector_123",
            "type": "CCS",
            "power": 150,
            "status": "available",
            "pricePerKwh": 0.35
          }
        ],
        "amenities": ["wifi", "restroom", "food"],
        "rating": 4.5,
        "distance": 0.5
      }
    ],
    "totalCount": 1,
    "hasMore": false
  }
}
```

#### Get Station Details
```http
GET /api/v1/stations/{stationId}
Authorization: Bearer <token>
```

#### Get Station Availability
```http
GET /api/v1/stations/{stationId}/availability
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stationId": "station_123",
    "connectors": [
      {
        "id": "connector_123",
        "status": "available",
        "currentSession": null,
        "nextReservation": null
      }
    ],
    "lastUpdated": "2024-01-07T10:30:00Z"
  }
}
```

### Charging Endpoints

#### Start Charging Session
```http
POST /api/v1/charging/sessions
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "stationId": "station_123",
  "connectorId": "connector_123",
  "vehicleId": "vehicle_123",
  "paymentMethodId": "pm_123",
  "maxCost": 50.00
}
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
    "vehicleId": "vehicle_123",
    "startTime": "2024-01-07T10:30:00Z",
    "estimatedDuration": 45,
    "estimatedCost": 25.50,
    "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
  }
}
```

#### Get Charging Session
```http
GET /api/v1/charging/sessions/{sessionId}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session_123",
    "status": "charging",
    "stationId": "station_123",
    "connectorId": "connector_123",
    "vehicleId": "vehicle_123",
    "startTime": "2024-01-07T10:30:00Z",
    "currentTime": "2024-01-07T10:45:00Z",
    "energyDelivered": 15.5,
    "currentPower": 150,
    "cost": 5.43,
    "estimatedCompletion": "2024-01-07T11:15:00Z",
    "progress": {
      "percentage": 65,
      "remainingTime": 30
    }
  }
}
```

#### Stop Charging Session
```http
POST /api/v1/charging/sessions/{sessionId}/stop
Authorization: Bearer <token>
```

#### Get Charging History
```http
GET /api/v1/charging/history?limit=20&offset=0&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

### Payment Endpoints

#### Get Payment Methods
```http
GET /api/v1/payments/methods
Authorization: Bearer <token>
```

#### Add Payment Method
```http
POST /api/v1/payments/methods
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "type": "card",
  "provider": "stripe",
  "cardToken": "tok_1234567890",
  "isDefault": true
}
```

#### Get Transactions
```http
GET /api/v1/payments/transactions?limit=20&offset=0&status=completed
Authorization: Bearer <token>
```

### Reservation Endpoints

#### Create Reservation
```http
POST /api/v1/reservations
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "stationId": "station_123",
  "connectorId": "connector_123",
  "startTime": "2024-01-07T14:00:00Z",
  "duration": 60,
  "vehicleId": "vehicle_123"
}
```

#### Get Reservations
```http
GET /api/v1/reservations?status=upcoming&limit=10
Authorization: Bearer <token>
```

#### Cancel Reservation
```http
DELETE /api/v1/reservations/{reservationId}
Authorization: Bearer <token>
```

### Notification Endpoints

#### Get Notifications
```http
GET /api/v1/notifications?unreadOnly=true&limit=20
Authorization: Bearer <token>
```

#### Mark Notification as Read
```http
PUT /api/v1/notifications/{notificationId}/read
Authorization: Bearer <token>
```

### Token Endpoints

#### Get Token Balance
```http
GET /api/v1/tokens/balance
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "balance": 12500.50,
    "currency": "EVC",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "pendingRewards": 150.25,
    "totalEarned": 15000.75,
    "totalSpent": 2500.25
  }
}
```

#### Get Token Transactions
```http
GET /api/v1/tokens/transactions?type=reward&limit=20
Authorization: Bearer <token>
```

#### Transfer Tokens
```http
POST /api/v1/tokens/transfer
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "recipient": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  "amount": 100.00,
  "memo": "Payment for charging session"
}
```

#### Calculate Rewards
```http
POST /api/v1/tokens/rewards/calculate
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "energyDelivered": 25.5,
  "isGreenEnergy": true,
  "isOffPeak": false,
  "userTier": "gold"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "baseReward": 255.00,
    "greenBonus": 127.50,
    "tierMultiplier": 1.3,
    "totalReward": 497.25,
    "breakdown": {
      "energyReward": 255.00,
      "greenEnergyBonus": 127.50,
      "loyaltyBonus": 114.75
    }
  }
}
```

---

## 🔌 WebSocket Events

Connect to the WebSocket endpoint for real-time updates:

```javascript
const ws = new WebSocket('wss://api.evcoin.io/ws?token=<your-jwt-token>');

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Received:', data);
};
```

### Event Types

#### Charging Session Updates
```json
{
  "type": "charging_session_update",
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

#### Station Status Updates
```json
{
  "type": "station_status_update",
  "data": {
    "stationId": "station_123",
    "connectors": [
      {
        "id": "connector_123",
        "status": "available",
        "currentSession": null
      }
    ]
  }
}
```

#### Token Rewards
```json
{
  "type": "token_reward",
  "data": {
    "sessionId": "session_123",
    "rewardAmount": 25.50,
    "reason": "charging_completed",
    "newBalance": 12525.50
  }
}
```

---

## 📦 SDKs

### JavaScript/TypeScript
```bash
npm install @evcoin/sdk
```

```typescript
import { EVcoinAPI } from '@evcoin/sdk';

const api = new EVcoinAPI({
  apiKey: 'your-api-key',
  environment: 'production'
});

// Search stations
const stations = await api.stations.search({
  lat: 40.7128,
  lng: -74.0060,
  radius: 10
});
```

### Python
```bash
pip install evcoin-sdk
```

```python
from evcoin import EVcoinAPI

api = EVcoinAPI(api_key='your-api-key')

# Search stations
stations = api.stations.search(
    lat=40.7128,
    lng=-74.0060,
    radius=10
)
```

### React Native
```bash
npm install @evcoin/react-native-sdk
```

```typescript
import { EVcoinSDK } from '@evcoin/react-native-sdk';

const sdk = new EVcoinSDK({
  apiKey: 'your-api-key'
});

// Start charging session
const session = await sdk.charging.startSession({
  stationId: 'station_123',
  connectorId: 'connector_123'
});
```

---

## 🧪 Testing

### Postman Collection
Download our Postman collection for easy API testing:
[EVcoin API Collection](https://www.postman.com/evcoin/workspace/evcoin-api)

### API Testing Tool
Use our interactive API explorer:
[API Explorer](https://api.evcoin.io/explorer)

---

## 📞 Support

- **API Support**: [api-support@evcoin.io](mailto:api-support@evcoin.io)
- **Documentation Issues**: [GitHub Issues](https://github.com/mercuria-tech/evcoin/issues)
- **Developer Community**: [Discord](https://discord.gg/evcoin)

---

<div align="center">

**🔌 Complete API Reference for EVcoin Platform**

[Authentication](authentication.md) • [WebSocket Events](websocket.md) • [SDKs](reference/sdk.md) • [Examples](examples/)

</div>

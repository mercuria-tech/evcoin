-- Initial database schema for EV Charging Platform on Cloudflare D1

-- Enable required extensions
PRAGMA journal_mode = WAL;

-- Create index for UUID primary keys
CREATE TABLE IF NOT EXISTS migrations (
  version INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  profile_picture TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  preferences TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  vin TEXT,
  license_plate TEXT,
  battery_capacity_kwh DECIMAL(5,2),
  charging_power_max_kw DECIMAL(5,2),
  connector_types TEXT, -- JSON array
  is_default BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Stations table
CREATE TABLE IF NOT EXISTS stations (
  id TEXT PRIMARY KEY,
  operator_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  address_street TEXT NOT NULL,
  address_city TEXT NOT NULL,
  address_state TEXT,
  address_zip TEXT NOT NULL,
  address_country TEXT NOT NULL DEFAULT 'US',
  location_lat DECIMAL(10, 8) NOT NULL,
  location_lng DECIMAL(11, 8) NOT NULL,
  amenities TEXT, -- JSON array
  operating_hours Text, -- JSON
  contact_phone TEXT,
  contact_email TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'maintenance', 'inactive')),
  rating DECIMAL(2,1) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  photos TEXT, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Connectors table
CREATE TABLE IF NOT EXISTS connectors (
  id TEXT PRIMARY KEY,
  station_id TEXT NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  connector_number INTEGER NOT NULL,
  type TEXT NOT NULL, -- Type2, CCS, CHAdeMO, etc.
  power_kw DECIMAL(5,2) NOT NULL,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'out_of_service')),
  voltage_min INTEGER,
  voltage_max INTEGER,
  amperage_max INTEGER,
  pricing TEXT, -- JSON
  last_status_update DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(station_id, connector_number)
);

-- Charging sessions table
CREATE TABLE IF NOT EXISTS charging_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
  vehicle_id TEXT REFERENCES vehicles(id) ON DELETE SET NULL,
  station_id TEXT NOT NULL REFERENCES stations(id),
  connector_id TEXT NOT NULL REFERENCES connectors(id),
  status TEXT NOT NULL CHECK (status IN ('starting', 'charging', 'paused', 'completed', 'failed', 'cancelled')),
  start_method TEXT CHECK (start_method IN ('qr_code', 'rfid', 'app')),
  started_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME,
  duration_seconds INTEGER,
  energy_delivered_kwh DECIMAL(8,3),
  power_max_kw DECIMAL(5,2),
  power_avg_kw DECIMAL(5,2),
  cost_amount DECIMAL(10,2),
  cost_currency TEXT DEFAULT 'USD',
  payment_method_id TEXT,
  transaction_id TEXT,
  error_code TEXT,
  error_message TEXT,
  ocpp_session_id TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Reservations table
CREATE TABLE IF NOT EXISTS reservations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  station_id TEXT NOT NULL REFERENCES stations(id),
  connector_id TEXT NOT NULL REFERENCES connectors(id),
  vehicle_id TEXT REFERENCES vehicles(id) ON DELETE SET NULL,
  start_time DATETIME NOT NULL,
  end_time DATETIME NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('confirmed', 'checked_in', 'completed', 'cancelled', 'no_show')),
  reservation_fee DECIMAL(8,2),
  no_show_fee DECIMAL(8,2),
  grace_period_minutes INTEGER DEFAULT 15,
  check_in_time DATETIME,
  cancelled_at DATETIME,
  cancellation_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('card', 'wallet', 'bank_account')),
  provider TEXT NOT NULL, -- stripe, paypal, etc.
  provider_payment_method_id TEXT NOT NULL,
  card_brand TEXT,
  card_last4 TEXT,
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  billing_address TEXT, -- JSON
  is_default BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL CHECK (status IN ('active', 'expired', 'removed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('charge', 'refund', 'authorization', 'capture', 'fee')),
  session_id TEXT REFERENCES charging_sessions(id),
  reservation_id TEXT REFERENCES reservations(id),
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled')),
  payment_method_id TEXT REFERENCES payment_methods(id),
  provider TEXT, -- stripe, paypal, etc.
  provider_transaction_id TEXT,
  authorization_code TEXT,
  description TEXT,
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'push', 'in_app', 'webhook')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'read')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  rich_content TEXT, -- JSON
  action_button TEXT, -- JSON
  metadata TEXT, -- JSON
  scheduled_for DATETIME,
  sent_at DATETIME,
  delivered_at DATETIME,
  read_at DATETIME,
  failed_at DATETIME,
  failure_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS support_tickets (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_id TEXT REFERENCES charging_sessions(id),
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category TEXT NOT NULL,
  assigned_to TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_vehicles_user_id ON vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_stations_location ON stations(location_lat, location_lng);
CREATE INDEX IF NOT EXISTS idx_stations_status ON stations(status);
CREATE INDEX IF NOT EXISTS idx_stations_rating ON stations(rating);
CREATE INDEX IF NOT EXISTS idx_connectors_station_id ON connectors(station_id);
CREATE INDEX IF NOT EXISTS idx_connectors_status ON connectors(status);
CREATE INDEX IF NOT EXISTS idx_charging_sessions_user_id ON charging_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_charging_sessions_station_id ON charging_sessions(station_id);
CREATE INDEX IF NOT EXISTS idx_charging_sessions_status ON charging_sessions(status);
CREATE INDEX IF NOT EXISTS idx_charging_sessions_started_at ON charging_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_session_id ON reservations(station_id);
CREATE INDEX IF NOT EXISTS idx_reservations_dates ON reservations(start_time, end_time);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled_for ON notifications(scheduled_for);

-- Insert migration record
INSERT INTO migrations (version, name) VALUES (1, '0001_initial_schema');

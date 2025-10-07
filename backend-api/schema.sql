-- EV Charging Platform Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    role TEXT DEFAULT 'customer',
    status TEXT DEFAULT 'active',
    join_date TEXT NOT NULL,
    location TEXT,
    total_sessions INTEGER DEFAULT 0,
    total_spent REAL DEFAULT 0,
    last_activity TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Stations table
CREATE TABLE IF NOT EXISTS stations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    status TEXT DEFAULT 'active',
    last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Connectors table
CREATE TABLE IF NOT EXISTS connectors (
    id TEXT PRIMARY KEY,
    station_id TEXT NOT NULL,
    type TEXT NOT NULL,
    power TEXT NOT NULL,
    status TEXT DEFAULT 'available',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

-- Charging sessions table
CREATE TABLE IF NOT EXISTS charging_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    station_id TEXT NOT NULL,
    connector_id TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT,
    energy_delivered REAL DEFAULT 0,
    cost REAL DEFAULT 0,
    status TEXT DEFAULT 'active',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (station_id) REFERENCES stations(id),
    FOREIGN KEY (connector_id) REFERENCES connectors(id)
);

-- Insert sample data
INSERT OR IGNORE INTO users (id, name, email, phone, role, status, join_date, location, total_sessions, total_spent, last_activity) VALUES
('1', 'John Doe', 'john.doe@example.com', '+1 (555) 123-4567', 'customer', 'active', '2024-01-15', 'New York, NY', 45, 1250.50, '2 hours ago'),
('2', 'Jane Smith', 'jane.smith@example.com', '+1 (555) 234-5678', 'customer', 'active', '2024-02-20', 'Los Angeles, CA', 32, 890.25, '1 day ago'),
('3', 'Mike Johnson', 'mike.johnson@example.com', '+1 (555) 345-6789', 'admin', 'active', '2023-12-01', 'Chicago, IL', 78, 2100.75, '30 minutes ago');

INSERT OR IGNORE INTO stations (id, name, location, latitude, longitude, status) VALUES
('ST-001', 'Downtown Charging Hub', '123 Main St, Downtown', 40.7128, -74.0060, 'active'),
('ST-002', 'Mall Charging Station', '456 Mall Ave, Shopping District', 40.7589, -73.9851, 'active');

INSERT OR IGNORE INTO connectors (id, station_id, type, power, status) VALUES
('C1-ST001', 'ST-001', 'CCS', '150kW', 'available'),
('C2-ST001', 'ST-001', 'CHAdeMO', '50kW', 'charging'),
('C3-ST001', 'ST-001', 'Type 2', '22kW', 'available'),
('C4-ST001', 'ST-001', 'CCS', '150kW', 'maintenance'),
('C1-ST002', 'ST-002', 'Type 2', '22kW', 'available'),
('C2-ST002', 'ST-002', 'Type 2', '22kW', 'available');

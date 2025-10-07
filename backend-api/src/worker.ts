import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: [
    'https://729665ee.ev-charging-admin.pages.dev', 
    'https://c725030b.ev-charging-admin-react.pages.dev', 
    'https://75c3dc09.ev-charging-admin.pages.dev',
    'https://8b865c7e.ev-charging-admin.pages.dev',
    'https://62c50193.ev-charging-admin.pages.dev',
    'https://02792785.ev-charging-admin.pages.dev',
    'https://b7444e75.ev-charging-admin.pages.dev',
    'https://51e0cd98.ev-charging-admin.pages.dev',
    'https://2c35c92a.ev-charging-admin.pages.dev',
    'https://26a94714.ev-charging-admin.pages.dev',
    'https://513e0b7b.ev-charging-admin.pages.dev',
    'https://d86e5487.ev-charging-admin.pages.dev',
    'https://faf355b7.ev-charging-admin.pages.dev',
    'https://1b5bec3f.ev-charging-admin.pages.dev',
    'https://b542f830.ev-charging-admin.pages.dev',
    'https://72a89e7d.ev-charging-admin.pages.dev',
    'https://ae81a447.ev-charging-admin.pages.dev',
    'https://dc80b3ae.ev-charging-admin.pages.dev',
    'https://ea779a1a.ev-charging-admin.pages.dev',
    'https://5961ad97.ev-charging-admin.pages.dev',
    'https://74b3fdfd.ev-charging-admin.pages.dev',
    'https://66bc4e8b.ev-charging-admin.pages.dev',
    'https://29be6ac7.ev-charging-admin.pages.dev',
    'https://a33b4944.ev-charging-admin.pages.dev',
    'https://ev-charging-token-service.mks-alghafil.workers.dev',
    'http://localhost:5173'
  ],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

app.use('*', logger());

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: Date.now()
  });
});

// Mock data
const users = [
  {
    id: '1',
    email: 'admin@evcharging.com',
    password: 'password', // In production, this would be hashed
    name: 'Admin User',
    role: 'admin'
  }
];

const stations = [
  {
    id: 'ST-001',
    name: 'Downtown Charging Hub',
    location: '123 Main St, Downtown',
    latitude: 40.7128,
    longitude: -74.0060,
    connectors: [
      { id: 'C1', type: 'CCS', power: '150kW', status: 'available' },
      { id: 'C2', type: 'CHAdeMO', power: '50kW', status: 'charging' },
      { id: 'C3', type: 'Type 2', power: '22kW', status: 'available' },
      { id: 'C4', type: 'CCS', power: '150kW', status: 'maintenance' }
    ],
    status: 'active',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'ST-002',
    name: 'Mall Charging Station',
    location: '456 Mall Ave, Shopping District',
    latitude: 40.7589,
    longitude: -73.9851,
    connectors: [
      { id: 'C1', type: 'Type 2', power: '22kW', status: 'available' },
      { id: 'C2', type: 'Type 2', power: '22kW', status: 'available' }
    ],
    status: 'active',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'ST-003',
    name: 'Highway Rest Stop',
    location: '789 Highway 101, Exit 45',
    latitude: 40.6892,
    longitude: -74.0445,
    connectors: [
      { id: 'C1', type: 'CCS', power: '200kW', status: 'available' },
      { id: 'C2', type: 'CCS', power: '200kW', status: 'charging' },
      { id: 'C3', type: 'CHAdeMO', power: '50kW', status: 'available' },
      { id: 'C4', type: 'Type 2', power: '22kW', status: 'available' },
      { id: 'C5', type: 'Type 2', power: '22kW', status: 'available' },
      { id: 'C6', type: 'CCS', power: '200kW', status: 'maintenance' }
    ],
    status: 'active',
    lastUpdated: new Date().toISOString()
  }
];

// Auth routes
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    // Simple token (in production, use proper JWT)
    const token = btoa(JSON.stringify({ userId: user.id, email: user.email, role: user.role }));

    return c.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.post('/api/auth/register', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return c.json({ error: 'User already exists' }, 400);
    }

    const newUser = {
      id: (users.length + 1).toString(),
      email,
      password,
      name,
      role: 'user'
    };

    users.push(newUser);

    const token = btoa(JSON.stringify({ userId: newUser.id, email: newUser.email, role: newUser.role }));

    return c.json({
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    }, 201);
  } catch (error) {
    return c.json({ error: 'Internal server error' }, 500);
  }
});

app.get('/api/auth/verify', async (c) => {
  const authHeader = c.req.header('Authorization');
  const token = authHeader?.split(' ')[1];
  
  if (!token) {
    return c.json({ error: 'No token provided' }, 401);
  }

  try {
    const decoded = JSON.parse(atob(token));
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return c.json({ error: 'Invalid token' }, 401);
    }

    return c.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    return c.json({ error: 'Invalid token' }, 401);
  }
});

// Users routes
app.get('/api/users', async (c) => {
  const { page = 1, limit = 10, search = '', status = '', role = '' } = c.req.query();
  
  try {
    // Get database binding
    const db = c.env.DB;
    
    if (!db) {
      // Fallback to mock data if database not available
      const mockUsers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          role: 'customer',
          status: 'active',
          joinDate: '2024-01-15',
          location: 'New York, NY',
          totalSessions: 45,
          totalSpent: 1250.50,
          lastActivity: '2 hours ago'
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+1 (555) 234-5678',
          role: 'customer',
          status: 'active',
          joinDate: '2024-02-20',
          location: 'Los Angeles, CA',
          totalSessions: 32,
          totalSpent: 890.25,
          lastActivity: '1 day ago'
        },
        {
          id: '3',
          name: 'Mike Johnson',
          email: 'mike.johnson@example.com',
          phone: '+1 (555) 345-6789',
          role: 'admin',
          status: 'active',
          joinDate: '2023-12-01',
          location: 'Chicago, IL',
          totalSessions: 78,
          totalSpent: 2100.75,
          lastActivity: '30 minutes ago'
        }
      ];
      
      return c.json({
        users: mockUsers,
        total: mockUsers.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: 1
      });
    }
    
    // Build query with filters
    let query = 'SELECT * FROM users WHERE 1=1';
    const params = [];
    
    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR location LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }
    
    // Add pagination
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    const users = await db.prepare(query).bind(...params).all();
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM users WHERE 1=1';
    const countParams = [];
    
    if (search) {
      countQuery += ' AND (name LIKE ? OR email LIKE ? OR location LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (status) {
      countQuery += ' AND status = ?';
      countParams.push(status);
    }
    
    if (role) {
      countQuery += ' AND role = ?';
      countParams.push(role);
    }
    
    const countResult = await db.prepare(countQuery).bind(...countParams).first();
    const total = countResult?.total || 0;
    
    return c.json({
      users: users.results || [],
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
    
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

app.post('/api/users', async (c) => {
  try {
    const userData = await c.req.json();
    
    // Validate required fields
    if (!userData.name || !userData.email) {
      return c.json({ error: 'Name and email are required' }, 400);
    }
    
    const db = c.env.DB;
    
    if (!db) {
      // Fallback to mock response if database not available
      const newUser = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role || 'customer',
        status: 'active',
        joinDate: new Date().toISOString().split('T')[0],
        location: userData.location || '',
        totalSessions: 0,
        totalSpent: 0,
        lastActivity: 'Just now'
      };
      
      return c.json({
        message: 'User created successfully (mock)',
        user: newUser
      }, 201);
    }
    
    // Generate unique ID
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Insert into database
    const result = await db.prepare(`
      INSERT INTO users (id, name, email, phone, role, status, join_date, location, total_sessions, total_spent, last_activity)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      userId,
      userData.name,
      userData.email,
      userData.phone || '',
      userData.role || 'customer',
      'active',
      new Date().toISOString().split('T')[0],
      userData.location || '',
      0,
      0,
      'Just now'
    ).run();
    
    if (result.success) {
      // Fetch the created user
      const createdUser = await db.prepare('SELECT * FROM users WHERE id = ?').bind(userId).first();
      
      return c.json({
        message: 'User created successfully',
        user: createdUser
      }, 201);
    } else {
      return c.json({ error: 'Failed to create user' }, 500);
    }
    
  } catch (error) {
    console.error('Error creating user:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

app.put('/api/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const userData = await c.req.json();
    
    // Validate required fields
    if (!userData.name || !userData.email) {
      return c.json({ error: 'Name and email are required' }, 400);
    }
    
    const db = c.env.DB;
    
    if (!db) {
      // Fallback to mock response if database not available
      const updatedUser = {
        id,
        ...userData,
        lastActivity: 'Just now'
      };
      
      return c.json({
        message: 'User updated successfully (mock)',
        user: updatedUser
      });
    }
    
    // Update user in database
    const result = await db.prepare(`
      UPDATE users 
      SET name = ?, email = ?, phone = ?, role = ?, status = ?, location = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      userData.name,
      userData.email,
      userData.phone || '',
      userData.role || 'customer',
      userData.status || 'active',
      userData.location || '',
      id
    ).run();
    
    if (result.success) {
      // Fetch the updated user
      const updatedUser = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
      
      if (updatedUser) {
        return c.json({
          message: 'User updated successfully',
          user: updatedUser
        });
      } else {
        return c.json({ error: 'User not found' }, 404);
      }
    } else {
      return c.json({ error: 'Failed to update user' }, 500);
    }
    
  } catch (error) {
    console.error('Error updating user:', error);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

app.delete('/api/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const db = c.env.DB;
    
    if (!db) {
      // Fallback to mock response if database not available
      return c.json({
        message: 'User deleted successfully (mock)',
        id
      });
    }
    
    // Check if user exists
    const existingUser = await db.prepare('SELECT * FROM users WHERE id = ?').bind(id).first();
    
    if (!existingUser) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    // Delete user from database
    const result = await db.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
    
    if (result.success) {
      return c.json({
        message: 'User deleted successfully',
        id
      });
    } else {
      return c.json({ error: 'Failed to delete user' }, 500);
    }
    
  } catch (error) {
    console.error('Error deleting user:', error);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

// Stations routes
app.get('/api/stations', async (c) => {
  const { page = 1, limit = 10, search = '', status = '' } = c.req.query();
  
  let stations = [
    {
      id: 'ST-001',
      name: 'Downtown Charging Hub',
      location: '123 Main St, Downtown',
      latitude: 40.7128,
      longitude: -74.0060,
      connectors: [
        { id: 'C1', type: 'CCS', power: '150kW', status: 'available' },
        { id: 'C2', type: 'CHAdeMO', power: '50kW', status: 'charging' },
        { id: 'C3', type: 'Type 2', power: '22kW', status: 'available' },
        { id: 'C4', type: 'CCS', power: '150kW', status: 'maintenance' }
      ],
      status: 'active',
      lastUpdated: new Date().toISOString()
    },
    {
      id: 'ST-002',
      name: 'Mall Charging Station',
      location: '456 Mall Ave, Shopping District',
      latitude: 40.7589,
      longitude: -73.9851,
      connectors: [
        { id: 'C1', type: 'Type 2', power: '22kW', status: 'available' },
        { id: 'C2', type: 'Type 2', power: '22kW', status: 'available' }
      ],
      status: 'active',
      lastUpdated: new Date().toISOString()
    }
  ];
  
  // Apply filters
  if (search) {
    stations = stations.filter(station => 
      station.name.toLowerCase().includes(search.toLowerCase()) ||
      station.location.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  if (status) {
    stations = stations.filter(station => station.status === status);
  }
  
  return c.json({
    stations,
    total: stations.length
  });
});

app.post('/api/stations', async (c) => {
  try {
    const stationData = await c.req.json();
    
    // Validate required fields
    if (!stationData.name || !stationData.location) {
      return c.json({ error: 'Name and location are required' }, 400);
    }
    
    // Create new station
    const newStation = {
      id: `ST-${Date.now().toString().slice(-3)}`,
      name: stationData.name,
      location: stationData.location,
      latitude: stationData.latitude || 0,
      longitude: stationData.longitude || 0,
      connectors: stationData.connectors || [],
      status: 'active',
      lastUpdated: new Date().toISOString()
    };
    
    return c.json({
      message: 'Station created successfully',
      station: newStation
    }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to create station' }, 500);
  }
});

app.put('/api/stations/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const stationData = await c.req.json();
    
    // Update station
    const updatedStation = {
      id,
      ...stationData,
      lastUpdated: new Date().toISOString()
    };
    
    return c.json({
      message: 'Station updated successfully',
      station: updatedStation
    });
  } catch (error) {
    return c.json({ error: 'Failed to update station' }, 500);
  }
});

app.delete('/api/stations/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    return c.json({
      message: 'Station deleted successfully',
      id
    });
  } catch (error) {
    return c.json({ error: 'Failed to delete station' }, 500);
  }
});

// Charging Sessions routes
app.get('/api/charging/sessions', async (c) => {
  const { page = 1, limit = 10, search = '', status = '', userId = '' } = c.req.query();
  
  try {
    const db = c.env.DB;
    
    if (!db) {
      // Fallback to mock data if database not available
      const mockSessions = [
        {
          id: 'CS-001',
          userId: '1',
          userName: 'John Doe',
          stationId: 'ST-001',
          stationName: 'Downtown Charging Hub',
          connectorId: 'C1',
          startTime: '2024-01-15T10:30:00Z',
          endTime: '2024-01-15T11:45:00Z',
          energyDelivered: 45.5,
          cost: 25.75,
          status: 'completed'
        },
        {
          id: 'CS-002',
          userId: '2',
          userName: 'Jane Smith',
          stationId: 'ST-002',
          stationName: 'Mall Charging Station',
          connectorId: 'C1',
          startTime: '2024-01-15T14:20:00Z',
          endTime: null,
          energyDelivered: 12.3,
          cost: 0,
          status: 'active'
        }
      ];
      
      return c.json({
        sessions: mockSessions,
        total: mockSessions.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: 1
      });
    }
    
    // Build query with filters
    let query = `
      SELECT cs.*, u.name as user_name, s.name as station_name 
      FROM charging_sessions cs
      LEFT JOIN users u ON cs.user_id = u.id
      LEFT JOIN stations s ON cs.station_id = s.id
      WHERE 1=1
    `;
    const params = [];
    
    if (search) {
      query += ' AND (u.name LIKE ? OR s.name LIKE ? OR cs.id LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (status) {
      query += ' AND cs.status = ?';
      params.push(status);
    }
    
    if (userId) {
      query += ' AND cs.user_id = ?';
      params.push(userId);
    }
    
    // Add pagination
    query += ' ORDER BY cs.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    const sessions = await db.prepare(query).bind(...params).all();
    
    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM charging_sessions cs WHERE 1=1';
    const countParams = [];
    
    if (search) {
      countQuery += ' AND (cs.id LIKE ?)';
      const searchTerm = `%${search}%`;
      countParams.push(searchTerm);
    }
    
    if (status) {
      countQuery += ' AND cs.status = ?';
      countParams.push(status);
    }
    
    if (userId) {
      countQuery += ' AND cs.user_id = ?';
      countParams.push(userId);
    }
    
    const countResult = await db.prepare(countQuery).bind(...countParams).first();
    const total = countResult?.total || 0;
    
    return c.json({
      sessions: sessions.results || [],
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit))
    });
    
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to fetch charging sessions' }, 500);
  }
});

app.post('/api/charging/sessions', async (c) => {
  try {
    const sessionData = await c.req.json();
    
    // Validate required fields
    if (!sessionData.userId || !sessionData.stationId || !sessionData.connectorId) {
      return c.json({ error: 'User ID, Station ID, and Connector ID are required' }, 400);
    }
    
    const db = c.env.DB;
    
    if (!db) {
      // Fallback to mock response if database not available
      const newSession = {
        id: `CS-${Date.now().toString().slice(-3)}`,
        userId: sessionData.userId,
        stationId: sessionData.stationId,
        connectorId: sessionData.connectorId,
        startTime: new Date().toISOString(),
        endTime: null,
        energyDelivered: 0,
        cost: 0,
        status: 'active'
      };
      
      return c.json({
        message: 'Charging session created successfully (mock)',
        session: newSession
      }, 201);
    }
    
    // Generate unique ID
    const sessionId = `cs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Insert into database
    const result = await db.prepare(`
      INSERT INTO charging_sessions (id, user_id, station_id, connector_id, start_time, end_time, energy_delivered, cost, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      sessionId,
      sessionData.userId,
      sessionData.stationId,
      sessionData.connectorId,
      new Date().toISOString(),
      null,
      0,
      0,
      'active'
    ).run();
    
    if (result.success) {
      // Fetch the created session with user and station names
      const createdSession = await db.prepare(`
        SELECT cs.*, u.name as user_name, s.name as station_name 
        FROM charging_sessions cs
        LEFT JOIN users u ON cs.user_id = u.id
        LEFT JOIN stations s ON cs.station_id = s.id
        WHERE cs.id = ?
      `).bind(sessionId).first();
      
      return c.json({
        message: 'Charging session created successfully',
        session: createdSession
      }, 201);
    } else {
      return c.json({ error: 'Failed to create charging session' }, 500);
    }
    
  } catch (error) {
    console.error('Error creating charging session:', error);
    return c.json({ error: 'Failed to create charging session' }, 500);
  }
});

app.put('/api/charging/sessions/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const sessionData = await c.req.json();
    
    const db = c.env.DB;
    
    if (!db) {
      // Fallback to mock response if database not available
      const updatedSession = {
        id,
        ...sessionData
      };
      
      return c.json({
        message: 'Charging session updated successfully (mock)',
        session: updatedSession
      });
    }
    
    // Update session in database
    const result = await db.prepare(`
      UPDATE charging_sessions 
      SET end_time = ?, energy_delivered = ?, cost = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(
      sessionData.endTime || null,
      sessionData.energyDelivered || 0,
      sessionData.cost || 0,
      sessionData.status || 'active',
      id
    ).run();
    
    if (result.success) {
      // Fetch the updated session
      const updatedSession = await db.prepare(`
        SELECT cs.*, u.name as user_name, s.name as station_name 
        FROM charging_sessions cs
        LEFT JOIN users u ON cs.user_id = u.id
        LEFT JOIN stations s ON cs.station_id = s.id
        WHERE cs.id = ?
      `).bind(id).first();
      
      if (updatedSession) {
        return c.json({
          message: 'Charging session updated successfully',
          session: updatedSession
        });
      } else {
        return c.json({ error: 'Charging session not found' }, 404);
      }
    } else {
      return c.json({ error: 'Failed to update charging session' }, 500);
    }
    
  } catch (error) {
    console.error('Error updating charging session:', error);
    return c.json({ error: 'Failed to update charging session' }, 500);
  }
});

app.delete('/api/charging/sessions/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    const db = c.env.DB;
    
    if (!db) {
      // Fallback to mock response if database not available
      return c.json({
        message: 'Charging session deleted successfully (mock)',
        id
      });
    }
    
    // Check if session exists
    const existingSession = await db.prepare('SELECT * FROM charging_sessions WHERE id = ?').bind(id).first();
    
    if (!existingSession) {
      return c.json({ error: 'Charging session not found' }, 404);
    }
    
    // Delete session from database
    const result = await db.prepare('DELETE FROM charging_sessions WHERE id = ?').bind(id).run();
    
    if (result.success) {
      return c.json({
        message: 'Charging session deleted successfully',
        id
      });
    } else {
      return c.json({ error: 'Failed to delete charging session' }, 500);
    }
    
  } catch (error) {
    console.error('Error deleting charging session:', error);
    return c.json({ error: 'Failed to delete charging session' }, 500);
  }
});

// Payments routes
app.get('/api/payments', async (c) => {
  const { page = 1, limit = 10, status = '', userId = '', paymentMethod = '' } = c.req.query();

  try {
    // Always use mock data for now to avoid database issues
    const mockPayments = [
      {
        id: 'PAY-001',
        userId: '1',
        sessionId: 'CS-001',
        amount: 18.08,
        currency: 'USD',
        paymentMethod: 'credit_card',
        status: 'completed',
        transactionId: 'txn_123456789',
        createdAt: '2024-01-20T11:45:00Z',
        processedAt: '2024-01-20T11:45:30Z'
      },
      {
        id: 'PAY-002',
        userId: '2',
        sessionId: 'CS-002',
        amount: 25.50,
        currency: 'USD',
        paymentMethod: 'credit_card',
        status: 'completed',
        transactionId: 'txn_987654321',
        createdAt: '2024-01-19T17:10:00Z',
        processedAt: '2024-01-19T17:10:15Z'
      },
      {
        id: 'PAY-003',
        userId: '3',
        sessionId: 'CS-003',
        amount: 32.75,
        currency: 'USD',
        paymentMethod: 'paypal',
        status: 'completed',
        transactionId: 'txn_456789123',
        createdAt: '2024-01-18T14:30:00Z',
        processedAt: '2024-01-18T14:30:45Z'
      },
      {
        id: 'PAY-004',
        userId: '4',
        sessionId: 'CS-004',
        amount: 15.20,
        currency: 'USD',
        paymentMethod: 'apple_pay',
        status: 'pending',
        transactionId: 'txn_789123456',
        createdAt: '2024-01-17T09:15:00Z',
        processedAt: null
      },
      {
        id: 'PAY-005',
        userId: '5',
        sessionId: 'CS-005',
        amount: 42.80,
        currency: 'USD',
        paymentMethod: 'google_pay',
        status: 'completed',
        transactionId: 'txn_321654987',
        createdAt: '2024-01-16T16:45:00Z',
        processedAt: '2024-01-16T16:45:20Z'
      }
    ];

    // Filter mock data based on query parameters
    let filteredPayments = mockPayments;

    if (status) {
      filteredPayments = filteredPayments.filter(p => p.status === status);
    }

    if (userId) {
      filteredPayments = filteredPayments.filter(p => p.userId === userId);
    }

    if (paymentMethod) {
      filteredPayments = filteredPayments.filter(p => p.paymentMethod === paymentMethod);
    }

    // Apply pagination
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedPayments = filteredPayments.slice(startIndex, endIndex);

    return c.json({
      payments: paginatedPayments,
      total: filteredPayments.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(filteredPayments.length / parseInt(limit))
    });

  } catch (error) {
    console.error('Payments error:', error);
    return c.json({ error: 'Failed to fetch payments' }, 500);
  }
});

app.get('/api/payments/transactions', async (c) => {
  const { page = 1, limit = 10, search = '', status = '', userId = '' } = c.req.query();
  
  try {
    const db = c.env.DB;
    
    if (!db) {
      // Fallback to mock data if database not available
      const mockPayments = [
        {
          id: 'PAY-001',
          userId: '1',
          userName: 'John Doe',
          sessionId: 'CS-001',
          amount: 25.75,
          currency: 'USD',
          status: 'completed',
          paymentMethod: 'credit_card',
          createdAt: '2024-01-15T11:45:00Z'
        },
        {
          id: 'PAY-002',
          userId: '2',
          userName: 'Jane Smith',
          sessionId: 'CS-002',
          amount: 8.75,
          currency: 'USD',
          status: 'pending',
          paymentMethod: 'paypal',
          createdAt: '2024-01-15T14:20:00Z'
        }
      ];
      
      return c.json({
        payments: mockPayments,
        total: mockPayments.length,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: 1
      });
    }
    
    // For now, return mock data since we don't have a payments table yet
    const mockPayments = [
      {
        id: 'PAY-001',
        userId: '1',
        userName: 'John Doe',
        sessionId: 'CS-001',
        amount: 25.75,
        currency: 'USD',
        status: 'completed',
        paymentMethod: 'credit_card',
        createdAt: '2024-01-15T11:45:00Z'
      },
      {
        id: 'PAY-002',
        userId: '2',
        userName: 'Jane Smith',
        sessionId: 'CS-002',
        amount: 8.75,
        currency: 'USD',
        status: 'pending',
        paymentMethod: 'paypal',
        createdAt: '2024-01-15T14:20:00Z'
      }
    ];
    
    return c.json({
      payments: mockPayments,
      total: mockPayments.length,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: 1
    });
    
  } catch (error) {
    console.error('Database error:', error);
    return c.json({ error: 'Failed to fetch payments' }, 500);
  }
});

app.post('/api/payments/transactions', async (c) => {
  try {
    const paymentData = await c.req.json();
    
    // Validate required fields
    if (!paymentData.userId || !paymentData.sessionId || !paymentData.amount) {
      return c.json({ error: 'User ID, Session ID, and Amount are required' }, 400);
    }
    
    // Generate unique ID
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create payment (mock for now)
    const newPayment = {
      id: paymentId,
      userId: paymentData.userId,
      sessionId: paymentData.sessionId,
      amount: paymentData.amount,
      currency: paymentData.currency || 'USD',
      status: 'pending',
      paymentMethod: paymentData.paymentMethod || 'credit_card',
      createdAt: new Date().toISOString()
    };
    
    return c.json({
      message: 'Payment created successfully',
      payment: newPayment
    }, 201);
    
  } catch (error) {
    console.error('Error creating payment:', error);
    return c.json({ error: 'Failed to create payment' }, 500);
  }
});

app.put('/api/payments/transactions/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const paymentData = await c.req.json();
    
    // Update payment (mock for now)
    const updatedPayment = {
      id,
      ...paymentData,
      updatedAt: new Date().toISOString()
    };
    
    return c.json({
      message: 'Payment updated successfully',
      payment: updatedPayment
    });
    
  } catch (error) {
    console.error('Error updating payment:', error);
    return c.json({ error: 'Failed to update payment' }, 500);
  }
});

app.delete('/api/payments/transactions/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    return c.json({
      message: 'Payment deleted successfully',
      id
    });
    
  } catch (error) {
    console.error('Error deleting payment:', error);
    return c.json({ error: 'Failed to delete payment' }, 500);
  }
});

// Analytics routes
app.get('/api/analytics/dashboard', async (c) => {
  const analytics = {
    totalStations: 156,
    activeSessions: 23,
    totalUsers: 2847,
    revenueToday: 12847.50,
    systemHealth: {
      api: 'healthy',
      database: 'online',
      paymentGateway: 'degraded'
    },
    recentActivity: [
      {
        id: 1,
        user: 'John Doe',
        action: 'Started charging session',
        station: 'Station ST-001',
        time: '2 minutes ago',
        type: 'session'
      },
      {
        id: 2,
        user: 'Jane Smith',
        action: 'Completed payment',
        amount: '$45.20',
        time: '5 minutes ago',
        type: 'payment'
      },
      {
        id: 3,
        user: 'Mike Johnson',
        action: 'Reported issue',
        station: 'Station ST-005',
        time: '12 minutes ago',
        type: 'issue'
      }
    ],
    quickStats: {
      stationsGrowth: '+12%',
      sessionsGrowth: '+5%',
      usersGrowth: '+18%',
      revenueGrowth: '+8%'
    }
  };
  
  return c.json(analytics);
});

app.get('/api/analytics/revenue', async (c) => {
  const { period = 'month' } = c.req.query();
  
  // Mock revenue data based on period
  let revenueData = [];
  
  if (period === 'month') {
    revenueData = [
      { date: '2024-01-01', revenue: 12500 },
      { date: '2024-01-02', revenue: 13200 },
      { date: '2024-01-03', revenue: 11800 },
      { date: '2024-01-04', revenue: 14500 },
      { date: '2024-01-05', revenue: 16200 },
      { date: '2024-01-06', revenue: 13800 },
      { date: '2024-01-07', revenue: 15500 },
    ];
  } else if (period === 'week') {
    revenueData = [
      { date: '2024-01-01', revenue: 2500 },
      { date: '2024-01-02', revenue: 3200 },
      { date: '2024-01-03', revenue: 2800 },
      { date: '2024-01-04', revenue: 3500 },
      { date: '2024-01-05', revenue: 4200 },
      { date: '2024-01-06', revenue: 3800 },
      { date: '2024-01-07', revenue: 4500 },
    ];
  } else if (period === 'year') {
    revenueData = [
      { month: 'Jan', revenue: 125000 },
      { month: 'Feb', revenue: 132000 },
      { month: 'Mar', revenue: 118000 },
      { month: 'Apr', revenue: 145000 },
      { month: 'May', revenue: 162000 },
      { month: 'Jun', revenue: 138000 },
    ];
  }
  
  return c.json({ data: revenueData, period });
});

app.get('/api/analytics/usage', async (c) => {
  const usageData = {
    stations: [
      { name: 'Downtown Hub', sessions: 245, revenue: 12500 },
      { name: 'Mall Station', sessions: 189, revenue: 9800 },
      { name: 'Highway Rest', sessions: 156, revenue: 7800 },
      { name: 'Airport Terminal', sessions: 134, revenue: 6700 },
      { name: 'Shopping Center', sessions: 98, revenue: 4900 },
    ],
    peakHours: [
      { hour: '08:00', sessions: 45 },
      { hour: '09:00', sessions: 52 },
      { hour: '10:00', sessions: 48 },
      { hour: '11:00', sessions: 41 },
      { hour: '12:00', sessions: 38 },
      { hour: '13:00', sessions: 35 },
      { hour: '14:00', sessions: 42 },
      { hour: '15:00', sessions: 48 },
      { hour: '16:00', sessions: 55 },
      { hour: '17:00', sessions: 62 },
      { hour: '18:00', sessions: 58 },
      { hour: '19:00', sessions: 45 },
    ],
    userGrowth: [
      { month: 'Jan', users: 1200 },
      { month: 'Feb', users: 1350 },
      { month: 'Mar', users: 1480 },
      { month: 'Apr', users: 1620 },
      { month: 'May', users: 1780 },
      { month: 'Jun', users: 1950 },
    ]
  };
  
  return c.json(usageData);
});

// Token Service Proxy Endpoints
const TOKEN_SERVICE_URL = 'https://ev-charging-token-service.mks-alghafil.workers.dev';

// Proxy token info
app.get('/api/token/info', async (c) => {
  try {
    const response = await fetch(`${TOKEN_SERVICE_URL}/api/token/info`);
    const data = await response.json();
    return c.json(data);
  } catch (error) {
    return c.json({ error: 'Failed to get token info' }, 500);
  }
});

// Proxy token stats
app.get('/api/token/stats', async (c) => {
  try {
    const response = await fetch(`${TOKEN_SERVICE_URL}/api/token/stats`);
    const data = await response.json();
    return c.json(data);
  } catch (error) {
    return c.json({ error: 'Failed to get token statistics' }, 500);
  }
});

// Proxy mint tokens
app.post('/api/token/mint', async (c) => {
  try {
    const body = await c.req.json();
    const response = await fetch(`${TOKEN_SERVICE_URL}/api/token/mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return c.json(data);
  } catch (error) {
    return c.json({ error: 'Failed to mint tokens' }, 500);
  }
});

// Proxy burn tokens
app.post('/api/token/burn', async (c) => {
  try {
    const body = await c.req.json();
    const response = await fetch(`${TOKEN_SERVICE_URL}/api/token/burn`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return c.json(data);
  } catch (error) {
    return c.json({ error: 'Failed to burn tokens' }, 500);
  }
});

// Proxy transfer tokens
app.post('/api/token/transfer', async (c) => {
  try {
    const body = await c.req.json();
    const response = await fetch(`${TOKEN_SERVICE_URL}/api/token/transfer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return c.json(data);
  } catch (error) {
    return c.json({ error: 'Failed to transfer tokens' }, 500);
  }
});

// Proxy wallet balance
app.get('/api/wallet/balance/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const response = await fetch(`${TOKEN_SERVICE_URL}/api/wallet/balance/${userId}`);
    const data = await response.json();
    return c.json(data);
  } catch (error) {
    return c.json({ error: 'Failed to get wallet balance' }, 500);
  }
});

// Proxy wallet info
app.get('/api/wallet/info/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const response = await fetch(`${TOKEN_SERVICE_URL}/api/wallet/info/${userId}`);
    const data = await response.json();
    return c.json(data);
  } catch (error) {
    return c.json({ error: 'Failed to get wallet info' }, 500);
  }
});

// Proxy wallet transactions
app.get('/api/wallet/transactions/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const limit = c.req.query('limit') || '50';
    const response = await fetch(`${TOKEN_SERVICE_URL}/api/wallet/transactions/${userId}?limit=${limit}`);
    const data = await response.json();
    return c.json(data);
  } catch (error) {
    return c.json({ error: 'Failed to get wallet transactions' }, 500);
  }
});

// Proxy wallet stats
app.get('/api/wallet/stats', async (c) => {
  try {
    const response = await fetch(`${TOKEN_SERVICE_URL}/api/wallet/stats`);
    const data = await response.json();
    return c.json(data);
  } catch (error) {
    return c.json({ error: 'Failed to get wallet statistics' }, 500);
  }
});

// Error handling
app.onError((err, c) => {
  console.error(err);
  return c.json({ 
    error: 'Something went wrong!',
    message: err.message 
  }, 500);
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Route not found' }, 404);
});

export default app;
import { Router } from 'express';

const router = Router();

// Mock charging sessions data
const chargingSessions = [
  {
    id: 'CS-001',
    userId: '1',
    stationId: 'ST-001',
    connectorId: 'C1',
    startTime: '2024-01-20T10:30:00Z',
    endTime: '2024-01-20T11:45:00Z',
    duration: 75, // minutes
    energyDelivered: 45.2, // kWh
    cost: 18.08,
    status: 'completed',
    paymentMethod: 'credit_card'
  },
  {
    id: 'CS-002',
    userId: '2',
    stationId: 'ST-002',
    connectorId: 'C1',
    startTime: '2024-01-20T14:15:00Z',
    endTime: null,
    duration: 0,
    energyDelivered: 0,
    cost: 0,
    status: 'active',
    paymentMethod: 'wallet'
  },
  {
    id: 'CS-003',
    userId: '1',
    stationId: 'ST-003',
    connectorId: 'C2',
    startTime: '2024-01-19T16:20:00Z',
    endTime: '2024-01-19T17:10:00Z',
    duration: 50,
    energyDelivered: 32.8,
    cost: 13.12,
    status: 'completed',
    paymentMethod: 'credit_card'
  }
];

// Get all charging sessions
router.get('/', (req, res) => {
  const { status, userId, stationId, startDate, endDate } = req.query;
  
  let filteredSessions = chargingSessions;
  
  if (status) {
    filteredSessions = filteredSessions.filter(session => session.status === status);
  }
  
  if (userId) {
    filteredSessions = filteredSessions.filter(session => session.userId === userId);
  }
  
  if (stationId) {
    filteredSessions = filteredSessions.filter(session => session.stationId === stationId);
  }
  
  if (startDate) {
    filteredSessions = filteredSessions.filter(session => 
      new Date(session.startTime) >= new Date(startDate as string)
    );
  }
  
  if (endDate) {
    filteredSessions = filteredSessions.filter(session => 
      new Date(session.startTime) <= new Date(endDate as string)
    );
  }
  
  res.json({
    sessions: filteredSessions,
    total: filteredSessions.length
  });
});

// Get session by ID
router.get('/:id', (req, res) => {
  const session = chargingSessions.find(s => s.id === req.params.id);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  res.json(session);
});

// Start new charging session
router.post('/', (req, res) => {
  const { userId, stationId, connectorId, paymentMethod } = req.body;
  
  if (!userId || !stationId || !connectorId || !paymentMethod) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const newSession = {
    id: `CS-${String(chargingSessions.length + 1).padStart(3, '0')}`,
    userId,
    stationId,
    connectorId,
    startTime: new Date().toISOString(),
    endTime: null,
    duration: 0,
    energyDelivered: 0,
    cost: 0,
    status: 'active',
    paymentMethod
  };
  
  chargingSessions.push(newSession);
  
  res.status(201).json(newSession);
});

// End charging session
router.patch('/:id/end', (req, res) => {
  const session = chargingSessions.find(s => s.id === req.params.id);
  
  if (!session) {
    return res.status(404).json({ error: 'Session not found' });
  }
  
  if (session.status !== 'active') {
    return res.status(400).json({ error: 'Session is not active' });
  }
  
  const endTime = new Date();
  const startTime = new Date(session.startTime);
  const duration = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
  
  // Mock energy calculation (in real app, this would come from the charging station)
  const energyDelivered = Math.random() * 50 + 10; // 10-60 kWh
  const cost = energyDelivered * 0.4; // $0.40 per kWh
  
  session.endTime = endTime.toISOString();
  session.duration = duration;
  session.energyDelivered = Math.round(energyDelivered * 100) / 100;
  session.cost = Math.round(cost * 100) / 100;
  session.status = 'completed';
  
  res.json(session);
});

// Get session statistics
router.get('/stats/overview', (req, res) => {
  const totalSessions = chargingSessions.length;
  const activeSessions = chargingSessions.filter(s => s.status === 'active').length;
  const completedSessions = chargingSessions.filter(s => s.status === 'completed').length;
  const totalEnergy = chargingSessions.reduce((sum, s) => sum + s.energyDelivered, 0);
  const totalRevenue = chargingSessions.reduce((sum, s) => sum + s.cost, 0);
  const averageSessionDuration = chargingSessions
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + s.duration, 0) / completedSessions || 0;
  
  res.json({
    totalSessions,
    activeSessions,
    completedSessions,
    totalEnergy: Math.round(totalEnergy * 100) / 100,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    averageSessionDuration: Math.round(averageSessionDuration * 100) / 100
  });
});

export { router as chargingRoutes };

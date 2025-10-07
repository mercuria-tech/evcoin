import { Router } from 'express';

const router = Router();

// Mock stations data
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

// Get all stations
router.get('/', (req, res) => {
  const { status, location } = req.query;
  
  let filteredStations = stations;
  
  if (status) {
    filteredStations = filteredStations.filter(station => station.status === status);
  }
  
  if (location) {
    filteredStations = filteredStations.filter(station => 
      station.location.toLowerCase().includes((location as string).toLowerCase())
    );
  }
  
  res.json({
    stations: filteredStations,
    total: filteredStations.length
  });
});

// Get station by ID
router.get('/:id', (req, res) => {
  const station = stations.find(s => s.id === req.params.id);
  
  if (!station) {
    return res.status(404).json({ error: 'Station not found' });
  }
  
  res.json(station);
});

// Get station connectors
router.get('/:id/connectors', (req, res) => {
  const station = stations.find(s => s.id === req.params.id);
  
  if (!station) {
    return res.status(404).json({ error: 'Station not found' });
  }
  
  res.json({
    stationId: station.id,
    connectors: station.connectors
  });
});

// Update station status
router.patch('/:id/status', (req, res) => {
  const station = stations.find(s => s.id === req.params.id);
  
  if (!station) {
    return res.status(404).json({ error: 'Station not found' });
  }
  
  const { status } = req.body;
  
  if (!['active', 'maintenance', 'offline'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  station.status = status;
  station.lastUpdated = new Date().toISOString();
  
  res.json(station);
});

// Get station statistics
router.get('/:id/stats', (req, res) => {
  const station = stations.find(s => s.id === req.params.id);
  
  if (!station) {
    return res.status(404).json({ error: 'Station not found' });
  }
  
  const stats = {
    totalConnectors: station.connectors.length,
    availableConnectors: station.connectors.filter(c => c.status === 'available').length,
    chargingConnectors: station.connectors.filter(c => c.status === 'charging').length,
    maintenanceConnectors: station.connectors.filter(c => c.status === 'maintenance').length,
    averagePower: station.connectors.reduce((sum, c) => sum + parseInt(c.power), 0) / station.connectors.length
  };
  
  res.json(stats);
});

export { router as stationsRoutes };

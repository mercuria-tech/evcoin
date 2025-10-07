import { Router } from 'express';

const router = Router();

// Mock users data
const users = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1-555-0123',
    registrationDate: '2024-01-15T10:30:00Z',
    lastLogin: '2024-01-20T14:22:00Z',
    status: 'active',
    totalSessions: 45,
    totalEnergy: 1250.5,
    totalCost: 187.50
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1-555-0124',
    registrationDate: '2024-01-10T09:15:00Z',
    lastLogin: '2024-01-19T16:45:00Z',
    status: 'active',
    totalSessions: 32,
    totalEnergy: 890.2,
    totalCost: 133.50
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    phone: '+1-555-0125',
    registrationDate: '2024-01-05T11:20:00Z',
    lastLogin: '2024-01-18T12:30:00Z',
    status: 'suspended',
    totalSessions: 12,
    totalEnergy: 340.8,
    totalCost: 51.20
  }
];

// Get all users
router.get('/', (req, res) => {
  const { status, search } = req.query;
  
  let filteredUsers = users;
  
  if (status) {
    filteredUsers = filteredUsers.filter(user => user.status === status);
  }
  
  if (search) {
    const searchTerm = (search as string).toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm)
    );
  }
  
  res.json({
    users: filteredUsers,
    total: filteredUsers.length
  });
});

// Get user by ID
router.get('/:id', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json(user);
});

// Update user status
router.patch('/:id/status', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const { status } = req.body;
  
  if (!['active', 'suspended', 'inactive'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  
  user.status = status;
  
  res.json(user);
});

// Get user statistics
router.get('/:id/stats', (req, res) => {
  const user = users.find(u => u.id === req.params.id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const stats = {
    totalSessions: user.totalSessions,
    totalEnergy: user.totalEnergy,
    totalCost: user.totalCost,
    averageSessionCost: user.totalCost / user.totalSessions,
    averageSessionEnergy: user.totalEnergy / user.totalSessions,
    registrationDate: user.registrationDate,
    lastLogin: user.lastLogin,
    daysSinceRegistration: Math.floor((Date.now() - new Date(user.registrationDate).getTime()) / (1000 * 60 * 60 * 24))
  };
  
  res.json(stats);
});

export { router as usersRoutes };

import { Router } from 'express';

const router = Router();

// Get dashboard analytics
router.get('/dashboard', (req, res) => {
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
  
  res.json(analytics);
});

// Get revenue analytics
router.get('/revenue', (req, res) => {
  const { period = 'month' } = req.query;
  
  // Mock revenue data based on period
  let revenueData: Array<{date: string, revenue: number}> = [];
  
  if (period === 'month') {
    revenueData = [
      { date: '2024-01-01', revenue: 12500 },
      { date: '2024-01-02', revenue: 13200 },
      { date: '2024-01-03', revenue: 11800 },
      { date: '2024-01-04', revenue: 14500 },
      { date: '2024-01-05', revenue: 16200 },
      { date: '2024-01-06', revenue: 13800 },
      { date: '2024-01-07', revenue: 15100 },
      { date: '2024-01-08', revenue: 16700 },
      { date: '2024-01-09', revenue: 14200 },
      { date: '2024-01-10', revenue: 15900 },
      { date: '2024-01-11', revenue: 17300 },
      { date: '2024-01-12', revenue: 14800 },
      { date: '2024-01-13', revenue: 16100 },
      { date: '2024-01-14', revenue: 17500 },
      { date: '2024-01-15', revenue: 15200 },
      { date: '2024-01-16', revenue: 16800 },
      { date: '2024-01-17', revenue: 14400 },
      { date: '2024-01-18', revenue: 15700 },
      { date: '2024-01-19', revenue: 17100 },
      { date: '2024-01-20', revenue: 12847 }
    ];
  } else if (period === 'week') {
    revenueData = [
      { date: '2024-01-14', revenue: 17500 },
      { date: '2024-01-15', revenue: 15200 },
      { date: '2024-01-16', revenue: 16800 },
      { date: '2024-01-17', revenue: 14400 },
      { date: '2024-01-18', revenue: 15700 },
      { date: '2024-01-19', revenue: 17100 },
      { date: '2024-01-20', revenue: 12847 }
    ];
  }
  
  res.json({
    period,
    data: revenueData,
    total: revenueData.reduce((sum, item) => sum + item.revenue, 0),
    average: revenueData.reduce((sum, item) => sum + item.revenue, 0) / revenueData.length
  });
});

// Get usage analytics
router.get('/usage', (req, res) => {
  const usageData = {
    dailySessions: [
      { date: '2024-01-14', sessions: 145 },
      { date: '2024-01-15', sessions: 132 },
      { date: '2024-01-16', sessions: 158 },
      { date: '2024-01-17', sessions: 124 },
      { date: '2024-01-18', sessions: 147 },
      { date: '2024-01-19', sessions: 163 },
      { date: '2024-01-20', sessions: 89 }
    ],
    stationUtilization: [
      { stationId: 'ST-001', utilization: 85 },
      { stationId: 'ST-002', utilization: 72 },
      { stationId: 'ST-003', utilization: 91 },
      { stationId: 'ST-004', utilization: 68 },
      { stationId: 'ST-005', utilization: 78 }
    ],
    peakHours: [
      { hour: '08:00', sessions: 45 },
      { hour: '09:00', sessions: 67 },
      { hour: '10:00', sessions: 89 },
      { hour: '11:00', sessions: 92 },
      { hour: '12:00', sessions: 78 },
      { hour: '13:00', sessions: 65 },
      { hour: '14:00', sessions: 71 },
      { hour: '15:00', sessions: 83 },
      { hour: '16:00', sessions: 95 },
      { hour: '17:00', sessions: 88 },
      { hour: '18:00', sessions: 76 },
      { hour: '19:00', sessions: 54 }
    ]
  };
  
  res.json(usageData);
});

// Get station performance analytics
router.get('/stations/performance', (req, res) => {
  const performanceData = [
    {
      stationId: 'ST-001',
      name: 'Downtown Charging Hub',
      totalSessions: 1247,
      totalRevenue: 18750.50,
      averageSessionDuration: 45,
      utilizationRate: 85,
      uptime: 98.5,
      rating: 4.7
    },
    {
      stationId: 'ST-002',
      name: 'Mall Charging Station',
      totalSessions: 892,
      totalRevenue: 13380.75,
      averageSessionDuration: 38,
      utilizationRate: 72,
      uptime: 96.2,
      rating: 4.3
    },
    {
      stationId: 'ST-003',
      name: 'Highway Rest Stop',
      totalSessions: 2156,
      totalRevenue: 32340.00,
      averageSessionDuration: 52,
      utilizationRate: 91,
      uptime: 99.1,
      rating: 4.8
    }
  ];
  
  res.json(performanceData);
});

// Get user behavior analytics
router.get('/users/behavior', (req, res) => {
  const behaviorData = {
    userSegments: [
      { segment: 'Frequent Users', count: 456, percentage: 16 },
      { segment: 'Regular Users', count: 1234, percentage: 43 },
      { segment: 'Occasional Users', count: 1157, percentage: 41 }
    ],
    sessionPatterns: [
      { pattern: 'Morning Commute', sessions: 234, percentage: 18 },
      { pattern: 'Workday Charging', sessions: 567, percentage: 44 },
      { pattern: 'Evening Return', sessions: 345, percentage: 27 },
      { pattern: 'Weekend Travel', sessions: 134, percentage: 11 }
    ],
    retentionRate: {
      day1: 95,
      day7: 78,
      day30: 65,
      day90: 52
    }
  };
  
  res.json(behaviorData);
});

export { router as analyticsRoutes };

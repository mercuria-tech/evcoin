import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Button,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  FlashOn,
  CreditCard,
  Schedule,
  People,
  LocationOn,
  MoreVert,
  Refresh,
  FilterList,
} from '@mui/icons-material';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';

// Mock data - in real app, this would come from API
const mockStats = {
  totalRevenue: 28450.75,
  revenueGrowth: 12.5,
  activeSessions: 156,
  sessionGrowth: 8.2,
  totalUsers: 8542,
  userGrowth: 15.3,
  stationsOnline: 48,
  stationsTotal: 52,
};

const mockRevenueData = [
  { month: 'Jan', revenue: 22500, sessions: 1420 },
  { month: 'Feb', revenue: 25100, sessions: 1580 },
  { month: 'Mar', revenue: 26800, sessions: 1720 },
  { month: 'Apr', revenue: 27650, sessions: 1850 },
  { month: 'May', revenue: 28450, sessions: 1920 },
  { month: 'Jun', revenue: 29800, sessions: 2100 },
];

const mockConnectorData = [
  { name: 'Type 2', value: 180, color: '#007AFF' },
  { name: 'CCS', value: 120, color: '#34C759' },
  { name: 'CHAdeMO', value: 60, color: '#FF9500' },
  { name: 'Tesla', value: 40, color: '#8E44AD' },
];

const mockRecentSessions = [
  { id: 1, user: 'John Doe', station: 'Downtown Plaza', duration: '45 min', energy: 32.5, cost: 18.75, status: 'completed' },
  { id: 2, user: 'Sarah Wilson', station: 'Shopping Mall', duration: '23 min', energy: 15.2, cost: 9.84, status: 'charging' },
  { id: 3, user: 'Mike Johnson', station: 'Office Building', duration: '67 min', energy: 48.3, cost: 27.19, status: 'completed' },
  { id: 4, user: 'Lisa Chen', station: 'Airport Terminal', duration: '31 min', energy: 22.1, cost: 12.55, status: 'charging' },
];

const mockTopStations = [
  { name: 'Downtown Plaza', sessions: 234, revenue: 18500, utilization: 78 },
  { name: 'Shopping Mall', sessions: 156, revenue: 12300, utilization: 65 },
  { name: 'Office Building', sessions: 189, revenue: 15200, utilization: 82 },
  { name: 'Airport Terminal', sessions: 145, revenue: 11800, utilization: 71 },
];

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const refreshData = () => {
    setLastUpdated(new Date());
    // In real app, this would refetch all queries
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setTimeRange(timeRange === '7d' ? '30d' : '90d')}
          >
            {timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : 'Last 90 days'}
          </Button>
          <IconButton onClick={refreshData} color="primary">
            <Refresh />
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Typography>
        </Box>
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" component="div">
                    ${mockStats.totalRevenue.toLocaleString()}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUp color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +{mockStats.revenueGrowth}%
                    </Typography>
                  </Box>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <CreditCard />
                </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Active Sessions
                </Typography>
                <Typography variant="h4" component="div">
                  {mockStats.activeSessions}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUp color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2" color="success.main">
                    +{mockStats.sessionGrowth}%
                  </Typography>
                </Box>
              </Box>
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <FlashOn />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Total Users
                </Typography>
                <Typography variant="h4" component="div">
                  {mockStats.totalUsers.toLocaleString()}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TrendingUp color="success" sx={{ fontSize: 16, mr: 0.5 }} />
                  <Typography variant="body2" color="success.main">
                    +{mockStats.userGrowth}%
                  </Typography>
                </Box>
              </Box>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <People />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box>
                <Typography color="text.secondary" gutterBottom variant="body2">
                  Station Availability
                </Typography>
                <Typography variant="h4" component="div">
                  {mockStats.stationsOnline}/{mockStats.stationsTotal}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(mockStats.stationsOnline / mockStats.stationsTotal) * 100}
                    sx={{ borderRadius: 1, height: 6 }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {(mockStats.stationsOnline / mockStats.stationsTotal) * 100}% online
                  </Typography>
                </Box>
              </Box>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <LocationOn />
              </Avatar>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>

    {/* Charts Row */}
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {/* Revenue Trend */}
      <Grid item xs={12} md={8}>
        <Card>
          <CardHeader
            title="Revenue Trend"
            action={
              <IconButton>
                <MoreVert />
              </IconButton>
            }
          />
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={mockRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#007AFF" fill="#007AFF" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Connector Distribution */}
      <Grid item xs={12} md={4}>
        <Card sx={{ height: '100%' }}>
          <CardHeader title="Connector Types" />
          <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={mockConnectorData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {mockConnectorData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>
    </Grid>

    {/* Tables Row */}
    <Grid container spacing={3}>
      {/* Recent Sessions */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title="Recent Sessions"
            action={
              <Button size="small" color="primary">
                View All
              </Button>
            }
          />
          <CardContent sx={{ p: 0 }}>
            <List>
              {mockRecentSessions.map((session, index) => (
                <React.Fragment key={session.id}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: session.status === 'charging' ? 'secondary.main' : 'success.main' }}>
                        <FlashOn />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1">{session.user}</Typography>
                          <Chip
                            label={session.status}
                            color={session.status === 'charging' ? 'secondary' : 'success'}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {session.station} • {session.duration} • {session.energy} kWh
                          </Typography>
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                            ${session.cost}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < mockRecentSessions.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Top Performing Stations */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardHeader
            title="Top Stations"
            action={
              <Button size="small" color="primary">
                View All
              </Button>
            }
          />
          <CardContent sx={{ p: 0 }}>
            <List>
              {mockTopStations.map((station, index) => (
                <React.Fragment key={station.name}>
                  <ListItem>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        <LocationOn />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle1">{station.name}</Typography>
                          <Typography variant="body2" color="primary.main" sx={{ fontWeight: 600 }}>
                            {station.utilization}%
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {station.sessions} sessions
                          </Typography>
                          <Typography variant="body2" color="success.main" sx={{ fontWeight: 600 }}>
                            ${station.revenue.toLocaleString()}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < mockTopStations.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  </Box>
);

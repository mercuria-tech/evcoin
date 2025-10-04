import React, { useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Grid,
} from '@mui/material';
import {
  Search,
  FilterList,
  ViewList,
  ViewModule,
  Add,
  MoreVert,
  Edit,
  Delete,
  Map,
  Assignment,
  FlashOn,
  LocationOn,
  RestartAlt,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';

// Mock data - in real app, this would come from API
const mockStations = [
  {
    id: '1',
    name: 'Downtown Plaza',
    address: '123 Main St, Downtown',
    city: 'San Francisco',
    status: 'online',
    connectorCount: 12,
    availableConnectors: 8,
    totalRevenue: 18500.75,
    utilizationRate: 78.5,
    rating: 4.6,
    reviewCount: 156,
    lastActivity: '2023-12-07T14:30:00Z',
    powerTypes: ['CCS', 'Type 2', 'CHAdeMO'],
    amenities: ['WiFi', 'Cafe', 'Restrooms'],
  },
  {
    id: '2',
    name: 'Shopping Mall Station',
    address: '456 Commerce Blvd',
    city: 'Oakland',
    status: 'maintenance',
    connectorCount: 8,
    availableConnectors: 0,
    totalRevenue: 12300.50,
    utilizationRate: 65.2,
    rating: 4.3,
    reviewCount: 89,
    lastActivity: '2023-12-07T10:15:00Z',
    powerTypes: ['Type 2', 'CCS'],
    amenities: ['Shopping', 'Food Court'],
  },
  {
    id: '3',
    name: 'Office Building',
    address: '789 Business Park',
    city: 'San Jose',
    status: 'online',
    connectorCount: 16,
    availableConnectors: 4,
    totalRevenue: 15200.25,
    utilizationRate: 82.1,
    rating: 4.8,
    reviewCount: 234,
    lastActivity: '2023-12-07T15:45:00Z',
    powerTypes: ['CCS', 'Type 2'],
    amenities: ['WiFi', 'Cafeteria', 'Parking'],
  },
  {
    id: '4',
    name: 'International Airport',
    address: '1000 Airport Blvd',
    city: 'San Francisco',
    status: 'offline',
    connectorCount: 20,
    availableConnectors: 0,
    totalRevenue: 28400.00,
    utilizationRate: 91.5,
    rating: 4.7,
    reviewCount: 445,
    lastActivity: '2023-12-06T22:30:00Z',
    powerTypes: ['CCS', 'Type 2', 'CHAdeMO', 'Tesla'],
    amenities: ['WiFi', 'Restaurants', 'Shopping', 'Parking'],
  },
];

export default function StationList() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [statusFilter, setStatusFilter] = useState('all');
  const [cityFilter, setCityFilter] = useState('all');
  const [selectedStation, setSelectedStation] = useState(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Filter stations based on search and filters
  const filteredStations = useMemo(() => {
    return mockStations.filter(station => {
      const matchesSearch = station.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          station.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          station.city.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || station.status === statusFilter;
      const matchesCity = cityFilter === 'all' || station.city === cityFilter;
      
      return matchesSearch && matchesStatus && matchesCity;
    });
  }, [searchQuery, statusFilter, cityFilter]);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, station: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedStation(station);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedStation(null);
  };

  const handleDeleteConfirm = () => {
    console.log('Delete station:', selectedStation?.id);
    setDeleteDialogOpen(false);
    handleMenuClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'success';
      case 'maintenance': return 'warning';
      case 'offline': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return '🟢';
      case 'maintenance': return '🟡';
      case 'offline': return '🔴';
      default: return '⚪';
    }
  };

  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Station Name',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
            <LocationOn />
          </Avatar>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {params.value}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.address}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={getStatusColor(params.value) as any}
          icon={<span>{getStatusIcon(params.value)}</span>}
        />
      ),
    },
    {
      field: 'connectivity',
      headerName: 'Connectors',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.row.availableConnectors}/{params.row.connectorCount}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Available
          </Typography>
        </Box>
      ),
    },
    {
      field: 'utilizationRate',
      headerName: 'Utilization',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ textAlign: 'center' }}>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: params.value > 80 ? 'success.main' : params.value > 60 ? 'warning.main' : 'error.main'
            }}
          >
            {params.value}%
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
            {params.value > params.row.utilizationRate ? (
              <TrendingUp fontSize="small" color="success" />
            ) : (
              <TrendingDown fontSize="small" color="error" />
            )}
          </Box>
        </Box>
      ),
    },
    {
      field: 'totalRevenue',
      headerName: 'Revenue',
      width: 120,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          ${params.value.toLocaleString()}
        </Typography>
      ),
    },
    {
      field: 'rating',
      headerName: 'Rating',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.value} ⭐
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.reviewCount} reviews
          </Typography>
        </Box>
      ),
    },
    {
      field: 'powerTypes',
      headerName: 'Connector Types',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          {params.value.slice(0, 2).map((type: string) => (
            <Chip key={type} label={type} size="small" variant="outlined" />
          ))}
          {params.value.length > 2 && (
            <Chip label={`+${params.value.length - 2}`} size="small" variant="outlined" />
          )}
        </Box>
      ),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<Map />}
          label="View on Map"
          onClick={() => console.log('View map:', params.id)}
        />,
        <GridActionsCellItem
          icon={<Assignment />}
          label="View Details"
          onClick={() => console.log('View details:', params.id)}
        />,
        <GridActionsCellItem
          icon={<Edit />}
          label="Edit Station"
          onClick={() => console.log('Edit station:', params.id)}
        />,
        <GridActionsCellItem
          icon={<MoreVert />}
          label="More Options"
          onClick={(event) => handleMenuClick(event, params.row)}
        />,
      ],
    },
  ];

  const StatCard = ({ icon, title, value, subtitle }: any) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.light', width: 48, height: 48 }}>
            {icon}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              {title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {subtitle}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Charging Stations
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => console.log('Create new station')}
        >
          Add Station
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<LocationOn />}
            title="Total Stations"
            value={mockStations.length}
            subtitle="Across all locations"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<FlashOn />}
            title="Online Stations"
            value={mockStations.filter(s => s.status === 'online').length}
            subtitle={((mockStations.filter(s => s.status === 'online').length / mockStations.length) * 100).toFixed(1)}% availability
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<TrendingUp />}
            title="Total Revenue"
            value={`$${mockStations.reduce((sum, s) => sum + s.totalRevenue, 0).toLocaleString()}`}
            subtitle="Last 30 days"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<RestartAlt />}
            title="Avg Utilization"
            value={`${(mockStations.reduce((sum, s) => sum + s.utilizationRate, 0) / mockStations.length).toFixed(1)}%`}
            subtitle="Station efficiency"
          />
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Search stations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1, minWidth: 300 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="maintenance">Maintenance</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>City</InputLabel>
              <Select
                value={cityFilter}
                label="City"
                onChange={(e) => setCityFilter(e.target.value)}
              >
                <MenuItem value="all">All Cities</MenuItem>
                <MenuItem value="San Francisco">San Francisco</MenuItem>
                <MenuItem value="Oakland">Oakland</MenuItem>
                <MenuItem value="San Jose">San Jose</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                onClick={() => setViewMode('table')}
                color={viewMode === 'table' ? 'primary' : 'default'}
              >
                <ViewList />
              </IconButton>
              <IconButton
                onClick={() => setViewMode('grid')}
                color={viewMode === 'grid' ? 'primary' : 'default'}
              >
                <ViewModule />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Station Table */}
      <Card>
        <CardContent sx={{ p: 0 }}>
          <DataGrid
            rows={filteredStations}
            columns={columns}
            autoHeight
            pageSize={25}
            rowsPerPageOptions={[25, 50, 100]}
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid rgba(224, 224, 224, 1)',
              },
              '& .MuiDataGrid-cell:focus': {
                outline: 'none',
              },
              '& .MuiDataGrid-row:hover': {
                backgroundColor: 'rgba(0, 122, 255, 0.04)',
              },
            }}
            initialState={{
              sorting: {
                sortModel: [{ field: 'utilizationRate', sort: 'desc' }],
              },
            }}
          />
        </CardContent>
      </Card>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { console.log('View details', selectedStation?.id); handleMenuClose(); }}>
          <ListItemIcon>
            <Assignment />
          </ListItemIcon>
          <ListItemText>View Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { console.log('Edit station', selectedStation?.id); handleMenuClose(); }}>
          <ListItemIcon>
            <Edit />
          </ListItemIcon>
          <ListItemText>Edit Station</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { console.log('View analytics', selectedStation?.id); handleMenuClose(); }}>
          <ListItemIcon>
            <TrendingUp />
          </ListItemIcon>
          <ListItemText>View Analytics</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setDeleteDialogOpen(true)} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete color="error" />
          </ListItemIcon>
          <ListItemText>Delete Station</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Station</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedStation?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

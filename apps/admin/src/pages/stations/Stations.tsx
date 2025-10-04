import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Zap,
  MapPin,
  Battery,
  Clock,
  Users,
  DollarSign,
  MoreHorizontal,
  Plus,
  Search,
  Filter,
  Download,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
} from 'lucide-react';

const stations = [
  {
    id: 1,
    name: 'Downtown Plaza Station',
    location: '123 Main St, Downtown',
    coordinates: { lat: 37.7749, lng: -122.4194 },
    status: 'online',
    connectors: [
      { id: 1, type: 'Type2', power: 22, status: 'available' },
      { id: 2, type: 'CCS', power: 50, status: 'occupied' },
      { id: 3, type: 'CHAdeMO', power: 50, status: 'maintenance' },
    ],
    revenue: 1250.50,
    sessions: 45,
    lastActivity: '2 minutes ago',
  },
  {
    id: 2,
    name: 'Airport Terminal Station',
    location: '456 Airport Blvd, Terminal 2',
    coordinates: { lat: 37.6213, lng: -122.3790 },
    status: 'online',
    connectors: [
      { id: 4, type: 'Type2', power: 22, status: 'available' },
      { id: 5, type: 'CCS', power: 50, status: 'available' },
    ],
    revenue: 2100.75,
    sessions: 78,
    lastActivity: '5 minutes ago',
  },
  {
    id: 3,
    name: 'Shopping Mall Station',
    location: '789 Commerce St, Mall Entrance',
    coordinates: { lat: 37.7849, lng: -122.4094 },
    status: 'maintenance',
    connectors: [
      { id: 6, type: 'Type2', power: 22, status: 'maintenance' },
      { id: 7, type: 'CCS', power: 50, status: 'maintenance' },
    ],
    revenue: 890.25,
    sessions: 32,
    lastActivity: '1 hour ago',
  },
];

const Stations: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredStations = stations.filter(station => {
    const matchesSearch = station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         station.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || station.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge variant="success" className="flex items-center"><CheckCircle className="w-3 h-3 mr-1" />Online</Badge>;
      case 'maintenance':
        return <Badge variant="warning" className="flex items-center"><AlertTriangle className="w-3 h-3 mr-1" />Maintenance</Badge>;
      case 'offline':
        return <Badge variant="destructive" className="flex items-center"><XCircle className="w-3 h-3 mr-1" />Offline</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getConnectorStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="success" className="text-xs">Available</Badge>;
      case 'occupied':
        return <Badge variant="default" className="text-xs">Occupied</Badge>;
      case 'maintenance':
        return <Badge variant="warning" className="text-xs">Maintenance</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Station Management</h1>
          <p className="text-muted-foreground">Monitor and manage charging stations across your network</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Station
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">+12 new this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Online Stations</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,201</div>
            <p className="text-xs text-muted-foreground">96.3% uptime</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Connectors</CardTitle>
            <Battery className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847</div>
            <p className="text-xs text-muted-foreground">89 currently occupied</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$387,421</div>
            <p className="text-xs text-muted-foreground">+15.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Station Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search stations by name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="maintenance">Maintenance</option>
                <option value="offline">Offline</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stations List */}
      <div className="space-y-4">
        {filteredStations.map((station) => (
          <Card key={station.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{station.name}</CardTitle>
                    <CardDescription className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      {station.location}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(station.status)}
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Connectors */}
                <div>
                  <h4 className="font-medium mb-2">Connectors</h4>
                  <div className="space-y-2">
                    {station.connectors.map((connector) => (
                      <div key={connector.id} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <span className="font-medium">{connector.type}</span>
                          <span className="text-sm text-muted-foreground ml-2">{connector.power}kW</span>
                        </div>
                        {getConnectorStatusBadge(connector.status)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Performance */}
                <div>
                  <h4 className="font-medium mb-2">Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Revenue</span>
                      <span className="font-medium">${station.revenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Sessions</span>
                      <span className="font-medium">{station.sessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Activity</span>
                      <span className="font-medium">{station.lastActivity}</span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <h4 className="font-medium mb-2">Location</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Latitude</span>
                      <span className="font-medium">{station.coordinates.lat}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Longitude</span>
                      <span className="font-medium">{station.coordinates.lng}</span>
                    </div>
                    <Button variant="outline" size="sm" className="w-full">
                      <MapPin className="w-4 h-4 mr-2" />
                      View on Map
                    </Button>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h4 className="font-medium mb-2">Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Station
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Stations;

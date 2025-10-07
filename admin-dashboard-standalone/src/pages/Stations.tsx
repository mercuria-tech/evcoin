import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { stationsAPI } from '@/services/api';
import { 
  MapPin, 
  Plug, 
  Activity,
  Plus,
  Search,
  Filter,
  X
} from 'lucide-react';

const Stations: React.FC = () => {
  const { t } = useTranslation();
  const [stationsData, setStationsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStation, setEditingStation] = useState<any>(null);
  const [newStation, setNewStation] = useState({
    name: '',
    location: '',
    latitude: '',
    longitude: '',
    connectors: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await stationsAPI.getAll();
        setStationsData(response.data);
      } catch (err) {
        console.error('Error fetching stations data:', err);
        setError('Failed to load stations data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddStation = async () => {
    try {
      const response = await fetch('https://ev-charging-platform-production.mks-alghafil.workers.dev/api/stations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStation),
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Station created:', result);
      
      // Reset form and close modal
      setNewStation({
        name: '',
        location: '',
        latitude: '',
        longitude: '',
        connectors: []
      });
      setShowAddModal(false);
      
      // Refresh the stations list
      window.location.reload();
      
    } catch (err) {
      console.error('Error creating station:', err);
      alert(`Failed to create station: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleEditStation = async () => {
    try {
      const response = await fetch(`https://ev-charging-platform-production.mks-alghafil.workers.dev/api/stations/${editingStation.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingStation),
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Station updated:', result);
      
      setShowEditModal(false);
      setEditingStation(null);
      
      // Refresh the stations list
      window.location.reload();
      
    } catch (err) {
      console.error('Error updating station:', err);
      alert(`Failed to update station: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeleteStation = async (stationId: string, stationName: string) => {
    if (!confirm(`Are you sure you want to delete station "${stationName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`https://ev-charging-platform-production.mks-alghafil.workers.dev/api/stations/${stationId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Station deleted:', result);
      
      // Refresh the stations list
      window.location.reload();
      
    } catch (err) {
      console.error('Error deleting station:', err);
      alert(`Failed to delete station: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const openEditModal = (station: any) => {
    setEditingStation({ ...station });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stations = stationsData?.stations || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'maintenance':
        return <Badge variant="destructive">Maintenance</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const filteredStations = stations.filter((station: any) =>
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('stations.title')}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage and monitor charging stations
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Station
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search stations..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      {/* Stations Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredStations.map((station: any) => (
          <Card key={station.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-semibold">{station.name}</CardTitle>
              {getStatusBadge(station.status)}
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="mr-2 h-4 w-4" /> {station.location}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Plug className="mr-2 h-4 w-4" /> {station.connectors?.length || 0} connectors
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Activity className="mr-2 h-4 w-4" /> Last updated: {new Date(station.lastUpdated).toLocaleDateString()}
              </div>
              <div className="flex space-x-2 mt-4">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openEditModal(station)}
                  className="flex-1"
                >
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleDeleteStation(station.id, station.name)}
                  className="flex-1 text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStations.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No stations found matching your search.</p>
        </div>
      )}

      {/* Add Station Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Station</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Station Name *</label>
                <input
                  type="text"
                  value={newStation.name}
                  onChange={(e) => setNewStation({...newStation, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter station name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Location *</label>
                <input
                  type="text"
                  value={newStation.location}
                  onChange={(e) => setNewStation({...newStation, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter station location"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={newStation.latitude}
                  onChange={(e) => setNewStation({...newStation, latitude: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter latitude"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={newStation.longitude}
                  onChange={(e) => setNewStation({...newStation, longitude: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter longitude"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddStation}
                disabled={!newStation.name || !newStation.location}
              >
                Add Station
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Station Modal */}
      {showEditModal && editingStation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Station</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Station Name *</label>
                <input
                  type="text"
                  value={editingStation.name}
                  onChange={(e) => setEditingStation({...editingStation, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter station name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Location *</label>
                <input
                  type="text"
                  value={editingStation.location}
                  onChange={(e) => setEditingStation({...editingStation, location: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter station location"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  value={editingStation.latitude || ''}
                  onChange={(e) => setEditingStation({...editingStation, latitude: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter latitude"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  value={editingStation.longitude || ''}
                  onChange={(e) => setEditingStation({...editingStation, longitude: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter longitude"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={editingStation.status}
                  onChange={(e) => setEditingStation({...editingStation, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditStation}
                disabled={!editingStation.name || !editingStation.location}
              >
                Update Station
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Stations;
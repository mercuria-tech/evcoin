import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { chargingAPI } from '@/services/api';
import { 
  Zap, 
  Clock,
  DollarSign,
  Activity,
  Plus,
  Search,
  Filter,
  X
} from 'lucide-react';

const ChargingSessionsPage: React.FC = () => {
  const { t } = useTranslation();
  const [sessionsData, setSessionsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const [newSession, setNewSession] = useState({
    userId: '',
    stationId: '',
    connectorId: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await chargingAPI.getAll();
        const data = response.data;
        
        // Add mock stats for now (in production, get from separate endpoint)
        const sessionsWithStats = {
          ...data,
          stats: {
            totalSessions: 1247,
            activeSessions: 23,
            completedToday: 45,
            totalRevenue: 12580.75
          }
        };
        
        setSessionsData(sessionsWithStats);
      } catch (err) {
        console.error('Error fetching charging sessions data:', err);
        setError(`Failed to load charging sessions data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddSession = async () => {
    try {
      const response = await fetch('https://ev-charging-platform-production.mks-alghafil.workers.dev/api/charging/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSession),
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Charging session created:', result);
      
      // Reset form and close modal
      setNewSession({
        userId: '',
        stationId: '',
        connectorId: ''
      });
      setShowAddModal(false);
      
      // Refresh the sessions list
      window.location.reload();
      
    } catch (err) {
      console.error('Error creating charging session:', err);
      alert(`Failed to create charging session: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleEditSession = async () => {
    try {
      const response = await fetch(`https://ev-charging-platform-production.mks-alghafil.workers.dev/api/charging/sessions/${editingSession.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingSession),
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Charging session updated:', result);
      
      setShowEditModal(false);
      setEditingSession(null);
      
      // Refresh the sessions list
      window.location.reload();
      
    } catch (err) {
      console.error('Error updating charging session:', err);
      alert(`Failed to update charging session: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeleteSession = async (sessionId: string, sessionInfo: string) => {
    if (!confirm(`Are you sure you want to delete charging session "${sessionInfo}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`https://ev-charging-platform-production.mks-alghafil.workers.dev/api/charging/sessions/${sessionId}`, {
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
      console.log('Charging session deleted:', result);
      
      // Refresh the sessions list
      window.location.reload();
      
    } catch (err) {
      console.error('Error deleting charging session:', err);
      alert(`Failed to delete charging session: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const openEditModal = (session: any) => {
    setEditingSession({ ...session });
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

  const sessions = sessionsData?.sessions || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default">{t('charging.status_active')}</Badge>;
      case 'completed':
        return <Badge variant="secondary">{t('charging.status_completed')}</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">{t('charging.status_cancelled')}</Badge>;
      default:
        return <Badge variant="outline">{t('charging.status_unknown')}</Badge>;
    }
  };

  const filteredSessions = sessions.filter((session: any) =>
    session.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.station_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Charging Sessions
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Monitor and manage charging sessions
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Session
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionsData?.stats?.totalSessions || 0}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionsData?.stats?.activeSessions || 0}</div>
            <p className="text-xs text-muted-foreground">Currently charging</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessionsData?.stats?.completedToday || 0}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${sessionsData?.stats?.totalRevenue?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search sessions..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      {/* Sessions List */}
      <div className="grid gap-4">
        {filteredSessions.map((session: any) => (
          <Card key={session.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">{session.id}</h3>
                    {getStatusBadge(session.status)}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="font-medium">{session.user_name}</span>
                    <span className="mx-2">•</span>
                    <span>{session.station_name}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>Started: {new Date(session.start_time).toLocaleString()}</span>
                    {session.end_time && (
                      <span>Ended: {new Date(session.end_time).toLocaleString()}</span>
                    )}
                    <span>Energy: {session.energy_delivered || 0} kWh</span>
                    <span>Cost: ${session.cost || 0}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditModal(session)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteSession(session.id, `${session.user_name} - ${session.station_name}`)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No charging sessions found.</p>
        </div>
      )}

      {/* Add Session Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Charging Session</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">User ID *</label>
                <input
                  type="text"
                  value={newSession.userId}
                  onChange={(e) => setNewSession({...newSession, userId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter user ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Station ID *</label>
                <input
                  type="text"
                  value={newSession.stationId}
                  onChange={(e) => setNewSession({...newSession, stationId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter station ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Connector ID *</label>
                <input
                  type="text"
                  value={newSession.connectorId}
                  onChange={(e) => setNewSession({...newSession, connectorId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter connector ID"
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
                onClick={handleAddSession}
                disabled={!newSession.userId || !newSession.stationId || !newSession.connectorId}
              >
                Add Session
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Session Modal */}
      {showEditModal && editingSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Charging Session</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Energy Delivered (kWh)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingSession.energy_delivered || ''}
                  onChange={(e) => setEditingSession({...editingSession, energy_delivered: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter energy delivered"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Cost ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingSession.cost || ''}
                  onChange={(e) => setEditingSession({...editingSession, cost: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter cost"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={editingSession.status}
                  onChange={(e) => setEditingSession({...editingSession, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {editingSession.status === 'completed' && (
                <div>
                  <label className="block text-sm font-medium mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    value={editingSession.end_time ? new Date(editingSession.end_time).toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditingSession({...editingSession, end_time: e.target.value ? new Date(e.target.value).toISOString() : null})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSession}
              >
                Update Session
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChargingSessionsPage;
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Bell, 
  Plus,
  Search,
  Check,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  Clock,
  User,
  Zap,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Calendar
} from 'lucide-react';

const NotificationsPage: React.FC = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    priority: 'medium',
    targetUsers: 'all'
  });

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Mock notifications data - in production, this would come from API
        const mockNotifications = [
          {
            id: 'NOT-001',
            title: 'Station Maintenance Scheduled',
            message: 'Station ST-001 will undergo maintenance on January 20th from 2:00 AM to 6:00 AM',
            type: 'maintenance',
            priority: 'high',
            status: 'unread',
            createdAt: '2024-01-15T10:30:00Z',
            targetUsers: 'all',
            readBy: 0,
            totalUsers: 2847,
            scheduledFor: '2024-01-20T02:00:00Z'
          },
          {
            id: 'NOT-002',
            title: 'Payment Processing Delay',
            message: 'Some payments may experience delays due to payment gateway maintenance',
            type: 'payment',
            priority: 'medium',
            status: 'read',
            createdAt: '2024-01-15T09:15:00Z',
            targetUsers: 'all',
            readBy: 1247,
            totalUsers: 2847,
            scheduledFor: null
          },
          {
            id: 'NOT-003',
            title: 'New Charging Station Added',
            message: 'A new charging station has been added at Downtown Mall with 4 CCS connectors',
            type: 'system',
            priority: 'low',
            status: 'read',
            createdAt: '2024-01-14T16:45:00Z',
            targetUsers: 'all',
            readBy: 2847,
            totalUsers: 2847,
            scheduledFor: null
          },
          {
            id: 'NOT-004',
            title: 'Energy Efficiency Alert',
            message: 'Station ST-005 is operating below optimal efficiency. Please check connector status',
            type: 'alert',
            priority: 'high',
            status: 'unread',
            createdAt: '2024-01-14T14:20:00Z',
            targetUsers: 'operators',
            readBy: 3,
            totalUsers: 12,
            scheduledFor: null
          },
          {
            id: 'NOT-005',
            title: 'User Feedback Summary',
            message: 'Monthly user feedback summary is now available. Overall rating: 4.7/5 stars',
            type: 'feedback',
            priority: 'low',
            status: 'read',
            createdAt: '2024-01-13T11:30:00Z',
            targetUsers: 'admins',
            readBy: 5,
            totalUsers: 8,
            scheduledFor: null
          },
          {
            id: 'NOT-006',
            title: 'Scheduled System Update',
            message: 'System will be updated on January 18th at 3:00 AM. Expected downtime: 30 minutes',
            type: 'system',
            priority: 'medium',
            status: 'unread',
            createdAt: '2024-01-12T08:00:00Z',
            targetUsers: 'all',
            readBy: 0,
            totalUsers: 2847,
            scheduledFor: '2024-01-18T03:00:00Z'
          }
        ];
        
        setNotifications(mockNotifications);
      } catch (err) {
        console.error('Error fetching notifications:', err);
        setError(`Failed to load notifications: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'maintenance':
        return <Settings className="h-5 w-5 text-orange-500" />;
      case 'payment':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'system':
        return <Zap className="h-5 w-5 text-blue-500" />;
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'feedback':
        return <User className="h-5 w-5 text-purple-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge variant="default" className="bg-blue-100 text-blue-800">Unread</Badge>;
      case 'read':
        return <Badge variant="outline">Read</Badge>;
      case 'archived':
        return <Badge variant="secondary">Archived</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, status: 'read', readBy: notif.readBy + 1 } : notif
      )
    );
  };

  const markAsUnread = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, status: 'unread', readBy: Math.max(0, notif.readBy - 1) } : notif
      )
    );
  };

  const deleteNotification = (id: string) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      setNotifications(prev => prev.filter(notif => notif.id !== id));
    }
  };

  const handleAddNotification = () => {
    if (!newNotification.title || !newNotification.message) {
      alert('Please fill in all required fields');
      return;
    }

    const notification = {
      id: `NOT-${Date.now().toString().slice(-3)}`,
      ...newNotification,
      status: 'unread',
      createdAt: new Date().toISOString(),
      readBy: 0,
      totalUsers: newNotification.targetUsers === 'all' ? 2847 : 
                  newNotification.targetUsers === 'operators' ? 12 : 8,
      scheduledFor: null
    };

    setNotifications(prev => [notification, ...prev]);
    setNewNotification({
      title: '',
      message: '',
      type: 'info',
      priority: 'medium',
      targetUsers: 'all'
    });
    setShowAddModal(false);
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || notification.type === selectedType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Notifications
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage system notifications and alerts
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Notification
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.filter(n => n.status === 'unread').length}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.filter(n => n.priority === 'high').length}</div>
            <p className="text-xs text-muted-foreground">Urgent</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.filter(n => n.scheduledFor).length}</div>
            <p className="text-xs text-muted-foreground">Future notifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search notifications..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Types</option>
          <option value="maintenance">Maintenance</option>
          <option value="payment">Payment</option>
          <option value="system">System</option>
          <option value="alert">Alert</option>
          <option value="feedback">Feedback</option>
        </select>
      </div>

      {/* Notifications List */}
      <div className="grid gap-4">
        {filteredNotifications.map((notification) => (
          <Card key={notification.id} className={notification.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      {getTypeIcon(notification.type)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{notification.title}</h3>
                      {getPriorityBadge(notification.priority)}
                      {getStatusBadge(notification.status)}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{new Date(notification.createdAt).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        <span>Target: {notification.targetUsers}</span>
                      </div>
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 mr-1" />
                        <span>{notification.readBy}/{notification.totalUsers} read</span>
                      </div>
                      {notification.scheduledFor && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>Scheduled: {new Date(notification.scheduledFor).toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  {notification.status === 'unread' ? (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Check className="mr-2 h-4 w-4" /> Mark Read
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => markAsUnread(notification.id)}
                    >
                      <EyeOff className="mr-2 h-4 w-4" /> Mark Unread
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteNotification(notification.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No notifications found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Add Notification Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Notification</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter notification title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Message *</label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter notification message"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={newNotification.type}
                  onChange={(e) => setNewNotification({...newNotification, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="info">Info</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="payment">Payment</option>
                  <option value="system">System</option>
                  <option value="alert">Alert</option>
                  <option value="feedback">Feedback</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={newNotification.priority}
                  onChange={(e) => setNewNotification({...newNotification, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Target Users</label>
                <select
                  value={newNotification.targetUsers}
                  onChange={(e) => setNewNotification({...newNotification, targetUsers: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Users</option>
                  <option value="operators">Operators Only</option>
                  <option value="admins">Admins Only</option>
                </select>
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
                onClick={handleAddNotification}
                disabled={!newNotification.title || !newNotification.message}
              >
                Add Notification
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;

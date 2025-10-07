import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Headphones, 
  Plus,
  Search,
  MessageSquare,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Star,
  Reply,
  Archive,
  Calendar,
  MapPin,
  Zap
} from 'lucide-react';

const SupportPage: React.FC = () => {
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'technical',
    userEmail: '',
    stationId: ''
  });
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        // Mock support tickets data - in production, this would come from API
        const mockTickets = [
          {
            id: 'TKT-001',
            title: 'Charging Station Not Responding',
            description: 'Station ST-001 is not responding to charging requests. Users are unable to start charging sessions.',
            priority: 'high',
            status: 'open',
            category: 'technical',
            userEmail: 'john.doe@example.com',
            userName: 'John Doe',
            stationId: 'ST-001',
            stationName: 'Downtown Charging Hub',
            createdAt: '2024-01-15T10:30:00Z',
            updatedAt: '2024-01-15T10:30:00Z',
            assignedTo: 'Tech Support Team',
            messages: [
              {
                id: 1,
                sender: 'John Doe',
                message: 'The station has been unresponsive for the past 2 hours. Multiple users have reported the issue.',
                timestamp: '2024-01-15T10:30:00Z',
                type: 'user'
              },
              {
                id: 2,
                sender: 'Tech Support Team',
                message: 'Thank you for reporting this issue. We are investigating the problem and will update you shortly.',
                timestamp: '2024-01-15T11:15:00Z',
                type: 'support'
              }
            ],
            rating: null,
            resolutionTime: null
          },
          {
            id: 'TKT-002',
            title: 'Payment Processing Error',
            description: 'Users are experiencing payment failures when trying to pay for charging sessions.',
            priority: 'high',
            status: 'in_progress',
            category: 'payment',
            userEmail: 'jane.smith@example.com',
            userName: 'Jane Smith',
            stationId: 'ST-002',
            stationName: 'Mall Charging Station',
            createdAt: '2024-01-15T09:15:00Z',
            updatedAt: '2024-01-15T12:00:00Z',
            assignedTo: 'Payment Team',
            messages: [
              {
                id: 1,
                sender: 'Jane Smith',
                message: 'I tried to pay for my charging session but the payment failed multiple times. My card works fine elsewhere.',
                timestamp: '2024-01-15T09:15:00Z',
                type: 'user'
              },
              {
                id: 2,
                sender: 'Payment Team',
                message: 'We are aware of the payment processing issues and are working with our payment provider to resolve this.',
                timestamp: '2024-01-15T10:30:00Z',
                type: 'support'
              },
              {
                id: 3,
                sender: 'Payment Team',
                message: 'The issue has been identified as a temporary problem with our payment gateway. We expect it to be resolved within 2 hours.',
                timestamp: '2024-01-15T12:00:00Z',
                type: 'support'
              }
            ],
            rating: null,
            resolutionTime: null
          },
          {
            id: 'TKT-003',
            title: 'App Login Issues',
            description: 'Users are unable to log into the mobile app. Getting authentication errors.',
            priority: 'medium',
            status: 'resolved',
            category: 'app',
            userEmail: 'mike.johnson@example.com',
            userName: 'Mike Johnson',
            stationId: null,
            stationName: null,
            createdAt: '2024-01-14T16:45:00Z',
            updatedAt: '2024-01-15T08:30:00Z',
            assignedTo: 'App Development Team',
            messages: [
              {
                id: 1,
                sender: 'Mike Johnson',
                message: 'I cannot log into the mobile app. I keep getting an authentication error.',
                timestamp: '2024-01-14T16:45:00Z',
                type: 'user'
              },
              {
                id: 2,
                sender: 'App Development Team',
                message: 'We have identified and fixed the authentication issue. Please try logging in again.',
                timestamp: '2024-01-15T08:30:00Z',
                type: 'support'
              }
            ],
            rating: 5,
            resolutionTime: '15 hours 45 minutes'
          },
          {
            id: 'TKT-004',
            title: 'Station Maintenance Request',
            description: 'Station ST-003 needs routine maintenance. Connector C2 is showing signs of wear.',
            priority: 'low',
            status: 'open',
            category: 'maintenance',
            userEmail: 'sarah.wilson@example.com',
            userName: 'Sarah Wilson',
            stationId: 'ST-003',
            stationName: 'Highway Rest Stop',
            createdAt: '2024-01-14T14:20:00Z',
            updatedAt: '2024-01-14T14:20:00Z',
            assignedTo: 'Maintenance Team',
            messages: [
              {
                id: 1,
                sender: 'Sarah Wilson',
                message: 'I noticed that connector C2 at Station ST-003 is showing signs of wear and may need maintenance soon.',
                timestamp: '2024-01-14T14:20:00Z',
                type: 'user'
              }
            ],
            rating: null,
            resolutionTime: null
          },
          {
            id: 'TKT-005',
            title: 'Billing Discrepancy',
            description: 'User was charged incorrectly for a charging session. Amount charged does not match energy delivered.',
            priority: 'medium',
            status: 'closed',
            category: 'billing',
            userEmail: 'david.brown@example.com',
            userName: 'David Brown',
            stationId: 'ST-004',
            stationName: 'Airport Terminal',
            createdAt: '2024-01-13T11:30:00Z',
            updatedAt: '2024-01-14T09:15:00Z',
            assignedTo: 'Billing Team',
            messages: [
              {
                id: 1,
                sender: 'David Brown',
                message: 'I was charged $45.20 for a charging session but only received 22.5 kWh. The rate should be $0.15/kWh.',
                timestamp: '2024-01-13T11:30:00Z',
                type: 'user'
              },
              {
                id: 2,
                sender: 'Billing Team',
                message: 'We have reviewed your billing and found the discrepancy. A refund of $12.05 has been processed.',
                timestamp: '2024-01-14T09:15:00Z',
                type: 'support'
              }
            ],
            rating: 4,
            resolutionTime: '21 hours 45 minutes'
          }
        ];
        
        setTickets(mockTickets);
      } catch (err) {
        console.error('Error fetching tickets:', err);
        setError(`Failed to load support tickets: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'medium':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'low':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="default" className="bg-red-100 text-red-800">Open</Badge>;
      case 'in_progress':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'closed':
        return <Badge variant="secondary">Closed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'technical':
        return <Zap className="h-4 w-4" />;
      case 'payment':
        return <MessageSquare className="h-4 w-4" />;
      case 'app':
        return <User className="h-4 w-4" />;
      case 'maintenance':
        return <AlertCircle className="h-4 w-4" />;
      case 'billing':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Headphones className="h-4 w-4" />;
    }
  };

  const updateTicketStatus = (id: string, newStatus: string) => {
    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === id ? { 
          ...ticket, 
          status: newStatus, 
          updatedAt: new Date().toISOString() 
        } : ticket
      )
    );
  };

  const addReply = (ticketId: string) => {
    if (!replyMessage.trim()) {
      alert('Please enter a reply message');
      return;
    }

    const newMessage = {
      id: Date.now(),
      sender: 'Support Team',
      message: replyMessage,
      timestamp: new Date().toISOString(),
      type: 'support'
    };

    setTickets(prev => 
      prev.map(ticket => 
        ticket.id === ticketId ? {
          ...ticket,
          messages: [...ticket.messages, newMessage],
          updatedAt: new Date().toISOString()
        } : ticket
      )
    );

    setReplyMessage('');
    setShowReplyModal(false);
    setSelectedTicket(null);
  };

  const createTicket = () => {
    if (!newTicket.title || !newTicket.description || !newTicket.userEmail) {
      alert('Please fill in all required fields');
      return;
    }

    const ticket = {
      id: `TKT-${Date.now().toString().slice(-3)}`,
      ...newTicket,
      userName: newTicket.userEmail.split('@')[0],
      stationName: newTicket.stationId ? `Station ${newTicket.stationId}` : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignedTo: 'Support Team',
      messages: [
        {
          id: 1,
          sender: newTicket.userEmail.split('@')[0],
          message: newTicket.description,
          timestamp: new Date().toISOString(),
          type: 'user'
        }
      ],
      rating: null,
      resolutionTime: null
    };

    setTickets(prev => [ticket, ...prev]);
    setNewTicket({
      title: '',
      description: '',
      priority: 'medium',
      category: 'technical',
      userEmail: '',
      stationId: ''
    });
    setShowAddModal(false);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || ticket.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || ticket.priority === selectedPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Support Tickets
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage customer support tickets and issues
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Ticket
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <Headphones className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'open').length}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'in_progress').length}</div>
            <p className="text-xs text-muted-foreground">Being worked on</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tickets.filter(t => t.status === 'resolved').length}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tickets..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>
        <select
          value={selectedPriority}
          onChange={(e) => setSelectedPriority(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {/* Tickets List */}
      <div className="grid gap-4">
        {filteredTickets.map((ticket) => (
          <Card key={ticket.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      {getPriorityIcon(ticket.priority)}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="text-lg font-semibold">{ticket.title}</h3>
                      {getPriorityBadge(ticket.priority)}
                      {getStatusBadge(ticket.status)}
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                      {ticket.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        <span>{ticket.userName}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                      </div>
                      {ticket.stationId && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span>{ticket.stationName}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        {getCategoryIcon(ticket.category)}
                        <span className="ml-1 capitalize">{ticket.category}</span>
                      </div>
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        <span>{ticket.messages.length} messages</span>
                      </div>
                    </div>
                    
                    {ticket.rating && (
                      <div className="mt-2 flex items-center">
                        <span className="text-sm text-gray-500 mr-2">Rating:</span>
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < ticket.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                        <span className="ml-2 text-sm text-gray-500">
                          ({ticket.resolutionTime})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSelectedTicket(ticket);
                      setShowReplyModal(true);
                    }}
                  >
                    <Reply className="mr-2 h-4 w-4" /> Reply
                  </Button>
                  
                  {ticket.status === 'open' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                    >
                      <Clock className="mr-2 h-4 w-4" /> Start
                    </Button>
                  )}
                  
                  {ticket.status === 'in_progress' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" /> Resolve
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => updateTicketStatus(ticket.id, 'closed')}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Archive className="mr-2 h-4 w-4" /> Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTickets.length === 0 && (
        <div className="text-center py-12">
          <Headphones className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No tickets found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Create Ticket Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create Support Ticket</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  type="text"
                  value={newTicket.title}
                  onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter ticket title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  value={newTicket.description}
                  onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Describe the issue"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">User Email *</label>
                <input
                  type="email"
                  value={newTicket.userEmail}
                  onChange={(e) => setNewTicket({...newTicket, userEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Station ID</label>
                <input
                  type="text"
                  value={newTicket.stationId}
                  onChange={(e) => setNewTicket({...newTicket, stationId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ST-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={newTicket.category}
                  onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="technical">Technical</option>
                  <option value="payment">Payment</option>
                  <option value="app">App</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="billing">Billing</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
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
                onClick={createTicket}
                disabled={!newTicket.title || !newTicket.description || !newTicket.userEmail}
              >
                Create Ticket
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Reply to Ticket</h3>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setSelectedTicket(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium">{selectedTicket.title}</h4>
              <p className="text-sm text-gray-600">{selectedTicket.description}</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Reply Message *</label>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                  placeholder="Enter your reply..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="outline"
                onClick={() => {
                  setShowReplyModal(false);
                  setSelectedTicket(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => addReply(selectedTicket.id)}
                disabled={!replyMessage.trim()}
              >
                Send Reply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportPage;

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  Zap,
  TrendingUp,
  Shield,
  Ban,
  CheckCircle,
} from 'lucide-react';

const users = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@email.com',
    phone: '+1 (555) 123-4567',
    status: 'active',
    joinDate: '2023-01-15',
    totalSessions: 45,
    totalSpent: 1250.50,
    lastActivity: '2 hours ago',
    subscription: 'premium',
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    phone: '+1 (555) 987-6543',
    status: 'active',
    joinDate: '2023-03-22',
    totalSessions: 78,
    totalSpent: 2100.75,
    lastActivity: '1 day ago',
    subscription: 'basic',
  },
  {
    id: 3,
    name: 'Mike Wilson',
    email: 'mike.wilson@email.com',
    phone: '+1 (555) 456-7890',
    status: 'suspended',
    joinDate: '2023-02-10',
    totalSessions: 12,
    totalSpent: 320.25,
    lastActivity: '1 week ago',
    subscription: 'basic',
  },
];

const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" className="flex items-center"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'suspended':
        return <Badge variant="destructive" className="flex items-center"><Ban className="w-3 h-3 mr-1" />Suspended</Badge>;
      case 'pending':
        return <Badge variant="warning" className="flex items-center"><Shield className="w-3 h-3 mr-1" />Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getSubscriptionBadge = (subscription: string) => {
    switch (subscription) {
      case 'premium':
        return <Badge variant="default">Premium</Badge>;
      case 'basic':
        return <Badge variant="secondary">Basic</Badge>;
      default:
        return <Badge variant="outline">{subscription}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts and monitor activity</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,432</div>
            <p className="text-xs text-muted-foreground">+127 new this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14,891</div>
            <p className="text-xs text-muted-foreground">96.5% active rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,247</div>
            <p className="text-xs text-muted-foreground">21% conversion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
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
          <CardTitle>User Search & Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
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
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <Mail className="w-4 h-4 mr-1" />
                        {user.email}
                      </span>
                      <span className="flex items-center">
                        <Phone className="w-4 h-4 mr-1" />
                        {user.phone}
                      </span>
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(user.status)}
                  {getSubscriptionBadge(user.subscription)}
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Activity Stats */}
                <div>
                  <h4 className="font-medium mb-2">Activity Stats</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Sessions</span>
                      <span className="font-medium">{user.totalSessions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Spent</span>
                      <span className="font-medium">${user.totalSpent.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Last Activity</span>
                      <span className="font-medium">{user.lastActivity}</span>
                    </div>
                  </div>
                </div>

                {/* Account Info */}
                <div>
                  <h4 className="font-medium mb-2">Account Info</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Join Date</span>
                      <span className="font-medium">{user.joinDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Subscription</span>
                      {getSubscriptionBadge(user.subscription)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      {getStatusBadge(user.status)}
                    </div>
                  </div>
                </div>

                {/* Payment Methods */}
                <div>
                  <h4 className="font-medium mb-2">Payment Methods</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        <span className="text-sm">**** 1234</span>
                      </div>
                      <Badge variant="success" className="text-xs">Active</Badge>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-muted rounded">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-2" />
                        <span className="text-sm">**** 5678</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">Backup</Badge>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div>
                  <h4 className="font-medium mb-2">Actions</h4>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      Edit User
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      View Sessions
                    </Button>
                    {user.status === 'active' ? (
                      <Button variant="destructive" size="sm" className="w-full">
                        Suspend User
                      </Button>
                    ) : (
                      <Button variant="default" size="sm" className="w-full">
                        Activate User
                      </Button>
                    )}
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

export default Users;

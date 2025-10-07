import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { paymentsAPI } from '@/services/api';
import { 
  DollarSign, 
  CreditCard,
  TrendingUp,
  Activity,
  Plus,
  Search,
  Filter,
  X
} from 'lucide-react';

const PaymentsPage: React.FC = () => {
  const { t } = useTranslation();
  const [paymentsData, setPaymentsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);
  const [newPayment, setNewPayment] = useState({
    userId: '',
    sessionId: '',
    amount: '',
    currency: 'USD',
    paymentMethod: 'credit_card'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await paymentsAPI.getAll();
        const data = response.data;
        
        // Add mock stats for now (in production, get from separate endpoint)
        const paymentsWithStats = {
          ...data,
          stats: {
            totalRevenue: 12580.75,
            todayRevenue: 1250.50,
            pendingPayments: 5,
            completedPayments: 1242
          }
        };
        
        setPaymentsData(paymentsWithStats);
      } catch (err) {
        console.error('Error fetching payments data:', err);
        setError(`Failed to load payments data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddPayment = async () => {
    try {
      const response = await fetch('https://ev-charging-platform-production.mks-alghafil.workers.dev/api/payments/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newPayment,
          amount: parseFloat(newPayment.amount)
        }),
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Payment created:', result);
      
      // Reset form and close modal
      setNewPayment({
        userId: '',
        sessionId: '',
        amount: '',
        currency: 'USD',
        paymentMethod: 'credit_card'
      });
      setShowAddModal(false);
      
      // Refresh the payments list
      window.location.reload();
      
    } catch (err) {
      console.error('Error creating payment:', err);
      alert(`Failed to create payment: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleEditPayment = async () => {
    try {
      const response = await fetch(`https://ev-charging-platform-production.mks-alghafil.workers.dev/api/payments/transactions/${editingPayment.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingPayment),
        mode: 'cors',
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Payment updated:', result);
      
      setShowEditModal(false);
      setEditingPayment(null);
      
      // Refresh the payments list
      window.location.reload();
      
    } catch (err) {
      console.error('Error updating payment:', err);
      alert(`Failed to update payment: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleDeletePayment = async (paymentId: string, paymentInfo: string) => {
    if (!confirm(`Are you sure you want to delete payment "${paymentInfo}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`https://ev-charging-platform-production.mks-alghafil.workers.dev/api/payments/transactions/${paymentId}`, {
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
      console.log('Payment deleted:', result);
      
      // Refresh the payments list
      window.location.reload();
      
    } catch (err) {
      console.error('Error deleting payment:', err);
      alert(`Failed to delete payment: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const openEditModal = (payment: any) => {
    setEditingPayment({ ...payment });
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

  const payments = paymentsData?.payments || [];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">{t('payments.status_completed')}</Badge>;
      case 'pending':
        return <Badge variant="secondary">{t('payments.status_pending')}</Badge>;
      case 'failed':
        return <Badge variant="destructive">{t('payments.status_failed')}</Badge>;
      case 'refunded':
        return <Badge variant="outline">{t('payments.status_refunded')}</Badge>;
      default:
        return <Badge variant="outline">{t('payments.status_unknown')}</Badge>;
    }
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
        return <CreditCard className="h-4 w-4" />;
      case 'paypal':
        return <DollarSign className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const filteredPayments = payments.filter((payment: any) =>
    payment.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.sessionId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Payments
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage payment transactions and revenue
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Payment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paymentsData?.stats?.totalRevenue?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${paymentsData?.stats?.todayRevenue?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentsData?.stats?.pendingPayments || 0}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Payments</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{paymentsData?.stats?.completedPayments || 0}</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search payments..."
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>

      {/* Payments List */}
      <div className="grid gap-4">
        {filteredPayments.map((payment: any) => (
          <Card key={payment.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold">{payment.id}</h3>
                    {getStatusBadge(payment.status)}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span className="font-medium">{payment.userName}</span>
                    <span className="mx-2">•</span>
                    <span>Session: {payment.sessionId}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span className="flex items-center">
                      {getPaymentMethodIcon(payment.paymentMethod)}
                      <span className="ml-1 capitalize">{payment.paymentMethod.replace('_', ' ')}</span>
                    </span>
                    <span>Amount: ${payment.amount}</span>
                    <span>Created: {new Date(payment.createdAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => openEditModal(payment)}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeletePayment(payment.id, `${payment.userName} - $${payment.amount}`)}
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

      {filteredPayments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No payments found.</p>
        </div>
      )}

      {/* Add Payment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Add New Payment</h3>
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
                  value={newPayment.userId}
                  onChange={(e) => setNewPayment({...newPayment, userId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter user ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Session ID *</label>
                <input
                  type="text"
                  value={newPayment.sessionId}
                  onChange={(e) => setNewPayment({...newPayment, sessionId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter session ID"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Amount ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Currency</label>
                <select
                  value={newPayment.currency}
                  onChange={(e) => setNewPayment({...newPayment, currency: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  value={newPayment.paymentMethod}
                  onChange={(e) => setNewPayment({...newPayment, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="apple_pay">Apple Pay</option>
                  <option value="google_pay">Google Pay</option>
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
                onClick={handleAddPayment}
                disabled={!newPayment.userId || !newPayment.sessionId || !newPayment.amount}
              >
                Add Payment
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Modal */}
      {showEditModal && editingPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Payment</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingPayment.amount || ''}
                  onChange={(e) => setEditingPayment({...editingPayment, amount: parseFloat(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter amount"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={editingPayment.status}
                  onChange={(e) => setEditingPayment({...editingPayment, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Payment Method</label>
                <select
                  value={editingPayment.paymentMethod}
                  onChange={(e) => setEditingPayment({...editingPayment, paymentMethod: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="apple_pay">Apple Pay</option>
                  <option value="google_pay">Google Pay</option>
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
                onClick={handleEditPayment}
              >
                Update Payment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsPage;
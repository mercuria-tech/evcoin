import { Router } from 'express';

const router = Router();

// Mock payments data
const payments = [
  {
    id: 'PAY-001',
    userId: '1',
    sessionId: 'CS-001',
    amount: 18.08,
    currency: 'USD',
    paymentMethod: 'credit_card',
    status: 'completed',
    transactionId: 'txn_123456789',
    createdAt: '2024-01-20T11:45:00Z',
    processedAt: '2024-01-20T11:45:30Z'
  },
  {
    id: 'PAY-002',
    userId: '2',
    sessionId: 'CS-002',
    amount: 0,
    currency: 'USD',
    paymentMethod: 'wallet',
    status: 'pending',
    transactionId: null,
    createdAt: '2024-01-20T14:15:00Z',
    processedAt: null
  },
  {
    id: 'PAY-003',
    userId: '1',
    sessionId: 'CS-003',
    amount: 13.12,
    currency: 'USD',
    paymentMethod: 'credit_card',
    status: 'completed',
    transactionId: 'txn_987654321',
    createdAt: '2024-01-19T17:10:00Z',
    processedAt: '2024-01-19T17:10:15Z'
  }
];

// Get all payments
router.get('/', (req, res) => {
  const { status, userId, paymentMethod, startDate, endDate } = req.query;
  
  let filteredPayments = payments;
  
  if (status) {
    filteredPayments = filteredPayments.filter(payment => payment.status === status);
  }
  
  if (userId) {
    filteredPayments = filteredPayments.filter(payment => payment.userId === userId);
  }
  
  if (paymentMethod) {
    filteredPayments = filteredPayments.filter(payment => payment.paymentMethod === paymentMethod);
  }
  
  if (startDate) {
    filteredPayments = filteredPayments.filter(payment => 
      new Date(payment.createdAt) >= new Date(startDate as string)
    );
  }
  
  if (endDate) {
    filteredPayments = filteredPayments.filter(payment => 
      new Date(payment.createdAt) <= new Date(endDate as string)
    );
  }
  
  res.json({
    payments: filteredPayments,
    total: filteredPayments.length
  });
});

// Get payment by ID
router.get('/:id', (req, res) => {
  const payment = payments.find(p => p.id === req.params.id);
  
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  
  res.json(payment);
});

// Process payment
router.post('/process', (req, res) => {
  const { sessionId, paymentMethod, amount } = req.body;
  
  if (!sessionId || !paymentMethod || !amount) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  const newPayment = {
    id: `PAY-${String(payments.length + 1).padStart(3, '0')}`,
    userId: '1', // In real app, get from session
    sessionId,
    amount: parseFloat(amount),
    currency: 'USD',
    paymentMethod,
    status: 'completed',
    transactionId: `txn_${Date.now()}`,
    createdAt: new Date().toISOString(),
    processedAt: new Date().toISOString()
  };
  
  payments.push(newPayment);
  
  res.status(201).json(newPayment);
});

// Refund payment
router.post('/:id/refund', (req, res) => {
  const payment = payments.find(p => p.id === req.params.id);
  
  if (!payment) {
    return res.status(404).json({ error: 'Payment not found' });
  }
  
  if (payment.status !== 'completed') {
    return res.status(400).json({ error: 'Payment is not completed' });
  }
  
  payment.status = 'refunded';
  
  res.json(payment);
});

// Get payment statistics
router.get('/stats/overview', (req, res) => {
  const totalPayments = payments.length;
  const completedPayments = payments.filter(p => p.status === 'completed').length;
  const pendingPayments = payments.filter(p => p.status === 'pending').length;
  const refundedPayments = payments.filter(p => p.status === 'refunded').length;
  const totalRevenue = payments
    .filter(p => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);
  const averagePaymentAmount = totalRevenue / completedPayments || 0;
  
  // Payment methods breakdown
  const paymentMethods = payments.reduce((acc, payment) => {
    acc[payment.paymentMethod] = (acc[payment.paymentMethod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  res.json({
    totalPayments,
    completedPayments,
    pendingPayments,
    refundedPayments,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    averagePaymentAmount: Math.round(averagePaymentAmount * 100) / 100,
    paymentMethods
  });
});

export { router as paymentsRoutes };

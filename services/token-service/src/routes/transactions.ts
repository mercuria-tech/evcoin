import { Hono } from 'hono';

const app = new Hono();

// Get transaction by hash
app.get('/:hash', async (c) => {
  try {
    const hash = c.req.param('hash');
    
    if (!hash) {
      return c.json({ error: 'Transaction hash is required' }, 400);
    }

    // In a real implementation, this would query the blockchain
    // For now, returning mock data
    const mockTransaction = {
      hash,
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      blockNumber: 12345678,
      from: 'mock_from_address',
      to: 'mock_to_address',
      amount: 100.5,
      currency: 'EVCH',
      type: 'transfer',
      gasUsed: 5000,
      gasPrice: 0.000005
    };

    return c.json(mockTransaction);

  } catch (error) {
    return c.json({ 
      error: 'Failed to get transaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get user transactions
app.get('/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    // In a real implementation, this would query a database
    const mockTransactions = [
      {
        id: 'txn_001',
        hash: 'mock_hash_001',
        userId,
        type: 'mint',
        amount: 25.5,
        currency: 'EVCH',
        status: 'confirmed',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        description: 'Charging session reward'
      },
      {
        id: 'txn_002',
        hash: 'mock_hash_002',
        userId,
        type: 'burn',
        amount: 10.0,
        currency: 'EVCH',
        status: 'confirmed',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        description: 'Payment for charging session'
      }
    ];

    return c.json({
      userId,
      transactions: mockTransactions.slice(offset, offset + limit),
      total: mockTransactions.length,
      limit,
      offset
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to get user transactions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get transaction statistics
app.get('/stats/overview', async (c) => {
  try {
    const period = c.req.query('period') || '24h';
    
    // In a real implementation, this would calculate from database
    const mockStats = {
      period,
      totalTransactions: 1250,
      totalVolume: 50000, // EVCH
      averageTransaction: 40,
      successRate: 99.5,
      topUsers: [
        { userId: 'user_001', volume: 5000 },
        { userId: 'user_002', volume: 3500 },
        { userId: 'user_003', volume: 2800 }
      ]
    };

    return c.json(mockStats);

  } catch (error) {
    return c.json({ 
      error: 'Failed to get transaction statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export { app as transactionRoutes };

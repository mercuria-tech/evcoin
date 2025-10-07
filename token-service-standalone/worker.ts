import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: [
    'https://74b3fdfd.ev-charging-admin.pages.dev',
    'https://5961ad97.ev-charging-admin.pages.dev',
    'https://ea779a1a.ev-charging-admin.pages.dev',
    'https://dc80b3ae.ev-charging-admin.pages.dev',
    'https://ae81a447.ev-charging-admin.pages.dev',
    'https://72a89e7d.ev-charging-admin.pages.dev',
    'http://localhost:5173'
  ],
  credentials: true,
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

app.use('*', logger());

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'OK',
    service: 'token-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Token Service Routes
app.get('/api/token/info', async (c) => {
  try {
    return c.json({
      name: 'EV Charge Token',
      symbol: 'EVCH',
      decimals: 6,
      mintAddress: 'EVCH1111111111111111111111111111111111111111',
      totalSupply: 1000000000,
      circulatingSupply: 500000000,
      network: 'Solana',
      standard: 'SPL Token'
    });
  } catch (error) {
    return c.json({ error: 'Failed to get token info' }, 500);
  }
});

app.get('/api/token/stats', async (c) => {
  try {
    return c.json({
      totalSupply: 1000000000,
      circulatingSupply: 500000000,
      totalMinted: 750000000,
      totalBurned: 250000000,
      activeWallets: 1250,
      currency: 'EVCH'
    });
  } catch (error) {
    return c.json({ error: 'Failed to get token statistics' }, 500);
  }
});

// Mint tokens for charging sessions
app.post('/api/token/mint', async (c) => {
  try {
    const { userId, sessionId, energyKwh, sessionData } = await c.req.json();
    
    if (!userId || !sessionId || !energyKwh) {
      return c.json({ error: 'Missing required fields: userId, sessionId, energyKwh' }, 400);
    }

    // Mock minting - in production this would call Solana
    const mockTransactionHash = `mint_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return c.json({
      success: true,
      transactionHash: mockTransactionHash,
      tokensMinted: energyKwh,
      userId,
      sessionId,
      message: 'Tokens minted successfully'
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to mint tokens',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Burn tokens for payments
app.post('/api/token/burn', async (c) => {
  try {
    const { userId, amount, reason, sessionId } = await c.req.json();
    
    if (!userId || !amount) {
      return c.json({ error: 'Missing required fields: userId, amount' }, 400);
    }

    // Mock burning - in production this would call Solana
    const mockTransactionHash = `burn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return c.json({
      success: true,
      transactionHash: mockTransactionHash,
      tokensBurned: amount,
      userId,
      message: 'Tokens burned successfully'
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to burn tokens',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Transfer tokens between users
app.post('/api/token/transfer', async (c) => {
  try {
    const { fromUserId, toUserId, amount, reason } = await c.req.json();
    
    if (!fromUserId || !toUserId || !amount) {
      return c.json({ error: 'Missing required fields: fromUserId, toUserId, amount' }, 400);
    }

    // Mock transfer - in production this would call Solana
    const mockTransactionHash = `transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return c.json({
      success: true,
      transactionHash: mockTransactionHash,
      amount,
      fromUserId,
      toUserId,
      message: 'Tokens transferred successfully'
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to transfer tokens',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Wallet Service Routes
app.get('/api/wallet/balance/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    // Mock balance - in production this would query Solana
    const mockBalance = Math.floor(Math.random() * 1000) + 100; // Random balance between 100-1100 EVCH

    return c.json({
      userId,
      balance: mockBalance,
      balanceRaw: mockBalance * 1000000,
      currency: 'EVCH'
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to get balance',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

app.get('/api/wallet/info/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    // Mock wallet info
    const mockBalance = Math.floor(Math.random() * 1000) + 100;
    const mockPublicKey = `mock_${userId}_${Math.random().toString(36).substr(2, 9)}`;

    return c.json({
      userId,
      publicKey: mockPublicKey,
      tokenAccount: `token_${mockPublicKey}`,
      balance: mockBalance,
      createdAt: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString(), // Random date within last 30 days
      lastActivity: new Date(Date.now() - Math.random() * 86400000).toISOString() // Random date within last day
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to get wallet info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

app.post('/api/wallet/create', async (c) => {
  try {
    const { userId } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    // Mock wallet creation
    const mockPublicKey = `new_${userId}_${Math.random().toString(36).substr(2, 9)}`;

    return c.json({
      success: true,
      wallet: {
        userId,
        publicKey: mockPublicKey,
        tokenAccount: `token_${mockPublicKey}`,
        balance: 0,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      }
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to create wallet',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

app.get('/api/wallet/transactions/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const limit = parseInt(c.req.query('limit') || '50');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    // Mock transaction history
    const mockTransactions = [
      {
        id: 'txn_001',
        userId,
        type: 'mint',
        amount: 25.5,
        transactionHash: 'mock_hash_001',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        description: 'Charging session reward'
      },
      {
        id: 'txn_002',
        userId,
        type: 'burn',
        amount: 10.0,
        transactionHash: 'mock_hash_002',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        description: 'Payment for charging session'
      },
      {
        id: 'txn_003',
        userId,
        type: 'transfer_in',
        amount: 50.0,
        transactionHash: 'mock_hash_003',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        description: 'Transfer from friend'
      }
    ];

    return c.json({
      userId,
      transactions: mockTransactions.slice(0, limit),
      count: mockTransactions.length
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to get transactions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

app.get('/api/wallet/stats', async (c) => {
  try {
    return c.json({
      totalWallets: 1250,
      activeWallets: 890,
      totalBalance: 1250000,
      averageBalance: 1000
    });
  } catch (error) {
    return c.json({ error: 'Failed to get wallet statistics' }, 500);
  }
});

app.get('/api/wallet/rewards/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    return c.json({
      userId,
      totalRewards: 150.5,
      greenRewards: 75.2,
      offPeakRewards: 45.3,
      lastReward: new Date(Date.now() - 3600000).toISOString()
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to get user rewards',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Transaction Routes
app.get('/api/transactions/:hash', async (c) => {
  try {
    const hash = c.req.param('hash');
    
    if (!hash) {
      return c.json({ error: 'Transaction hash is required' }, 400);
    }

    return c.json({
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
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to get transaction',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

app.get('/api/transactions/user/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

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

app.get('/api/transactions/stats/overview', async (c) => {
  try {
    const period = c.req.query('period') || '24h';
    
    return c.json({
      period,
      totalTransactions: 1250,
      totalVolume: 50000,
      averageTransaction: 40,
      successRate: 99.5,
      topUsers: [
        { userId: 'user_001', volume: 5000 },
        { userId: 'user_002', volume: 3500 },
        { userId: 'user_003', volume: 2800 }
      ]
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to get transaction statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;

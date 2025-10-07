import { Hono } from 'hono';
import { WalletService } from '../services/WalletService';
import { BlockchainGateway } from '../services/BlockchainGateway';

const app = new Hono();
const blockchainGateway = new BlockchainGateway();
const walletService = new WalletService(blockchainGateway);

// Get user wallet balance
app.get('/balance/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const balance = await walletService.getUserBalance(userId);
    
    return c.json({
      userId,
      balance: balance / 1000000, // Convert to EVCH
      balanceRaw: balance,
      currency: 'EVCH'
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to get balance',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get user wallet information
app.get('/info/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const wallet = await walletService.getUserWallet(userId);
    
    return c.json(wallet);

  } catch (error) {
    return c.json({ 
      error: 'Failed to get wallet info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Create user wallet
app.post('/create', async (c) => {
  try {
    const { userId } = await c.req.json();
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const wallet = await walletService.createUserWallet(userId);
    
    return c.json({
      success: true,
      wallet
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to create wallet',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get wallet transaction history
app.get('/transactions/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    const limit = parseInt(c.req.query('limit') || '50');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const transactions = await walletService.getWalletTransactions(userId, limit);
    
    return c.json({
      userId,
      transactions,
      count: transactions.length
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to get transactions',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get wallet statistics
app.get('/stats', async (c) => {
  try {
    const stats = await walletService.getWalletStats();
    
    return c.json(stats);

  } catch (error) {
    return c.json({ 
      error: 'Failed to get wallet statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get user rewards
app.get('/rewards/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const rewards = await walletService.getUserRewards(userId);
    
    return c.json({
      userId,
      ...rewards
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to get user rewards',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Validate wallet address
app.post('/validate', async (c) => {
  try {
    const { address } = await c.req.json();
    
    if (!address) {
      return c.json({ error: 'Address is required' }, 400);
    }

    const isValid = walletService.validateWalletAddress(address);
    
    return c.json({
      address,
      isValid
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to validate address',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export { app as walletRoutes };

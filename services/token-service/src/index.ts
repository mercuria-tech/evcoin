import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { TokenService } from './services/TokenService';
import { WalletService } from './services/WalletService';
import { BlockchainGateway } from './services/BlockchainGateway';
import { tokenRoutes } from './routes/token';
import { walletRoutes } from './routes/wallet';
import { transactionRoutes } from './routes/transactions';

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

// Initialize services
const blockchainGateway = new BlockchainGateway();
const tokenService = new TokenService(blockchainGateway);
const walletService = new WalletService(blockchainGateway);

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'OK',
    service: 'token-service',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API routes
app.route('/api/token', tokenRoutes);
app.route('/api/wallet', walletRoutes);
app.route('/api/transactions', transactionRoutes);

// Token minting endpoint for charging sessions
app.post('/api/token/mint', async (c) => {
  try {
    const { userId, sessionId, energyKwh, sessionData } = await c.req.json();
    
    // Validate required fields
    if (!userId || !sessionId || !energyKwh) {
      return c.json({ error: 'Missing required fields: userId, sessionId, energyKwh' }, 400);
    }

    // Mint tokens based on energy consumed (1 kWh = 1 EVCH)
    const tokensToMint = Math.floor(energyKwh * 1000000); // Convert to smallest unit (6 decimals)
    
    const mintResult = await tokenService.mintTokens({
      userId,
      sessionId,
      amount: tokensToMint,
      energyKwh,
      sessionData
    });

    return c.json({
      success: true,
      transactionHash: mintResult.transactionHash,
      tokensMinted: energyKwh,
      userId,
      sessionId
    });

  } catch (error) {
    console.error('Token minting error:', error);
    return c.json({ 
      error: 'Failed to mint tokens',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Token burning endpoint for payments
app.post('/api/token/burn', async (c) => {
  try {
    const { userId, amount, reason, sessionId } = await c.req.json();
    
    if (!userId || !amount) {
      return c.json({ error: 'Missing required fields: userId, amount' }, 400);
    }

    const burnResult = await tokenService.burnTokens({
      userId,
      amount: Math.floor(amount * 1000000), // Convert to smallest unit
      reason,
      sessionId
    });

    return c.json({
      success: true,
      transactionHash: burnResult.transactionHash,
      tokensBurned: amount,
      userId
    });

  } catch (error) {
    console.error('Token burning error:', error);
    return c.json({ 
      error: 'Failed to burn tokens',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get user token balance
app.get('/api/wallet/balance/:userId', async (c) => {
  try {
    const userId = c.req.param('userId');
    
    if (!userId) {
      return c.json({ error: 'User ID is required' }, 400);
    }

    const balance = await walletService.getUserBalance(userId);
    
    return c.json({
      userId,
      balance: balance / 1000000, // Convert from smallest unit to EVCH
      balanceRaw: balance,
      currency: 'EVCH'
    });

  } catch (error) {
    console.error('Balance fetch error:', error);
    return c.json({ 
      error: 'Failed to fetch balance',
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

    const transferResult = await tokenService.transferTokens({
      fromUserId,
      toUserId,
      amount: Math.floor(amount * 1000000), // Convert to smallest unit
      reason
    });

    return c.json({
      success: true,
      transactionHash: transferResult.transactionHash,
      amount,
      fromUserId,
      toUserId
    });

  } catch (error) {
    console.error('Token transfer error:', error);
    return c.json({ 
      error: 'Failed to transfer tokens',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get token statistics
app.get('/api/token/stats', async (c) => {
  try {
    const stats = await tokenService.getTokenStats();
    
    return c.json({
      totalSupply: stats.totalSupply / 1000000,
      totalSupplyRaw: stats.totalSupply,
      circulatingSupply: stats.circulatingSupply / 1000000,
      circulatingSupplyRaw: stats.circulatingSupply,
      totalMinted: stats.totalMinted / 1000000,
      totalBurned: stats.totalBurned / 1000000,
      activeWallets: stats.activeWallets,
      currency: 'EVCH'
    });

  } catch (error) {
    console.error('Stats fetch error:', error);
    return c.json({ 
      error: 'Failed to fetch token statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default app;

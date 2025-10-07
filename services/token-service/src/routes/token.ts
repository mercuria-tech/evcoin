import { Hono } from 'hono';
import { TokenService } from '../services/TokenService';
import { BlockchainGateway } from '../services/BlockchainGateway';

const app = new Hono();
const blockchainGateway = new BlockchainGateway();
const tokenService = new TokenService(blockchainGateway);

// Get token information
app.get('/info', async (c) => {
  try {
    const mintAddress = await blockchainGateway.getMintAddress();
    const stats = await tokenService.getTokenStats();
    
    return c.json({
      name: 'EV Charge Token',
      symbol: 'EVCH',
      decimals: 6,
      mintAddress: mintAddress.toString(),
      totalSupply: stats.totalSupply,
      circulatingSupply: stats.circulatingSupply,
      network: 'Solana',
      standard: 'SPL Token'
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to get token info',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get token statistics
app.get('/stats', async (c) => {
  try {
    const stats = await tokenService.getTokenStats();
    
    return c.json({
      ...stats,
      currency: 'EVCH'
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to get token statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Mint tokens (for charging sessions)
app.post('/mint', async (c) => {
  try {
    const { userId, sessionId, energyKwh, sessionData } = await c.req.json();
    
    if (!userId || !sessionId || !energyKwh) {
      return c.json({ error: 'Missing required fields: userId, sessionId, energyKwh' }, 400);
    }

    const result = await tokenService.mintTokens({
      userId,
      sessionId,
      amount: Math.floor(energyKwh * 1000000), // Convert to smallest unit
      energyKwh,
      sessionData
    });

    return c.json({
      success: true,
      transactionHash: result.transactionHash,
      tokensMinted: energyKwh,
      userId,
      sessionId
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to mint tokens',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Burn tokens (for payments)
app.post('/burn', async (c) => {
  try {
    const { userId, amount, reason, sessionId } = await c.req.json();
    
    if (!userId || !amount) {
      return c.json({ error: 'Missing required fields: userId, amount' }, 400);
    }

    const result = await tokenService.burnTokens({
      userId,
      amount: Math.floor(amount * 1000000), // Convert to smallest unit
      reason,
      sessionId
    });

    return c.json({
      success: true,
      transactionHash: result.transactionHash,
      tokensBurned: amount,
      userId
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to burn tokens',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Transfer tokens
app.post('/transfer', async (c) => {
  try {
    const { fromUserId, toUserId, amount, reason } = await c.req.json();
    
    if (!fromUserId || !toUserId || !amount) {
      return c.json({ error: 'Missing required fields: fromUserId, toUserId, amount' }, 400);
    }

    const result = await tokenService.transferTokens({
      fromUserId,
      toUserId,
      amount: Math.floor(amount * 1000000), // Convert to smallest unit
      reason
    });

    return c.json({
      success: true,
      transactionHash: result.transactionHash,
      amount,
      fromUserId,
      toUserId
    });

  } catch (error) {
    return c.json({ 
      error: 'Failed to transfer tokens',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export { app as tokenRoutes };

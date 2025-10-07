import { PublicKey, Keypair } from '@solana/web3.js';
import { getAccount, getAssociatedTokenAddress, createAssociatedTokenAccount } from '@solana/spl-token';
import { BlockchainGateway } from './BlockchainGateway';

export interface UserWallet {
  userId: string;
  publicKey: string;
  tokenAccount: string;
  balance: number;
  createdAt: string;
  lastActivity: string;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'mint' | 'burn' | 'transfer_in' | 'transfer_out';
  amount: number;
  transactionHash: string;
  timestamp: string;
  description: string;
}

export class WalletService {
  private blockchainGateway: BlockchainGateway;
  private connection: any;

  constructor(blockchainGateway: BlockchainGateway) {
    this.blockchainGateway = blockchainGateway;
    this.connection = blockchainGateway.getConnection();
  }

  /**
   * Get user token balance
   */
  async getUserBalance(userId: string): Promise<number> {
    try {
      const tokenAccount = await this.getUserTokenAccount(userId);
      const balance = await this.blockchainGateway.getTokenAccountBalance(tokenAccount);
      return balance;

    } catch (error) {
      console.error('Error getting user balance:', error);
      return 0; // Return 0 if account doesn't exist
    }
  }

  /**
   * Get user wallet information
   */
  async getUserWallet(userId: string): Promise<UserWallet> {
    try {
      const userKeypair = this.deriveUserKeypair(userId);
      const tokenAccount = await this.getUserTokenAccount(userId);
      const balance = await this.getUserBalance(userId);

      return {
        userId,
        publicKey: userKeypair.publicKey.toString(),
        tokenAccount: tokenAccount.toString(),
        balance: balance / 1000000, // Convert to EVCH
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error getting user wallet:', error);
      throw new Error(`Failed to get user wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create user wallet
   */
  async createUserWallet(userId: string): Promise<UserWallet> {
    try {
      const userKeypair = this.deriveUserKeypair(userId);
      const mintAddress = await this.blockchainGateway.getMintAddress();
      
      // Create associated token account
      const tokenAccount = await createAssociatedTokenAccount(
        this.connection,
        this.blockchainGateway.getMintAuthority(),
        userKeypair.publicKey,
        mintAddress
      );

      console.log(`Created wallet for user ${userId}: ${tokenAccount.toString()}`);

      return {
        userId,
        publicKey: userKeypair.publicKey.toString(),
        tokenAccount: tokenAccount.toString(),
        balance: 0,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      };

    } catch (error) {
      console.error('Error creating user wallet:', error);
      throw new Error(`Failed to create user wallet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user token account address
   */
  async getUserTokenAccount(userId: string): Promise<PublicKey> {
    try {
      const userKeypair = this.deriveUserKeypair(userId);
      const mintAddress = await this.blockchainGateway.getMintAddress();
      
      // Get associated token account address
      const tokenAccount = await getAssociatedTokenAddress(
        mintAddress,
        userKeypair.publicKey
      );

      return tokenAccount;

    } catch (error) {
      console.error('Error getting user token account:', error);
      throw new Error(`Failed to get user token account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get wallet transaction history
   */
  async getWalletTransactions(userId: string, limit: number = 50): Promise<WalletTransaction[]> {
    try {
      // In a real implementation, this would query a database
      // For now, returning mock data
      const mockTransactions: WalletTransaction[] = [
        {
          id: 'txn_001',
          userId,
          type: 'mint',
          amount: 25.5,
          transactionHash: 'mock_hash_001',
          timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
          description: 'Charging session reward'
        },
        {
          id: 'txn_002',
          userId,
          type: 'burn',
          amount: 10.0,
          transactionHash: 'mock_hash_002',
          timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
          description: 'Payment for charging session'
        }
      ];

      return mockTransactions.slice(0, limit);

    } catch (error) {
      console.error('Error getting wallet transactions:', error);
      return [];
    }
  }

  /**
   * Get wallet statistics
   */
  async getWalletStats(): Promise<{
    totalWallets: number;
    activeWallets: number;
    totalBalance: number;
    averageBalance: number;
  }> {
    try {
      // In a real implementation, this would query a database
      return {
        totalWallets: 1250,
        activeWallets: 890,
        totalBalance: 1250000, // Total EVCH in circulation
        averageBalance: 1000 // Average EVCH per wallet
      };

    } catch (error) {
      console.error('Error getting wallet stats:', error);
      throw new Error(`Failed to get wallet statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validate wallet address
   */
  validateWalletAddress(address: string): boolean {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get wallet by public key
   */
  async getWalletByPublicKey(publicKey: string): Promise<UserWallet | null> {
    try {
      const pubKey = new PublicKey(publicKey);
      
      // In a real implementation, you would look up the user by public key
      // For now, this is a placeholder
      return null;

    } catch (error) {
      console.error('Error getting wallet by public key:', error);
      return null;
    }
  }

  /**
   * Derive user keypair from userId
   * In production, this would use a more secure method
   */
  private deriveUserKeypair(userId: string): Keypair {
    // This is a simplified approach - in production you'd use proper key derivation
    const seed = Buffer.from(userId.padEnd(32, '0').slice(0, 32));
    return Keypair.fromSeed(seed);
  }

  /**
   * Record wallet transaction
   */
  async recordTransaction(transaction: Omit<WalletTransaction, 'id' | 'timestamp'>): Promise<void> {
    try {
      // In a real implementation, this would save to a database
      console.log('Recording wallet transaction:', {
        ...transaction,
        id: `txn_${Date.now()}`,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error recording transaction:', error);
      // Don't throw here as this shouldn't fail the main operation
    }
  }

  /**
   * Get user's charging rewards
   */
  async getUserRewards(userId: string): Promise<{
    totalRewards: number;
    greenRewards: number;
    offPeakRewards: number;
    lastReward: string;
  }> {
    try {
      // In a real implementation, this would calculate from charging history
      return {
        totalRewards: 150.5,
        greenRewards: 75.2,
        offPeakRewards: 45.3,
        lastReward: new Date(Date.now() - 3600000).toISOString() // 1 hour ago
      };

    } catch (error) {
      console.error('Error getting user rewards:', error);
      throw new Error(`Failed to get user rewards: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

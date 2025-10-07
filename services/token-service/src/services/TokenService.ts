import { 
  Connection, 
  PublicKey, 
  Keypair, 
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js';
import {
  createMint,
  createAccount,
  mintTo,
  burn,
  transfer,
  getAccount,
  getMint,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { BlockchainGateway } from './BlockchainGateway';

export interface MintTokensParams {
  userId: string;
  sessionId: string;
  amount: number; // Amount in smallest unit (6 decimals)
  energyKwh: number;
  sessionData?: any;
}

export interface BurnTokensParams {
  userId: string;
  amount: number; // Amount in smallest unit (6 decimals)
  reason: string;
  sessionId?: string;
}

export interface TransferTokensParams {
  fromUserId: string;
  toUserId: string;
  amount: number; // Amount in smallest unit (6 decimals)
  reason: string;
}

export interface TokenStats {
  totalSupply: number;
  circulatingSupply: number;
  totalMinted: number;
  totalBurned: number;
  activeWallets: number;
}

export class TokenService {
  private connection: Connection;
  private mintAddress: PublicKey;
  private blockchainGateway: BlockchainGateway;

  constructor(blockchainGateway: BlockchainGateway) {
    this.blockchainGateway = blockchainGateway;
    this.connection = blockchainGateway.getConnection();
    
    // EVCH Token mint address (will be deployed to Solana)
    // For now, using a placeholder - in production this would be the actual deployed mint
    this.mintAddress = new PublicKey('EVCH1111111111111111111111111111111111111111');
  }

  /**
   * Mint EVCH tokens for energy consumption
   * 1 kWh = 1 EVCH token
   */
  async mintTokens(params: MintTokensParams): Promise<{ transactionHash: string }> {
    try {
      const { userId, sessionId, amount, energyKwh, sessionData } = params;

      // Get or create user token account
      const userTokenAccount = await this.getOrCreateUserTokenAccount(userId);

      // Create mint transaction
      const transaction = new Transaction();
      
      // Add mint instruction
      transaction.add(
        mintTo(
          this.connection,
          this.blockchainGateway.getMintAuthority(), // Mint authority keypair
          this.mintAddress,
          userTokenAccount,
          this.blockchainGateway.getMintAuthority().publicKey,
          amount
        )
      );

      // Record Proof of Charge event
      await this.recordProofOfCharge({
        userId,
        sessionId,
        energyKwh,
        tokensMinted: amount,
        sessionData
      });

      // Send transaction
      const signature = await this.connection.sendTransaction(transaction, [
        this.blockchainGateway.getMintAuthority()
      ]);

      // Wait for confirmation
      await this.connection.confirmTransaction(signature);

      console.log(`Minted ${amount / 1000000} EVCH tokens for user ${userId}, session ${sessionId}`);
      
      return { transactionHash: signature };

    } catch (error) {
      console.error('Error minting tokens:', error);
      throw new Error(`Failed to mint tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Burn EVCH tokens for payments or redemptions
   */
  async burnTokens(params: BurnTokensParams): Promise<{ transactionHash: string }> {
    try {
      const { userId, amount, reason, sessionId } = params;

      // Get user token account
      const userTokenAccount = await this.getUserTokenAccount(userId);

      // Create burn transaction
      const transaction = new Transaction();
      
      transaction.add(
        burn(
          this.connection,
          this.blockchainGateway.getMintAuthority(),
          userTokenAccount,
          this.mintAddress,
          this.blockchainGateway.getMintAuthority().publicKey,
          amount
        )
      );

      // Send transaction
      const signature = await this.connection.sendTransaction(transaction, [
        this.blockchainGateway.getMintAuthority()
      ]);

      // Wait for confirmation
      await this.connection.confirmTransaction(signature);

      console.log(`Burned ${amount / 1000000} EVCH tokens for user ${userId}, reason: ${reason}`);
      
      return { transactionHash: signature };

    } catch (error) {
      console.error('Error burning tokens:', error);
      throw new Error(`Failed to burn tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Transfer tokens between users
   */
  async transferTokens(params: TransferTokensParams): Promise<{ transactionHash: string }> {
    try {
      const { fromUserId, toUserId, amount, reason } = params;

      // Get token accounts
      const fromTokenAccount = await this.getUserTokenAccount(fromUserId);
      const toTokenAccount = await this.getOrCreateUserTokenAccount(toUserId);

      // Create transfer transaction
      const transaction = new Transaction();
      
      transaction.add(
        transfer(
          this.connection,
          this.blockchainGateway.getMintAuthority(),
          fromTokenAccount,
          toTokenAccount,
          this.blockchainGateway.getMintAuthority().publicKey,
          amount
        )
      );

      // Send transaction
      const signature = await this.connection.sendTransaction(transaction, [
        this.blockchainGateway.getMintAuthority()
      ]);

      // Wait for confirmation
      await this.connection.confirmTransaction(signature);

      console.log(`Transferred ${amount / 1000000} EVCH tokens from ${fromUserId} to ${toUserId}`);
      
      return { transactionHash: signature };

    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw new Error(`Failed to transfer tokens: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get token statistics
   */
  async getTokenStats(): Promise<TokenStats> {
    try {
      const mintInfo = await getMint(this.connection, this.mintAddress);
      
      // In a real implementation, you would track these metrics in a database
      // For now, returning mock data
      return {
        totalSupply: mintInfo.supply.toNumber(),
        circulatingSupply: mintInfo.supply.toNumber(),
        totalMinted: mintInfo.supply.toNumber(),
        totalBurned: 0,
        activeWallets: 0 // Would be calculated from database
      };

    } catch (error) {
      console.error('Error fetching token stats:', error);
      throw new Error(`Failed to fetch token statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get or create user token account
   */
  private async getOrCreateUserTokenAccount(userId: string): Promise<PublicKey> {
    try {
      // In production, you would derive the token account address from userId
      // For now, using a simple approach
      const userKeypair = this.deriveUserKeypair(userId);
      
      try {
        // Try to get existing account
        const account = await getAccount(this.connection, userKeypair.publicKey);
        return account.address;
      } catch {
        // Account doesn't exist, create it
        const tokenAccount = await createAccount(
          this.connection,
          this.blockchainGateway.getMintAuthority(),
          this.mintAddress,
          userKeypair.publicKey
        );
        
        return tokenAccount;
      }

    } catch (error) {
      console.error('Error getting/creating user token account:', error);
      throw new Error(`Failed to get/create user token account: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get user token account
   */
  private async getUserTokenAccount(userId: string): Promise<PublicKey> {
    try {
      const userKeypair = this.deriveUserKeypair(userId);
      const account = await getAccount(this.connection, userKeypair.publicKey);
      return account.address;

    } catch (error) {
      throw new Error(`User token account not found for ${userId}`);
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
   * Record Proof of Charge event on-chain
   */
  private async recordProofOfCharge(data: {
    userId: string;
    sessionId: string;
    energyKwh: number;
    tokensMinted: number;
    sessionData?: any;
  }): Promise<void> {
    try {
      // In a real implementation, this would write to a smart contract
      // For now, we'll log the event
      console.log('Proof of Charge Event:', {
        timestamp: new Date().toISOString(),
        ...data,
        eventType: 'PROOF_OF_CHARGE'
      });

      // TODO: Implement actual on-chain event recording
      // This would involve calling a smart contract method that records the charging event

    } catch (error) {
      console.error('Error recording Proof of Charge:', error);
      // Don't throw here as this shouldn't fail the main transaction
    }
  }
}

import { 
  Connection, 
  PublicKey, 
  Keypair,
  clusterApiUrl,
  Commitment
} from '@solana/web3.js';
import { createMint, TOKEN_PROGRAM_ID } from '@solana/spl-token';

export class BlockchainGateway {
  private connection: Connection;
  private mintAuthority: Keypair;
  private mintAddress: PublicKey | null = null;

  constructor() {
    // Initialize Solana connection
    // In production, use mainnet-beta
    const network = process.env.SOLANA_NETWORK || 'devnet';
    const rpcUrl = process.env.SOLANA_RPC_URL || clusterApiUrl(network);
    
    this.connection = new Connection(rpcUrl, {
      commitment: 'confirmed' as Commitment,
      wsEndpoint: rpcUrl.replace('https://', 'wss://')
    });

    // Initialize mint authority
    // In production, this would be loaded from secure storage
    this.mintAuthority = this.loadMintAuthority();
  }

  /**
   * Get Solana connection
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get mint authority keypair
   */
  getMintAuthority(): Keypair {
    return this.mintAuthority;
  }

  /**
   * Get EVCH token mint address
   */
  async getMintAddress(): Promise<PublicKey> {
    if (!this.mintAddress) {
      // In production, this would be the deployed mint address
      // For now, we'll create a new mint for testing
      this.mintAddress = await this.createEVCHMint();
    }
    return this.mintAddress;
  }

  /**
   * Create EVCH token mint
   */
  private async createEVCHMint(): Promise<PublicKey> {
    try {
      console.log('Creating EVCH token mint...');
      
      const mint = await createMint(
        this.connection,
        this.mintAuthority,
        this.mintAuthority.publicKey,
        null, // Freeze authority (null = no freeze)
        6 // Decimals (same as USDC)
      );

      console.log(`EVCH token mint created: ${mint.toString()}`);
      return mint;

    } catch (error) {
      console.error('Error creating EVCH mint:', error);
      throw new Error(`Failed to create EVCH mint: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load mint authority from environment or generate new one
   */
  private loadMintAuthority(): Keypair {
    try {
      // In production, load from secure environment variable
      const privateKey = process.env.MINT_AUTHORITY_PRIVATE_KEY;
      
      if (privateKey) {
        const keyArray = JSON.parse(privateKey);
        return Keypair.fromSecretKey(new Uint8Array(keyArray));
      } else {
        // For development, generate a new keypair
        console.warn('No mint authority private key found, generating new keypair for development');
        return Keypair.generate();
      }

    } catch (error) {
      console.error('Error loading mint authority:', error);
      throw new Error('Failed to load mint authority keypair');
    }
  }

  /**
   * Get account balance
   */
  async getAccountBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance;

    } catch (error) {
      console.error('Error getting account balance:', error);
      throw new Error(`Failed to get account balance: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get token account balance
   */
  async getTokenAccountBalance(tokenAccount: PublicKey): Promise<number> {
    try {
      const accountInfo = await this.connection.getTokenAccountBalance(tokenAccount);
      return accountInfo.value.amount ? parseInt(accountInfo.value.amount) : 0;

    } catch (error) {
      console.error('Error getting token account balance:', error);
      return 0; // Return 0 if account doesn't exist
    }
  }

  /**
   * Check if account exists
   */
  async accountExists(publicKey: PublicKey): Promise<boolean> {
    try {
      const accountInfo = await this.connection.getAccountInfo(publicKey);
      return accountInfo !== null;

    } catch (error) {
      return false;
    }
  }

  /**
   * Get recent blockhash
   */
  async getRecentBlockhash(): Promise<string> {
    try {
      const { blockhash } = await this.connection.getLatestBlockhash();
      return blockhash;

    } catch (error) {
      console.error('Error getting recent blockhash:', error);
      throw new Error(`Failed to get recent blockhash: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Wait for transaction confirmation
   */
  async waitForConfirmation(signature: string, commitment: Commitment = 'confirmed'): Promise<void> {
    try {
      await this.connection.confirmTransaction(signature, commitment);

    } catch (error) {
      console.error('Error waiting for confirmation:', error);
      throw new Error(`Failed to confirm transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(signature: string): Promise<any> {
    try {
      const transaction = await this.connection.getTransaction(signature);
      return transaction;

    } catch (error) {
      console.error('Error getting transaction:', error);
      throw new Error(`Failed to get transaction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get network info
   */
  async getNetworkInfo(): Promise<{
    network: string;
    rpcUrl: string;
    commitment: string;
    version: string;
  }> {
    try {
      const version = await this.connection.getVersion();
      
      return {
        network: process.env.SOLANA_NETWORK || 'devnet',
        rpcUrl: this.connection.rpcEndpoint,
        commitment: 'confirmed',
        version: version['solana-core']
      };

    } catch (error) {
      console.error('Error getting network info:', error);
      throw new Error(`Failed to get network info: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

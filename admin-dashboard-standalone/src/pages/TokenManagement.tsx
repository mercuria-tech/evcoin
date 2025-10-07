import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Coins, 
  TrendingUp,
  Users,
  Wallet,
  Send,
  RefreshCw,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react';

interface TokenStats {
  totalSupply: number;
  circulatingSupply: number;
  totalMinted: number;
  totalBurned: number;
  activeWallets: number;
  currency: string;
}

interface WalletStats {
  totalWallets: number;
  activeWallets: number;
  totalBalance: number;
  averageBalance: number;
}

interface WalletTransaction {
  id: string;
  userId: string;
  type: 'mint' | 'burn' | 'transfer_in' | 'transfer_out';
  amount: number;
  transactionHash: string;
  timestamp: string;
  description: string;
}

const TokenManagementPage: React.FC = () => {
  const [tokenStats, setTokenStats] = useState<TokenStats | null>(null);
  const [walletStats, setWalletStats] = useState<WalletStats | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Token operations state
  const [mintForm, setMintForm] = useState({
    userId: '',
    sessionId: '',
    energyKwh: '',
    sessionData: ''
  });
  
  const [burnForm, setBurnForm] = useState({
    userId: '',
    amount: '',
    reason: '',
    sessionId: ''
  });
  
  const [transferForm, setTransferForm] = useState({
    fromUserId: '',
    toUserId: '',
    amount: '',
    reason: ''
  });

  const [operationLoading, setOperationLoading] = useState(false);
  const [operationSuccess, setOperationSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchTokenData();
  }, []);

  const fetchTokenData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [tokenStatsRes, walletStatsRes] = await Promise.all([
        fetch('https://ev-charging-token-service.mks-alghafil.workers.dev/api/token/stats'),
        fetch('https://ev-charging-token-service.mks-alghafil.workers.dev/api/wallet/stats')
      ]);

      if (!tokenStatsRes.ok || !walletStatsRes.ok) {
        throw new Error('Failed to fetch token data');
      }

      const [tokenStatsData, walletStatsData] = await Promise.all([
        tokenStatsRes.json(),
        walletStatsRes.json()
      ]);

      setTokenStats(tokenStatsData);
      setWalletStats(walletStatsData);

      // Mock recent transactions for now
      setRecentTransactions([
        {
          id: 'txn_001',
          userId: 'user_001',
          type: 'mint',
          amount: 25.5,
          transactionHash: 'mock_hash_001',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          description: 'Charging session reward'
        },
        {
          id: 'txn_002',
          userId: 'user_002',
          type: 'burn',
          amount: 10.0,
          transactionHash: 'mock_hash_002',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          description: 'Payment for charging session'
        },
        {
          id: 'txn_003',
          userId: 'user_003',
          type: 'transfer_in',
          amount: 50.0,
          transactionHash: 'mock_hash_003',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          description: 'Transfer from friend'
        }
      ]);

    } catch (err) {
      console.error('Error fetching token data:', err);
      setError(`Failed to load token data: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleMintTokens = async () => {
    try {
      setOperationLoading(true);
      setOperationSuccess(null);

      const response = await fetch('https://ev-charging-token-service.mks-alghafil.workers.dev/api/token/mint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: mintForm.userId,
          sessionId: mintForm.sessionId,
          energyKwh: parseFloat(mintForm.energyKwh),
          sessionData: mintForm.sessionData ? JSON.parse(mintForm.sessionData) : undefined
        })
      });

      if (!response.ok) {
        throw new Error('Failed to mint tokens');
      }

      const result = await response.json();
      setOperationSuccess(`Successfully minted ${result.tokensMinted} EVCH tokens for user ${result.userId}`);
      
      // Reset form
      setMintForm({ userId: '', sessionId: '', energyKwh: '', sessionData: '' });
      
      // Refresh data
      await fetchTokenData();

    } catch (err) {
      console.error('Error minting tokens:', err);
      setError(`Failed to mint tokens: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleBurnTokens = async () => {
    try {
      setOperationLoading(true);
      setOperationSuccess(null);

      const response = await fetch('https://ev-charging-token-service.mks-alghafil.workers.dev/api/token/burn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: burnForm.userId,
          amount: parseFloat(burnForm.amount),
          reason: burnForm.reason,
          sessionId: burnForm.sessionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to burn tokens');
      }

      const result = await response.json();
      setOperationSuccess(`Successfully burned ${result.tokensBurned} EVCH tokens for user ${result.userId}`);
      
      // Reset form
      setBurnForm({ userId: '', amount: '', reason: '', sessionId: '' });
      
      // Refresh data
      await fetchTokenData();

    } catch (err) {
      console.error('Error burning tokens:', err);
      setError(`Failed to burn tokens: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setOperationLoading(false);
    }
  };

  const handleTransferTokens = async () => {
    try {
      setOperationLoading(true);
      setOperationSuccess(null);

      const response = await fetch('https://ev-charging-token-service.mks-alghafil.workers.dev/api/token/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromUserId: transferForm.fromUserId,
          toUserId: transferForm.toUserId,
          amount: parseFloat(transferForm.amount),
          reason: transferForm.reason
        })
      });

      if (!response.ok) {
        throw new Error('Failed to transfer tokens');
      }

      const result = await response.json();
      setOperationSuccess(`Successfully transferred ${result.amount} EVCH tokens from ${result.fromUserId} to ${result.toUserId}`);
      
      // Reset form
      setTransferForm({ fromUserId: '', toUserId: '', amount: '', reason: '' });
      
      // Refresh data
      await fetchTokenData();

    } catch (err) {
      console.error('Error transferring tokens:', err);
      setError(`Failed to transfer tokens: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setOperationLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'mint':
        return <Plus className="h-4 w-4 text-green-500" />;
      case 'burn':
        return <Minus className="h-4 w-4 text-red-500" />;
      case 'transfer_in':
        return <ArrowDownRight className="h-4 w-4 text-blue-500" />;
      case 'transfer_out':
        return <ArrowUpRight className="h-4 w-4 text-orange-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'mint':
        return 'bg-green-100 text-green-800';
      case 'burn':
        return 'bg-red-100 text-red-800';
      case 'transfer_in':
        return 'bg-blue-100 text-blue-800';
      case 'transfer_out':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading token data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center">
            <Coins className="mr-3 h-8 w-8 text-primary" />
            Token Management
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage EVCH tokens, minting, burning, and transfers
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={fetchTokenData}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {operationSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-green-800">{operationSuccess}</p>
            </div>
          </div>
        </div>
      )}

      {/* Token Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Supply</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tokenStats ? (tokenStats.totalSupply / 1000000).toLocaleString() : '0'} EVCH
            </div>
            <p className="text-xs text-muted-foreground">
              {tokenStats ? (tokenStats.totalSupply / 1000000000).toFixed(2) : '0'}B total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Circulating Supply</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tokenStats ? (tokenStats.circulatingSupply / 1000000).toLocaleString() : '0'} EVCH
            </div>
            <p className="text-xs text-muted-foreground">
              {tokenStats ? ((tokenStats.circulatingSupply / tokenStats.totalSupply) * 100).toFixed(1) : '0'}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {walletStats ? walletStats.activeWallets.toLocaleString() : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {walletStats ? walletStats.totalWallets.toLocaleString() : '0'} total wallets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {walletStats ? walletStats.averageBalance.toLocaleString() : '0'} EVCH
            </div>
            <p className="text-xs text-muted-foreground">
              Per active wallet
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Token Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mint Tokens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Plus className="mr-2 h-5 w-5 text-green-500" />
              Mint Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mint-user-id">User ID</Label>
              <Input
                id="mint-user-id"
                value={mintForm.userId}
                onChange={(e) => setMintForm({ ...mintForm, userId: e.target.value })}
                placeholder="user_123"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mint-session-id">Session ID</Label>
              <Input
                id="mint-session-id"
                value={mintForm.sessionId}
                onChange={(e) => setMintForm({ ...mintForm, sessionId: e.target.value })}
                placeholder="session_456"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="mint-energy">Energy (kWh)</Label>
              <Input
                id="mint-energy"
                type="number"
                step="0.1"
                value={mintForm.energyKwh}
                onChange={(e) => setMintForm({ ...mintForm, energyKwh: e.target.value })}
                placeholder="25.5"
              />
            </div>
            
            <Button 
              onClick={handleMintTokens} 
              disabled={operationLoading || !mintForm.userId || !mintForm.sessionId || !mintForm.energyKwh}
              className="w-full"
            >
              {operationLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Mint Tokens
            </Button>
          </CardContent>
        </Card>

        {/* Burn Tokens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Minus className="mr-2 h-5 w-5 text-red-500" />
              Burn Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="burn-user-id">User ID</Label>
              <Input
                id="burn-user-id"
                value={burnForm.userId}
                onChange={(e) => setBurnForm({ ...burnForm, userId: e.target.value })}
                placeholder="user_123"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="burn-amount">Amount (EVCH)</Label>
              <Input
                id="burn-amount"
                type="number"
                step="0.1"
                value={burnForm.amount}
                onChange={(e) => setBurnForm({ ...burnForm, amount: e.target.value })}
                placeholder="10.0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="burn-reason">Reason</Label>
              <Input
                id="burn-reason"
                value={burnForm.reason}
                onChange={(e) => setBurnForm({ ...burnForm, reason: e.target.value })}
                placeholder="Payment for charging session"
              />
            </div>
            
            <Button 
              onClick={handleBurnTokens} 
              disabled={operationLoading || !burnForm.userId || !burnForm.amount || !burnForm.reason}
              variant="destructive"
              className="w-full"
            >
              {operationLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Minus className="mr-2 h-4 w-4" />
              )}
              Burn Tokens
            </Button>
          </CardContent>
        </Card>

        {/* Transfer Tokens */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Send className="mr-2 h-5 w-5 text-blue-500" />
              Transfer Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="transfer-from">From User ID</Label>
              <Input
                id="transfer-from"
                value={transferForm.fromUserId}
                onChange={(e) => setTransferForm({ ...transferForm, fromUserId: e.target.value })}
                placeholder="user_123"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transfer-to">To User ID</Label>
              <Input
                id="transfer-to"
                value={transferForm.toUserId}
                onChange={(e) => setTransferForm({ ...transferForm, toUserId: e.target.value })}
                placeholder="user_456"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transfer-amount">Amount (EVCH)</Label>
              <Input
                id="transfer-amount"
                type="number"
                step="0.1"
                value={transferForm.amount}
                onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                placeholder="50.0"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="transfer-reason">Reason</Label>
              <Input
                id="transfer-reason"
                value={transferForm.reason}
                onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                placeholder="Transfer between users"
              />
            </div>
            
            <Button 
              onClick={handleTransferTokens} 
              disabled={operationLoading || !transferForm.fromUserId || !transferForm.toUserId || !transferForm.amount || !transferForm.reason}
              variant="outline"
              className="w-full"
            >
              {operationLoading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Transfer Tokens
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Activity className="mr-2 h-5 w-5" />
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  {getTransactionIcon(transaction.type)}
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      User: {transaction.userId} • {new Date(transaction.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getTransactionColor(transaction.type)}>
                    {transaction.type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <div className="text-right">
                    <p className="font-medium">
                      {transaction.type === 'burn' || transaction.type === 'transfer_out' ? '-' : '+'}
                      {transaction.amount} EVCH
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.transactionHash.slice(0, 8)}...
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TokenManagementPage;

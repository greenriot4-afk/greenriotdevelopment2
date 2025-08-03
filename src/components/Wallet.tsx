import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Wallet as WalletIcon, Plus, Minus, DollarSign, History } from "lucide-react";

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: string;
  description: string;
  created_at: string;
  stripe_payment_intent_id?: string;
  stripe_session_id?: string;
  updated_at: string;
  user_id: string;
  wallet_id: string;
}

interface WalletData {
  id: string;
  balance: number;
  user_id: string;
}

export default function Wallet() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);

  const fetchWallet = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setWallet(data);
      } else {
        // Create wallet if it doesn't exist
        const { data: newWallet, error: createError } = await supabase
          .from('wallets')
          .insert({ user_id: user.id, balance: 0.00 })
          .select()
          .single();

        if (createError) throw createError;
        setWallet(newWallet);
      }
    } catch (error) {
      console.error('Error fetching wallet:', error);
      toast.error('Failed to load wallet');
    }
  };

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setTransactions((data || []) as Transaction[]);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) < 10) {
      toast.error('Minimum deposit amount is $10');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-deposit-session', {
        body: { amount: parseFloat(depositAmount) }
      });

      if (error) throw error;

      // Open Stripe checkout in a new tab
      window.open(data.url, '_blank');
      
      setDepositAmount("");
      toast.success('Redirecting to payment...');
    } catch (error) {
      console.error('Error creating deposit session:', error);
      toast.error(error.message || 'Failed to create deposit session');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) < 10) {
      toast.error('Minimum withdrawal amount is $10');
      return;
    }

    if (!wallet || wallet.balance < parseFloat(withdrawAmount)) {
      toast.error('Insufficient balance');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-withdrawal', {
        body: { amount: parseFloat(withdrawAmount) }
      });

      if (error) throw error;

      toast.success(`Successfully withdrew $${withdrawAmount}`);
      setWithdrawAmount("");
      
      // Refresh wallet and transactions
      await fetchWallet();
      await fetchTransactions();
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast.error(error.message || 'Failed to process withdrawal');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const syncStripeStatus = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.functions.invoke('sync-stripe-status');
      
      if (error) {
        toast.error('Error syncing with Stripe: ' + error.message);
        return;
      }
      
      toast.success(`Synced ${data.updated} out of ${data.total} transactions with Stripe`);
      await fetchWallet();
      await fetchTransactions();
    } catch (error) {
      console.error('Error syncing Stripe status:', error);
      toast.error('Failed to sync with Stripe');
    } finally {
      setLoading(false);
    }
  };

  const checkLastStripeSession = async () => {
    try {
      setLoading(true);
      
      // Get the most recent transaction with stripe_session_id
      const latestTransaction = transactions.find(t => 
        t.type === 'deposit' && 
        t.stripe_session_id && 
        t.status === 'pending'
      );
      
      if (!latestTransaction) {
        toast.error('No recent transaction with Stripe session found');
        return;
      }
      
      const { data, error } = await supabase.functions.invoke('check-stripe-session', {
        body: { session_id: latestTransaction.stripe_session_id }
      });
      
      if (error) {
        toast.error('Error checking Stripe: ' + error.message);
        return;
      }
      
      console.log('Stripe session details:', data);
      toast.success(`Session status: ${data.status}, Payment: ${data.payment_status}`);
    } catch (error) {
      console.error('Error checking Stripe session:', error);
      toast.error('Failed to check Stripe session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Wallet Balance Card */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <WalletIcon className="h-8 w-8 text-primary" />
            <CardTitle className="text-2xl">My Wallet</CardTitle>
          </div>
          <CardDescription>Manage your wallet balance</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-4xl font-bold text-primary mb-2">
            {wallet ? formatCurrency(wallet.balance) : '$0.00'}
          </div>
          <p className="text-muted-foreground">Available Balance</p>
          <div className="flex gap-2 justify-center mt-3">
            <Button 
              onClick={syncStripeStatus} 
              disabled={loading} 
              variant="outline" 
              size="sm"
            >
              {loading ? 'Syncing...' : 'Sync with Stripe'}
            </Button>
            <Button 
              onClick={checkLastStripeSession} 
              disabled={loading} 
              variant="outline" 
              size="sm"
            >
              Check Session
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Deposit and Withdraw Tabs */}
      <Tabs defaultValue="deposit" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="deposit" className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Deposit</span>
          </TabsTrigger>
          <TabsTrigger value="withdraw" className="flex items-center space-x-2">
            <Minus className="h-4 w-4" />
            <span>Withdraw</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center space-x-2">
            <History className="h-4 w-4" />
            <span>History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deposit">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Deposit Money</span>
              </CardTitle>
              <CardDescription>
                Add money to your wallet using Stripe. Minimum deposit is $10.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="depositAmount">Amount (USD)</Label>
                <Input
                  id="depositAmount"
                  type="number"
                  placeholder="10.00"
                  min="10"
                  step="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>
              <Button 
                onClick={handleDeposit}
                disabled={loading || !depositAmount || parseFloat(depositAmount) < 10}
                className="w-full"
              >
                {loading ? 'Processing...' : `Deposit ${depositAmount ? formatCurrency(parseFloat(depositAmount)) : '$0.00'}`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Minus className="h-5 w-5" />
                <span>Withdraw Money</span>
              </CardTitle>
              <CardDescription>
                Withdraw money from your wallet. Minimum withdrawal is $10.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="withdrawAmount">Amount (USD)</Label>
                <Input
                  id="withdrawAmount"
                  type="number"
                  placeholder="10.00"
                  min="10"
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Available balance: {wallet ? formatCurrency(wallet.balance) : '$0.00'}
              </p>
              <Button 
                onClick={handleWithdraw}
                disabled={loading || !withdrawAmount || parseFloat(withdrawAmount) < 10 || (wallet && wallet.balance < parseFloat(withdrawAmount))}
                className="w-full"
                variant="secondary"
              >
                {loading ? 'Processing...' : `Withdraw ${withdrawAmount ? formatCurrency(parseFloat(withdrawAmount)) : '$0.00'}`}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <History className="h-5 w-5" />
                <span>Transaction History</span>
              </CardTitle>
              <CardDescription>
                View your recent transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="text-center py-4">Loading transactions...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No transactions yet
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div 
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          transaction.type === 'deposit' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>
                          {transaction.type === 'deposit' ? <Plus className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{transaction.type}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(transaction.created_at)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        <p className={`text-sm capitalize ${
                          transaction.status === 'completed' ? 'text-green-600' : 
                          transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {transaction.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
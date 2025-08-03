import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Wallet as WalletIcon, Plus, Minus, DollarSign, History, MapPin, Filter, CreditCard, ExternalLink, AlertCircle } from "lucide-react";

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'debit' | 'credit';
  amount: number;
  status: string;
  description: string;
  created_at: string;
  stripe_payment_intent_id?: string;
  stripe_session_id?: string;
  updated_at: string;
  user_id: string;
  wallet_id: string;
  object_type?: string;
}

interface WalletData {
  id: string;
  balance: number;
  user_id: string;
}

interface AccountStatus {
  account_status: string;
  can_withdraw: boolean;
  status_message: string;
  onboarding_url?: string;
  dashboard_url?: string;
  needs_onboarding: boolean;
  requirements: string[];
}

export default function Wallet() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionFilter, setTransactionFilter] = useState<'all' | 'coordinates' | 'wallet'>('all');
  const [accountStatus, setAccountStatus] = useState<AccountStatus | null>(null);
  const [checkingAccount, setCheckingAccount] = useState(false);

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
    checkAccountStatus();
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
        .limit(50); // Increased limit to show more transactions

      if (error) throw error;
      const allTxns = (data || []) as Transaction[];
      setAllTransactions(allTxns);
      setTransactions(allTxns);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
    } finally {
      setTransactionsLoading(false);
    }
  };

  // Filter transactions based on selected filter
  useEffect(() => {
    if (transactionFilter === 'all') {
      setTransactions(allTransactions);
    } else if (transactionFilter === 'coordinates') {
      setTransactions(allTransactions.filter(t => 
        t.object_type === 'coordinate' || 
        t.object_type === 'coordinate_sale' ||
        t.description?.toLowerCase().includes('coordenadas')
      ));
    } else if (transactionFilter === 'wallet') {
      setTransactions(allTransactions.filter(t => 
        t.type === 'deposit' || t.type === 'withdrawal'
      ));
    }
  }, [transactionFilter, allTransactions]);

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
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(Math.abs(amount));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (transaction: Transaction) => {
    if (transaction.object_type === 'coordinate_sale') return <MapPin className="h-4 w-4" />;
    if (transaction.object_type === 'coordinate') return <MapPin className="h-4 w-4" />;
    if (transaction.type === 'deposit') return <Plus className="h-4 w-4" />;
    if (transaction.type === 'withdrawal') return <Minus className="h-4 w-4" />;
    if (transaction.type === 'credit') return <Plus className="h-4 w-4" />;
    if (transaction.type === 'debit') return <Minus className="h-4 w-4" />;
    return <CreditCard className="h-4 w-4" />;
  };

  const getTransactionColor = (transaction: Transaction) => {
    if (transaction.object_type === 'coordinate_sale') return 'bg-blue-100 text-blue-600';
    if (transaction.object_type === 'coordinate') return 'bg-orange-100 text-orange-600';
    if (transaction.type === 'deposit' || transaction.type === 'credit') return 'bg-green-100 text-green-600';
    return 'bg-red-100 text-red-600';
  };

  const getTransactionType = (transaction: Transaction) => {
    if (transaction.object_type === 'coordinate_sale') return 'Venta de Coordenadas';
    if (transaction.object_type === 'coordinate') return 'Compra de Coordenadas';
    if (transaction.type === 'deposit') return 'Depósito';
    if (transaction.type === 'withdrawal') return 'Retiro';
    if (transaction.type === 'credit') return 'Ingreso';
    if (transaction.type === 'debit') return 'Gasto';
    return transaction.type;
  };

  const coordinateTransactions = allTransactions.filter(t => 
    t.object_type === 'coordinate' || 
    t.object_type === 'coordinate_sale' ||
    t.description?.toLowerCase().includes('coordenadas')
  );

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

  const checkAccountStatus = async () => {
    try {
      setCheckingAccount(true);
      const { data, error } = await supabase.functions.invoke('check-account-status');
      
      if (error) {
        console.error('Error checking account status:', error);
        return;
      }
      
      setAccountStatus(data);
    } catch (error) {
      console.error('Error checking account status:', error);
    } finally {
      setCheckingAccount(false);
    }
  };

  const createExpressAccount = async () => {
    try {
      setLoading(true);
      console.log('Calling create-express-account function...');
      
      const { data, error } = await supabase.functions.invoke('create-express-account');
      
      console.log('Function response:', { data, error });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      if (data.needs_onboarding && data.onboarding_url) {
        // Open onboarding in new tab
        window.open(data.onboarding_url, '_blank');
        toast.success('Redirecting to account setup...');
      } else {
        toast.success('Account is already set up!');
      }
      
      // Refresh account status
      await checkAccountStatus();
    } catch (error) {
      console.error('Error creating Express account:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleRealWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) < 10) {
      toast.error('Minimum withdrawal amount is $10');
      return;
    }

    if (!wallet || wallet.balance < parseFloat(withdrawAmount)) {
      toast.error('Insufficient balance');
      return;
    }

    if (!accountStatus?.can_withdraw) {
      toast.error('Please complete your account setup to withdraw funds');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-real-withdrawal', {
        body: { amount: parseFloat(withdrawAmount) }
      });

      if (error) throw error;

      toast.success(data.message || `Successfully withdrew ${formatCurrency(parseFloat(withdrawAmount))}`);
      setWithdrawAmount("");
      
      // Refresh wallet and transactions
      await fetchWallet();
      await fetchTransactions();
    } catch (error) {
      console.error('Error processing real withdrawal:', error);
      toast.error(error.message || 'Failed to process withdrawal');
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
                Withdraw money to your bank account. Minimum withdrawal is $10.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Account Status Section */}
              {checkingAccount ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Checking account status...</p>
                </div>
              ) : !accountStatus ? (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">Unable to check account status</p>
                </div>
              ) : accountStatus.account_status === 'not_connected' ? (
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Setup Required</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          To withdraw funds, you need to set up your payout account with Stripe.
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={createExpressAccount}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? 'Setting up...' : 'Set Up Payout Account'}
                  </Button>
                </div>
              ) : accountStatus.account_status !== 'active' ? (
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                      <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-orange-800">Account Verification Required</h4>
                        <p className="text-sm text-orange-700 mt-1">
                          {accountStatus.status_message}
                        </p>
                        {accountStatus.requirements.length > 0 && (
                          <ul className="text-xs text-orange-600 mt-2 list-disc list-inside">
                            {accountStatus.requirements.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {accountStatus.onboarding_url && (
                      <Button 
                        onClick={() => window.open(accountStatus.onboarding_url, '_blank')}
                        disabled={loading}
                        className="flex-1"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Complete Setup
                      </Button>
                    )}
                    {accountStatus.dashboard_url && (
                      <Button 
                        onClick={() => window.open(accountStatus.dashboard_url, '_blank')}
                        variant="outline"
                        disabled={loading}
                        className="flex-1"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Stripe Dashboard
                      </Button>
                    )}
                  </div>
                  <Button 
                    onClick={checkAccountStatus}
                    variant="outline"
                    disabled={checkingAccount}
                    className="w-full"
                  >
                    {checkingAccount ? 'Checking...' : 'Refresh Status'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Account Active - Show withdrawal form */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                      <p className="text-sm text-green-700 font-medium">
                        Your payout account is active and ready for withdrawals
                      </p>
                    </div>
                  </div>
                  
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
                    onClick={handleRealWithdraw}
                    disabled={loading || !withdrawAmount || parseFloat(withdrawAmount) < 10 || (wallet && wallet.balance < parseFloat(withdrawAmount))}
                    className="w-full"
                  >
                    {loading ? 'Processing...' : `Withdraw ${withdrawAmount ? formatCurrency(parseFloat(withdrawAmount)) : '$0.00'}`}
                  </Button>
                  
                  <div className="flex gap-2 mt-4">
                    {accountStatus.dashboard_url && (
                      <Button 
                        onClick={() => window.open(accountStatus.dashboard_url, '_blank')}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Manage Account
                      </Button>
                    )}
                    <Button 
                      onClick={checkAccountStatus}
                      variant="outline"
                      size="sm"
                      disabled={checkingAccount}
                      className="flex-1"
                    >
                      {checkingAccount ? 'Checking...' : 'Refresh Status'}
                    </Button>
                  </div>
                  
                  <div className="text-xs text-muted-foreground mt-4 p-3 bg-muted/50 rounded">
                    <p>• Withdrawals typically arrive within 2-7 business days</p>
                    <p>• Processing fees may apply as per Stripe's standard rates</p>
                    <p>• You'll receive email confirmations for all transfers</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>Historial de Transacciones</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4" />
                  <select 
                    value={transactionFilter} 
                    onChange={(e) => setTransactionFilter(e.target.value as any)}
                    className="text-sm border rounded px-2 py-1"
                  >
                    <option value="all">Todas</option>
                    <option value="coordinates">Coordenadas</option>
                    <option value="wallet">Wallet</option>
                  </select>
                </div>
              </CardTitle>
              <CardDescription>
                {transactionFilter === 'coordinates' 
                  ? `Ventas y compras de coordenadas (${coordinateTransactions.length} transacciones)`
                  : transactionFilter === 'wallet'
                  ? 'Depósitos y retiros de wallet'
                  : 'Todas las transacciones de tu cuenta'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Summary Cards para Coordenadas */}
              {transactionFilter === 'coordinates' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card className="bg-blue-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Ventas de Coordenadas</p>
                          <p className="text-lg font-semibold text-blue-600">
                            {formatCurrency(coordinateTransactions
                              .filter(t => t.object_type === 'coordinate_sale')
                              .reduce((sum, t) => sum + Math.abs(t.amount), 0))}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-orange-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Compras de Coordenadas</p>
                          <p className="text-lg font-semibold text-orange-600">
                            {formatCurrency(coordinateTransactions
                              .filter(t => t.object_type === 'coordinate')
                              .reduce((sum, t) => sum + Math.abs(t.amount), 0))}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50">
                    <CardContent className="p-4">
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-sm text-muted-foreground">Balance Neto</p>
                          <p className="text-lg font-semibold text-green-600">
                            {formatCurrency(coordinateTransactions.reduce((sum, t) => {
                              if (t.object_type === 'coordinate_sale') return sum + Math.abs(t.amount);
                              if (t.object_type === 'coordinate') return sum - Math.abs(t.amount);
                              return sum;
                            }, 0))}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {transactionsLoading ? (
                <div className="text-center py-4">Cargando transacciones...</div>
              ) : transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="space-y-2">
                    {transactionFilter === 'coordinates' ? (
                      <>
                        <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        <p>No hay transacciones de coordenadas aún</p>
                        <p className="text-sm">Las ventas de coordenadas aparecerán aquí cuando alguien compre tus ubicaciones</p>
                      </>
                    ) : (
                      <>
                        <History className="h-12 w-12 mx-auto text-muted-foreground/50" />
                        <p>No hay transacciones aún</p>
                        <p className="text-sm">Tus transacciones aparecerán aquí</p>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div 
                      key={transaction.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${getTransactionColor(transaction)}`}>
                          {getTransactionIcon(transaction)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{getTransactionType(transaction)}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(transaction.created_at)}</p>
                          {transaction.description && (
                            <p className="text-xs text-muted-foreground mt-1 max-w-md truncate">
                              {transaction.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium text-lg ${
                          (transaction.type === 'deposit' || transaction.type === 'credit' || 
                           transaction.object_type === 'coordinate_sale') 
                            ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {(transaction.type === 'deposit' || transaction.type === 'credit' || 
                            transaction.object_type === 'coordinate_sale') ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </p>
                        <p className={`text-sm capitalize ${
                          transaction.status === 'completed' ? 'text-green-600' : 
                          transaction.status === 'pending' ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {transaction.status === 'completed' ? 'Completada' : 
                           transaction.status === 'pending' ? 'Pendiente' : 
                           transaction.status === 'failed' ? 'Fallida' : transaction.status}
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
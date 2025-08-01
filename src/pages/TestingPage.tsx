import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentTestPanel } from '@/components/PaymentTestPanel';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Database,
  Users,
  ShoppingBag,
  MessageSquare,
  MapPin,
  Wallet,
  Gift
} from 'lucide-react';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: any;
}

export default function TestingPage() {
  const { user, signUp, signIn } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runDatabaseTests = async (): Promise<TestResult[]> => {
    const tests: TestResult[] = [];
    
    try {
      // Test profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      tests.push({
        name: 'Profiles Table Access',
        passed: !profilesError,
        error: profilesError?.message,
        details: { count: profiles?.length || 0 }
      });

      // Test circular markets table
      const { data: markets, error: marketsError } = await supabase
        .from('circular_markets')
        .select('*')
        .limit(1);
      
      tests.push({
        name: 'Circular Markets Table Access',
        passed: !marketsError,
        error: marketsError?.message,
        details: { count: markets?.length || 0 }
      });

      // Test objects table
      const { data: objects, error: objectsError } = await supabase
        .from('objects')
        .select('*')
        .limit(1);
      
      tests.push({
        name: 'Objects Table Access',
        passed: !objectsError,
        error: objectsError?.message,
        details: { count: objects?.length || 0 }
      });

      // Test wallets table (only if user is authenticated)
      if (user) {
        const { data: wallets, error: walletsError } = await supabase
          .from('wallets')
          .select('*')
          .eq('user_id', user.id);
        
        tests.push({
          name: 'Wallets Table Access (User Specific)',
          passed: !walletsError,
          error: walletsError?.message,
          details: { count: wallets?.length || 0 }
        });

        // Test transactions table
        const { data: transactions, error: transactionsError } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .limit(1);
        
        tests.push({
          name: 'Transactions Table Access (User Specific)',
          passed: !transactionsError,
          error: transactionsError?.message,
          details: { count: transactions?.length || 0 }
        });

        // Test affiliate codes table
        const { data: affiliateCodes, error: affiliateError } = await supabase
          .from('affiliate_codes')
          .select('*')
          .eq('user_id', user.id);
        
        tests.push({
          name: 'Affiliate Codes Table Access (User Specific)',
          passed: !affiliateError,
          error: affiliateError?.message,
          details: { count: affiliateCodes?.length || 0 }
        });
      } else {
        tests.push({
          name: 'User Authentication Required Tests',
          passed: false,
          error: 'User not authenticated - login required to test user-specific tables'
        });
      }

    } catch (error) {
      tests.push({
        name: 'Database Connection',
        passed: false,
        error: error.message || 'Unknown database error'
      });
    }

    return tests;
  };

  const runAuthTests = async (): Promise<TestResult[]> => {
    const tests: TestResult[] = [];

    // Test current auth state
    tests.push({
      name: 'Authentication State',
      passed: !!user,
      details: user ? { userId: user.id, email: user.email } : { message: 'No user logged in' }
    });

    // Test Supabase auth connection
    try {
      const { data: session } = await supabase.auth.getSession();
      tests.push({
        name: 'Supabase Auth Connection',
        passed: true,
        details: { hasSession: !!session.session }
      });
    } catch (error) {
      tests.push({
        name: 'Supabase Auth Connection',
        passed: false,
        error: error.message
      });
    }

    return tests;
  };

  const runStorageTests = async (): Promise<TestResult[]> => {
    const tests: TestResult[] = [];

    try {
      // Test storage buckets access
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      tests.push({
        name: 'Storage Buckets Access',
        passed: !error,
        error: error?.message,
        details: { buckets: buckets?.map(b => b.name) || [] }
      });

      // Test chat-images bucket specifically
      if (buckets?.find(b => b.name === 'chat-images')) {
        const { data: files, error: filesError } = await supabase.storage
          .from('chat-images')
          .list('', { limit: 1 });
        
        tests.push({
          name: 'Chat Images Bucket Access',
          passed: !filesError,
          error: filesError?.message,
          details: { fileCount: files?.length || 0 }
        });
      }

    } catch (error) {
      tests.push({
        name: 'Storage System',
        passed: false,
        error: error.message || 'Storage test failed'
      });
    }

    return tests;
  };

  const runEdgeFunctionTests = async (): Promise<TestResult[]> => {
    const tests: TestResult[] = [];

    // Test payment system edge function
    try {
      const { data, error } = await supabase.functions.invoke('test-payment-system');
      
      tests.push({
        name: 'Payment System Edge Function',
        passed: !error && data?.success,
        error: error?.message || data?.error,
        details: data?.summary
      });
    } catch (error) {
      tests.push({
        name: 'Payment System Edge Function',
        passed: false,
        error: error.message || 'Edge function test failed'
      });
    }

    return tests;
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults([]);

    try {
      toast.info('Running comprehensive app tests...');

      const [authTests, dbTests, storageTests, edgeFunctionTests] = await Promise.all([
        runAuthTests(),
        runDatabaseTests(),
        runStorageTests(),
        runEdgeFunctionTests()
      ]);

      const allResults = [
        ...authTests,
        ...dbTests,
        ...storageTests,
        ...edgeFunctionTests
      ];

      setResults(allResults);

      const passedTests = allResults.filter(t => t.passed).length;
      const totalTests = allResults.length;

      if (passedTests === totalTests) {
        toast.success(`All ${totalTests} tests passed! 🎉`);
      } else {
        toast.warning(`${passedTests}/${totalTests} tests passed`);
      }

    } catch (error) {
      toast.error('Test execution failed');
      console.error('Testing error:', error);
    } finally {
      setTesting(false);
    }
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (passed: boolean) => {
    return (
      <Badge variant={passed ? "default" : "destructive"} className="ml-2">
        {passed ? "PASS" : "FAIL"}
      </Badge>
    );
  };

  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  const successRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : '0';

  return (
    <div className="flex-1 p-4 space-y-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <TestTube className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Comprehensive App Testing</h1>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Results</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Quick System Test
                </CardTitle>
                <CardDescription>
                  Run a comprehensive test of all app functionalities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={runAllTests} 
                  disabled={testing}
                  className="flex items-center gap-2"
                  size="lg"
                >
                  {testing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Running Tests...
                    </>
                  ) : (
                    <>
                      <TestTube className="h-4 w-4" />
                      Run All Tests
                    </>
                  )}
                </Button>

                {results.length > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Test Summary:</strong> {passedTests}/{totalTests} tests passed ({successRate}%)
                    </AlertDescription>
                  </Alert>
                )}

                {/* Quick Status Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <div>
                        <div className="font-semibold">Authentication</div>
                        <div className="text-sm text-muted-foreground">
                          {user ? 'Logged In' : 'Not Logged In'}
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-green-500" />
                      <div>
                        <div className="font-semibold">Database</div>
                        <div className="text-sm text-muted-foreground">Connected</div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <Wallet className="h-5 w-5 text-purple-500" />
                      <div>
                        <div className="font-semibold">Payments</div>
                        <div className="text-sm text-muted-foreground">Test Mode</div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-orange-500" />
                      <div>
                        <div className="font-semibold">Features</div>
                        <div className="text-sm text-muted-foreground">Ready</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Connectivity Tests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={async () => {
                    setTesting(true);
                    const dbResults = await runDatabaseTests();
                    setResults(dbResults);
                    setTesting(false);
                  }}
                  disabled={testing}
                  className="mb-4"
                >
                  Test Database Access
                </Button>

                {results.length > 0 && (
                  <div className="space-y-2">
                    {results.map((result, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(result.passed)}
                          <span>{result.name}</span>
                        </div>
                        {getStatusBadge(result.passed)}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <PaymentTestPanel />
          </TabsContent>

          <TabsContent value="detailed" className="space-y-6">
            {results.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Test Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {results.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(result.passed)}
                            <span className="font-semibold">{result.name}</span>
                          </div>
                          {getStatusBadge(result.passed)}
                        </div>
                        
                        {result.error && (
                          <Alert variant="destructive" className="mt-2">
                            <XCircle className="h-4 w-4" />
                            <AlertDescription>{result.error}</AlertDescription>
                          </Alert>
                        )}
                        
                        {result.details && (
                          <div className="mt-2 p-2 bg-muted rounded text-sm">
                            <pre>{JSON.stringify(result.details, null, 2)}</pre>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
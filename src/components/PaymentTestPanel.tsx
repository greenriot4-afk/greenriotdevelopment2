import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TestTube, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface TestResult {
  stripeConnection: boolean;
  supabaseConnection: boolean;
  testCustomerCreation: boolean;
  testSubscriptionCreation: boolean;
  testPaymentIntentCreation: boolean;
  walletFunctionality: boolean;
  affiliateSystem: boolean;
  errors: string[];
}

interface TestResponse {
  success: boolean;
  testResults: TestResult;
  summary: {
    passedTests: number;
    totalTests: number;
    successRate: string;
  };
  message: string;
  error?: string;
}

export const PaymentTestPanel = () => {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResponse | null>(null);

  const runTests = async () => {
    setTesting(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke('test-payment-system');
      
      if (error) {
        throw error;
      }

      setResults(data);
      
      if (data.success && data.testResults.errors.length === 0) {
        toast.success('All payment tests passed! 🎉');
      } else {
        toast.warning(`Tests completed with ${data.summary.passedTests}/${data.summary.totalTests} passing`);
      }
      
    } catch (error) {
      console.error('Test execution failed:', error);
      toast.error('Failed to run payment tests');
      setResults({
        success: false,
        testResults: {
          stripeConnection: false,
          supabaseConnection: false,
          testCustomerCreation: false,
          testSubscriptionCreation: false,
          testPaymentIntentCreation: false,
          walletFunctionality: false,
          affiliateSystem: false,
          errors: [error.message || 'Unknown error occurred']
        },
        summary: { passedTests: 0, totalTests: 7, successRate: '0%' },
        message: 'Test execution failed',
        error: error.message
      });
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

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Payment System Testing Panel
        </CardTitle>
        <CardDescription>
          Test all payment functionalities using Stripe test mode
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex gap-4">
          <Button 
            onClick={runTests} 
            disabled={testing}
            className="flex items-center gap-2"
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
        </div>

        {results && (
          <div className="space-y-4">
            {/* Summary */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Test Summary:</strong> {results.summary.passedTests}/{results.summary.totalTests} tests passed ({results.summary.successRate})
                <br />
                {results.message}
              </AlertDescription>
            </Alert>

            {/* Test Results */}
            <div className="space-y-3">
              <h4 className="font-semibold text-lg">Test Results:</h4>
              
              <div className="grid gap-2">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.testResults.stripeConnection)}
                    <span>Stripe Connection</span>
                  </div>
                  {getStatusBadge(results.testResults.stripeConnection)}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.testResults.supabaseConnection)}
                    <span>Supabase Connection</span>
                  </div>
                  {getStatusBadge(results.testResults.supabaseConnection)}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.testResults.testCustomerCreation)}
                    <span>Customer Creation</span>
                  </div>
                  {getStatusBadge(results.testResults.testCustomerCreation)}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.testResults.testSubscriptionCreation)}
                    <span>Subscription Creation</span>
                  </div>
                  {getStatusBadge(results.testResults.testSubscriptionCreation)}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.testResults.testPaymentIntentCreation)}
                    <span>Payment Intent Creation</span>
                  </div>
                  {getStatusBadge(results.testResults.testPaymentIntentCreation)}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.testResults.walletFunctionality)}
                    <span>Wallet Functionality</span>
                  </div>
                  {getStatusBadge(results.testResults.walletFunctionality)}
                </div>

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(results.testResults.affiliateSystem)}
                    <span>Affiliate System</span>
                  </div>
                  {getStatusBadge(results.testResults.affiliateSystem)}
                </div>
              </div>
            </div>

            {/* Errors */}
            {results.testResults.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold text-lg text-red-600">Errors:</h4>
                <div className="space-y-2">
                  {results.testResults.errors.map((error, index) => (
                    <Alert key={index} variant="destructive">
                      <XCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
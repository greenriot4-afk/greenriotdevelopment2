import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, AlertTriangle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';

interface SecurityReport {
  timestamp: string;
  user_id: string;
  security_status: {
    security_level: 'NORMAL' | 'WARNING' | 'ALERT' | 'CRITICAL';
    admin_count: number;
    suspicious_high_value_transactions: number;
  };
  recent_admin_activities: any[];
  suspicious_transactions: any[];
  rate_limiting_status: any;
  recommendations: string[];
}

export const SecurityMonitor = () => {
  const [securityReport, setSecurityReport] = useState<SecurityReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchSecurityReport = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('enhanced-security-monitor');
      
      if (error) {
        console.error('Security monitor error:', error);
        toast.error('Failed to fetch security report');
        return;
      }

      setSecurityReport(data);
      setLastUpdated(new Date());
      toast.success('Security report updated');
    } catch (error) {
      console.error('Security monitor error:', error);
      toast.error('Failed to fetch security report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSecurityReport();
  }, []);

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'NORMAL':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'WARNING':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'ALERT':
        return 'bg-orange-500/10 text-orange-700 border-orange-200';
      case 'CRITICAL':
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getSecurityLevelIcon = (level: string) => {
    switch (level) {
      case 'NORMAL':
        return <CheckCircle className="h-4 w-4" />;
      case 'WARNING':
      case 'ALERT':
        return <AlertTriangle className="h-4 w-4" />;
      case 'CRITICAL':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  if (!securityReport) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Monitor
          </CardTitle>
          <CardDescription>Loading security report...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { security_status, recommendations, recent_admin_activities, suspicious_transactions } = securityReport;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Monitor
              </CardTitle>
              <CardDescription>
                Real-time security status and monitoring
                {lastUpdated && (
                  <span className="block text-sm text-muted-foreground mt-1">
                    Last updated: {lastUpdated.toLocaleString()}
                  </span>
                )}
              </CardDescription>
            </div>
            <Button
              onClick={fetchSecurityReport}
              disabled={loading}
              variant="outline"
              size="sm"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Security Level Status */}
          <div className="flex items-center gap-4">
            <Badge className={`${getSecurityLevelColor(security_status.security_level)} flex items-center gap-2`}>
              {getSecurityLevelIcon(security_status.security_level)}
              Security Level: {security_status.security_level}
            </Badge>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-primary">
                {security_status.admin_count}
              </div>
              <div className="text-sm text-muted-foreground">Active Administrators</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {security_status.suspicious_high_value_transactions}
              </div>
              <div className="text-sm text-muted-foreground">Suspicious Transactions (1h)</div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {recent_admin_activities.length}
              </div>
              <div className="text-sm text-muted-foreground">Recent Admin Activities (24h)</div>
            </div>
          </div>

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Security Recommendations</h4>
              {recommendations.map((recommendation, index) => (
                <Alert key={index} className={
                  recommendation.includes('CRITICAL') ? 'border-red-200 bg-red-50' :
                  recommendation.includes('WARNING') ? 'border-yellow-200 bg-yellow-50' :
                  recommendation.includes('ALERT') ? 'border-orange-200 bg-orange-50' :
                  'border-blue-200 bg-blue-50'
                }>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{recommendation}</AlertDescription>
                </Alert>
              ))}
            </div>
          )}

          {/* Recent Admin Activities */}
          {recent_admin_activities.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Recent Admin Activities</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {recent_admin_activities.map((activity, index) => (
                  <div key={index} className="p-3 border rounded-lg text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">Role: {activity.role}</span>
                        {activity.profiles?.display_name && (
                          <span className="text-muted-foreground ml-2">
                            ({activity.profiles.display_name})
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suspicious Transactions */}
          {suspicious_transactions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Suspicious High-Value Transactions</h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {suspicious_transactions.map((transaction, index) => (
                  <div key={index} className="p-3 border rounded-lg text-sm">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="font-medium">
                          ${transaction.amount} {transaction.currency}
                        </span>
                        <span className="text-muted-foreground ml-2">
                          - {transaction.type}
                        </span>
                        {transaction.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {transaction.description}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
import { useState, useEffect } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useAffiliates } from '@/hooks/useAffiliates';
import { useLanguage } from '@/hooks/useLanguage';
import { Gift } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { supabase } from '@/integrations/supabase/client';

export default function Auth() {
  const [searchParams] = useSearchParams();
  const urlAffiliateCode = searchParams.get('ref');
  const [affiliateCode, setAffiliateCode] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user, signIn, signUp } = useAuth();
  const { processReferralSignup } = useAffiliates();
  const { t } = useLanguage();

  // Detectar código de afiliado desde URL o localStorage
  useEffect(() => {
    if (urlAffiliateCode) {
      // Si viene de URL, usar ese y almacenarlo
      console.log('Affiliate code detected from URL:', urlAffiliateCode);
      setAffiliateCode(urlAffiliateCode);
      localStorage.setItem('pendingAffiliateCode', urlAffiliateCode);
    } else {
      // Si no hay en URL, verificar localStorage (para links compartidos)
      const storedCode = localStorage.getItem('pendingAffiliateCode');
      if (storedCode) {
        console.log('Affiliate code detected from localStorage:', storedCode);
        setAffiliateCode(storedCode);
      }
    }
  }, [urlAffiliateCode]);

  // Redirigir si ya está autenticado
  if (user) {
    return <Navigate to="/app/abandons" replace />;
  }

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: t('error.fillAllFields'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    const { error } = await signIn(email, password);
    
    if (error) {
      toast({
        title: t('error.signInError'),
        description: error.message === "Invalid login credentials" 
          ? t('error.invalidCredentials')
          : error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: t('auth.welcome'),
        description: t('auth.signedInSuccessfully'),
      });
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !displayName) {
      toast({
        title: "Error",
        description: t('error.fillAllFields'),
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: t('error.passwordsDontMatch'),
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: t('error.passwordTooShort'),
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    
    // Almacenar código de afiliado antes del registro si existe
    if (affiliateCode) {
      localStorage.setItem('pendingAffiliateCode', affiliateCode);
    }
    
    const { error } = await signUp(email, password, displayName);
    
    if (error) {
      // Limpiar código almacenado si hay error
      if (affiliateCode) {
        localStorage.removeItem('pendingAffiliateCode');
      }
      
      if (error.message.includes("already registered")) {
        toast({
          title: t('error.signUpError'),
          description: t('error.emailAlreadyRegistered'),
          variant: "destructive",
        });
      } else {
        toast({
          title: t('error.signUpError'),
          description: error.message,
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: t('auth.registrationSuccessful'),
        description: affiliateCode 
          ? `${t('auth.checkEmailToConfirm')} ${t('auth.referredByAffiliate')}`
          : t('auth.checkEmailToConfirm'),
      });
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/app/abandons`
      }
    });
    
    if (error) {
      toast({
        title: t('error.signInError'),
        description: error.message,
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src="/lovable-uploads/b8718597-8055-40ab-be67-40fc8bd1fac3.png" 
              alt="Greenriot" 
              className="h-12 w-auto"
            />
          </div>
          <p className="text-muted-foreground mt-2">{t('auth.slogan')}</p>
          
          {affiliateCode && (
            <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Gift className="w-4 h-4 text-primary" />
                <Badge variant="secondary" className="text-primary">
                  {t('auth.referredByAffiliateTitle')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('auth.affiliateBonus')}
              </p>
            </div>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t('auth.title')}</CardTitle>
            <CardDescription>
              {t('auth.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">{t('auth.signIn')}</TabsTrigger>
                <TabsTrigger value="signup">{t('auth.signUp')}</TabsTrigger>
              </TabsList>
              
              
              <TabsContent value="signin">
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <FcGoogle className="mr-2 h-4 w-4" />
                    {t('auth.signInWithGoogle')}
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        {t('auth.orContinueWith')}
                      </span>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">{t('auth.email')}</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder={t('auth.yourEmail')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">{t('auth.password')}</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t('auth.signingIn') : t('auth.signIn')}
                  </Button>
                </form>
              </TabsContent>
              
              
              <TabsContent value="signup">
                <div className="space-y-4">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                  >
                    <FcGoogle className="mr-2 h-4 w-4" />
                    {t('auth.signUpWithGoogle')}
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        {t('auth.orContinueWith')}
                      </span>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">{t('auth.name')}</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder={t('auth.yourName')}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t('auth.email')}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder={t('auth.yourEmail')}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t('auth.password')}</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t('auth.confirmPassword')}</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? t('auth.registering') : t('auth.register')}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
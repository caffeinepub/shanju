import { useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetCallerUserProfile } from '../hooks/useUserProfile';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ShanjuLogo from '../components/brand/ShanjuLogo';
import ProfileSetupModal from '../components/profile/ProfileSetupModal';
import { LogIn, AlertCircle } from 'lucide-react';

export default function SignInPage() {
  const { login, identity, loginStatus, loginError } = useInternetIdentity();
  const {
    data: userProfile,
    isLoading: profileLoading,
    isFetched,
  } = useGetCallerUserProfile();
  const navigate = useNavigate();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  useEffect(() => {
    if (isAuthenticated && userProfile) {
      navigate({ to: '/dashboard' });
    }
  }, [isAuthenticated, userProfile, navigate]);

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <ShanjuLogo size={80} />
          </div>
          <div>
            <CardTitle className="text-3xl">Welcome to Shanju</CardTitle>
            <CardDescription className="mt-2">
              Sign in to create and manage payment requests securely
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {loginError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{loginError.message}</AlertDescription>
            </Alert>
          )}
          <Button
            onClick={handleLogin}
            disabled={loginStatus === 'logging-in'}
            className="w-full"
            size="lg"
          >
            <LogIn className="mr-2 h-5 w-5" />
            {loginStatus === 'logging-in' ? 'Signing in...' : 'Sign in with Internet Identity'}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our terms of service and privacy policy
          </p>
        </CardContent>
      </Card>
      <ProfileSetupModal open={showProfileSetup} />
    </div>
  );
}


import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useGetCallerPersonalAccount, useSaveCallerPersonalAccount, normalizePersonalAccount, createEmptyPersonalAccount } from '../hooks/usePersonalAccount';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, AlertCircle, CheckCircle2, LogIn, Wallet, User } from 'lucide-react';
import { toast } from 'sonner';
import type { PersonalAccount } from '../backend';
import WalletBalancesCard from '../components/wallet/WalletBalancesCard';
import WalletHistoryTable from '../components/wallet/WalletHistoryTable';
import SendMoneyForm from '../components/wallet/SendMoneyForm';
import AddMoneyForm from '../components/wallet/AddMoneyForm';
import CashOutForm from '../components/wallet/CashOutForm';

export default function PersonalAccountPage() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: personalAccount, isLoading, isFetched, error } = useGetCallerPersonalAccount();
  const saveMutation = useSaveCallerPersonalAccount();

  const [formData, setFormData] = useState<PersonalAccount>(createEmptyPersonalAccount());

  const [errors, setErrors] = useState<Partial<Record<keyof PersonalAccount, string>>>({});

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  // Handle authorization errors
  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (personalAccount) {
      setFormData(normalizePersonalAccount(personalAccount));
    }
  }, [personalAccount]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PersonalAccount, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }

    if (!formData.nid.trim()) {
      newErrors.nid = 'NID Number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      await saveMutation.mutateAsync(formData);
      toast.success(personalAccount ? 'Personal account updated successfully' : 'Personal account created successfully');
    } catch (error: any) {
      console.error('Failed to save personal account:', error);
      const errorMessage = error.message || 'Failed to save personal account';
      
      // Check for authorization errors
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('not authenticated')) {
        toast.error('You need to sign in to save your personal account');
        setTimeout(() => navigate({ to: '/' }), 2000);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleChange = (field: keyof PersonalAccount, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Show error state for authorization failures
  if (error) {
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    const isAuthError = errorMessage.includes('Unauthorized') || errorMessage.includes('not authenticated');

    return (
      <div className="container py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="py-12">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Access Error</AlertTitle>
                <AlertDescription className="mt-2">
                  {isAuthError
                    ? 'You need to be signed in to access your personal account.'
                    : 'Unable to load your personal account. Please try again later.'}
                </AlertDescription>
              </Alert>
              {isAuthError && (
                <div className="flex justify-center mt-6">
                  <Button onClick={() => navigate({ to: '/' })} className="gap-2">
                    <LogIn className="h-4 w-4" />
                    Go to Sign In
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="max-w-6xl mx-auto">
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const isNewAccount = isFetched && !personalAccount;

  return (
    <div className="container py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Personal Account</h1>
          <p className="text-muted-foreground mt-1">Manage your profile and wallet</p>
        </div>

        <Tabs defaultValue="wallet" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="wallet" className="gap-2">
              <Wallet className="h-4 w-4" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="profile" className="gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wallet" className="space-y-6">
            <WalletBalancesCard />

            <div className="grid gap-6 md:grid-cols-3">
              <SendMoneyForm />
              <AddMoneyForm />
              <CashOutForm />
            </div>

            <WalletHistoryTable />
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  {isNewAccount
                    ? 'Set up your personal account information for payment processing'
                    : 'Manage your personal account information'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isNewAccount && (
                  <Alert className="mb-6">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your personal account is not set up yet. Please provide your information below.
                    </AlertDescription>
                  </Alert>
                )}

                {!isNewAccount && personalAccount && (
                  <Alert className="mb-6 border-green-200 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100">
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>Your personal account is active and configured.</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">
                      Full Name <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      placeholder="Enter your full name"
                      className={errors.fullName ? 'border-destructive' : ''}
                    />
                    {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      placeholder="your.email@example.com"
                      className={errors.email ? 'border-destructive' : ''}
                    />
                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="+880 1XXX-XXXXXX"
                      className={errors.phone ? 'border-destructive' : ''}
                    />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">
                      Address <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange('address', e.target.value)}
                      placeholder="Enter your full address"
                      className={errors.address ? 'border-destructive' : ''}
                    />
                    {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">
                      Password <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      placeholder="Enter your password"
                      className={errors.password ? 'border-destructive' : ''}
                    />
                    {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nid">
                      NID Number <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nid"
                      value={formData.nid}
                      onChange={(e) => handleChange('nid', e.target.value)}
                      placeholder="Enter your NID number"
                      className={errors.nid ? 'border-destructive' : ''}
                    />
                    {errors.nid && <p className="text-sm text-destructive">{errors.nid}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxId">Tax ID</Label>
                    <Input
                      id="taxId"
                      value={formData.taxId}
                      onChange={(e) => handleChange('taxId', e.target.value)}
                      placeholder="Enter your tax ID (optional)"
                    />
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button type="submit" disabled={saveMutation.isPending} className="gap-2">
                      {saveMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          {isNewAccount ? 'Create Account' : 'Save Changes'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

import { useNavigate } from '@tanstack/react-router';
import { useListPayments } from '../hooks/usePayments';
import { useGetCallerPersonalAccount } from '../hooks/usePersonalAccount';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import PaymentsTable from '../components/payments/PaymentsTable';
import { Plus, Wallet, TrendingUp, Clock, User, Loader2, AlertCircle } from 'lucide-react';
import { PaymentStatus } from '../backend';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { data: payments } = useListPayments();
  const { data: personalAccount, isLoading: personalAccountLoading, isFetched: personalAccountFetched } = useGetCallerPersonalAccount();

  // Show loading state while checking personal account
  if (personalAccountLoading || !personalAccountFetched) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const stats = {
    total: payments?.length || 0,
    pending: payments?.filter((p) => p.status === PaymentStatus.pending).length || 0,
    completed: payments?.filter((p) => p.status === PaymentStatus.completed).length || 0,
  };

  const showProfileSetupNotice = personalAccount === null;

  return (
    <div className="container py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your payment activity</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate({ to: '/personal-account' })} variant="outline" size="lg">
            <User className="mr-2 h-5 w-5" />
            Personal Account
          </Button>
          <Button onClick={() => navigate({ to: '/create-payment' })} size="lg">
            <Plus className="mr-2 h-5 w-5" />
            Create Payment
          </Button>
        </div>
      </div>

      {showProfileSetupNotice && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Complete your personal account setup to unlock all payment features.</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/personal-account', search: { tab: 'profile' } })}
              className="ml-4"
            >
              Set Up Now
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground mt-1">All payment requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground mt-1">Successfully processed</p>
          </CardContent>
        </Card>
      </div>

      <PaymentsTable />
    </div>
  );
}

import { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsAdmin } from '../hooks/useAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import AdminPaymentsTable from '../components/admin/AdminPaymentsTable';
import AdminUserLookup from '../components/admin/AdminUserLookup';
import AndroidInstallGuideCard from '../components/admin/AndroidInstallGuideCard';

export default function AdminPanelPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: isAdmin, isLoading: isAdminLoading } = useIsAdmin();

  const isAuthenticated = !!identity && !identity.getPrincipal().isAnonymous();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate({ to: '/' });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  if (isAdminLoading) {
    return (
      <div className="container py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container py-8">
        <Alert variant="destructive" className="max-w-2xl mx-auto">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Unauthorized</strong>
            <p className="mt-2">You do not have permission to access the Admin Panel. This area is restricted to administrators only.</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Admin Panel</h1>
        </div>
        <p className="text-muted-foreground">
          Manage system-wide payments, user accounts, and application settings.
        </p>
      </div>

      <Tabs defaultValue="payments" className="space-y-6">
        <TabsList>
          <TabsTrigger value="payments">All Payments</TabsTrigger>
          <TabsTrigger value="users">User Lookup</TabsTrigger>
          <TabsTrigger value="install">Install Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System-Wide Payments</CardTitle>
              <CardDescription>
                View and manage all payment requests across the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminPaymentsTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Account Lookup</CardTitle>
              <CardDescription>
                Search for a user by their principal ID to view their profile, wallet, and transaction history.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminUserLookup />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="install" className="space-y-4">
          <AndroidInstallGuideCard />
        </TabsContent>
      </Tabs>
    </div>
  );
}

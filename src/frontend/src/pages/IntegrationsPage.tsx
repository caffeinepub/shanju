import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import ConnectorCreateForm from '../components/integrations/ConnectorCreateForm';
import ConnectorsTable from '../components/integrations/ConnectorsTable';

export default function IntegrationsPage() {
  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground mt-2">
          Connect your e-commerce platforms to manage payment requests seamlessly.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Connection</CardTitle>
          <CardDescription>
            Connect Shopify, WooCommerce, or other platforms to your Shanju account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConnectorCreateForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Connections</CardTitle>
          <CardDescription>
            Manage your platform connections and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConnectorsTable />
        </CardContent>
      </Card>
    </div>
  );
}

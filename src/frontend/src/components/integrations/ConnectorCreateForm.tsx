import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateConnector } from '../../hooks/useConnectors';
import { PlatformType } from '../../backend';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function ConnectorCreateForm() {
  const [name, setName] = useState('');
  const [platformType, setPlatformType] = useState<PlatformType | ''>('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');

  const createConnector = useCreateConnector();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Please enter a display name');
      return;
    }

    if (!platformType) {
      toast.error('Please select a platform');
      return;
    }

    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    if (!apiSecret.trim()) {
      toast.error('Please enter an API secret');
      return;
    }

    try {
      await createConnector.mutateAsync({
        name: name.trim(),
        platformType: platformType as PlatformType,
        apiKey: apiKey.trim(),
        apiSecret: apiSecret.trim(),
      });

      toast.success('Connection created successfully');
      
      // Reset form
      setName('');
      setPlatformType('');
      setApiKey('');
      setApiSecret('');
    } catch (error: any) {
      console.error('Error creating connector:', error);
      toast.error(error.message || 'Failed to create connection');
    }
  };

  const isPending = createConnector.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="platform">Platform</Label>
          <Select
            value={platformType}
            onValueChange={(value) => setPlatformType(value as PlatformType)}
            disabled={isPending}
          >
            <SelectTrigger id="platform">
              <SelectValue placeholder="Select platform" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PlatformType.shopify}>Shopify</SelectItem>
              <SelectItem value={PlatformType.wordpress_woo}>WooCommerce</SelectItem>
              <SelectItem value={PlatformType.otherPlatform}>Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Display Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="My Store"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isPending}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="text"
            placeholder="Enter API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={isPending}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiSecret">API Secret</Label>
          <Input
            id="apiSecret"
            type="password"
            placeholder="Enter API secret"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            disabled={isPending}
          />
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? 'Creating...' : 'Create Connection'}
      </Button>
    </form>
  );
}

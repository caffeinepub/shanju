import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useListConnectors, useDeleteConnector } from '../../hooks/useConnectors';
import { PlatformType } from '../../backend';
import { toast } from 'sonner';
import { Loader2, Trash2 } from 'lucide-react';

export default function ConnectorsTable() {
  const { data: connectors, isLoading, error } = useListConnectors();
  const deleteConnector = useDeleteConnector();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [connectorToDelete, setConnectorToDelete] = useState<bigint | null>(null);

  const getPlatformLabel = (platformType: PlatformType): string => {
    switch (platformType) {
      case PlatformType.shopify:
        return 'Shopify';
      case PlatformType.wordpress_woo:
        return 'WooCommerce';
      case PlatformType.otherPlatform:
        return 'Other';
      default:
        return 'Unknown';
    }
  };

  const handleDeleteClick = (id: bigint) => {
    setConnectorToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (connectorToDelete === null) return;

    try {
      await deleteConnector.mutateAsync(connectorToDelete);
      toast.success('Connection deleted successfully');
      setDeleteDialogOpen(false);
      setConnectorToDelete(null);
    } catch (error: any) {
      console.error('Error deleting connector:', error);
      toast.error(error.message || 'Failed to delete connection');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        Error loading connections. Please try again.
      </div>
    );
  }

  if (!connectors || connectors.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No connections yet. Create your first connection above.
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Platform</TableHead>
              <TableHead>Display Name</TableHead>
              <TableHead>API Key</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {connectors.map((connector) => (
              <TableRow key={connector.id.toString()}>
                <TableCell>
                  <Badge variant="outline">{getPlatformLabel(connector.platformType)}</Badge>
                </TableCell>
                <TableCell className="font-medium">{connector.name}</TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {connector.apiKey.substring(0, 8)}...
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteClick(connector.id)}
                    disabled={deleteConnector.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Connection</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this connection? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteConnector.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteConnector.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteConnector.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

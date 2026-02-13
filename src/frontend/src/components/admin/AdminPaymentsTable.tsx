import { useAllPayments } from '../../hooks/useAdminPanel';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import PaymentStatusBadge from '../payments/PaymentStatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';

export default function AdminPaymentsTable() {
  const { data: payments, isLoading, error } = useAllPayments();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading payments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load payments: {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    );
  }

  if (!payments || payments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No payments found in the system.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Payer</TableHead>
            <TableHead>Payee</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id.toString()}>
              <TableCell className="font-mono text-sm">{payment.id.toString()}</TableCell>
              <TableCell className="font-semibold">
                {formatCurrency(payment.amount, payment.currency)}
              </TableCell>
              <TableCell>
                <PaymentStatusBadge status={payment.status} />
              </TableCell>
              <TableCell className="max-w-xs truncate">{payment.description}</TableCell>
              <TableCell className="font-mono text-xs">
                {payment.payer.toString().slice(0, 12)}...
              </TableCell>
              <TableCell className="font-mono text-xs">
                {payment.payee.toString().slice(0, 12)}...
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import { useState } from 'react';
import { useListPayments } from '../../hooks/usePayments';
import { useCurrentPrincipal } from '../../hooks/useCurrentPrincipal';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PaymentStatusBadge from './PaymentStatusBadge';
import { PaymentStatus, type Payment } from '../../backend';
import { formatCurrency } from '../../utils/formatCurrency';
import { Loader2, ArrowRight } from 'lucide-react';

type FilterStatus = 'all' | PaymentStatus;

export default function PaymentsTable() {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const { data: payments, isLoading, error } = useListPayments();
  const principal = useCurrentPrincipal();
  const navigate = useNavigate();

  const filteredPayments =
    payments?.filter((payment) => filter === 'all' || payment.status === filter) || [];

  const getPaymentRole = (payment: Payment) => {
    if (!principal) return 'Unknown';
    const principalStr = principal.toString();
    if (payment.payer.toString() === principalStr) return 'Payer';
    if (payment.payee.toString() === principalStr) return 'Payee';
    return 'Unknown';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <p className="text-center text-destructive">Failed to load payments. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Payments</CardTitle>
            <CardDescription>View and manage your payment requests</CardDescription>
          </div>
          <Tabs value={filter} onValueChange={(v) => setFilter(v as FilterStatus)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value={PaymentStatus.pending}>Pending</TabsTrigger>
              <TabsTrigger value={PaymentStatus.completed}>Completed</TabsTrigger>
              <TabsTrigger value={PaymentStatus.cancelled}>Cancelled</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        {filteredPayments.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No payments found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{payment.description}</TableCell>
                    <TableCell>{formatCurrency(payment.amount, payment.currency)}</TableCell>
                    <TableCell>{getPaymentRole(payment)}</TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={payment.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate({ to: '/payment/$id', params: { id: index.toString() } })}
                      >
                        View
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

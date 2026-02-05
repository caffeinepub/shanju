import { useState } from 'react';
import { useUpdatePaymentStatus } from '../../hooks/usePayments';
import { useCurrentPrincipal } from '../../hooks/useCurrentPrincipal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import PaymentStatusBadge from './PaymentStatusBadge';
import { PaymentStatus, type Payment } from '../../backend';
import { formatCurrency } from '../../utils/formatCurrency';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Copy, ExternalLink } from 'lucide-react';

interface PaymentDetailsCardProps {
  payment: Payment;
  paymentId: bigint;
}

export default function PaymentDetailsCard({ payment, paymentId }: PaymentDetailsCardProps) {
  const [confirmAction, setConfirmAction] = useState<PaymentStatus | null>(null);
  const updateStatus = useUpdatePaymentStatus();
  const principal = useCurrentPrincipal();

  const canUpdateStatus = payment.status === PaymentStatus.pending;

  const paymentLink = `${window.location.origin}/pay/${paymentId}`;

  const handleStatusUpdate = async (status: PaymentStatus) => {
    try {
      await updateStatus.mutateAsync({ id: paymentId, status });
      toast.success(`Payment marked as ${status}`);
      setConfirmAction(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update payment status');
      console.error('Status update error:', error);
    }
  };

  const getPaymentRole = () => {
    if (!principal) return 'Unknown';
    const principalStr = principal.toString();
    if (payment.payer.toString() === principalStr) return 'You are the payer';
    if (payment.payee.toString() === principalStr) return 'You are the payee';
    return 'Unknown';
  };

  const copyPaymentLink = () => {
    navigator.clipboard.writeText(paymentLink);
    toast.success('Payment link copied to clipboard!');
  };

  const openPaymentLink = () => {
    window.open(paymentLink, '_blank');
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Payment Details</CardTitle>
              <CardDescription className="mt-1">{getPaymentRole()}</CardDescription>
            </div>
            <PaymentStatusBadge status={payment.status} />
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="mt-1 text-lg">{payment.description}</p>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground">Amount</p>
              <p className="mt-1 text-2xl font-semibold">{formatCurrency(payment.amount, payment.currency)}</p>
            </div>

            <Separator />

            {payment.status === PaymentStatus.pending && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="paymentLink">Payment Link</Label>
                  <div className="flex gap-2">
                    <Input
                      id="paymentLink"
                      type="text"
                      value={paymentLink}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={copyPaymentLink}
                      title="Copy link"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={openPaymentLink}
                      title="Open link"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Share this link with the payer to complete the payment
                  </p>
                </div>

                <Separator />
              </>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payer</p>
                <p className="mt-1 text-sm font-mono break-all">{payment.payer.toString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payee</p>
                <p className="mt-1 text-sm font-mono break-all">{payment.payee.toString()}</p>
              </div>
            </div>
          </div>

          {canUpdateStatus && (
            <>
              <Separator />
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setConfirmAction(PaymentStatus.completed)}
                  disabled={updateStatus.isPending}
                  className="flex-1"
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Completed
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setConfirmAction(PaymentStatus.cancelled)}
                  disabled={updateStatus.isPending}
                  className="flex-1"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Payment
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to mark this payment as{' '}
              {confirmAction === PaymentStatus.completed ? 'completed' : 'cancelled'}? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmAction && handleStatusUpdate(confirmAction)}
              className={confirmAction === PaymentStatus.cancelled ? 'bg-destructive' : ''}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

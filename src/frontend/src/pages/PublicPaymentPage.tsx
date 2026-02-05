import { useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { useListPayments } from '../hooks/usePayments';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, CreditCard, CheckCircle2 } from 'lucide-react';
import { SiPaypal } from 'react-icons/si';
import PaymentStatusBadge from '../components/payments/PaymentStatusBadge';
import { PaymentStatus } from '../backend';
import { formatCurrency } from '../utils/formatCurrency';
import SimpleCaptcha from '../components/payments/SimpleCaptcha';
import PaymentMethodSelector from '../components/payments/PaymentMethodSelector';
import CreditCardForm from '../components/payments/CreditCardForm';
import PayPalButton from '../components/payments/PayPalButton';

export default function PublicPaymentPage() {
  const { id } = useParams({ from: '/pay/$id' });
  const { data: payments, isLoading } = useListPayments();
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const paymentIndex = parseInt(id);
  const payment = payments?.[paymentIndex];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Payment link not found or invalid</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (payment.status !== PaymentStatus.pending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <PaymentStatusBadge status={payment.status} />
            </div>
            <p className="text-center text-muted-foreground">
              This payment is no longer available for processing.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-success/10 p-3">
                <CheckCircle2 className="h-12 w-12 text-success" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">Payment Successful!</h2>
              <p className="text-muted-foreground mt-2">
                Your payment of {formatCurrency(payment.amount, payment.currency)} has been processed.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Complete Your Payment</CardTitle>
          <CardDescription>Secure payment powered by Shanju</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Description</p>
              <p className="mt-1 text-lg">{payment.description}</p>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium text-muted-foreground">Amount Due</p>
              <p className="mt-1 text-3xl font-bold">{formatCurrency(payment.amount, payment.currency)}</p>
            </div>
          </div>

          {!captchaVerified ? (
            <>
              <Separator />
              <SimpleCaptcha onVerify={() => setCaptchaVerified(true)} />
            </>
          ) : !paymentMethod ? (
            <>
              <Separator />
              <PaymentMethodSelector onSelect={setPaymentMethod} />
            </>
          ) : paymentMethod === 'card' ? (
            <>
              <Separator />
              <CreditCardForm
                amount={payment.amount}
                currency={payment.currency}
                onSuccess={() => setPaymentComplete(true)}
                onBack={() => setPaymentMethod(null)}
              />
            </>
          ) : (
            <>
              <Separator />
              <PayPalButton
                amount={payment.amount}
                currency={payment.currency}
                onSuccess={() => setPaymentComplete(true)}
                onBack={() => setPaymentMethod(null)}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

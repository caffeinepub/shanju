import { useParams, useNavigate } from '@tanstack/react-router';
import { useListPayments } from '../hooks/usePayments';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PaymentDetailsCard from '../components/payments/PaymentDetailsCard';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function PaymentDetailsPage() {
  const { id } = useParams({ from: '/payment/$id' });
  const navigate = useNavigate();
  const { data: payments, isLoading } = useListPayments();

  const paymentIndex = parseInt(id);
  const payment = payments?.[paymentIndex];

  if (isLoading) {
    return (
      <div className="container py-8">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="container py-8 max-w-2xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Payment not found</p>
            <Button onClick={() => navigate({ to: '/dashboard' })} className="mt-4">
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8 max-w-2xl space-y-6">
      <Button variant="ghost" onClick={() => navigate({ to: '/dashboard' })}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>
      <PaymentDetailsCard payment={payment} paymentId={BigInt(paymentIndex)} />
    </div>
  );
}


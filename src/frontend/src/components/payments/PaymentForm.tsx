import { useState } from 'react';
import { useCreatePayment } from '../../hooks/usePayments';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';
import { Info } from 'lucide-react';

export default function PaymentForm() {
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createPayment = useCreatePayment();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!payee.trim()) {
      newErrors.payee = 'Payee principal is required';
    } else {
      try {
        Principal.fromText(payee.trim());
      } catch {
        newErrors.payee = 'Invalid principal format';
      }
    }

    if (!amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        newErrors.amount = 'Amount must be greater than 0';
      }
    }

    if (!currency.trim()) {
      newErrors.currency = 'Currency is required';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const amountInCents = BigInt(Math.round(parseFloat(amount) * 100));
      const paymentId = await createPayment.mutateAsync({
        payee: payee.trim(),
        amount: amountInCents,
        currency: currency.trim().toUpperCase(),
        description: description.trim(),
      });
      toast.success('Payment request created successfully');
      navigate({ to: '/payment/$id', params: { id: paymentId.toString() } });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create payment request');
      console.error('Payment creation error:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Payment Request</CardTitle>
        <CardDescription>Enter the details for your new payment request</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="payee">Payee Principal</Label>
            <Input
              id="payee"
              value={payee}
              onChange={(e) => {
                setPayee(e.target.value);
                if (errors.payee) setErrors({ ...errors, payee: '' });
              }}
              placeholder="Enter payee principal ID"
              disabled={createPayment.isPending}
            />
            {errors.payee && <p className="text-sm text-destructive">{errors.payee}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors({ ...errors, amount: '' });
                }}
                placeholder="0.00"
                disabled={createPayment.isPending}
              />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value.toUpperCase());
                  if (errors.currency) setErrors({ ...errors, currency: '' });
                }}
                placeholder="USD"
                maxLength={3}
                disabled={createPayment.isPending}
              />
              {errors.currency && <p className="text-sm text-destructive">{errors.currency}</p>}
              <p className="text-xs text-muted-foreground">ISO 4217 code (e.g., USD, EUR, GBP, CHF)</p>
            </div>
          </div>

          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Shanju supports creating payment requests in multiple currencies worldwide. Please note that
              this system does not perform currency conversion or settlement—it simply records payment
              requests in your chosen currency.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              placeholder="What is this payment for?"
              rows={3}
              disabled={createPayment.isPending}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <Button type="submit" className="w-full" disabled={createPayment.isPending}>
            {createPayment.isPending ? 'Creating...' : 'Create Payment Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

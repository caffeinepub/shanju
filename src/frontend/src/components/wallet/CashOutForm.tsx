import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ArrowDownToLine, Loader2 } from 'lucide-react';
import { useProcessCashOut } from '../../hooks/useWallet';
import { codeToCurrency, amountToSmallestUnit } from '../../utils/walletCurrency';
import { Variant_upay_payoneer_nagad_bkash_rocket_paypal } from '../../backend';
import type { CashOutRequest } from '../../backend';

export default function CashOutForm() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [provider, setProvider] = useState<Variant_upay_payoneer_nagad_bkash_rocket_paypal>(Variant_upay_payoneer_nagad_bkash_rocket_paypal.paypal);
  const [destination, setDestination] = useState('');
  const [reference, setReference] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; destination?: string }>({});

  const cashOutMutation = useProcessCashOut();

  const validateForm = (): boolean => {
    const newErrors: { amount?: string; destination?: string } = {};

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!destination.trim()) {
      newErrors.destination = 'Destination is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const currencyObj = codeToCurrency(currency);
      const amountInSmallestUnit = amountToSmallestUnit(parseFloat(amount), currencyObj);

      await cashOutMutation.mutateAsync({
        amount: amountInSmallestUnit,
        currency: currencyObj,
        provider,
        destination: destination.trim(),
        reference: reference.trim() || undefined,
      });

      // Reset form
      setAmount('');
      setDestination('');
      setReference('');
      setErrors({});
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const getDestinationPlaceholder = () => {
    if (provider === Variant_upay_payoneer_nagad_bkash_rocket_paypal.paypal || provider === Variant_upay_payoneer_nagad_bkash_rocket_paypal.payoneer) {
      return 'Enter email address';
    }
    return 'Enter phone number or account ID';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowDownToLine className="h-5 w-5" />
          Cash Out
        </CardTitle>
        <CardDescription>Withdraw funds to external accounts</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="provider">Provider</Label>
            <Select value={provider} onValueChange={(v) => setProvider(v as Variant_upay_payoneer_nagad_bkash_rocket_paypal)}>
              <SelectTrigger id="provider">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={Variant_upay_payoneer_nagad_bkash_rocket_paypal.paypal}>PayPal</SelectItem>
                <SelectItem value={Variant_upay_payoneer_nagad_bkash_rocket_paypal.payoneer}>Payoneer</SelectItem>
                <SelectItem value={Variant_upay_payoneer_nagad_bkash_rocket_paypal.bkash}>bKash</SelectItem>
                <SelectItem value={Variant_upay_payoneer_nagad_bkash_rocket_paypal.nagad}>Nagad</SelectItem>
                <SelectItem value={Variant_upay_payoneer_nagad_bkash_rocket_paypal.rocket}>Rocket</SelectItem>
                <SelectItem value={Variant_upay_payoneer_nagad_bkash_rocket_paypal.upay}>Upay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="destination">
              Destination <span className="text-destructive">*</span>
            </Label>
            <Input
              id="destination"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                if (errors.destination) setErrors({ ...errors, destination: undefined });
              }}
              placeholder={getDestinationPlaceholder()}
              className={errors.destination ? 'border-destructive' : ''}
            />
            {errors.destination && <p className="text-sm text-destructive">{errors.destination}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">
                Amount <span className="text-destructive">*</span>
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (errors.amount) setErrors({ ...errors, amount: undefined });
                }}
                placeholder="0.00"
                className={errors.amount ? 'border-destructive' : ''}
              />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="BDT">BDT - Bangladeshi Taka</SelectItem>
                  <SelectItem value="BTC">BTC - Bitcoin</SelectItem>
                  <SelectItem value="ETH">ETH - Ethereum</SelectItem>
                  <SelectItem value="USDT">USDT - Tether</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference">Reference (Optional)</Label>
            <Textarea
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Add a note for this cash out"
              rows={2}
            />
          </div>

          <Button type="submit" disabled={cashOutMutation.isPending} className="w-full gap-2">
            {cashOutMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ArrowDownToLine className="h-4 w-4" />
                Cash Out
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

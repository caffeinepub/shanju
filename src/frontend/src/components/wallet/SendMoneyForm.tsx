import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { useProcessInternalTransferByPhone } from '../../hooks/useWallet';
import { codeToCurrency, amountToSmallestUnit } from '../../utils/walletCurrency';

export default function SendMoneyForm() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [reference, setReference] = useState('');
  const [errors, setErrors] = useState<{ phoneNumber?: string; amount?: string }>({});

  const sendMutation = useProcessInternalTransferByPhone();

  const validateForm = (): boolean => {
    const newErrors: { phoneNumber?: string; amount?: string } = {};

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Recipient phone number is required';
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
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

      await sendMutation.mutateAsync({
        phoneNumber: phoneNumber.trim(),
        amount: amountInSmallestUnit,
        currency: currencyObj,
        reference: reference.trim() || undefined,
      });

      // Reset form
      setPhoneNumber('');
      setAmount('');
      setReference('');
      setErrors({});
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send Money
        </CardTitle>
        <CardDescription>Transfer funds to another user by phone number</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phoneNumber">
              Recipient Phone Number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="phoneNumber"
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                if (errors.phoneNumber) setErrors({ ...errors, phoneNumber: undefined });
              }}
              placeholder="Enter recipient's phone number"
              className={errors.phoneNumber ? 'border-destructive' : ''}
            />
            {errors.phoneNumber && <p className="text-sm text-destructive">{errors.phoneNumber}</p>}
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
            <Label htmlFor="reference">Note (Optional)</Label>
            <Textarea
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Add a note for this transfer"
              rows={2}
            />
          </div>

          <Button type="submit" disabled={sendMutation.isPending} className="w-full gap-2">
            {sendMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Send Money
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

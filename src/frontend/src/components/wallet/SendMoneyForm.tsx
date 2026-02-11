import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { useProcessInternalTransfer } from '../../hooks/useWallet';
import { codeToCurrency, amountToSmallestUnit } from '../../utils/walletCurrency';
import { Principal } from '@dfinity/principal';

export default function SendMoneyForm() {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [reference, setReference] = useState('');
  const [errors, setErrors] = useState<{ recipient?: string; amount?: string }>({});

  const sendMutation = useProcessInternalTransfer();

  const validateForm = (): boolean => {
    const newErrors: { recipient?: string; amount?: string } = {};

    if (!recipient.trim()) {
      newErrors.recipient = 'Recipient Principal is required';
    } else {
      try {
        Principal.fromText(recipient.trim());
      } catch {
        newErrors.recipient = 'Invalid Principal format';
      }
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
      const recipientPrincipal = Principal.fromText(recipient.trim());
      const currencyObj = codeToCurrency(currency);
      const amountInSmallestUnit = amountToSmallestUnit(parseFloat(amount), currencyObj);

      await sendMutation.mutateAsync({
        recipient: recipientPrincipal,
        amount: amountInSmallestUnit,
        currency: currencyObj,
        reference: reference.trim() || undefined,
      });

      // Reset form
      setRecipient('');
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
        <CardDescription>Transfer funds to another user</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">
              Recipient Principal <span className="text-destructive">*</span>
            </Label>
            <Input
              id="recipient"
              value={recipient}
              onChange={(e) => {
                setRecipient(e.target.value);
                if (errors.recipient) setErrors({ ...errors, recipient: undefined });
              }}
              placeholder="xxxxx-xxxxx-xxxxx-xxxxx-xxx"
              className={errors.recipient ? 'border-destructive' : ''}
            />
            {errors.recipient && <p className="text-sm text-destructive">{errors.recipient}</p>}
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

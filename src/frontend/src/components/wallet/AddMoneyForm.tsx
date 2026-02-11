import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2, CreditCard, Building2 } from 'lucide-react';
import { useProcessAddMoney } from '../../hooks/useWallet';
import { codeToCurrency, amountToSmallestUnit } from '../../utils/walletCurrency';
import type { FundingRequest } from '../../backend';

export default function AddMoneyForm() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [method, setMethod] = useState<'visa' | 'mastercard' | 'bank'>('visa');
  const [reference, setReference] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; accountNumber?: string }>({});

  const addMoneyMutation = useProcessAddMoney();

  const validateForm = (): boolean => {
    const newErrors: { amount?: string; accountNumber?: string } = {};

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (method === 'bank' && !accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required for bank transfers';
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

      let methodObj: FundingRequest['method'];
      if (method === 'visa') {
        methodObj = { __kind__: 'visa', visa: null };
      } else if (method === 'mastercard') {
        methodObj = { __kind__: 'mastercard', mastercard: null };
      } else {
        methodObj = { __kind__: 'bank_account', bank_account: { account_number: accountNumber.trim() } };
      }

      await addMoneyMutation.mutateAsync({
        amount: amountInSmallestUnit,
        currency: currencyObj,
        method: methodObj,
        reference: reference.trim() || undefined,
      });

      // Reset form
      setAmount('');
      setReference('');
      setAccountNumber('');
      setErrors({});
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Money
        </CardTitle>
        <CardDescription>Fund your wallet from external sources</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="method">Payment Method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as 'visa' | 'mastercard' | 'bank')}>
              <SelectTrigger id="method">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visa">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Visa Card
                  </div>
                </SelectItem>
                <SelectItem value="mastercard">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Mastercard
                  </div>
                </SelectItem>
                <SelectItem value="bank">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Bank Account
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {method === 'bank' && (
            <div className="space-y-2">
              <Label htmlFor="accountNumber">
                Bank Account Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="accountNumber"
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value);
                  if (errors.accountNumber) setErrors({ ...errors, accountNumber: undefined });
                }}
                placeholder="Enter your bank account number"
                className={errors.accountNumber ? 'border-destructive' : ''}
              />
              {errors.accountNumber && <p className="text-sm text-destructive">{errors.accountNumber}</p>}
            </div>
          )}

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
            <Input
              id="reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="Last 4 digits of card or transaction reference"
            />
          </div>

          <Button type="submit" disabled={addMoneyMutation.isPending} className="w-full gap-2">
            {addMoneyMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                Add Money
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

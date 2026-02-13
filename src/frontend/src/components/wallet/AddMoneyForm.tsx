import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Loader2, CreditCard, Building2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useStartAddMoney, useVerifyAddMoney, useResendAddMoneyOtp } from '../../hooks/useWallet';
import { codeToCurrency, amountToSmallestUnit } from '../../utils/walletCurrency';
import type { FundingRequest } from '../../backend';
import AddMoneyOtpDialog from './AddMoneyOtpDialog';

export default function AddMoneyForm() {
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [method, setMethod] = useState<'visa' | 'mastercard' | 'bank' | ''>('');
  const [reference, setReference] = useState('');
  
  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Bank fields
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  // OTP dialog state
  const [otpDialogOpen, setOtpDialogOpen] = useState(false);
  const [currentReferenceId, setCurrentReferenceId] = useState<bigint | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);

  const startAddMoneyMutation = useStartAddMoney();
  const verifyAddMoneyMutation = useVerifyAddMoney();
  const resendOtpMutation = useResendAddMoneyOtp();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validate amount
    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    // Validate method selection
    if (!method) {
      newErrors.method = 'Please select a funding method';
    }

    // Validate card fields for Visa/Mastercard
    if (method === 'visa' || method === 'mastercard') {
      if (!cardNumber.trim()) {
        newErrors.cardNumber = 'Card number is required';
      }
      if (!cardHolder.trim()) {
        newErrors.cardHolder = 'Cardholder name is required';
      }
      if (!expiry.trim()) {
        newErrors.expiry = 'Expiry date is required';
      }
      if (!cvv.trim()) {
        newErrors.cvv = 'CVV is required';
      }
      if (!reference.trim()) {
        newErrors.reference = 'Reference (e.g., last 4 digits) is required for card payments';
      }
    }

    // Validate bank fields
    if (method === 'bank') {
      if (!accountNumber.trim()) {
        newErrors.accountNumber = 'Bank account number is required';
      }
      if (!accountHolder.trim()) {
        newErrors.accountHolder = 'Account holder name is required';
      }
      if (!bankName.trim()) {
        newErrors.bankName = 'Bank name is required';
      }
      if (!routingNumber.trim()) {
        newErrors.routingNumber = 'Routing number is required';
      }
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
        methodObj = {
          __kind__: 'visa',
          visa: {
            card_number: cardNumber.trim(),
            card_holder: cardHolder.trim(),
            expiry: expiry.trim(),
            cvv: cvv.trim(),
          },
        };
      } else if (method === 'mastercard') {
        methodObj = {
          __kind__: 'mastercard',
          mastercard: {
            card_number: cardNumber.trim(),
            card_holder: cardHolder.trim(),
            expiry: expiry.trim(),
            cvv: cvv.trim(),
          },
        };
      } else {
        methodObj = {
          __kind__: 'bank_account',
          bank_account: {
            account_number: accountNumber.trim(),
            account_holder: accountHolder.trim(),
            bank_name: bankName.trim(),
            routing_number: routingNumber.trim(),
          },
        };
      }

      // Start add money flow (returns reference ID)
      const referenceId = await startAddMoneyMutation.mutateAsync({
        amount: amountInSmallestUnit,
        currency: currencyObj,
        method: methodObj,
        reference: reference.trim() || undefined,
      });

      // Open OTP dialog with reference ID
      setCurrentReferenceId(referenceId);
      setOtpError(null);
      setOtpDialogOpen(true);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    if (!currentReferenceId) {
      setOtpError('Invalid transaction reference');
      return;
    }

    try {
      setOtpError(null);
      await verifyAddMoneyMutation.mutateAsync({
        referenceId: currentReferenceId,
        otp: BigInt(otp),
      });

      // Success - close dialog and reset form
      setOtpDialogOpen(false);
      setCurrentReferenceId(null);
      resetForm();
    } catch (error: any) {
      setOtpError(error.message || 'Failed to verify OTP');
      throw error;
    }
  };

  const handleResendOtp = async () => {
    if (!currentReferenceId) {
      setOtpError('Invalid transaction reference');
      return;
    }

    try {
      setOtpError(null);
      await resendOtpMutation.mutateAsync(currentReferenceId);
    } catch (error: any) {
      setOtpError(error.message || 'Failed to resend OTP');
      throw error;
    }
  };

  const resetForm = () => {
    setAmount('');
    setMethod('');
    setReference('');
    setCardNumber('');
    setCardHolder('');
    setExpiry('');
    setCvv('');
    setAccountNumber('');
    setAccountHolder('');
    setBankName('');
    setRoutingNumber('');
    setErrors({});
  };

  const clearFieldError = (field: string) => {
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const isFormValid = () => {
    if (!method || !amount) return false;
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) return false;

    if (method === 'visa' || method === 'mastercard') {
      return cardNumber.trim() && cardHolder.trim() && expiry.trim() && cvv.trim() && reference.trim();
    }

    if (method === 'bank') {
      return accountNumber.trim() && accountHolder.trim() && bankName.trim() && routingNumber.trim();
    }

    return false;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Money
          </CardTitle>
          <CardDescription>Fund your wallet from your bank account or card</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Enter your payment details below. You will receive an OTP from your bank to verify and complete the transaction instantly.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="method">
                Funding Method <span className="text-destructive">*</span>
              </Label>
              <Select
                value={method}
                onValueChange={(v) => {
                  setMethod(v as 'visa' | 'mastercard' | 'bank');
                  clearFieldError('method');
                }}
              >
                <SelectTrigger id="method" className={errors.method ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select a funding method" />
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
              {errors.method && <p className="text-sm text-destructive">{errors.method}</p>}
            </div>

            {(method === 'visa' || method === 'mastercard') && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <h3 className="font-medium text-sm">Card Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">
                    Card Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="cardNumber"
                    value={cardNumber}
                    onChange={(e) => {
                      setCardNumber(e.target.value);
                      clearFieldError('cardNumber');
                    }}
                    placeholder="1234 5678 9012 3456"
                    className={errors.cardNumber ? 'border-destructive' : ''}
                  />
                  {errors.cardNumber && <p className="text-sm text-destructive">{errors.cardNumber}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cardHolder">
                    Cardholder Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="cardHolder"
                    value={cardHolder}
                    onChange={(e) => {
                      setCardHolder(e.target.value);
                      clearFieldError('cardHolder');
                    }}
                    placeholder="John Doe"
                    className={errors.cardHolder ? 'border-destructive' : ''}
                  />
                  {errors.cardHolder && <p className="text-sm text-destructive">{errors.cardHolder}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">
                      Expiry Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="expiry"
                      value={expiry}
                      onChange={(e) => {
                        setExpiry(e.target.value);
                        clearFieldError('expiry');
                      }}
                      placeholder="MM/YY"
                      className={errors.expiry ? 'border-destructive' : ''}
                    />
                    {errors.expiry && <p className="text-sm text-destructive">{errors.expiry}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cvv">
                      CVV <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="cvv"
                      value={cvv}
                      onChange={(e) => {
                        setCvv(e.target.value);
                        clearFieldError('cvv');
                      }}
                      placeholder="123"
                      maxLength={4}
                      className={errors.cvv ? 'border-destructive' : ''}
                    />
                    {errors.cvv && <p className="text-sm text-destructive">{errors.cvv}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reference">
                    Reference (Last 4 digits) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="reference"
                    value={reference}
                    onChange={(e) => {
                      setReference(e.target.value);
                      clearFieldError('reference');
                    }}
                    placeholder="Last 4 digits of card"
                    className={errors.reference ? 'border-destructive' : ''}
                  />
                  {errors.reference && <p className="text-sm text-destructive">{errors.reference}</p>}
                </div>
              </div>
            )}

            {method === 'bank' && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <h3 className="font-medium text-sm">Bank Account Details</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">
                    Account Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="accountNumber"
                    value={accountNumber}
                    onChange={(e) => {
                      setAccountNumber(e.target.value);
                      clearFieldError('accountNumber');
                    }}
                    placeholder="1234567890"
                    className={errors.accountNumber ? 'border-destructive' : ''}
                  />
                  {errors.accountNumber && <p className="text-sm text-destructive">{errors.accountNumber}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountHolder">
                    Account Holder Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="accountHolder"
                    value={accountHolder}
                    onChange={(e) => {
                      setAccountHolder(e.target.value);
                      clearFieldError('accountHolder');
                    }}
                    placeholder="John Doe"
                    className={errors.accountHolder ? 'border-destructive' : ''}
                  />
                  {errors.accountHolder && <p className="text-sm text-destructive">{errors.accountHolder}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bankName">
                    Bank Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="bankName"
                    value={bankName}
                    onChange={(e) => {
                      setBankName(e.target.value);
                      clearFieldError('bankName');
                    }}
                    placeholder="Bank of America"
                    className={errors.bankName ? 'border-destructive' : ''}
                  />
                  {errors.bankName && <p className="text-sm text-destructive">{errors.bankName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="routingNumber">
                    Routing Number <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="routingNumber"
                    value={routingNumber}
                    onChange={(e) => {
                      setRoutingNumber(e.target.value);
                      clearFieldError('routingNumber');
                    }}
                    placeholder="123456789"
                    className={errors.routingNumber ? 'border-destructive' : ''}
                  />
                  {errors.routingNumber && <p className="text-sm text-destructive">{errors.routingNumber}</p>}
                </div>
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
                    clearFieldError('amount');
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
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="BDT">BDT</SelectItem>
                    <SelectItem value="BTC">BTC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!isFormValid() || startAddMoneyMutation.isPending}
            >
              {startAddMoneyMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Continue to OTP Verification
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <AddMoneyOtpDialog
        open={otpDialogOpen}
        onOpenChange={setOtpDialogOpen}
        referenceId={currentReferenceId}
        onVerify={handleVerifyOtp}
        onResend={handleResendOtp}
        isVerifying={verifyAddMoneyMutation.isPending}
        isResending={resendOtpMutation.isPending}
        error={otpError}
      />
    </>
  );
}

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, Loader2 } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { toast } from 'sonner';

interface CreditCardFormProps {
  amount: bigint;
  currency: string;
  onSuccess: () => void;
  onBack: () => void;
}

export default function CreditCardForm({ amount, currency, onSuccess, onBack }: CreditCardFormProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };

  const formatExpiry = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setCardNumber(formatCardNumber(value));
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setExpiryDate(formatExpiry(value));
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setCvv(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cardNumber.replace(/\s/g, '').length !== 16) {
      toast.error('Please enter a valid 16-digit card number');
      return;
    }
    
    if (expiryDate.length !== 5) {
      toast.error('Please enter a valid expiry date (MM/YY)');
      return;
    }
    
    if (cvv.length < 3) {
      toast.error('Please enter a valid CVV');
      return;
    }

    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('Payment processed successfully!');
      onSuccess();
    }, 2000);
  };

  const isFormValid = 
    cardNumber.replace(/\s/g, '').length === 16 &&
    expiryDate.length === 5 &&
    cvv.length >= 3 &&
    cardName.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button type="button" variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="font-semibold">Card Payment</h3>
          <p className="text-sm text-muted-foreground">Enter your card details</p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardNumber">Card Number</Label>
        <div className="relative">
          <Input
            id="cardNumber"
            type="text"
            placeholder="1234 5678 9012 3456"
            value={cardNumber}
            onChange={handleCardNumberChange}
            className="pr-10"
          />
          <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cardName">Cardholder Name</Label>
        <Input
          id="cardName"
          type="text"
          placeholder="John Doe"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="expiry">Expiry Date</Label>
          <Input
            id="expiry"
            type="text"
            placeholder="MM/YY"
            value={expiryDate}
            onChange={handleExpiryChange}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cvv">CVV</Label>
          <Input
            id="cvv"
            type="text"
            placeholder="123"
            value={cvv}
            onChange={handleCvvChange}
          />
        </div>
      </div>

      <div className="pt-4 space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-muted-foreground">Amount to pay:</span>
          <span className="font-semibold text-lg">{formatCurrency(amount, currency)}</span>
        </div>
        <Button type="submit" className="w-full" disabled={!isFormValid || isProcessing}>
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${formatCurrency(amount, currency)}`
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Your payment is secured with 256-bit SSL encryption
      </p>
    </form>
  );
}

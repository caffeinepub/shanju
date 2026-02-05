import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
import { SiPaypal } from 'react-icons/si';

interface PaymentMethodSelectorProps {
  onSelect: (method: 'card' | 'paypal') => void;
}

export default function PaymentMethodSelector({ onSelect }: PaymentMethodSelectorProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="font-semibold">Select Payment Method</h3>
        <p className="text-sm text-muted-foreground mt-1">Choose how you'd like to pay</p>
      </div>

      <div className="grid gap-3">
        <Button
          variant="outline"
          className="h-auto py-4 justify-start gap-4 hover:bg-primary/5 hover:border-primary"
          onClick={() => onSelect('card')}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <div className="text-left">
            <div className="font-semibold">Credit / Debit Card</div>
            <div className="text-sm text-muted-foreground">Pay with Visa, Mastercard, or Amex</div>
          </div>
        </Button>

        <Button
          variant="outline"
          className="h-auto py-4 justify-start gap-4 hover:bg-[#0070ba]/5 hover:border-[#0070ba]"
          onClick={() => onSelect('paypal')}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#0070ba]/10">
            <SiPaypal className="h-5 w-5 text-[#0070ba]" />
          </div>
          <div className="text-left">
            <div className="font-semibold">PayPal</div>
            <div className="text-sm text-muted-foreground">Pay securely with your PayPal account</div>
          </div>
        </Button>
      </div>
    </div>
  );
}

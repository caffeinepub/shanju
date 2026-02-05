import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { SiPaypal } from 'react-icons/si';
import { formatCurrency } from '../../utils/formatCurrency';
import { toast } from 'sonner';

interface PayPalButtonProps {
  amount: bigint;
  currency: string;
  onSuccess: () => void;
  onBack: () => void;
}

export default function PayPalButton({ amount, currency, onSuccess, onBack }: PayPalButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayPalPayment = async () => {
    setIsProcessing(true);
    
    // Simulate PayPal redirect and processing
    setTimeout(() => {
      setIsProcessing(false);
      toast.success('PayPal payment completed successfully!');
      onSuccess();
    }, 2500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button type="button" variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h3 className="font-semibold">PayPal Payment</h3>
          <p className="text-sm text-muted-foreground">Complete payment via PayPal</p>
        </div>
      </div>

      <div className="bg-muted/50 rounded-lg p-6 space-y-4">
        <div className="flex justify-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-[#0070ba]/10">
            <SiPaypal className="h-8 w-8 text-[#0070ba]" />
          </div>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">You will be redirected to PayPal to complete your payment</p>
          <p className="text-2xl font-bold">{formatCurrency(amount, currency)}</p>
        </div>
      </div>

      <Button
        onClick={handlePayPalPayment}
        className="w-full bg-[#0070ba] hover:bg-[#005ea6] text-white"
        disabled={isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting to PayPal...
          </>
        ) : (
          <>
            <SiPaypal className="mr-2 h-5 w-5" />
            Continue with PayPal
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        You'll be redirected to PayPal's secure checkout
      </p>
    </div>
  );
}

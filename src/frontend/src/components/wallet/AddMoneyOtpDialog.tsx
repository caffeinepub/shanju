import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AddMoneyOtpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  referenceId: bigint | null;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  isVerifying: boolean;
  isResending: boolean;
  error: string | null;
}

export default function AddMoneyOtpDialog({
  open,
  onOpenChange,
  referenceId,
  onVerify,
  onResend,
  isVerifying,
  isResending,
  error,
}: AddMoneyOtpDialogProps) {
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  // Reset OTP when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setOtp('');
      setLocalError(null);
    }
  }, [open]);

  // Update local error when prop changes
  useEffect(() => {
    setLocalError(error);
  }, [error]);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      setLocalError('Please enter a complete 6-digit OTP code');
      return;
    }

    setLocalError(null);
    try {
      await onVerify(otp);
    } catch (err) {
      // Error is handled by parent component
    }
  };

  const handleResend = async () => {
    setLocalError(null);
    setOtp('');
    try {
      await onResend();
    } catch (err) {
      // Error is handled by parent component
    }
  };

  const handleCancel = () => {
    setOtp('');
    setLocalError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Your Transaction</DialogTitle>
          <DialogDescription>
            Enter the 6-digit OTP code sent by your bank to complete the transaction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {referenceId && (
            <div className="text-sm text-muted-foreground text-center">
              Reference ID: <span className="font-mono font-medium">{referenceId.toString()}</span>
            </div>
          )}

          <div className="flex flex-col items-center gap-4">
            <InputOTP
              maxLength={6}
              value={otp}
              onChange={(value) => {
                setOtp(value);
                setLocalError(null);
              }}
              disabled={isVerifying}
            >
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>

            <p className="text-xs text-muted-foreground text-center">
              For demo purposes, use OTP: <span className="font-mono font-semibold">123456</span>
            </p>
          </div>

          {localError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{localError}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center">
            <Button
              variant="link"
              size="sm"
              onClick={handleResend}
              disabled={isResending || isVerifying}
              className="text-xs"
            >
              {isResending ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Resending...
                </>
              ) : (
                'Resend OTP'
              )}
            </Button>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isVerifying || isResending}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleVerify}
            disabled={otp.length !== 6 || isVerifying || isResending}
            className="w-full sm:w-auto"
          >
            {isVerifying ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Verify & Add Money
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

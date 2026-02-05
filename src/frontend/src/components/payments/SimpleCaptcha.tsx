import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RefreshCw } from 'lucide-react';

interface SimpleCaptchaProps {
  onVerify: () => void;
}

export default function SimpleCaptcha({ onVerify }: SimpleCaptchaProps) {
  const [captchaText, setCaptchaText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [error, setError] = useState('');

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(result);
    setUserInput('');
    setError('');
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleVerify = () => {
    if (userInput.toUpperCase() === captchaText) {
      onVerify();
    } else {
      setError('Incorrect code. Please try again.');
      generateCaptcha();
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="captcha">Verify you're human</Label>
        <p className="text-sm text-muted-foreground mt-1">Enter the code shown below</p>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 bg-muted rounded-lg p-4 select-none">
          <div
            className="text-2xl font-bold tracking-widest text-center"
            style={{
              fontFamily: 'monospace',
              letterSpacing: '0.3em',
              textDecoration: 'line-through',
              textDecorationStyle: 'wavy',
              textDecorationColor: 'hsl(var(--primary))',
            }}
          >
            {captchaText}
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={generateCaptcha}
          title="Generate new code"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2">
        <Input
          id="captcha"
          type="text"
          placeholder="Enter code"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          className="text-center tracking-widest uppercase"
          maxLength={6}
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <Button onClick={handleVerify} className="w-full" disabled={userInput.length !== 6}>
        Verify & Continue
      </Button>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp } from 'lucide-react';
import { useGetCallerWalletBalance } from '../../hooks/useWallet';
import { formatWalletAmount, currencyToLabel } from '../../utils/walletCurrency';
import { Skeleton } from '@/components/ui/skeleton';

export default function WalletBalancesCard() {
  const { data: balances, isLoading } = useGetCallerWalletBalance();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Wallet Balances
          </CardTitle>
          <CardDescription>Your available funds across currencies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasBalances = balances && balances.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Wallet Balances
        </CardTitle>
        <CardDescription>Your available funds across currencies</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasBalances ? (
          <div className="text-center py-8 text-muted-foreground">
            <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No balances yet. Add money to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {balances.map((balance, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{currencyToLabel(balance.currency)}</p>
                    <p className="text-sm text-muted-foreground">Available</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">{formatWalletAmount(balance.amount, balance.currency)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

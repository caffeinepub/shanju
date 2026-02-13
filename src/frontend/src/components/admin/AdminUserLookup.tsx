import { useState } from 'react';
import { useUserAccount } from '../../hooks/useAdminPanel';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Search, AlertCircle, User, Wallet, History } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';
import { currencyToCode } from '../../utils/walletCurrency';
import { format } from 'date-fns';

export default function AdminUserLookup() {
  const [principalInput, setPrincipalInput] = useState('');
  const [searchPrincipal, setSearchPrincipal] = useState<string | null>(null);
  const { data: userData, isLoading, error } = useUserAccount(searchPrincipal);

  const handleSearch = () => {
    if (principalInput.trim()) {
      setSearchPrincipal(principalInput.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="flex-1">
          <Label htmlFor="principal">Principal ID</Label>
          <Input
            id="principal"
            placeholder="Enter user principal ID..."
            value={principalInput}
            onChange={(e) => setPrincipalInput(e.target.value)}
            onKeyPress={handleKeyPress}
            className="font-mono"
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleSearch} disabled={!principalInput.trim() || isLoading}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading user data...</p>
          </div>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error instanceof Error ? error.message : 'Failed to load user data'}
          </AlertDescription>
        </Alert>
      )}

      {!isLoading && !error && userData && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                <CardTitle>User Profile</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-muted-foreground">Principal</Label>
                <p className="font-mono text-sm break-all">{searchPrincipal}</p>
              </div>
              {userData.profile && (
                <div>
                  <Label className="text-muted-foreground">Name</Label>
                  <p>{userData.profile.name}</p>
                </div>
              )}
              {!userData.profile && (
                <p className="text-sm text-muted-foreground">No profile information available.</p>
              )}
            </CardContent>
          </Card>

          {userData.personalAccount && (
            <Card>
              <CardHeader>
                <CardTitle>Personal Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Full Name</Label>
                    <p>{userData.personalAccount.fullName}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Email</Label>
                    <p>{userData.personalAccount.email}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p>{userData.personalAccount.phone}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Tax ID</Label>
                    <p>{userData.personalAccount.taxId}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">NID</Label>
                    <p>{userData.personalAccount.nid}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Address</Label>
                    <p className="text-sm">{userData.personalAccount.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                <CardTitle>Wallet Balances</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {userData.walletBalances && userData.walletBalances.length > 0 ? (
                <div className="space-y-2">
                  {userData.walletBalances.map((balance, index) => (
                    <div key={index} className="flex justify-between items-center py-2">
                      <span className="font-medium">{currencyToCode(balance.currency)}</span>
                      <span className="font-mono">
                        {formatCurrency(balance.amount, currencyToCode(balance.currency))}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No wallet balances found.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-primary" />
                <CardTitle>Transaction History</CardTitle>
              </div>
              <CardDescription>Recent wallet transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {userData.transactions && userData.transactions.length > 0 ? (
                <div className="space-y-3">
                  {userData.transactions.slice(0, 10).map((tx) => (
                    <div key={tx.id.toString()} className="border-b pb-3 last:border-0">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium capitalize">
                          {tx.transactionType.__kind__.replace(/_/g, ' ')}
                        </span>
                        <span className="font-mono text-sm">
                          {formatCurrency(tx.amount, currencyToCode(tx.currency))}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(Number(tx.timestamp) / 1000000), 'PPp')}
                      </div>
                      {tx.reference && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Ref: {tx.reference}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No transactions found.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!isLoading && !error && searchPrincipal && !userData && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No user found with the provided principal ID.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

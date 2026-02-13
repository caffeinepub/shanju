import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, ArrowUpRight, ArrowDownLeft, Plus, Minus, Loader2 } from 'lucide-react';
import { useGetCallerTransactionHistory } from '../../hooks/useWallet';
import { formatWalletAmount, currencyToLabel } from '../../utils/walletCurrency';
import type { Transaction, TransactionStatus } from '../../backend';

function getTransactionIcon(type: Transaction['transactionType']) {
  if (type.__kind__ === 'transfer_out') return <ArrowUpRight className="h-4 w-4 text-orange-500" />;
  if (type.__kind__ === 'transfer_in') return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
  if (type.__kind__ === 'funding') return <Plus className="h-4 w-4 text-blue-500" />;
  if (type.__kind__ === 'cash_out') return <Minus className="h-4 w-4 text-red-500" />;
  return <History className="h-4 w-4" />;
}

function getTransactionLabel(type: Transaction['transactionType']): string {
  if (type.__kind__ === 'transfer_out') return 'Sent';
  if (type.__kind__ === 'transfer_in') return 'Received';
  if (type.__kind__ === 'funding') return 'Added Money';
  if (type.__kind__ === 'cash_out') return 'Cash Out';
  if (type.__kind__ === 'deposit') return 'Deposit';
  if (type.__kind__ === 'withdrawal') return 'Withdrawal';
  return 'Transaction';
}

function getStatusBadge(status: TransactionStatus) {
  if (status === 'completed') {
    return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Completed</Badge>;
  }
  if (status === 'pending') {
    return <Badge variant="secondary">Pending</Badge>;
  }
  if (status === 'failed') {
    return <Badge variant="destructive">Failed</Badge>;
  }
  return <Badge variant="outline">{status}</Badge>;
}

function formatTimestamp(timestamp: bigint): string {
  const date = new Date(Number(timestamp) / 1000000); // Convert nanoseconds to milliseconds
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTransactionDetails(tx: Transaction): string {
  if (tx.transactionType.__kind__ === 'transfer_in' && tx.sender) {
    return `From: ${tx.sender.toString().slice(0, 8)}...${tx.sender.toString().slice(-6)}`;
  }
  if (tx.transactionType.__kind__ === 'transfer_out' && tx.receiver) {
    return `To: ${tx.receiver.toString().slice(0, 8)}...${tx.receiver.toString().slice(-6)}`;
  }
  if (tx.transactionType.__kind__ === 'funding') {
    return tx.reference || 'Bank/Card funding';
  }
  if (tx.transactionType.__kind__ === 'cash_out') {
    const provider = tx.transactionType.cash_out.provider;
    return `Via ${provider.charAt(0).toUpperCase() + provider.slice(1)}`;
  }
  if (tx.reference) {
    return tx.reference;
  }
  return '—';
}

export default function WalletHistoryTable() {
  const { data: transactions, isLoading } = useGetCallerTransactionHistory();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>Your recent wallet activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasTransactions = transactions && transactions.length > 0;
  const sortedTransactions = hasTransactions
    ? [...transactions].sort((a, b) => Number(b.timestamp - a.timestamp))
    : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Transaction History
        </CardTitle>
        <CardDescription>Your recent wallet activity</CardDescription>
      </CardHeader>
      <CardContent>
        {!hasTransactions ? (
          <div className="text-center py-12 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No transactions yet</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTransactions.map((tx) => (
                  <TableRow key={tx.id.toString()}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getTransactionIcon(tx.transactionType)}
                        <span className="font-medium">{getTransactionLabel(tx.transactionType)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {getTransactionDetails(tx)}
                    </TableCell>
                    <TableCell className="font-mono">
                      {formatWalletAmount(tx.amount, tx.currency)}
                    </TableCell>
                    <TableCell>{getStatusBadge(tx.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatTimestamp(tx.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

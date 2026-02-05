import PaymentsTable from '../components/payments/PaymentsTable';

export default function PaymentHistoryPage() {
  return (
    <div className="container py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
        <p className="text-muted-foreground mt-1">View all your payment requests and their status</p>
      </div>
      <PaymentsTable />
    </div>
  );
}


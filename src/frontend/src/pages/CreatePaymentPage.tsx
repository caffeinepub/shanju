import PaymentForm from '../components/payments/PaymentForm';

export default function CreatePaymentPage() {
  return (
    <div className="container py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Payment Request</h1>
        <p className="text-muted-foreground mt-1">
          Create a new payment request in any currency worldwide
        </p>
      </div>
      <PaymentForm />
    </div>
  );
}

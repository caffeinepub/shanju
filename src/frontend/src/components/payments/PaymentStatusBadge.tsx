import { Badge } from '@/components/ui/badge';
import { PaymentStatus } from '../../backend';

interface PaymentStatusBadgeProps {
  status: PaymentStatus;
}

export default function PaymentStatusBadge({ status }: PaymentStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case PaymentStatus.pending:
        return { label: 'Pending', variant: 'secondary' as const };
      case PaymentStatus.completed:
        return { label: 'Completed', variant: 'default' as const };
      case PaymentStatus.cancelled:
        return { label: 'Cancelled', variant: 'destructive' as const };
      default:
        return { label: 'Unknown', variant: 'outline' as const };
    }
  };

  const { label, variant } = getStatusConfig();

  return <Badge variant={variant}>{label}</Badge>;
}


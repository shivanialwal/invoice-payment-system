import type { PaymentStatus } from '../types';
import './StatusBadge.css';

const labels: Record<PaymentStatus, string> = {
  PAID: 'Paid',
  PENDING: 'Pending',
  OVERDUE: 'Overdue',
};

export function StatusBadge({ status }: { status: PaymentStatus }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      {labels[status]}
    </span>
  );
}

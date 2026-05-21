import type { InvoiceStatus } from '../types';
import './StatusBadge.css';

const labels: Record<InvoiceStatus, string> = {
  DRAFT: 'Draft',
  PAID: 'Paid',
  PENDING: 'Pending',
  OVERDUE: 'Overdue',
  CANCELLED: 'Cancelled',
};

export function StatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className={`status-badge status-${status.toLowerCase()}`}>
      {labels[status]}
    </span>
  );
}

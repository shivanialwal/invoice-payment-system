import { Link } from 'react-router-dom';
import { InvoiceTable } from '../components/InvoiceTable';
import { StatCard } from '../components/StatCard';
import { computeDashboardStats, mockInvoices } from '../data/mockInvoices';
import { formatCurrency } from '../utils/format';
import './pages.css';

const stats = computeDashboardStats(mockInvoices);
const recent = [...mockInvoices].sort(
  (a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime(),
).slice(0, 4);

export function DashboardPage() {
  return (
    <>
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of invoices, payments, and what needs attention.</p>
      </header>

      <div className="stats-grid">
        <StatCard
          label="Collected revenue"
          value={formatCurrency(stats.totalRevenue)}
          hint="From paid invoices"
        />
        <StatCard label="Paid" value={String(stats.paidCount)} variant="paid" />
        <StatCard label="Pending" value={String(stats.pendingCount)} variant="pending" />
        <StatCard label="Overdue" value={String(stats.overdueCount)} variant="overdue" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>
          Recent invoices
        </h2>
        <Link to="/invoices/new" className="btn btn-primary">
          + New invoice
        </Link>
      </div>

      <InvoiceTable invoices={recent} />

      <div className="alert alert-info" style={{ marginTop: '1.5rem' }}>
        <strong>How this maps to the backend:</strong> Dashboard stats will come from{' '}
        <code className="mono">GET /api/invoices/stats</code>. Payment reminders and Razorpay/UPI
        webhooks will update status in real time once Spring Boot endpoints exist.
      </div>
    </>
  );
}

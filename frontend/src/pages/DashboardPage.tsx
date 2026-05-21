import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { invoiceApi } from '../api/client';
import { InvoiceTable } from '../components/InvoiceTable';
import { StatCard } from '../components/StatCard';
import type { DashboardStats, Invoice } from '../types';
import { formatCurrency } from '../utils/format';
import './pages.css';

function computeStats(invoices: Invoice[]): DashboardStats {
  return invoices.reduce(
    (acc, inv) => {
      if (inv.status === 'PAID') {
        acc.paidCount++;
        acc.totalRevenue += inv.totalAmount;
      } else if (inv.status === 'PENDING') {
        acc.pendingCount++;
      } else if (inv.status === 'OVERDUE') {
        acc.overdueCount++;
      }
      return acc;
    },
    { totalRevenue: 0, paidCount: 0, pendingCount: 0, overdueCount: 0 } as DashboardStats,
  );
}

export function DashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    invoiceApi.getAll()
      .then(setInvoices)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = computeStats(invoices);
  const recent = [...invoices]
    .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
    .slice(0, 5);

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
        <h2 className="section-title" style={{ margin: 0 }}>Recent invoices</h2>
        <Link to="/invoices/new" className="btn btn-primary">+ New invoice</Link>
      </div>

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}
      {error && <div className="alert alert-warn">Could not load invoices: {error}</div>}
      {!loading && !error && <InvoiceTable invoices={recent} />}
    </>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { dashboardApi, invoiceApi } from '../api/client';
import type { DashboardStats } from '../api/client';
import { InvoiceTable } from '../components/InvoiceTable';
import { StatCard } from '../components/StatCard';
import type { Invoice } from '../types';
import { formatCurrency } from '../utils/format';
import './pages.css';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([dashboardApi.getStats(), invoiceApi.getAll()])
      .then(([s, invoices]) => {
        setStats(s);
        setRecent(
          [...invoices]
            .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime())
            .slice(0, 5)
        );
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <header className="page-header">
        <h1>Dashboard</h1>
        <p>Overview of invoices, payments, and what needs attention.</p>
      </header>

      {error && <div className="alert alert-warn">Could not load data: {error}</div>}

      <div className="stats-grid">
        <StatCard
          label="Collected revenue"
          value={stats ? formatCurrency(stats.totalRevenue) : '—'}
          hint="From paid invoices"
        />
        <StatCard label="Paid"    value={stats ? String(stats.paidCount)    : '—'} variant="paid" />
        <StatCard label="Pending" value={stats ? String(stats.pendingCount) : '—'} variant="pending" />
        <StatCard label="Overdue" value={stats ? String(stats.overdueCount) : '—'} variant="overdue" />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="section-title" style={{ margin: 0 }}>Recent invoices</h2>
        <Link to="/invoices/new" className="btn btn-primary">+ New invoice</Link>
      </div>

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}
      {!loading && !error && <InvoiceTable invoices={recent} />}
    </>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { invoiceApi } from '../api/client';
import { InvoiceTable } from '../components/InvoiceTable';
import type { Invoice } from '../types';
import './pages.css';

export function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    invoiceApi.getAll()
      .then(setInvoices)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <header className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Invoices</h1>
            <p>Create, send, and track payment status for every client.</p>
          </div>
          <Link to="/invoices/new" className="btn btn-primary">+ New invoice</Link>
        </div>
      </header>

      {loading && <p style={{ color: 'var(--text-muted)' }}>Loading…</p>}
      {error && <div className="alert alert-warn">Could not load invoices: {error}</div>}
      {!loading && !error && <InvoiceTable invoices={invoices} />}
    </>
  );
}

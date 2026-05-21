import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { invoiceApi } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import type { Invoice } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import './pages.css';

export function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    invoiceApi.getById(Number(id))
      .then(setInvoice)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p style={{ color: 'var(--text-muted)', padding: '2rem' }}>Loading…</p>;
  if (error || !invoice) {
    return (
      <div className="card">
        <p>{error ?? 'Invoice not found.'}</p>
        <Link to="/invoices">← Back to invoices</Link>
      </div>
    );
  }

  const canPay = invoice.status !== 'PAID' && invoice.status !== 'CANCELLED';

  return (
    <>
      <header className="page-header">
        <Link to="/invoices" style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600 }}>
          ← Invoices
        </Link>
        <h1 style={{ marginTop: '0.5rem' }}>
          <span className="mono">{invoice.invoiceNumber}</span>
        </h1>
        <p>
          {invoice.clientName} · <StatusBadge status={invoice.status} />
        </p>
      </header>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="form-row">
          <div>
            <span className="stat-label">Client email</span>
            <p style={{ margin: '0.25rem 0 0' }}>{invoice.clientEmail}</p>
          </div>
          {invoice.clientPhone && (
            <div>
              <span className="stat-label">Phone</span>
              <p style={{ margin: '0.25rem 0 0' }}>{invoice.clientPhone}</p>
            </div>
          )}
          <div>
            <span className="stat-label">Issued</span>
            <p style={{ margin: '0.25rem 0 0' }}>{formatDate(invoice.issueDate)}</p>
          </div>
          <div>
            <span className="stat-label">Due date</span>
            <p style={{ margin: '0.25rem 0 0' }}>{formatDate(invoice.dueDate)}</p>
          </div>
          <div>
            <span className="stat-label">Amount paid</span>
            <p style={{ margin: '0.25rem 0 0' }}>{formatCurrency(invoice.paidAmount)}</p>
          </div>
        </div>
        {invoice.notes && (
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {invoice.notes}
          </p>
        )}
      </div>

      <div className="card">
        <h2 className="section-title">Line items</h2>
        <table className="line-items-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
                <td>{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.25rem', marginTop: '1rem' }}>
          {formatCurrency(invoice.totalAmount)}
        </p>
      </div>

      {canPay && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h2 className="section-title">Collect payment</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.5rem' }}>
            Razorpay checkout and UPI integration coming in Phase 3.
          </p>
          <div className="payment-actions">
            <button type="button" className="btn btn-primary" onClick={() => alert('Razorpay — Phase 3')}>
              Pay with Razorpay
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => alert('UPI — Phase 3')}>
              Pay via UPI
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => alert('Reminder — Phase 2')}>
              Send reminder
            </button>
          </div>
        </div>
      )}

      {invoice.status === 'OVERDUE' && (
        <div className="alert alert-warn" style={{ marginTop: '1rem' }}>
          This invoice is overdue. Auto-reminders via Spring Mail coming in Phase 2.
        </div>
      )}
    </>
  );
}

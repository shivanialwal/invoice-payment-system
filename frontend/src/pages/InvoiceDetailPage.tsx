import { Link, useParams } from 'react-router-dom';
import { StatusBadge } from '../components/StatusBadge';
import { lineItemsTotal, mockInvoices } from '../data/mockInvoices';
import { formatCurrency, formatDate } from '../utils/format';
import './pages.css';

export function InvoiceDetailPage() {
  const { id } = useParams();
  const invoice = mockInvoices.find((inv) => inv.id === id);

  if (!invoice) {
    return (
      <div className="card">
        <p>Invoice not found.</p>
        <Link to="/invoices">← Back to invoices</Link>
      </div>
    );
  }

  const total = lineItemsTotal(invoice.lineItems);
  const canPay = invoice.status !== 'PAID';

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
          <div>
            <span className="stat-label">Due date</span>
            <p style={{ margin: '0.25rem 0 0' }}>{formatDate(invoice.dueDate)}</p>
          </div>
          <div>
            <span className="stat-label">Issued</span>
            <p style={{ margin: '0.25rem 0 0' }}>{formatDate(invoice.issueDate)}</p>
          </div>
          <div>
            <span className="stat-label">Payment</span>
            <p style={{ margin: '0.25rem 0 0' }}>{invoice.paymentMethod}</p>
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
              <th>Unit</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {invoice.lineItems.map((item) => (
              <tr key={item.id}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>{formatCurrency(item.unitPrice)}</td>
                <td>{formatCurrency(item.quantity * item.unitPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ textAlign: 'right', fontWeight: 700, fontSize: '1.25rem', marginTop: '1rem' }}>
          {formatCurrency(total)}
        </p>
      </div>

      {canPay && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h2 className="section-title">Collect payment</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 0.5rem' }}>
            Client-facing flow: Razorpay checkout link or UPI QR / intent. Webhooks mark invoice as
            paid.
          </p>
          <div className="payment-actions">
            <button type="button" className="btn btn-primary" onClick={() => alert('Razorpay — opens checkout (mock)')}>
              Pay with Razorpay
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => alert('UPI — show QR / VPA (mock)')}>
              Pay via UPI
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => alert('Reminder email — POST /api/invoices/{id}/remind (mock)')}
            >
              Send reminder
            </button>
          </div>
        </div>
      )}

      {invoice.status === 'OVERDUE' && (
        <div className="alert alert-warn" style={{ marginTop: '1rem' }}>
          This invoice is overdue. Auto-reminders will run on a schedule via Spring Mail.
        </div>
      )}
    </>
  );
}

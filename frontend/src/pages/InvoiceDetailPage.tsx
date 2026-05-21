import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { invoiceApi, paymentApi } from '../api/client';
import { StatusBadge } from '../components/StatusBadge';
import type { Invoice } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import './pages.css';

export function InvoiceDetailPage() {
  const { id } = useParams();
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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

  // TypeScript loses null-narrowing inside async closures — capture it here
  const inv = invoice;
  const canPay = inv.status !== 'PAID' && inv.status !== 'CANCELLED';

  async function handleAction(type: 'send' | 'remind') {
    setActionLoading(type);
    setActionMsg(null);
    try {
      const res = await invoiceApi[type](inv.id);
      setActionMsg(res.message);
    } catch (e: unknown) {
      setActionMsg(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRazorpay() {
    setActionLoading('razorpay');
    setActionMsg(null);
    try {
      const order = await paymentApi.createOrder(inv.id);
      const options = {
        key: order.razorpayKeyId,
        amount: order.amount * 100,
        currency: order.currency,
        name: 'InvoicePay',
        description: `Payment for ${inv.invoiceNumber}`,
        order_id: order.orderId,
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          await paymentApi.verify(inv.id, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          setActionMsg('Payment successful! Invoice marked as paid.');
          setInvoice({ ...inv, status: 'PAID' as const });
        },
        prefill: { email: inv.clientEmail, name: inv.clientName },
        theme: { color: '#6c63ff' },
      };
      // @ts-expect-error — Razorpay loaded via CDN script tag
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (e: unknown) {
      setActionMsg(e instanceof Error ? e.message : 'Payment failed');
    } finally {
      setActionLoading(null);
    }
  }

  async function handleUpi() {
    setActionLoading('upi');
    try {
      const order = await paymentApi.createOrder(inv.id);
      window.location.href = order.upiLink;
    } catch (e: unknown) {
      setActionMsg(e instanceof Error ? e.message : 'UPI link failed');
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <>
      <header className="page-header">
        <Link to="/invoices" style={{ fontSize: '0.9rem', color: 'var(--accent)', fontWeight: 600 }}>
          ← Invoices
        </Link>
        <h1 style={{ marginTop: '0.5rem' }}>
          <span className="mono">{inv.invoiceNumber}</span>
        </h1>
        <p>
          {inv.clientName} · <StatusBadge status={inv.status} />
        </p>
      </header>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="form-row">
          <div>
            <span className="stat-label">Client email</span>
            <p style={{ margin: '0.25rem 0 0' }}>{inv.clientEmail}</p>
          </div>
          {inv.clientPhone && (
            <div>
              <span className="stat-label">Phone</span>
              <p style={{ margin: '0.25rem 0 0' }}>{inv.clientPhone}</p>
            </div>
          )}
          <div>
            <span className="stat-label">Issued</span>
            <p style={{ margin: '0.25rem 0 0' }}>{formatDate(inv.issueDate)}</p>
          </div>
          <div>
            <span className="stat-label">Due date</span>
            <p style={{ margin: '0.25rem 0 0' }}>{formatDate(inv.dueDate)}</p>
          </div>
          <div>
            <span className="stat-label">Amount paid</span>
            <p style={{ margin: '0.25rem 0 0' }}>{formatCurrency(inv.paidAmount)}</p>
          </div>
        </div>
        {inv.notes && (
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {inv.notes}
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
            {inv.lineItems.map((item) => (
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
          {formatCurrency(inv.totalAmount)}
        </p>
      </div>

      {actionMsg && (
        <div className="alert alert-info" style={{ marginTop: '1rem' }}>{actionMsg}</div>
      )}

      {canPay && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h2 className="section-title">Actions</h2>
          <div className="payment-actions">
            <button
              type="button" className="btn btn-primary"
              disabled={actionLoading === 'send'}
              onClick={() => handleAction('send')}
            >
              {actionLoading === 'send' ? 'Sending…' : 'Send invoice'}
            </button>
            <button
              type="button" className="btn btn-secondary"
              disabled={actionLoading === 'remind'}
              onClick={() => handleAction('remind')}
            >
              {actionLoading === 'remind' ? 'Sending…' : 'Send reminder'}
            </button>
            <button
              type="button" className="btn btn-primary"
              disabled={actionLoading === 'razorpay'}
              onClick={() => handleRazorpay()}
            >
              {actionLoading === 'razorpay' ? 'Opening…' : 'Pay with Razorpay'}
            </button>
            <button
              type="button" className="btn btn-secondary"
              disabled={actionLoading === 'upi'}
              onClick={() => handleUpi()}
            >
              {actionLoading === 'upi' ? 'Loading…' : 'Pay via UPI'}
            </button>
          </div>
        </div>
      )}

      {inv.status === 'OVERDUE' && (
        <div className="alert alert-warn" style={{ marginTop: '1rem' }}>
          This invoice is overdue. Auto-reminders via Spring Mail coming in Phase 2.
        </div>
      )}
    </>
  );
}

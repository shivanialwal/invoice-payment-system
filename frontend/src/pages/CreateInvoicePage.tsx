import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoiceApi } from '../api/client';
import type { InvoiceRequest } from '../types';
import { formatCurrency } from '../utils/format';
import './pages.css';

interface LineItemRow {
  tempId: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export function CreateInvoicePage() {
  const navigate = useNavigate();
  const today = new Date().toISOString().split('T')[0];

  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [issueDate, setIssueDate] = useState(today);
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [lineItems, setLineItems] = useState<LineItemRow[]>([
    { tempId: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 },
  ]);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const total = lineItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  function addLineItem() {
    setLineItems((prev) => [
      ...prev,
      { tempId: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 },
    ]);
  }

  function removeLineItem(tempId: string) {
    setLineItems((prev) => prev.filter((i) => i.tempId !== tempId));
  }

  function updateLineItem(tempId: string, field: keyof LineItemRow, value: string | number) {
    setLineItems((prev) =>
      prev.map((item) => (item.tempId === tempId ? { ...item, [field]: value } : item)),
    );
  }

  async function handleAiGenerate() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    // Simulated until Anthropic backend endpoint is wired (Phase 4)
    await new Promise((r) => setTimeout(r, 800));
    setLineItems([
      { tempId: crypto.randomUUID(), description: 'UI/UX design — 5 screens', quantity: 5, unitPrice: 12000 },
      { tempId: crypto.randomUUID(), description: 'React frontend implementation', quantity: 1, unitPrice: 65000 },
      { tempId: crypto.randomUUID(), description: 'QA & deployment support', quantity: 8, unitPrice: 3500 },
    ]);
    setAiLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);

    const payload: InvoiceRequest = {
      clientName,
      clientEmail,
      clientPhone: clientPhone || undefined,
      clientAddress: clientAddress || undefined,
      issueDate,
      dueDate,
      notes: notes || undefined,
      lineItems: lineItems.map(({ description, quantity, unitPrice }) => ({
        description,
        quantity,
        unitPrice,
      })),
    };

    try {
      const created = await invoiceApi.create(payload);
      navigate(`/invoices/${created.id}`);
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to create invoice');
      setSubmitting(false);
    }
  }

  return (
    <>
      <header className="page-header">
        <h1>New invoice</h1>
        <p>Fill in client details, add line items, then save.</p>
      </header>

      <form onSubmit={handleSubmit} className="form-grid">

        {/* AI panel */}
        <div className="ai-panel">
          <h3>AI line items</h3>
          <p>Describe the work in plain English — AI will suggest line items (Phase 4 wires real Anthropic API).</p>
          <div className="ai-row">
            <input
              type="text"
              placeholder="e.g. Website redesign for a bakery, 3 weeks, includes hosting"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleAiGenerate}
              disabled={aiLoading || !aiPrompt.trim()}
            >
              {aiLoading ? 'Generating…' : 'Generate'}
            </button>
          </div>
        </div>

        {/* Client details */}
        <div className="card">
          <h2 className="section-title">Client</h2>
          <div className="form-row">
            <div className="field">
              <label htmlFor="clientName">Name *</label>
              <input id="clientName" required value={clientName} onChange={(e) => setClientName(e.target.value)} placeholder="Acme Corp" />
            </div>
            <div className="field">
              <label htmlFor="clientEmail">Email *</label>
              <input id="clientEmail" type="email" required value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="billing@acme.com" />
            </div>
          </div>
          <div className="form-row" style={{ marginTop: '1rem' }}>
            <div className="field">
              <label htmlFor="clientPhone">Phone</label>
              <input id="clientPhone" value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} placeholder="+91 98765 43210" />
            </div>
            <div className="field">
              <label htmlFor="clientAddress">Address</label>
              <input id="clientAddress" value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="Mumbai, Maharashtra" />
            </div>
          </div>
          <div className="form-row" style={{ marginTop: '1rem' }}>
            <div className="field">
              <label htmlFor="issueDate">Issue date *</label>
              <input id="issueDate" type="date" required value={issueDate} onChange={(e) => setIssueDate(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="dueDate">Due date *</label>
              <input id="dueDate" type="date" required value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: '1rem' }}>
            <div className="field">
              <label htmlFor="notes">Notes</label>
              <input id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Payment terms, thank-you note…" />
            </div>
          </div>
        </div>

        {/* Line items */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="section-title" style={{ margin: 0 }}>Line items</h2>
            <button type="button" className="btn btn-secondary" onClick={addLineItem}>+ Add row</button>
          </div>
          <table className="line-items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit price (₹)</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.tempId}>
                  <td>
                    <input required value={item.description} onChange={(e) => updateLineItem(item.tempId, 'description', e.target.value)} placeholder="Service or product" />
                  </td>
                  <td style={{ width: 80 }}>
                    <input type="number" min={1} value={item.quantity} onChange={(e) => updateLineItem(item.tempId, 'quantity', parseInt(e.target.value, 10) || 1)} />
                  </td>
                  <td style={{ width: 140 }}>
                    <input type="number" min={0} value={item.unitPrice || ''} onChange={(e) => updateLineItem(item.tempId, 'unitPrice', parseFloat(e.target.value) || 0)} />
                  </td>
                  <td>{formatCurrency(item.quantity * item.unitPrice)}</td>
                  <td>
                    {lineItems.length > 1 && (
                      <button type="button" onClick={() => removeLineItem(item.tempId)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1rem' }}>✕</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ textAlign: 'right', fontWeight: 700, marginTop: '1rem' }}>
            Total: {formatCurrency(total)}
          </p>
        </div>

        {submitError && <div className="alert alert-warn">{submitError}</div>}

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Save invoice'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/invoices')}>
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}

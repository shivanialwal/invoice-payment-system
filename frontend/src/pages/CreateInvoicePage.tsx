import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LineItem } from '../types';
import { formatCurrency } from '../utils/format';
import './pages.css';

const demoAiItems: Omit<LineItem, 'id'>[] = [
  { description: 'UI/UX design — 5 screens', quantity: 5, unitPrice: 12000 },
  { description: 'React frontend implementation', quantity: 1, unitPrice: 65000 },
  { description: 'QA & deployment support', quantity: 8, unitPrice: 3500 },
];

export function CreateInvoicePage() {
  const navigate = useNavigate();
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 },
  ]);
  const [aiLoading, setAiLoading] = useState(false);

  const total = lineItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0);

  function addLineItem() {
    setLineItems((items) => [
      ...items,
      { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 },
    ]);
  }

  function updateLineItem(id: string, field: keyof LineItem, value: string | number) {
    setLineItems((items) =>
      items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  async function handleAiGenerate() {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    // Simulates POST /api/invoices/ai/line-items until backend exists
    await new Promise((r) => setTimeout(r, 800));
    setLineItems(
      demoAiItems.map((item) => ({
        ...item,
        id: crypto.randomUUID(),
      })),
    );
    setAiLoading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    alert(
      `Invoice draft saved locally (mock).\nClient: ${clientName}\nTotal: ${formatCurrency(total)}\n\nWill POST to /api/invoices when backend is ready.`,
    );
    navigate('/invoices');
  }

  return (
    <>
      <header className="page-header">
        <h1>New invoice</h1>
        <p>Fill in client details, line items, then send with Razorpay or UPI link.</p>
      </header>

      <form onSubmit={handleSubmit} className="form-grid">
        <div className="ai-panel">
          <h3>AI line items</h3>
          <p>
            Describe the work in plain English — the backend will call Anthropic to suggest line
            items (demo uses sample data until API is wired).
          </p>
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

        <div className="card">
          <h2 className="section-title">Client</h2>
          <div className="form-row">
            <div className="field">
              <label htmlFor="clientName">Client name</label>
              <input
                id="clientName"
                required
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Acme Corp"
              />
            </div>
            <div className="field">
              <label htmlFor="clientEmail">Email</label>
              <input
                id="clientEmail"
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="billing@acme.com"
              />
            </div>
          </div>
          <div className="form-row" style={{ marginTop: '1rem' }}>
            <div className="field">
              <label htmlFor="dueDate">Due date</label>
              <input
                id="dueDate"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="notes">Notes (optional)</label>
              <input
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Payment terms, thank-you note…"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              Line items
            </h2>
            <button type="button" className="btn btn-secondary" onClick={addLineItem}>
              + Add row
            </button>
          </div>
          <table className="line-items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Qty</th>
                <th>Unit price (₹)</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {lineItems.map((item) => (
                <tr key={item.id}>
                  <td>
                    <input
                      required
                      value={item.description}
                      onChange={(e) => updateLineItem(item.id, 'description', e.target.value)}
                      placeholder="Service or product"
                    />
                  </td>
                  <td style={{ width: 80 }}>
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) =>
                        updateLineItem(item.id, 'quantity', parseInt(e.target.value, 10) || 1)
                      }
                    />
                  </td>
                  <td style={{ width: 120 }}>
                    <input
                      type="number"
                      min={0}
                      value={item.unitPrice || ''}
                      onChange={(e) =>
                        updateLineItem(item.id, 'unitPrice', parseInt(e.target.value, 10) || 0)
                      }
                    />
                  </td>
                  <td>{formatCurrency(item.quantity * item.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ textAlign: 'right', fontWeight: 700, marginTop: '1rem' }}>
            Total: {formatCurrency(total)}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button type="submit" className="btn btn-primary">
            Save & send (mock)
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => navigate('/invoices')}>
            Cancel
          </button>
        </div>
      </form>
    </>
  );
}

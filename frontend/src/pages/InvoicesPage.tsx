import { Link } from 'react-router-dom';
import { InvoiceTable } from '../components/InvoiceTable';
import { mockInvoices } from '../data/mockInvoices';
import './pages.css';

export function InvoicesPage() {
  return (
    <>
      <header className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1>Invoices</h1>
            <p>Create, send, and track payment status for every client.</p>
          </div>
          <Link to="/invoices/new" className="btn btn-primary">
            + New invoice
          </Link>
        </div>
      </header>

      <InvoiceTable invoices={mockInvoices} />
    </>
  );
}

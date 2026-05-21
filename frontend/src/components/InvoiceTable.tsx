import { Link } from 'react-router-dom';
import type { Invoice } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { StatusBadge } from './StatusBadge';
import './InvoiceTable.css';

export function InvoiceTable({ invoices }: { invoices: Invoice[] }) {
  return (
    <div className="table-wrap">
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Invoice</th>
            <th>Client</th>
            <th>Due</th>
            <th>Amount</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td>
                <span className="mono inv-num">{inv.invoiceNumber}</span>
              </td>
              <td>
                <strong>{inv.clientName}</strong>
                <span className="client-email">{inv.clientEmail}</span>
              </td>
              <td>{formatDate(inv.dueDate)}</td>
              <td className="amount">{formatCurrency(inv.totalAmount)}</td>
              <td>
                <StatusBadge status={inv.status} />
              </td>
              <td>
                <Link to={`/invoices/${inv.id}`} className="link-btn">
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

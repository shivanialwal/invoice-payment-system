import type { DashboardStats, Invoice } from '../types';

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2026-001',
    clientName: 'Acme Corp',
    clientEmail: 'billing@acme.com',
    issueDate: '2026-05-01',
    dueDate: '2026-05-15',
    status: 'PAID',
    paymentMethod: 'RAZORPAY',
    lineItems: [
      { id: '1a', description: 'Web development — April', quantity: 40, unitPrice: 1500 },
      { id: '1b', description: 'Hosting & maintenance', quantity: 1, unitPrice: 5000 },
    ],
    notes: 'Thank you for your business!',
  },
  {
    id: '2',
    invoiceNumber: 'INV-2026-002',
    clientName: 'Bright Studio',
    clientEmail: 'accounts@brightstudio.io',
    issueDate: '2026-05-10',
    dueDate: '2026-05-24',
    status: 'PENDING',
    paymentMethod: 'UNPAID',
    lineItems: [
      { id: '2a', description: 'Brand identity package', quantity: 1, unitPrice: 45000 },
      { id: '2b', description: 'Social media templates (×12)', quantity: 12, unitPrice: 2500 },
    ],
  },
  {
    id: '3',
    invoiceNumber: 'INV-2026-003',
    clientName: 'Nova Retail',
    clientEmail: 'finance@novaretail.in',
    issueDate: '2026-04-20',
    dueDate: '2026-05-05',
    status: 'OVERDUE',
    paymentMethod: 'UNPAID',
    lineItems: [
      { id: '3a', description: 'E-commerce integration', quantity: 1, unitPrice: 85000 },
    ],
    notes: 'Payment reminder sent on May 8.',
  },
  {
    id: '4',
    invoiceNumber: 'INV-2026-004',
    clientName: 'GreenLeaf NGO',
    clientEmail: 'admin@greenleaf.org',
    issueDate: '2026-05-18',
    dueDate: '2026-06-01',
    status: 'PENDING',
    paymentMethod: 'UNPAID',
    lineItems: [
      { id: '4a', description: 'Annual report design', quantity: 1, unitPrice: 22000 },
      { id: '4b', description: 'Print-ready PDF export', quantity: 1, unitPrice: 8000 },
    ],
  },
];

export function lineItemsTotal(items: Invoice['lineItems']): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function computeDashboardStats(invoices: Invoice[]): DashboardStats {
  let paidCount = 0;
  let pendingCount = 0;
  let overdueCount = 0;
  let totalRevenue = 0;

  for (const inv of invoices) {
    const total = lineItemsTotal(inv.lineItems);
    if (inv.status === 'PAID') {
      paidCount++;
      totalRevenue += total;
    } else if (inv.status === 'PENDING') {
      pendingCount++;
    } else {
      overdueCount++;
    }
  }

  return { totalRevenue, paidCount, pendingCount, overdueCount };
}

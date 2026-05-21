// Mock data kept for reference only — all pages now use the real API.
// Not imported anywhere in production code.

import type { Invoice } from '../types';

export const mockInvoices: Invoice[] = [
  {
    id: 1,
    invoiceNumber: 'INV-2026-001',
    clientName: 'Acme Corp',
    clientEmail: 'billing@acme.com',
    totalAmount: 65000,
    paidAmount: 65000,
    issueDate: '2026-05-01',
    dueDate: '2026-05-15',
    status: 'PAID',
    lineItems: [
      { id: 1, description: 'Web development — April', quantity: 40, unitPrice: 1500, amount: 60000 },
      { id: 2, description: 'Hosting & maintenance', quantity: 1, unitPrice: 5000, amount: 5000 },
    ],
    notes: 'Thank you for your business!',
    createdAt: '2026-05-01T00:00:00',
    updatedAt: '2026-05-01T00:00:00',
  },
];

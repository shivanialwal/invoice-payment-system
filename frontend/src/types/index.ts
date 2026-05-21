export type PaymentStatus = 'PAID' | 'PENDING' | 'OVERDUE';

export type PaymentMethod = 'RAZORPAY' | 'UPI' | 'UNPAID';

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  lineItems: LineItem[];
  notes?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
}

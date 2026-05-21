export type InvoiceStatus = 'DRAFT' | 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface LineItem {
  id: number;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress?: string;
  totalAmount: number;
  paidAmount: number;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  notes?: string;
  lineItems: LineItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceRequest {
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress?: string;
  issueDate: string;
  dueDate: string;
  status?: InvoiceStatus;
  notes?: string;
  lineItems: {
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface DashboardStats {
  totalRevenue: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
}

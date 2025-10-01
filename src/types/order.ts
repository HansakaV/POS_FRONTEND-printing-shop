import type { OrderItem } from "./orderItem";

export interface Order  {
  _id: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  paidAmount: number;
  balanceAmount: number;
  status: 'pending' | 'completed' | 'cancelled';
  orderType: 'standard' | 'custom';
  createdAt?: string;
}
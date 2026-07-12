import apiClient from './client';

export interface SupportTicketItem {
  id: string;
  ticketNumber: string;
  userId: string | null;
  userRole: string | null;
  userName: string;
  userPhone: string;
  subject: string;
  message: string;
  type: string;
  status: string;
  priority: string;
  orderId: string | null;
  orderNumber: string | null;
  adminNotes: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SupportSummary {
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  total: number;
  byType: Array<{ type: string; count: number }>;
}

export const supportApi = {
  getSummary: () =>
    apiClient.get('/admin/support/summary') as Promise<{ data: SupportSummary }>,

  list: (params?: { type?: string; status?: string; search?: string; page?: number; limit?: number }) =>
    apiClient.get('/admin/support/tickets', { params }) as Promise<{
      data: { tickets: SupportTicketItem[]; total: number; page: number; limit: number; totalPages: number };
    }>,

  get: (ticketId: string) =>
    apiClient.get(`/admin/support/tickets/${ticketId}`) as Promise<{ data: SupportTicketItem }>,

  create: (payload: {
    subject: string;
    message: string;
    type?: string;
    priority?: string;
    userId?: string;
    userName?: string;
    userPhone?: string;
    userRole?: string;
    orderId?: string;
    orderNumber?: string;
  }) => apiClient.post('/admin/support/tickets', payload),

  update: (
    ticketId: string,
    payload: { status?: string; priority?: string; adminNotes?: string }
  ) => apiClient.patch(`/admin/support/tickets/${ticketId}`, payload),
};

import apiClient from './client';

export type AdminWithdrawRequest = {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  bankDetails: {
    accountHolder: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  bankDetailsFull?: {
    accountHolder: string;
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
  cook: { id: string; name: string; phone: string; email: string };
  cookNote?: string | null;
  adminNote?: string | null;
  payoutReference?: string | null;
  createdAt: string;
  paidAt?: string | null;
};

export const withdrawApi = {
  list: (status?: string) =>
    apiClient.get('/admin/withdrawals', { params: status ? { status } : {} }) as Promise<{
      data: { requests: AdminWithdrawRequest[]; total: number };
    }>,

  review: (requestId: string, approved: boolean, note?: string) =>
    apiClient.patch(`/admin/withdrawals/${requestId}/review`, { approved, note }),

  markPaid: (requestId: string, payoutReference: string, note?: string) =>
    apiClient.post(`/admin/withdrawals/${requestId}/mark-paid`, { payoutReference, note }),
};

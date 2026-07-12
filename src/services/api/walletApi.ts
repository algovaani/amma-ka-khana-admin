import apiClient from './client';

export interface WalletSummary {
  totalBalance: number;
  totalWallets: number;
  activeWallets: number;
  onHoldWallets: number;
  customersWithWallet: number;
  cooksWithWallet: number;
  transactionCount: number;
  todayCredits: number;
  todayDebits: number;
  todayTransactions: number;
}

export interface AdminWalletItem {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  phone: string;
  balance: number;
  currency: string;
  isOnHold: boolean;
  updatedAt: string;
}

export interface AdminWalletTransaction {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description: string;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: string;
}

export interface WalletOverviewResponse {
  summary: WalletSummary;
  wallets: AdminWalletItem[];
  transactions: AdminWalletTransaction[];
}

export const walletApi = {
  getOverview: (params?: { limit?: number }) =>
    apiClient.get('/admin/wallet/overview', { params }) as Promise<{ data: WalletOverviewResponse }>,
};

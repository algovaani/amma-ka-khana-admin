import apiClient from './client';

export interface AdminUserListItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  orders: number;
  status: string;
  walletBalance: number;
  walletHold: boolean;
  registeredAt: string;
}

export interface UserDetailResponse {
  user: {
    id: string;
    name: string;
    phone: string;
    email: string;
    role: string;
    status: string;
    authProvider: string;
    language: string;
    addresses: Array<{
      label: string;
      line1: string;
      city: string;
      area: string;
      pincode: string;
      isDefault: boolean;
    }>;
    registeredAt: string;
    lastLoginAt: string | null;
  };
  wallet: {
    balance: number;
    currency: string;
    isActive: boolean;
    isOnHold: boolean;
  };
  orders: Array<{
    id: string;
    orderNumber: string;
    role: string;
    status: string;
    paymentStatus: string;
    paymentMethod: string;
    total: number;
    itemsCount: number;
    createdAt: string;
  }>;
  transactions: Array<{
    id: string;
    type: string;
    amount: number;
    balanceAfter: number;
    description: string;
    referenceType: string | null;
    createdAt: string;
  }>;
  stats: {
    totalOrders: number;
    customerOrders: number;
    cookOrders: number;
    totalSpent: number;
    totalEarned: number;
  };
  cookProfile: {
    displayName: string;
    email?: string;
    city: string;
    area: string;
    address: string;
    kycStatus: string;
    aadharNumber?: string;
    fssaiNumber?: string;
    fssaiType?: string;
    fssaiBusinessName?: string;
    fssaiVerified: boolean;
    paymentStatus?: string;
    paymentMethod?: string;
    paymentTransactionId?: string;
    certificateFeeAmount?: number;
    securityDepositAmount?: number;
    adminApprovalStatus: string;
    onboardingStep: string;
    isVerified: boolean;
    availability: string;
    rating: number;
    totalOrders: number;
    profilePicUrl?: string;
    kitchenGallery: string[];
    aadharPhotoUrl?: string;
    aadharBackPhotoUrl?: string;
    fssaiCertificateUrl?: string;
    fssaiVerifiedAt?: string;
    bankDetails?: {
      accountHolder: string;
      accountNumber: string;
      ifsc: string;
      bankName: string;
    };
    documents?: Array<{ type: string; url: string; status: string }>;
  } | null;
}

export const usersApi = {
  list: () =>
    apiClient.get('/admin/users') as Promise<{ data: { users: AdminUserListItem[]; total: number } }>,

  getDetail: (userId: string) =>
    apiClient.get(`/admin/users/${userId}`) as Promise<{ data: UserDetailResponse }>,

  updateStatus: (userId: string, status: string) =>
    apiClient.patch(`/admin/users/${userId}/status`, { status }),

  setWalletHold: (userId: string, hold: boolean) =>
    apiClient.patch(`/admin/users/${userId}/wallet/hold`, { hold }),

  adjustWallet: (userId: string, payload: { amount: number; type: 'credit' | 'debit'; description?: string }) =>
    apiClient.post(`/admin/users/${userId}/wallet/adjust`, payload),
};

import apiClient from './client';

export interface AdminCoupon {
  id: string;
  code: string;
  title: string;
  description: string | null;
  applyOn: 'package' | 'platform_charge' | 'delivery';
  discountType: 'flat' | 'percentage';
  discountValue: number;
  minOrderAmount: number | null;
  maxDiscount: number | null;
  usageLimit: number | null;
  usedCount: number;
  perUserLimit: number;
  validFrom: string | null;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const couponsApi = {
  list: () =>
    apiClient.get('/admin/coupons') as Promise<{ data: { coupons: AdminCoupon[]; total: number } }>,

  create: (payload: {
    code: string;
    title: string;
    description?: string;
    applyOn: string;
    discountType: string;
    discountValue: number;
    minOrderAmount?: number;
    maxDiscount?: number;
    usageLimit?: number;
    perUserLimit?: number;
    validFrom?: string;
    validUntil?: string;
    isActive?: boolean;
  }) => apiClient.post('/admin/coupons', payload),

  update: (
    couponId: string,
    payload: Partial<{
      title: string;
      description: string;
      applyOn: string;
      discountType: string;
      discountValue: number;
      minOrderAmount: number;
      maxDiscount: number;
      usageLimit: number;
      perUserLimit: number;
      validFrom: string;
      validUntil: string;
      isActive: boolean;
    }>
  ) => apiClient.patch(`/admin/coupons/${couponId}`, payload),

  toggle: (couponId: string, isActive: boolean) =>
    apiClient.patch(`/admin/coupons/${couponId}/toggle`, { isActive }),
};

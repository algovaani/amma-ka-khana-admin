import apiClient from './client';

export interface AdminOrderListItem {
  id: string;
  orderNumber: string;
  customer: string;
  customerId: string;
  cook: string;
  cookId: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  itemsCount: number;
  createdAt: string;
}

export interface AdminOrderDetail {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentId: string | null;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  total: number;
  items: Array<{
    menuItemId: string;
    name: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
  }>;
  notes: string | null;
  cancelReason: string | null;
  couponCode: string | null;
  couponId: string | null;
  couponDiscount: number;
  couponApplyOn: string | null;
  packageChargeBase: number | null;
  platformCharge: number | null;
  fulfillmentType: string;
  pickupVerificationCode: string | null;
  deliveryAddress: {
    line1: string;
    line2?: string;
    city: string;
    area: string;
    pincode: string;
    location?: { type: string; coordinates: [number, number] };
  };
  pickupAddress: {
    line1?: string;
    area?: string;
    city?: string;
    coordinates?: [number, number];
    displayName?: string;
  } | null;
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  cook: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  timeline: {
    createdAt: string;
    acceptedAt: string | null;
    cookingStartedAt: string | null;
    readyAt: string | null;
    pickedAt: string | null;
    codePendingAt: string | null;
    codeVerifiedAt: string | null;
    completedAt: string | null;
    cancelledAt: string | null;
  };
}

export const ordersApi = {
  list: (params?: { page?: number; limit?: number; status?: string }) =>
    apiClient.get('/admin/orders', { params }) as Promise<{
      data: {
        orders: AdminOrderListItem[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>,

  getDetail: (orderId: string) =>
    apiClient.get(`/admin/orders/${orderId}`) as Promise<{ data: AdminOrderDetail }>,
};

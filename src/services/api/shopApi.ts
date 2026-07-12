import apiClient from './client';

export type ShopCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ShopProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  images: string[];
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
  stock: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type ShopDeliveryAddress = {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  area: string;
  pincode: string;
  lat?: number;
  lng?: number;
};

export type ShopOrder = {
  id: string;
  orderNumber: string;
  cookId: string;
  cookName: string | null;
  cookPhone: string | null;
  cookEmail: string | null;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string | null;
    lineTotal: number;
  }[];
  subtotal: number;
  total: number;
  status: string;
  paymentStatus: string;
  deliveryAddress: ShopDeliveryAddress | null;
  notes: string | null;
  trackingNote: string | null;
  deliveredAt: string | null;
  statusHistory: { status: string; at: string; note?: string }[];
  createdAt: string;
  updatedAt: string;
};

export type ShopDashboardStats = {
  totalOrders: number;
  pendingOrders: number;
  todayOrders: number;
  totalRevenue: number;
  todayRevenue: number;
};

export type ShopSettings = {
  minShopOrderAmount: number;
  shopEnabled: boolean;
};

export const shopApi = {
  getDashboardStats: () =>
    apiClient.get('/admin/shop/dashboard/stats') as Promise<{ data: ShopDashboardStats }>,

  getSettings: () =>
    apiClient.get('/admin/shop/settings') as Promise<{ data: ShopSettings }>,

  updateSettings: (payload: ShopSettings) =>
    apiClient.patch('/admin/shop/settings', payload) as Promise<{
      data: ShopSettings;
      message: string;
    }>,

  listCategories: () =>
    apiClient.get('/admin/shop/categories') as Promise<{ data: { categories: ShopCategory[]; total: number } }>,

  createCategory: (payload: {
    name: string;
    slug?: string;
    description?: string;
    sortOrder?: number;
  }) =>
    apiClient.post('/admin/shop/categories', payload) as Promise<{
      data: { category: ShopCategory };
      message: string;
    }>,

  updateCategory: (
    categoryId: string,
    payload: Partial<{
      name: string;
      slug: string;
      description: string;
      sortOrder: number;
      isActive: boolean;
    }>
  ) =>
    apiClient.patch(`/admin/shop/categories/${categoryId}`, payload) as Promise<{
      data: { category: ShopCategory };
      message: string;
    }>,

  toggleCategory: (categoryId: string, isActive: boolean) =>
    apiClient.patch(`/admin/shop/categories/${categoryId}/toggle`, { isActive }) as Promise<{
      data: { category: ShopCategory };
      message: string;
    }>,

  listProducts: (page = 1, limit = 20, search?: string, categoryId?: string) =>
    apiClient.get('/admin/shop/products', { params: { page, limit, search, categoryId } }) as Promise<{
      data: {
        products: ShopProduct[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>,

  createProduct: (payload: {
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    imageUrl?: string;
    images?: string[];
    stock?: number;
    sortOrder?: number;
  }) =>
    apiClient.post('/admin/shop/products', payload) as Promise<{ data: { product: ShopProduct }; message: string }>,

  updateProduct: (
    productId: string,
    payload: Partial<{
      name: string;
      description: string;
      price: number;
      categoryId: string;
      imageUrl: string;
      images: string[];
      stock: number;
      sortOrder: number;
      isActive: boolean;
    }>
  ) =>
    apiClient.patch(`/admin/shop/products/${productId}`, payload) as Promise<{
      data: { product: ShopProduct };
      message: string;
    }>,

  toggleProduct: (productId: string, isActive: boolean) =>
    apiClient.patch(`/admin/shop/products/${productId}/toggle`, { isActive }) as Promise<{
      data: { product: ShopProduct };
      message: string;
    }>,

  listOrders: (page = 1, limit = 20, status?: string, fromDate?: string, toDate?: string) =>
    apiClient.get('/admin/shop/orders', {
      params: { page, limit, status, fromDate, toDate },
    }) as Promise<{
      data: {
        orders: ShopOrder[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>,

  getOrder: (orderId: string) =>
    apiClient.get(`/admin/shop/orders/${orderId}`) as Promise<{ data: { order: ShopOrder } }>,

  updateOrderStatus: (orderId: string, status: string, note?: string, trackingNote?: string) =>
    apiClient.patch(`/admin/shop/orders/${orderId}/status`, { status, note, trackingNote }) as Promise<{
      data: { order: ShopOrder };
      message: string;
    }>,
};

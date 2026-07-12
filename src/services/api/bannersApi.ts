import apiClient from './client';

export type BannerAppTarget = 'customer' | 'cook' | 'both';
export type BannerScreenTarget =
  | 'all'
  | 'home'
  | 'orders'
  | 'wallet'
  | 'profile'
  | 'dashboard'
  | 'menu'
  | 'earnings';
export type BannerActionType = 'none' | 'url' | 'screen' | 'category';

export interface AdminBanner {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  appTarget: BannerAppTarget;
  screenTarget: BannerScreenTarget;
  actionType: BannerActionType;
  actionValue?: string;
  sortOrder: number;
  isActive: boolean;
  validFrom?: string;
  validUntil?: string;
  createdAt: string;
  updatedAt: string;
}

export const bannersApi = {
  list: () =>
    apiClient.get('/admin/banners') as Promise<{
      data: { banners: AdminBanner[]; total: number };
    }>,

  create: (payload: {
    title: string;
    subtitle?: string;
    imageUrl: string;
    appTarget: BannerAppTarget;
    screenTarget: BannerScreenTarget;
    actionType?: BannerActionType;
    actionValue?: string;
    sortOrder?: number;
    validFrom?: string;
    validUntil?: string;
    isActive?: boolean;
  }) => apiClient.post('/admin/banners', payload),

  update: (
    bannerId: string,
    payload: {
      title?: string;
      subtitle?: string;
      imageUrl?: string;
      appTarget?: BannerAppTarget;
      screenTarget?: BannerScreenTarget;
      actionType?: BannerActionType;
      actionValue?: string;
      sortOrder?: number;
      validFrom?: string | null;
      validUntil?: string | null;
    }
  ) => apiClient.patch(`/admin/banners/${bannerId}`, payload),

  toggle: (bannerId: string, isActive: boolean) =>
    apiClient.patch(`/admin/banners/${bannerId}/toggle`, { isActive }),
};

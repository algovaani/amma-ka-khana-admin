import apiClient from './client';

export interface AdminCook {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  area: string;
  rating: number;
  orders: number;
  kyc: string;
  fssai: string;
  adminApproval: string;
  onboardingStep: string;
  isVerified: boolean;
  availability: string;
  registeredAt: string;
  profileCreatedAt: string | null;
}

export interface CookMapMenuItem {
  id: string;
  name: string;
  image: string | null;
  readyAt: string | null;
  isTodaySpecial: boolean;
  category: string;
}

export interface CookMapItem {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  area: string;
  address: string;
  lat: number;
  lng: number;
  rating: number;
  orders: number;
  availability: string;
  isVerified: boolean;
  adminApproval: string;
  fssaiVerified: boolean;
  profilePicUrl: string | null;
  todayMenu: CookMapMenuItem[];
}

export const cooksApi = {
  list: () =>
    apiClient.get('/admin/cooks') as Promise<{ data: { cooks: AdminCook[]; total: number } }>,

  mapCooks: () =>
    apiClient.get('/admin/cooks/map') as Promise<{
      data: { cooks: CookMapItem[]; total: number; withoutLocation: number };
    }>,

  approve: (cookId: string, approved: boolean, note?: string) =>
    apiClient.patch(`/cooks/onboarding/admin/${cookId}/approve`, { approved, note }),

  verifyFssai: (cookId: string, verified: boolean) =>
    apiClient.patch(`/cooks/onboarding/admin/${cookId}/fssai-verify`, { verified }),

  verifyKyc: (cookId: string, verified: boolean, note?: string) =>
    apiClient.patch(`/cooks/onboarding/admin/${cookId}/kyc-verify`, { verified, note }),

  updateProfile: (cookId: string, payload: Record<string, unknown>) =>
    apiClient.patch(`/cooks/onboarding/admin/${cookId}/profile`, payload),

  uploadImage: (cookId: string, image: string, type: string) =>
    apiClient.post(`/cooks/onboarding/admin/${cookId}/upload`, { image, type }, { timeout: 60000 }) as Promise<{
      data: { url: string; type: string };
    }>,
};

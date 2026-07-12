import apiClient from './client';
import type { AdminReferralRow } from './settingsApi';

export const referralApi = {
  list: (page = 1, limit = 30) =>
    apiClient.get('/admin/referrals', { params: { page, limit } }) as Promise<{
      data: {
        referrals: AdminReferralRow[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      };
    }>,
};

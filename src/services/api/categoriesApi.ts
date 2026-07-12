import apiClient from './client';

export interface MenuCategoryItem {
  id: string;
  slug: string;
  label: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export const categoriesApi = {
  list: () =>
    apiClient.get('/admin/categories') as Promise<{
      data: { categories: MenuCategoryItem[]; total: number };
    }>,

  create: (payload: { label: string; slug?: string; sortOrder?: number }) =>
    apiClient.post('/admin/categories', payload),

  update: (categoryId: string, payload: { label?: string; sortOrder?: number }) =>
    apiClient.patch(`/admin/categories/${categoryId}`, payload),

  toggle: (categoryId: string, isActive: boolean) =>
    apiClient.patch(`/admin/categories/${categoryId}/toggle`, { isActive }),
};

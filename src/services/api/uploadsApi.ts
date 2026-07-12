import apiClient from './client';

export const uploadsApi = {
  uploadImage: (image: string, folder: 'banners' | 'assets' = 'banners') =>
    apiClient.post(
      '/admin/uploads/image',
      { image, folder },
      { timeout: 60000 }
    ) as Promise<{ data: { url: string } }>,
};

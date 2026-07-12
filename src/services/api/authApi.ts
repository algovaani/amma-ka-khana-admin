import apiClient from './client';

export interface AdminLoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export const authApi = {
  adminLogin: (email: string, password: string) =>
    apiClient.post('/auth/admin/login', { email, password }) as Promise<{
      data: AdminLoginResponse;
      message: string;
    }>,
};

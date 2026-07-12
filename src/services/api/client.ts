import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../../constants';
import { store } from '../../redux/store';
import { logout, updateTokens } from '../../redux/reducers/authReducer';

let isRefreshing = false;

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = store.getState().auth.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;

    if (
      status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/admin/login') &&
      !originalRequest.url?.includes('/auth/refresh')
    ) {
      const refreshToken = store.getState().auth.refreshToken;
      if (refreshToken) {
        originalRequest._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;
          try {
            const refreshResponse = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            });
            const tokens = refreshResponse.data.data.tokens as {
              accessToken: string;
              refreshToken: string;
            };
            store.dispatch(
              updateTokens({
                token: tokens.accessToken,
                refreshToken: tokens.refreshToken,
              })
            );
            isRefreshing = false;
            originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`;
            return apiClient(originalRequest);
          } catch {
            isRefreshing = false;
            store.dispatch(logout());
          }
        }
      } else {
        store.dispatch(logout());
      }
    }

    const message = error.response?.data?.message || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;

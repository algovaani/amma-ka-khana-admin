import apiClient from './client';

export type ReportType =
  | 'orders'
  | 'customers'
  | 'cooks'
  | 'wallet'
  | 'coupons'
  | 'cancelled'
  | 'revenue';

export interface ReportRow {
  id: string;
  traceId: string;
  linkType?: string | null;
  linkId?: string | null;
  [key: string]: unknown;
}

export interface ReportResponse {
  summary: Record<string, number>;
  rows: ReportRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const reportsApi = {
  get: (params: {
    type: ReportType;
    from?: string;
    to?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => apiClient.get('/admin/reports', { params }) as Promise<{ data: ReportResponse }>,
};

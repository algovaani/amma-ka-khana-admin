import apiClient from './client';

export interface LocationItem {
  _id: string;
  name: string;
  isActive: boolean;
  code?: string;
  countryId?: string | { _id: string; name: string; code?: string };
  stateId?: string | { _id: string; name: string };
}

export const locationsApi = {
  getAll: () =>
    apiClient.get('/admin/locations') as Promise<{
      data: { countries: LocationItem[]; states: LocationItem[]; cities: LocationItem[] };
    }>,

  createCountry: (payload: { name: string; code: string }) =>
    apiClient.post('/admin/locations/countries', payload),

  createState: (payload: { name: string; countryId: string }) =>
    apiClient.post('/admin/locations/states', payload),

  createCity: (payload: { name: string; stateId: string }) =>
    apiClient.post('/admin/locations/cities', payload),

  toggleCountry: (id: string, isActive: boolean) =>
    apiClient.patch(`/admin/locations/countries/${id}/toggle`, { isActive }),

  toggleState: (id: string, isActive: boolean) =>
    apiClient.patch(`/admin/locations/states/${id}/toggle`, { isActive }),

  toggleCity: (id: string, isActive: boolean) =>
    apiClient.patch(`/admin/locations/cities/${id}/toggle`, { isActive }),
};

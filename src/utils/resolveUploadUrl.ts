import { API_BASE_URL } from '../constants';

export const resolveUploadUrl = (path?: string | null) => {
  if (!path) {
    return '';
  }
  if (path.startsWith('http')) {
    return path;
  }
  const base = API_BASE_URL.replace(/\/api\/v1$/, '');
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
};

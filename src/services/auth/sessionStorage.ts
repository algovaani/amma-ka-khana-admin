const SESSION_KEY = 'akk_admin_session';

export interface AdminSession {
  user: { id: string; name: string; email: string; role: string };
  token: string;
  refreshToken: string;
}

export const saveSession = (session: AdminSession) => {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

export const loadSession = (): AdminSession | null => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AdminSession;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(SESSION_KEY);
};

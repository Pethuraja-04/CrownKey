'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { apiLogin, apiLogout, apiMe, apiRegister, apiRefresh, AUTH_REFRESH_EVENT } from '@/lib/api';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
}

interface AuthCtx extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; phone?: string }) => Promise<void>;
  logout: () => Promise<void>;
  authOpen: boolean;
  authMode: 'login' | 'register';
  openAuth: (mode?: 'login' | 'register') => void;
  closeAuth: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

const STORAGE_KEY = 'realestate.auth.v1';

const readStored = (): Pick<AuthState, 'user' | 'accessToken' | 'refreshToken'> | null => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeStored = (s: Pick<AuthState, 'user' | 'accessToken' | 'refreshToken'> | null) => {
  if (typeof window === 'undefined') return;
  if (!s) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: true,
  });

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const openAuth = useCallback((mode: 'login' | 'register' = 'login') => {
    setAuthMode(mode);
    setAuthOpen(true);
  }, []);

  const closeAuth = useCallback(() => {
    setAuthOpen(false);
  }, []);

  // Synchronize state when tokens are refreshed globally
  useEffect(() => {
    const handleRefresh = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        setState({
          user: detail.user,
          accessToken: detail.accessToken,
          refreshToken: detail.refreshToken,
          loading: false,
        });
      } else {
        setState({
          user: null,
          accessToken: null,
          refreshToken: null,
          loading: false,
        });
      }
    };

    window.addEventListener(AUTH_REFRESH_EVENT, handleRefresh);
    return () => {
      window.removeEventListener(AUTH_REFRESH_EVENT, handleRefresh);
    };
  }, []);

  useEffect(() => {
    const stored = readStored();
    if (!stored?.accessToken) {
      setState((s) => ({ ...s, loading: false }));
      return;
    }
    // Validate token by hitting /me — if it fails, try refreshing.
    apiMe(stored.accessToken)
      .then((r) => setState({ ...stored, user: r.data, loading: false }))
      .catch(() => {
        if (stored.refreshToken) {
          apiRefresh(stored.refreshToken)
            .then((r) => {
              const next = {
                user: r.data.user,
                accessToken: r.data.accessToken,
                refreshToken: r.data.refreshToken,
              };
              writeStored(next);
              setState({ ...next, loading: false });
            })
            .catch(() => {
              writeStored(null);
              setState({ user: null, accessToken: null, refreshToken: null, loading: false });
            });
        } else {
          writeStored(null);
          setState({ user: null, accessToken: null, refreshToken: null, loading: false });
        }
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiLogin({ email, password });
    const next = { user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken };
    writeStored(next);
    setState({ ...next, loading: false });
    setAuthOpen(false); // Close auth modal on successful login
  }, []);

  const register = useCallback(async (body: { name: string; email: string; password: string; phone?: string }) => {
    const { data } = await apiRegister(body);
    const next = { user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken };
    writeStored(next);
    setState({ ...next, loading: false });
    setAuthOpen(false); // Close auth modal on successful register
  }, []);

  const logout = useCallback(async () => {
    if (state.refreshToken) {
      try { await apiLogout(state.refreshToken); } catch { /* ignore */ }
    }
    writeStored(null);
    setState({ user: null, accessToken: null, refreshToken: null, loading: false });
  }, [state.refreshToken]);

  const value = useMemo<AuthCtx>(
    () => ({
      ...state,
      login,
      register,
      logout,
      authOpen,
      authMode,
      openAuth,
      closeAuth,
    }),
    [state, login, register, logout, authOpen, authMode, openAuth, closeAuth],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

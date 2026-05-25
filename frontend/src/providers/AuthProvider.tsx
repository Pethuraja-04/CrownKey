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
import { apiLogin, apiLogout, apiMe, apiRegister, AUTH_REFRESH_EVENT } from '@/lib/api';
import type { User } from '@/lib/types';

interface AuthState {
  user: User | null;
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
  // Included for backwards compatibility with WishlistProvider, though tokens aren't needed anymore
  accessToken: string | null;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
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
      if (detail && detail.user) {
        setState({
          user: detail.user,
          loading: false,
        });
      } else {
        setState({
          user: null,
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
    // Just hit /me on mount. Cookies are handled by browser.
    apiMe('')
      .then((r) => setState({ user: r.data, loading: false }))
      .catch(() => {
        setState({ user: null, loading: false });
      });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { data } = await apiLogin({ email, password });
    setState({ user: data.user, loading: false });
    setAuthOpen(false); // Close auth modal on successful login
  }, []);

  const register = useCallback(async (body: { name: string; email: string; password: string; phone?: string }) => {
    const { data } = await apiRegister(body);
    setState({ user: data.user, loading: false });
    setAuthOpen(false); // Close auth modal on successful register
  }, []);

  const logout = useCallback(async () => {
    try { await apiLogout(); } catch { /* ignore */ }
    setState({ user: null, loading: false });
  }, []);

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
      // Pass a dummy token so WishlistProvider doesn't break assuming it's logged out if missing
      accessToken: state.user ? 'cookie-based' : null,
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

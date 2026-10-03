'use client';

import React, { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getTokens, onAuthChange, setTokens } from '@/lib/api/client';
import { authApi, meApi } from '@/lib/api/endpoints';
import type { LoginResponse, Me } from '@/lib/api/types';

const HEARTBEAT_MS = 60_000;

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  user: Me | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  completeLogin: (response: LoginResponse) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: Me) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<Me | null>(null);
  // Without stored tokens we already know the visitor is anonymous; otherwise wait for /me.
  const [status, setStatus] = useState<AuthStatus>(() => (getTokens() ? 'loading' : 'anonymous'));

  const signOutLocally = useCallback(() => {
    setUserState(null);
    setStatus('anonymous');
  }, []);

  const loadUser = useCallback(async () => {
    try {
      const me = await meApi.get();
      setUserState(me);
      setStatus('authenticated');
    } catch {
      setTokens(null);
      signOutLocally();
    }
  }, [signOutLocally]);

  const refreshUser = useCallback(async () => {
    if (getTokens()) await loadUser();
    else signOutLocally();
  }, [loadUser, signOutLocally]);

  useEffect(() => {
    if (getTokens()) {
      meApi
        .get()
        .then(me => {
          setUserState(me);
          setStatus('authenticated');
        })
        .catch(() => {
          setTokens(null);
          signOutLocally();
        });
    }
    // Token expiry or logout in another tab clears the session here too.
    return onAuthChange(() => {
      if (!getTokens()) signOutLocally();
    });
  }, [signOutLocally]);

  const completeLogin = useCallback((response: LoginResponse) => {
    setTokens({ access: response.access, refresh: response.refresh });
    setUserState(response.user);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    const refresh = getTokens()?.refresh;
    if (refresh) await authApi.logout(refresh).catch(() => undefined);
    setTokens(null);
    signOutLocally();
  }, [signOutLocally]);

  // Presence: "online" while the tab is visible, "away" when hidden, refreshed every minute.
  useEffect(() => {
    if (status !== 'authenticated') return;
    const beat = () => meApi.heartbeat(document.hidden ? 'away' : 'online').catch(() => undefined);
    void beat();
    const timer = window.setInterval(beat, HEARTBEAT_MS);
    document.addEventListener('visibilitychange', beat);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', beat);
    };
  }, [status]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      status,
      isAuthenticated: status === 'authenticated',
      completeLogin,
      logout,
      refreshUser,
      setUser: setUserState,
    }),
    [user, status, completeLogin, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}

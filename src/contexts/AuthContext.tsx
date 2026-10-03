import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { api } from '../lib/api';

export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  age?: number;
  avatar?: string;
  phone?: string;
  role: string;
  coins?: number;
  totalCoinsEarned?: number;
  isAdultConfirmed?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateCoins: (newBalance: number) => void;
  unseenBetsCount: number;
  refreshUnseenBets: () => Promise<void>;
  clearUnseenBets: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [unseenBetsCount, setUnseenBetsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setUnseenBetsCount(0);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setUnseenBetsCount(0);
  };

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/users/me');
      const fresh: User = res.data;
      localStorage.setItem('user', JSON.stringify(fresh));
      setUser(fresh);
    } catch {}
  }, []);

  const updateCoins = useCallback((newBalance: number) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, coins: newBalance };
      localStorage.setItem('user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshUnseenBets = useCallback(async () => {
    if (!user || user.role !== 'user') {
      setUnseenBetsCount(0);
      return;
    }
    try {
      const res = await api.get('/bets/unseen-count');
      setUnseenBetsCount(res.data.count || 0);
    } catch {}
  }, [user]);

  const clearUnseenBets = useCallback(() => {
    setUnseenBetsCount(0);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        refreshUser,
        updateCoins,
        unseenBetsCount,
        refreshUnseenBets,
        clearUnseenBets,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
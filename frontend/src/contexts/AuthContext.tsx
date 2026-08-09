import { apiFetch } from '../lib/api';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  email: string;
  full_name: string;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  /** @deprecated Auth ligger nå i en HttpOnly-cookie (ikke lesbar fra JS). Alltid null. */
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Auth ligger i en HttpOnly-cookie (sendes automatisk med hvert kall). Vi lagrer
  // kun brukerinfo lokalt for å vise innlogget tilstand i grensesnittet.
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setUser(JSON.parse(storedUser));
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const response = await apiFetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as any));
      // Backend bruker en egen feil-handler som returnerer feltet «error»
      // (ikke «detail»). Les begge for sikkerhets skyld.
      const d = errorData?.error ?? errorData?.detail;
      const message = Array.isArray(d)
        ? d.map((x: any) => x?.msg || x).join(', ')
        : typeof d === 'string' && d
        ? d
        : response.status === 429
        ? 'For mange forsøk på kort tid. Vent noen minutter og prøv igjen.'
        : `Innlogging feilet (${response.status}). Prøv igjen.`;
      throw new Error(message);
    }
    const data = await response.json();
    setUser(data.user);
    try {
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch {
      /* ignore */
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    const response = await apiFetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as any));
      // Backend bruker en egen feil-handler som returnerer feltet «error»
      // (ikke «detail»). Les begge for sikkerhets skyld.
      const d = errorData?.error ?? errorData?.detail;
      const message = Array.isArray(d)
        ? d.map((x: any) => x?.msg || x).join(', ')
        : typeof d === 'string' && d
        ? d
        : response.status === 429
        ? 'For mange forsøk på kort tid. Vent noen minutter og prøv igjen.'
        : `Registrering feilet (${response.status}). Prøv igjen.`;
      throw new Error(message);
    }
    const data = await response.json();
    setUser(data.user);
    try {
      localStorage.setItem('user', JSON.stringify(data.user));
    } catch {
      /* ignore */
    }
  };

  const logout = () => {
    apiFetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setUser(null);
    try {
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // rydd bort gammelt token fra tidligere versjon
    } catch {
      /* ignore */
    }
    navigate('/');
  };

  const value: AuthContextType = {
    user,
    token: null,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

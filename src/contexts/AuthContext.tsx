import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { authApi, setAuthToken } from "../api";

type Role = "cliente" | "vendedor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isVendedor: boolean;
  isCliente: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: Role) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw && !user) setUser(JSON.parse(raw));
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password);
    const token = res.data?.token;
    const loggedUser = res.data?.user;
    if (token) setAuthToken(token);
    if (loggedUser) {
      localStorage.setItem("user", JSON.stringify(loggedUser));
      setUser(loggedUser);
    }
  };

  const register = async (name: string, email: string, password: string, role: Role) => {
    await authApi.register(name, email, password, role);
  };

  const logout = async () => {
    try { await authApi.logout(); } catch {}
    setAuthToken(undefined);
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isVendedor: user?.role === "vendedor",
        isCliente: user?.role === "cliente",
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};

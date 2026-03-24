"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/api/clients";
import { getTokens, clearTokens } from "@/lib/api/client";
import type { User } from "@/lib/api/types";
import { UserRole } from "@/lib/api/types";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_ROLES: UserRole[] = [UserRole.STAFF, UserRole.ADMIN, UserRole.SUPERADMIN];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    const { accessToken } = getTokens();
    if (!accessToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await authClient.getProfile();
      if (res.success && res.data) {
        if (!ADMIN_ROLES.includes(res.data.role)) {
          clearTokens();
          setUser(null);
        } else {
          setUser(res.data);
        }
      } else {
        clearTokens();
        setUser(null);
      }
    } catch {
      clearTokens();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (identifier: string, password: string) => {
    const res = await authClient.login({ identifier, password });
    if (res.success && res.data) {
      if (!ADMIN_ROLES.includes(res.data.user.role)) {
        clearTokens();
        return { success: false, message: "Access denied. Staff, Admin, or Superadmin role required." };
      }
      setUser(res.data.user);
      return { success: true, message: "Login successful" };
    }
    return { success: false, message: res.message || "Invalid credentials" };
  };

  const logout = () => {
    authClient.logout();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

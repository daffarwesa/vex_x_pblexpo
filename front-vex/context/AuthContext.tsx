"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import url from "@/lib/axios";

export type User = {
  id: number;
  nama: string;
  email: string;
};

type AuthType = {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
};

const AuthContext = createContext<AuthType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = () => {
    localStorage.removeItem("token");
    Cookies.remove("token");
    Cookies.remove("is_admin_logged_in");
    Cookies.remove("username");
    setUser(null);
  };

  const isSecure = typeof window !== "undefined" && window.location.protocol === "https:";

  const fetchUser = async () => {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("token") || Cookies.get("token")
      : null;

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await url.get("/api/user");
      const userData = response.data.user ?? response.data;

      if (userData) {
        setUser(userData);
        Cookies.set("token", token, { expires: 7, secure: isSecure, sameSite: "strict" });
        Cookies.set("is_admin_logged_in", "true", { expires: 7, secure: isSecure, sameSite: "strict" });
        Cookies.set("username", userData.nama || "", { expires: 7, secure: isSecure, sameSite: "strict" });
      }
    } catch (error: any) {
      if (error?.response?.status === 401) {
        clearSession();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

const login = (token: string, userData: User) => {
  localStorage.setItem("token", token);
  Cookies.set("token", token, { expires: 7, secure: isSecure, sameSite: "strict" });
  Cookies.set("is_admin_logged_in", "true", { expires: 7, secure: isSecure, sameSite: "strict" });
  Cookies.set("username", userData.nama || "", { expires: 7, secure: isSecure, sameSite: "strict" });
  setUser(userData);
};

const logout = async () => {
  try {
    await url.post("/api/auth/logout");
  } catch (error) {
    console.warn("Logout request failed, clearing local session anyway.");
  } finally {
    clearSession();
    router.replace("/login");
  }
};

return (
  <AuthContext.Provider
    value={{
      user,
      loading,
      login,
      logout,
      fetchUser,
    }}
  >
    {children}
  </AuthContext.Provider>
);
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("HARUS ADA DI DALAM AuthProvider");
  }

  return ctx;
};

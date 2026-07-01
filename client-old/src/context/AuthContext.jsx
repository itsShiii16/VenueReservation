/**
 * AuthContext.jsx - Authentication context provider.
 */

import { createContext, useEffect, useState } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrateUser = async () => {
      const token = localStorage.getItem("vrs_token");
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await authService.getMe();
        setUser(response.data);
      } catch {
        localStorage.removeItem("vrs_token");
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    hydrateUser();
  }, []);

  const login = async (email, password) => {
    const response = await authService.login({ email, password });
    localStorage.setItem("vrs_token", response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  const register = async (formData) => {
    const response = await authService.register(formData);
    localStorage.setItem("vrs_token", response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = () => {
    localStorage.removeItem("vrs_token");
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

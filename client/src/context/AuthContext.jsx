/**
 * AuthContext.jsx — Authentication Context Provider
 *
 * Manages auth state (user, token) across the app.
 * Provides login, register, logout functions.
 */

import { createContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("vrs_token"));
  const [loading, setLoading] = useState(true);

  // On mount, if we have a token, fetch the current user
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          const res = await authService.getMe();
          setUser(res.data);
        } catch {
          // Token is invalid — clear it
          localStorage.removeItem("vrs_token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    loadUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { user: userData, token: newToken } = res.data;
    localStorage.setItem("vrs_token", newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const register = async (formData) => {
    const res = await authService.register(formData);
    const { user: userData, token: newToken } = res.data;
    localStorage.setItem("vrs_token", newToken);
    setToken(newToken);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("vrs_token");
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

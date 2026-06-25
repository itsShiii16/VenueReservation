/**
 * AuthContext.jsx — Client-side Authentication Context Provider
 *
 * Uses mockDb to check credentials, save current session, and sync user state.
 */

import { createContext, useState, useEffect } from "react";
import { db, subscribe } from "../services/mockDb";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(db.getCurrentUser());
  const [loading, setLoading] = useState(false);

  // Sync state with changes to the local store (like updating profile or logout)
  useEffect(() => {
    const unsubscribe = subscribe((store) => {
      setUser(store.currentUser);
    });
    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    const loggedUser = db.login(email, password);
    setUser(loggedUser);
    return loggedUser;
  };

  const register = async (formData) => {
    const registeredUser = db.register(formData);
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = () => {
    db.logout();
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

import React, { createContext, useContext, useState, useEffect } from "react";
import api, { setCookie, eraseCookie, getCookie } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verify auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = getCookie("token");
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/api/auth/me");
        if (response.data?.success && response.data?.user) {
          setUser(response.data.user);
        } else {
          setUser(null);
          eraseCookie("token");
        }
      } catch (error) {
        console.error("Auth init failed:", error);
        setUser(null);
        eraseCookie("token");
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post("/api/auth/login", { email, password });
      if (response.data?.success && response.data?.data) {
        const { token, user: userData } = response.data.data;
        setCookie("token", token);
        setUser(userData);
        return response.data;
      }
      throw new Error(response.data?.message || "Login failed");
    } catch (error) {
      setUser(null);
      eraseCookie("token");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setLoading(true);
    try {
      const response = await api.post("/api/auth/register", { name, email, password });
      if (response.data?.success && response.data?.data) {
        const { token, user: userData } = response.data.data;
        setCookie("token", token);
        setUser(userData);
        return response.data;
      }
      throw new Error(response.data?.message || "Registration failed");
    } catch (error) {
      setUser(null);
      eraseCookie("token");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async (credential) => {
    setLoading(true);
    try {
      const response = await api.post("/api/auth/google", { credential });
      if (response.data?.success && response.data?.data) {
        const { token, user: userData } = response.data.data;
        setCookie("token", token);
        setUser(userData);
        return response.data;
      }
      throw new Error(response.data?.message || "Google auth failed");
    } catch (error) {
      setUser(null);
      eraseCookie("token");
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    eraseCookie("token");
    setUser(null);
  };

  const updateProfile = async (name, picture) => {
    try {
      const response = await api.patch("/api/users/profile", { name, picture });
      if (response.data?.success && response.data?.data) {
        setUser(response.data.data);
        return response.data;
      }
      throw new Error(response.data?.message || "Profile update failed");
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        googleLogin,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

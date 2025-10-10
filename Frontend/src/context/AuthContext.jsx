// context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/auth.service.js";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        const savedUser = localStorage.getItem("user");

        if (savedUser) {
          // Restore user immediately so UI remains authenticated while we verify token
          try {
            setUser(JSON.parse(savedUser));
          } catch (e) {
            // ignore parse errors
            setUser(null);
          }
          try {
            // Verify token by fetching current user
            const response = await authService.getCurrentUser();
            // response may be axios response or response.data shape
            const payload = response?.data ?? response;
            const currentUser =
              payload?.data?.user ?? payload?.user ?? payload?.data ?? null;
            if (currentUser) {
              setUser(currentUser);
              localStorage.setItem("user", JSON.stringify(currentUser));
            } else {
              // fallback: if payload is the user object itself
              setUser(payload);
              localStorage.setItem("user", JSON.stringify(payload));
            }
          } catch (error) {
            // If token invalid, clear storage
            localStorage.removeItem("accessToken");
            localStorage.removeItem("refreshToken");
            localStorage.removeItem("user");
            setUser(null);
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);
      console.log("Full login response: ", response.data);

      // Backend returns: { statusCode: 200, data: { user, accessToken, refreshToken }, message: "..." }
      const userData = response.data?.data?.user;
      const accessToken = response.data?.data?.accessToken;
      const refreshToken = response.data?.data?.refreshToken;

      // console.log("userData:", userData);
      // console.log("accessToken:", accessToken);
      // console.log("refreshToken:", refreshToken);

      // if (response.data && response.data.data?.user) {
      if (userData && accessToken && refreshToken) {
        // const { user, accessToken, refreshToken } = response.data.data;
        // setUser(response.data.data.user);
        setUser(userData);
        // ✅ Save tokens and user
        // localStorage.setItem("accessToken", response.data.data.accessToken);
        // localStorage.setItem("refreshToken", response.data.data.refreshToken);
        // localStorage.setItem("user", JSON.stringify(response.data.data.user));
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        console.log("✅ User logged in successfully:", userData);
        // setUser(user);
        // console.log("✅ User logged in successfully:", user);
      } else {
        throw new Error("Invalid response from server");
      }
      return response.data;
    } catch (error) {
      console.error("Login error in context:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      // Expect authService.register to return full axios response
      const response = await authService.register(userData);
      const payload = response?.data ?? response;
      // Try common shapes: response.data.data (with user/accessToken) or response.data (user) etc.
      const userObj =
        payload?.data?.user ?? payload?.data ?? payload?.user ?? payload;
      const accessToken =
        payload?.data?.accessToken ?? payload?.accessToken ?? null;
      const refreshToken =
        payload?.data?.refreshToken ?? payload?.refreshToken ?? null;

      if (userObj) {
        setUser(userObj);
        localStorage.setItem("user", JSON.stringify(userObj));
        if (accessToken) localStorage.setItem("accessToken", accessToken);
        if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
        console.log("✅ User registered successfully:", userObj);
        return response;
      } else {
        console.warn("⚠️ No user object returned from server");
        throw new Error("Invalid response from server");
      }
    } catch (error) {
      console.error("Registration error in context:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null); // ✅ localStorage cleared in service
    } catch (error) {
      console.error("Logout error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await authService.refreshToken();
      return response;
    } catch (error) {
      console.error("Token refresh error:", error);
      setUser(null);
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      throw error;
    }
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

import React, { createContext, useState, useCallback, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export const AuthContext = createContext();

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("authToken") || null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(!!localStorage.getItem("authToken"));
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Sync token to axios headers
  useEffect(() => {
    if (token) {
      apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete apiClient.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Logout callback
  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("authToken");
    delete apiClient.defaults.headers.common["Authorization"];
    toast.success("Logged out successfully!");
  }, []);

  // Response interceptor setup
  useEffect(() => {
    const interceptor = apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          const isAuthRequest = error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/register");
          if (!isAuthRequest && window.location.pathname !== "/login") {
            setToken(null);
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem("authToken");
            delete apiClient.defaults.headers.common["Authorization"];
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      apiClient.interceptors.response.eject(interceptor);
    };
  }, []);

  // Check if user is logged in on mount
  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      const storedToken = localStorage.getItem("authToken");
      if (!storedToken) {
        setIsInitializing(false);
        return;
      }

      try {
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
        const response = await apiClient.get("/auth/me");
        if (isMounted) {
          setUser(response.data.user);
          setIsAuthenticated(true);
          setToken(storedToken);
        }
      } catch (error) {
        console.warn("Session restore failed, clearing token");
        if (isMounted) {
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem("authToken");
          delete apiClient.defaults.headers.common["Authorization"];
        }
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    restoreSession();
    return () => {
      isMounted = false;
    };
  }, []);

  // Register
  const register = useCallback(
    async (userData) => {
      setIsLoading(true);
      try {
        const response = await apiClient.post("/auth/register", userData);
        setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem("authToken", response.data.token);
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
        toast.success("Registration successful!");
        return response.data;
      } catch (error) {
        toast.error(error.response?.data?.message || "Registration failed");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Login by email, phone, or employee ID
  const login = useCallback(
    async (identifier, password) => {
      setIsLoading(true);
      try {
        const normalizedIdentifier = String(identifier || "").trim();
        const payload = { username: normalizedIdentifier, password };
        const response = await apiClient.post("/auth/login", payload);
        setToken(response.data.token);
        setUser(response.data.user);
        setIsAuthenticated(true);
        localStorage.setItem("authToken", response.data.token);
        apiClient.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
        toast.success(`Welcome back, ${response.data.user.firstName}!`);
        return response.data;
      } catch (error) {
        toast.error(error.response?.data?.message || "Login failed");
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Login with token (OTP flow — token already obtained)
  const loginWithToken = useCallback((tokenValue, userData) => {
    setToken(tokenValue);
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem("authToken", tokenValue);
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${tokenValue}`;
  }, [apiClient]);

  // Get Current User
  const getCurrentUser = useCallback(async () => {
    try {
      const response = await apiClient.get("/auth/me");
      setUser(response.data.user);
      setIsAuthenticated(true);
      return response.data.user;
    } catch (error) {
      console.error("Failed to fetch current user");
      setIsAuthenticated(false);
      throw error;
    }
  }, []);

  // Update Profile
  const updateProfile = useCallback(
    async (profileData) => {
      try {
        const response = await apiClient.put("/users/profile", profileData);
        setUser(response.data.user);
        toast.success("Profile updated successfully!");
        return response.data;
      } catch (error) {
        toast.error(error.response?.data?.message || "Update failed");
        throw error;
      }
    },
    []
  );

  const value = {
    user,
    isLoading,
    isInitializing,
    isAuthenticated,
    token,
    register,
    login,
    loginWithToken,
    logout,
    getCurrentUser,
    updateProfile,
    apiClient,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom Hook
export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

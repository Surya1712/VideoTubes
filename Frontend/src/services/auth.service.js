// services/authService.js
import apiClient from "./api.js";

export const authService = {
  // Test API connection
  testAPI: async () => {
    try {
      const response = await apiClient.get("/test");
      console.log("✅ API Test successful:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ API Test failed:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      const response = await apiClient.post("/users/login", {
        email,
        password,
      });

      console.log("✅ Login successful:", response.data);

      // Store tokens if provided
      if (response.data.data?.accessToken) {
        localStorage.setItem("accessToken", response.data.data.accessToken);
      }
      if (response.data.data?.refreshToken) {
        localStorage.setItem("refreshToken", response.data.data.refreshToken);
      }

      // Store user data if provided
      if (response.data.data?.user) {
        localStorage.setItem("user", JSON.stringify(response.data.data.user));
      }

      // return response.data;
      return response;
    } catch (error) {
      console.error("❌ Login failed:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Login failed");
    }
  },

  // Register user
  register: async (userData) => {
    try {
      const response = await apiClient.post("/users/register", userData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("✅ Registration successful:", response.data);

      // // Store tokens if provided
      // if (response.data.data?.accessToken) {
      //   localStorage.setItem("accessToken", response.data.data.accessToken);
      // }
      // if (response.data.data?.refreshToken) {
      //   localStorage.setItem("refreshToken", response.data.data.refreshToken);
      // }

      // // Store user data if provided
      // if (response.data.data?.user) {
      //   localStorage.setItem("user", JSON.stringify(response.data.data.user));
      // }

      return response.data;
    } catch (error) {
      console.error(
        "❌ Registration failed:",
        error.response?.data || error.message
      );
      // If backend sends HTML (500 page), wrap it into a JSON error
      if (error.response?.data && typeof error.response.data === "string") {
        throw new Error("Server Error (HTML response received)");
      }
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  },

  // Logout user
  logout: async () => {
    try {
      const response = await apiClient.post("/users/logout");

      // Clear local storage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");

      console.log("✅ Logout successful");
      return response.data;
    } catch (error) {
      console.error("❌ Logout failed:", error.response?.data || error.message);
      // Still clear local storage even if API call fails
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      throw error;
    }
  },

  // Get current user
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get("/users/current-user");
      console.log("✅ Get current user successful:", response.data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ Get current user failed:",
        error.response?.data || error.message
      );
      throw error;
    }
  },

  // Refresh access token
  refreshToken: async () => {
    try {
      const response = await apiClient.post("/users/refresh-token");

      if (response.data.data?.accessToken) {
        localStorage.setItem("accessToken", response.data.data.accessToken);
      }

      console.log("✅ Token refresh successful");
      return response.data;
    } catch (error) {
      console.error(
        "❌ Token refresh failed:",
        error.response?.data || error.message
      );
      throw error;
    }
  },
};

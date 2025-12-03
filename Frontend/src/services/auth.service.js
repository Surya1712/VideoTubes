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
  /**
   * Change password for logged in user.
   * Expects oldPassword and newPassword.
   * Backend route assumed: POST /users/change-password
   */
  changePassword: async (oldPassword, newPassword) => {
    try {
      const payload = { oldPassword, newPassword };
      const response = await apiClient.post("/users/change-password", payload);
      // return full axios response so callers have consistent shape
      return response;
    } catch (error) {
      // normalize error message
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Change password failed";
      console.error(
        "❌ changePassword failed:",
        error.response?.data || error.message
      );
      throw new Error(msg);
    }
  },

  /**
   * Reset password using token (forgot password flow).
   * Backend route assumed: POST /users/reset-password/:token
   */
  resetPassword: async (token, newPassword) => {
    try {
      // if backend expects token in body instead, adjust accordingly
      const response = await apiClient.post(`/users/reset-password/${token}`, {
        password: newPassword,
      });
      return response;
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.message ||
        "Reset password failed";
      console.error(
        "❌ resetPassword failed:",
        error.response?.data || error.message
      );
      throw new Error(msg);
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
      // Let axios/browser set the multipart/form-data boundary automatically
      const response = await apiClient.post("/users/register", userData);
      console.log("✅ Registration successful:", response.data);
      // Return full axios response so callers can access response.data consistently
      return response;
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

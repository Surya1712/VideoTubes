// Simple API test utility
import apiClient from "../services/api.js";

export const testAPI = async () => {
  try {
    console.log("Testing API connectivity...");
    console.log("Axios config:", {
      baseURL: apiClient.defaults.baseURL,
      withCredentials: apiClient.defaults.withCredentials,
    });

    // Test basic connectivity
    const testResponse = await apiClient.get("/test");
    console.log("✅ Test endpoint working:", testResponse.data);

    // Test health check
    const healthResponse = await apiClient.get("/healthcheck");
    console.log("✅ Health check working:", healthResponse.data);

    return true;
  } catch (error) {
    console.error("❌ API test failed:", error);
    return false;
  }
};

export const testLogin = async (email, password) => {
  try {
    console.log("Testing login...");
    const response = await apiClient.post("/users/login", { email, password });
    console.log("✅ Login test successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Login test failed:", error);
    throw error;
  }
};

export const testRegister = async (userData) => {
  try {
    console.log("Testing registration...");
    const response = await apiClient.post("/users/register", userData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    console.log("✅ Register test successful:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Register test failed:", error);
    throw error;
  }
};

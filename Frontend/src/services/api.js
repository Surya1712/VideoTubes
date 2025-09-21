import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_APP_API_URI || "http://localhost:8000/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600000,
  withCredentials: true,
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          // ✅ use axios directly, not apiClient
          const response = await axios.post(
            `${API_BASE_URL}/users/refresh-token`,
            { refreshToken },
            { withCredentials: true }
          );

          const { accessToken } = response.data.data;
          localStorage.setItem("accessToken", accessToken);

          // retry the failed request with the new token
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

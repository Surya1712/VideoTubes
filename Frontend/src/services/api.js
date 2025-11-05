import axios from "axios";

// Prefer the more explicit URI env var, fall back to older VITE_API_BASE_URL and finally localhost
const BASE_URL =
  import.meta?.env?.VITE_APP_API_URI ||
  import.meta?.env?.VITE_API_BASE_URL ||
  "http://localhost:8000/api/v1";

// Helpful debug output when running locally to spot misconfigured env vars
console.log("[api] BASE_URL:", BASE_URL);

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  timeout: 600000,
});

// Attach access token from localStorage on each request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: on 401 try refresh once and retry original request
apiClient.interceptors.response.use(
  (resp) => resp,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        // call refresh token endpoint directly (use plain axios to avoid loop)
        const refreshResp = await axios.post(
          `${BASE_URL}/users/refresh-token`,
          {},
          { withCredentials: true }
        );
        const newAccessToken =
          refreshResp?.data?.data?.accessToken ??
          refreshResp?.data?.accessToken ??
          null;
        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          // set header for original request and retry
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        // Refresh failed: clear auth storage
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        return Promise.reject(refreshErr);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;

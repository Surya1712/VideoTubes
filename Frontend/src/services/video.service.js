import axios from "axios";
import apiClient from "./api.js"; // centralized axios instance
import { getWatchHistory } from "../../../Testing-Backend-main/src/controllers/user.controller.js";

const API_BASE_URL =
  import.meta.env.VITE_APP_API_URI || "http://localhost:8000/api/v1";

// Enhanced error handling
const handleApiError = (error, defaultMessage = "Operation failed") => {
  console.error("API Error:", error);

  if (error.response) {
    // Server responded with error status
    const message =
      error.response.data?.message ||
      error.response.statusText ||
      defaultMessage;
    throw new Error(message);
  } else if (error.request) {
    // Request was made but no response received
    throw new Error("Network error - please check your connection");
  } else {
    // Something else happened
    throw new Error(error.message || defaultMessage);
  }
};

// Token refresh functionality
const refreshAccessToken = async () => {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    console.log("🔄 Attempting token refresh...");
    const response = await axios.post(
      `${API_BASE_URL}/users/refresh-token`,
      { refreshToken },
      { withCredentials: true }
    );

    const { accessToken } = response.data.data;
    localStorage.setItem("accessToken", accessToken);
    console.log("✅ Token refreshed successfully");

    return accessToken;
  } catch (error) {
    console.error("❌ Token refresh failed:", error);
    // Clear tokens and redirect to login
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    window.location.href = "/login";
    throw error;
  }
};

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      "API Request:",
      config.method?.toUpperCase(),
      config.url,
      config.data instanceof FormData ? "[FormData]" : config.data
    );

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh
apiClient.interceptors.response.use(
  (response) => {
    console.log("API Response:", response.status, response.config.url);
    return response;
  },
  async (error) => {
    console.error(
      "API Error:",
      error?.response?.status,
      error?.config?.url,
      error.response?.data
    );

    const originalRequest = error.config;

    // Handle 401 errors with token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest); // Retry with new token
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Video service methods
const videoService = {
  // Get all videos with enhanced error handling
  getAllVideos: async (params = {}) => {
    try {
      console.log("Fetching videos with params:", params);
      const response = await apiClient.get("/videos", { params });

      // Handle different response structures
      let videos = [];
      if (response.data?.data?.docs) {
        // Paginated response
        videos = response.data.data.docs;
      } else if (Array.isArray(response.data?.data)) {
        // Direct array response
        videos = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Data is the array itself
        videos = response.data;
      }

      console.log(`✅ Fetched ${videos.length} videos`);
      return {
        data: videos,
        totalPages: response.data?.data?.totalPages || 1,
        currentPage: response.data?.data?.page || 1,
        hasNextPage: response.data?.data?.hasNextPage || false,
        hasPrevPage: response.data?.data?.hasPrevPage || false,
      };
    } catch (error) {
      handleApiError(error, "Failed to fetch videos");
    }
  },

  // Upload video with progress tracking and better error handling
  uploadVideo: async (formData, onProgress = null) => {
    try {
      console.log("Starting video upload...");

      // Validate FormData
      if (!(formData instanceof FormData)) {
        throw new Error("Invalid form data");
      }

      // Log form data contents (for debugging)
      for (let [key, value] of formData.entries()) {
        console.log(
          `FormData: ${key}:`,
          value instanceof File ? `File: ${value.name}` : value
        );
      }

      const response = await apiClient.post("/videos", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // Optional: Add progress tracking
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload progress: ${percentCompleted}%`);
          if (onProgress) {
            onprogress(percentCompleted);
          }
        },
      });

      console.log("✅ Video uploaded successfully");
      return response.data.data;
    } catch (error) {
      handleApiError(error, "Failed to upload video");
    }
  },

  // Get video by ID
  getVideoById: async (videoId) => {
    try {
      if (!videoId) {
        throw new Error("Video ID is required");
      }

      console.log(`Fetching video: ${videoId}`);
      const response = await apiClient.get(`/videos/${videoId}`);

      console.log("✅ Video fetched successfully");
      return response.data.data;
    } catch (error) {
      handleApiError(error, "Failed to fetch video");
    }
  },

  // Update video
  updateVideo: async (videoId, updateData) => {
    try {
      if (!videoId) {
        throw new Error("Video ID is required");
      }

      console.log(`Updating video: ${videoId}`);

      let config = {};
      if (updateData instanceof FormData) {
        config.headers = { "Content-Type": "multipart/form-data" };
      }

      const response = await apiClient.patch(
        `/videos/${videoId}`,
        updateData,
        config
      );

      console.log("✅ Video updated successfully");
      return response.data.data;
    } catch (error) {
      handleApiError(error, "Failed to update video");
    }
  },

  // Delete video
  deleteVideo: async (videoId) => {
    try {
      if (!videoId) {
        throw new Error("Video ID is required");
      }

      console.log(`Deleting video: ${videoId}`);
      const response = await apiClient.delete(`/videos/${videoId}`);

      console.log("✅ Video deleted successfully");
      return response.data;
    } catch (error) {
      handleApiError(error, "Failed to delete video");
    }
  },

  // Toggle publish status - Fixed method name to match usage
  toggleVideoPublishStatus: async (videoId) => {
    try {
      if (!videoId) {
        throw new Error("Video ID is required");
      }

      console.log(`Toggling publish status for video: ${videoId}`);
      const response = await apiClient.patch(
        `/videos/toggle/publish/${videoId}`
      );

      console.log("✅ Publish status toggled successfully");
      return response.data.data;
    } catch (error) {
      handleApiError(error, "Failed to toggle publish status");
    }
  },

  // Get user's videos (for dashboard/manage videos)
  getUserVideos: async (params = {}) => {
    try {
      console.log(
        "Fetching user videos for userId:",
        userId,
        "with params",
        params
      );

      // If userId is provided, use the general videos endpoint with userId filter
      // Otherwise use the user-specific endpoint (requires auth)
      const endpoint = userid ? `/videos` : `/videos/user`;
      const requestParams = userid ? { ...params, userid } : params;
      const response = await apiClient.get(endpoint, { params: requestParams });

      // Handle paginated response
      let videos = [];
      if (response.data?.data?.docs) {
        videos = response.data.data.docs;
      } else if (Array.isArray(response.data?.data)) {
        videos = response.data.data;
      } else if (Array.isArray(response.data)) {
        videos = response.data;
      }

      console.log(`✅ Fetched ${videos.length} user videos`);
      return videos;
    } catch (error) {
      handleApiError(error, "Failed to fetch user videos");
    }
  },

  // Search videos
  searchVideos: async (query, params = {}) => {
    try {
      if (!query?.trim()) {
        throw new Error("Search query is required");
      }

      console.log(`Searching videos for: "${query}"`);
      const searchParams = { query: query.trim(), ...params };
      const response = await apiClient.get("/videos", { params: searchParams });

      // const videos =  || response.data?.data || [];
      let videos = [];
      if (response.data?.data?.docs) {
        videos = response.data.data.docs;
      } else if (Array.isArray(response.data?.data)) {
        videos = response.data.data;
      } else if (Array.isArray(response.data)) {
        videos = response.data;
      }
      console.log(`✅ Found ${videos.length} videos for search: "${query}"`);
      return videos;
    } catch (error) {
      handleApiError(error, "Failed to search videos");
    }
  },
};

// Get watch history
getWatchHistory: async () => {
  try {
    console.log("Fetching watch history...");
    const response = await apiClient.get("users/watch-history");

    let videos = [];
    if (Array.isArray(response.data?.data)) {
      videos = response.data.data;
    } else if (Array.isArray(response.data)) {
      videos = response.data;
    }

    console.log(`✅ Fetched ${videos.length} videos in watch history`);
    return videos;
  } catch (error) {
    handleApiError(error, "Failed to fetch watch history");
  }
};

//Likes video
likeVideo: async (videoId) => {
  try {
    if (!videoId) {
      throw new Error("Video ID is required");
    }

    console.log(`Toggling like for video:${videoId}`);
    const response = await apiClient.options(`/likes/toggle/v/${videoId}`);

    console.log("✅ Like toggled successfully");
    return response.data.data;
  } catch (error) {
    handleApiError(error, "Failed to toggle like");
  }
};

// Debug logging
console.log("✅ Video service initialized with base URL:", API_BASE_URL);

export default videoService;

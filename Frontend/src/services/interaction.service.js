import apiClient from "./api.js";

export const interactionService = {
  // Get video details (used to read likesCount, likedByUser, uploader info)
  getVideo: async (videoId) => {
    const res = await apiClient.get(`/videos/${videoId}`);
    return res.data;
  },

  // Likes
  toggleLike: async (videoId) => {
    const res = await apiClient.post(`/videos/${videoId}/like`);
    return res.data;
  },
  getLikes: async (videoId) => {
    const res = await apiClient.get(`/videos/${videoId}/likes`);
    return res.data;
  },

  // Comments
  getComments: async (videoId) => {
    const res = await apiClient.get(`/videos/${videoId}/comments`);
    return res.data;
  },
  addComment: async (videoId, text) => {
    const res = await apiClient.post(`/videos/${videoId}/comments`, { text });
    return res.data;
  },

  // Subscriptions
  subscribe: async (channelId) => {
    const res = await apiClient.post(`/subscriptions/${channelId}`);
    return res.data;
  },
  unsubscribe: async (channelId) => {
    const res = await apiClient.delete(`/subscriptions/${channelId}`);
    return res.data;
  },
  getSubscriptionStatus: async (channelId) => {
    const res = await apiClient.get(`/subscriptions/${channelId}/status`);
    return res.data;
  },
  // Playlist methods
  getUserPlaylists: async (userId, page = 1, limit = 10) => {
    const response = await apiClient.get(
      `/playlist/user/${userId}?page=${page}&limit=${limit}`
    );
    return response.data;
  },
  getPlaylists: async (userId) => {
    const res = await apiClient.get(`/playlist/user/${userId}`);
    return res.data;
  },
  createPlaylist: async (data) => {
    const response = await apiClient.post(`/playlist`, data);
    return response.data;
  },

  updatePlaylist: async (playlistId, data) => {
    const response = await apiClient.patch(`/playlist/${playlistId}`, data);
    return response.data;
  },

  deletePlaylist: async (playlistId) => {
    const response = await apiClient.delete(`/playlist/${playlistId}`);
    return response.data;
  },

  getPlaylistById: async (playlistId) => {
    const response = await apiClient.get(`/playlist/${playlistId}`);
    return response.data;
  },

  addVideoToPlaylist: async (videoId, playlistId) => {
    const response = await apiClient.patch(
      `/playlist/add/${videoId}/${playlistId}`
    );
    return response.data;
  },

  removeVideoFromPlaylist: async (videoId, playlistId) => {
    const response = await apiClient.patch(
      `/playlist/remove/${videoId}/${playlistId}`
    );
    return response.data;
  },
};

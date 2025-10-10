import apiClient from "./api";

export const commentService = {
  async getVideoComments(videoId, page = 1, limit = 10) {
    const response = await apiClient.get(
      `/comments/${videoId}?page=${page}&limit=${limit}`
    );
    return response.data.data;
  },

  async addComment(videoId, content) {
    const response = await apiClient.post(`/comments/${videoId}`, { content });
    return response.data.data;
  },

  async updateComment(commentId, content) {
    const response = await apiClient.patch(`/comments/c/${commentId}`, {
      content,
    });
    return response.data.data;
  },

  async deleteComment(commentId) {
    const response = await apiClient.delete(`/comments/c/${commentId}`);
    return response.data;
  },

  async likeComment(commentId) {
    const response = await apiClient.post(`/likes/toggle/c/${commentId}`);
    return response.data;
  },
};

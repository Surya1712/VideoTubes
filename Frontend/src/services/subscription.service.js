import apiClient from "./api.js";

export const subscriptionService = {
  getUserSubscriptionStatus: async (channelId) => {
    const response = await apiClient.get(
      `/subscriptions/c/${channelId}/status`
    );
    return response.data; // { subscribed: true/false }
  },

  toggleSubscription: async (channelId) => {
    const response = await apiClient.post(`/subscriptions/c/${channelId}`);
    return response.data; // { subscribed: true, message }
  },
};

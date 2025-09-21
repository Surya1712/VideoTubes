import api from "./api";

export const subscriptionService = {
  async toggleSubscription(channelId) {
    const response = await api.post(`/subscriptions/c/${channelId}`);
    return response.data;
  },

  async getUserChannelSubscribers(channelId) {
    const response = await api.get(`/subscriptions/c/${channelId}`);
    return response.data.data;
  },

  async getSubscribedChannels(subscriberId) {
    const response = await api.get(`/subscriptions/u/${subscriberId}`);
    return response.data.data;
  },
};

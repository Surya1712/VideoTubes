import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import apiClient from "../services/api.js";
import VideoGrid from "../components/video/VideoGrid.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import toast from "react-hot-toast";

const Subscriptions = () => {
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchSubscriptions();
  }, [user]);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      // backend supports GET /api/v1/subscriptions/u/:subscriberId
      // Note: backend route includes the 'u' prefix (see subscription.routes.js)
      const res = await apiClient.get(`/subscriptions/u/${user._id}`);

      // Normalize a few possible shapes:
      // - { data: [channels] }
      // - { data: { docs: [subscriptions] } }
      // - { data: { subscriptions: [...] } }
      // - [ { channel: {...} } ]
      const payload = res?.data ?? res;
      let arr = [];

      if (Array.isArray(payload)) arr = payload;
      else if (Array.isArray(payload?.data)) arr = payload.data;
      else if (Array.isArray(payload?.data?.data)) arr = payload.data.data;
      else if (Array.isArray(payload?.data?.docs)) arr = payload.data.docs;
      else if (Array.isArray(payload?.data?.subscriptions))
        arr = payload.data.subscriptions;
      else arr = [];

      // Unwrap subscription entries to channel objects when necessary
      const list = arr
        .map((item) => {
          if (!item) return null;
          // common shapes
          // handle subscription wrapper from backend: { subscribedChannel: { ... } }
          const wrapped =
            item.subscribedChannel ||
            item.subscribedChannel ||
            item.channel ||
            item.subscribedTo ||
            item.to ||
            item;
          const ch = wrapped;
          // normalize simple fields
          return {
            _id: ch._id || ch.id || ch.channelId || null,
            username: ch.username || ch.name || ch.userName || null,
            fullName: ch.fullName || ch.name || ch.displayName || null,
            avatar: ch.avatar || ch.profilePic || ch.avatarUrl || null,
            subscribersCount:
              ch.subscribersCount || ch.subscriberCount || ch.subscribers || 0,
            videos:
              ch.videos ||
              ch.recentVideos ||
              (ch.latestVideo ? [ch.latestVideo] : []),
          };
        })
        .filter(Boolean);

      setChannels(list);
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error);
      toast.error(error.message || "Failed to load subscriptions");
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Subscriptions
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Channels you are subscribed to
            </p>
          </div>
        </div>

        {/* If the backend returned channel objects with latest video arrays, try to render them */}
        {channels.length > 0 ? (
          <div className="space-y-6">
            {channels.map((ch) => (
              <div
                key={ch._id || ch.username}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {ch.avatar ? (
                      <img
                        src={ch.avatar.url || ch.avatar}
                        alt={ch.fullName || ch.username}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white">
                        C
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {ch.fullName || ch.username}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {ch.subscribersCount || 0} subscribers
                      </div>
                    </div>
                  </div>
                </div>

                {/* Try render a sample grid of recent videos if available */}
                {Array.isArray(ch.videos) && ch.videos.length > 0 ? (
                  <VideoGrid videos={ch.videos} />
                ) : (
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    No recent videos from this channel.
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No subscriptions yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Subscribe to channels to see them here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Subscriptions;

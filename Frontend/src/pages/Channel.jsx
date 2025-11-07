import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import videoService from "../services/video.service.js";
import VideoGrid from "../components/video/VideoGrid.jsx";
import SubscribeButton from "../components/SubscribeButton.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const Channel = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [channelInfo, setChannelInfo] = useState(null);

  useEffect(() => {
    if (!username) return;
    fetchChannelVideos();
  }, [username]);

  const fetchChannelVideos = async () => {
    try {
      setLoading(true);
      // attempt to fetch videos by owner username
      const res = await videoService.getAllVideos({ ownerUsername: username });

      // Normalize possible response shapes from API
      // - { data: [videos] }
      // - { data: { docs: [videos], ... } }
      // - [videos]
      // - { data: { videos: [...] } }
      let list = [];
      if (!res) list = [];
      else if (Array.isArray(res)) list = res;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.data?.data)) list = res.data.data;
      else if (Array.isArray(res?.data?.data?.docs)) list = res.data.data.docs;
      else if (Array.isArray(res?.data?.docs)) list = res.data.docs;
      else if (Array.isArray(res?.data?.videos)) list = res.data.videos;
      else if (Array.isArray(res?.data)) list = res.data;
      else list = [];

      setVideos(list);

      // Derive channel info from response shapes
      let channel = null;
      // Check first video owner
      if (list.length > 0 && (list[0].owner || list[0].ownerDetails)) {
        channel = list[0].owner || list[0].ownerDetails;
      }

      // Fallback: API might include channel object at res.data.channel or res.data.data.channel
      if (!channel) {
        channel =
          res?.data?.channel ||
          res?.data?.data?.channel ||
          res?.data?.owner ||
          null;
      }

      if (!channel) channel = { username };
      setChannelInfo(channel);
    } catch (error) {
      console.error("Failed to fetch channel videos:", error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {channelInfo?.fullName || channelInfo?.username || username}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Channel • {videos.length} videos
            </p>
          </div>

          <div>
            {/* If we discovered channel id from owner data, show subscribe button */}
            {channelInfo?._id ? (
              <SubscribeButton channelId={channelInfo._id} />
            ) : (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Sign in to subscribe
              </div>
            )}
          </div>
        </div>

        <VideoGrid videos={videos} loading={loading} />

        {!loading && videos.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No videos found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              This channel has not uploaded any videos yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Channel;

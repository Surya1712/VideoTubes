import React, { useEffect, useState } from "react";
import apiClient from "../services/api.js";
import VideoPlayer from "../components/VideoPlayer.jsx";
import TweetComposer from "../components/TweetComposer.jsx";

export default function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      // backend likely exposes /videos or /videos/feed - try /videos
      const res = await apiClient.get("/videos");
      // normalize: response.data.data or response.data
      const payload = res.data?.data ?? res.data;
      setVideos(Array.isArray(payload) ? payload : payload.videos ?? []);
    } catch (e) {
      console.error("Failed to load videos", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return (
    <div className="space-y-6 p-4">
      <div className="max-w-3xl mx-auto">
        <TweetComposer onPosted={() => fetchVideos()} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {loading ? (
          <div>Loading...</div>
        ) : videos.length === 0 ? (
          <div>No videos yet</div>
        ) : (
          videos.map((v) => <VideoPlayer key={v._id || v.id} video={v} />)
        )}
      </div>
    </div>
  );
}

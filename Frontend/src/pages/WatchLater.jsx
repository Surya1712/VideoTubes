import { useEffect, useState } from "react";
import videoService from "../services/video.service.js";
import VideoGrid from "../components/video/VideoGrid.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

const WatchLater = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchWatchLater();
  }, [user]);

  const fetchWatchLater = async () => {
    try {
      setLoading(true);
      const res = await videoService.getWatchLater();
      setVideos(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      console.error("Failed to fetch watch later:", error);
      toast.error(error.message || "Failed to load watch later");
      setVideos([]);
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
              Watch Later
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Videos you saved to watch later
              {!loading && videos.length > 0 && ` (${videos.length} videos)`}
            </p>
          </div>
        </div>

        <VideoGrid videos={videos} loading={loading} />

        {!loading && videos.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No videos saved to Watch Later
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Save videos to watch them later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchLater;

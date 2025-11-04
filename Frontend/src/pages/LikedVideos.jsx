import { useEffect, useState } from "react";
import { interactionService } from "../services/interaction.service.js";
import VideoGrid from "../components/video/VideoGrid.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";

const LikedVideos = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchLikedVideos();
  }, [user]);

  const fetchLikedVideos = async () => {
    try {
      setLoading(true);
      const res = await interactionService.getLikes();
      // interactionService.getLikes returns data in various shapes; normalize
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (res?.data) list = res.data;
      else if (Array.isArray(res?.data)) list = res.data;
      else if (Array.isArray(res?.likedVideos)) list = res.likedVideos;

      // If backend returns aggregated objects with { likedVideo }, unwrap
      list = list.map((item) => item.likedVideo || item);

      setVideos(list);
    } catch (error) {
      console.error("Failed to fetch liked videos:", error);
      toast.error(error.message || "Failed to load liked videos");
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
              Liked Videos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Videos you've liked
              {!loading && videos.length > 0 && ` (${videos.length} videos)`}
            </p>
          </div>
        </div>

        <VideoGrid videos={videos} loading={loading} />

        {!loading && videos.length === 0 && (
          <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No liked videos
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Like videos to find them here later.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LikedVideos;

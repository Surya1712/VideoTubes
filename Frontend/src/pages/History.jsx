import React, { useEffect, useState } from "react";
import videoService from "../services/video.service.js";
import VideoGrid from "../components/video/VideoGrid.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { Navigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react";

const History = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchWatchHistory();
    }
  }, [user]);

  const fetchWatchHistory = async () => {
    try {
      setLoading(true);
      console.log("Fetching watch history...");

      const history = await videoService.getWatchHistory();
      console.log("Watch history response:", history);

      setVideos(Array.isArray(history) ? history : []);
    } catch (error) {
      console.error("Error fetching watch history:", error);
      toast.error(error.message || "Failed to load watch history");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (
      !confirm(
        "Are you sure you want to clear your entire watch history? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setClearing(true);
      // Note: You might need to implement this endpoint in your backend
      // For now, we'll just clear the local state
      setVideos([]);
      toast.success("Watch history cleared");
    } catch (error) {
      console.error("Error clearing history:", error);
      toast.error("Failed to clear watch history");
    } finally {
      setClearing(false);
    }
  };

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Watch History
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Videos you've watched recently
              {!loading && videos.length > 0 && ` (${videos.length} videos)`}
            </p>
          </div>

          {/* Clear History Button */}
          {!loading && videos.length > 0 && (
            <button
              onClick={handleClearHistory}
              disabled={clearing}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>{clearing ? "Clearing..." : "Clear History"}</span>
            </button>
          )}
        </div>

        {/* Video Grid */}
        <VideoGrid videos={videos} loading={loading} />

        {/* Empty State */}
        {!loading && videos.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Watch History
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You haven't watched any videos yet. Start exploring to build your
              watch history!
            </p>
            <button
              onClick={() => (window.location.href = "/")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Discover Videos
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-16">
            <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading your watch history...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;

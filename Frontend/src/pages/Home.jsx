import React, { useEffect, useState } from "react";
import videoService from "../services/video.service.js";
import VideoGrid from "../components/video/VideoGrid.jsx";
import toast from "react-hot-toast";

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async (page = 1) => {
    try {
      setLoading(true);
      console.log("Fetching videos for home page...");

      // Fetch videos with pagination
      const response = await videoService.getAllVideos({
        page,
        limit: 12,
        sortBy: "createdAt",
        sortType: "desc",
      });

      console.log("Home page videos response:", response);

      // Extract videos from response
      const videoList = response?.data || [];
      setVideos(videoList);

      // Set pagination info
      setPagination({
        currentPage: response?.currentPage || 1,
        totalPages: response?.totalPages || 1,
        hasNextPage: response?.hasNextPage || false,
        hasPrevPage: response?.hasPrevPage || false,
      });

      console.log(`Successfully loaded ${videoList.length} videos`);
    } catch (error) {
      console.error("Error fetching videos:", error);
      toast.error(error.message || "Failed to fetch videos");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = async () => {
    if (!pagination.hasNextPage || loading) return;

    try {
      setLoading(true);
      const response = await videoService.getAllVideos({
        page: pagination.currentPage + 1,
        limit: 12,
        sortBy: "createdAt",
        sortType: "desc",
      });

      const newVideos = response?.data || [];

      // Append new videos to existing ones
      setVideos((prevVideos) => [...prevVideos, ...newVideos]);

      // Update pagination
      setPagination({
        currentPage: response?.currentPage || pagination.currentPage + 1,
        totalPages: response?.totalPages || pagination.totalPages,
        hasNextPage: response?.hasNextPage || false,
        hasPrevPage: response?.hasPrevPage || true,
      });

      toast.success(`Loaded ${newVideos.length} more videos`);
    } catch (error) {
      console.error("Error loading more videos:", error);
      toast.error("Failed to load more videos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Recommended
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Discover the latest videos from creators around the world
          </p>
        </div>

        {/* Video Grid */}
        <VideoGrid videos={videos} loading={loading} />

        {/* Load More Button */}
        {!loading && videos.length > 0 && pagination.hasNextPage && (
          <div className="flex justify-center mt-8">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? "Loading..." : "Load More Videos"}
            </button>
          </div>
        )}

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
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Videos Available
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              There are no videos to display at the moment. Check back later!
            </p>
            <button
              onClick={() => fetchVideos()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        )}

        {/* Pagination Info */}
        {!loading && videos.length > 0 && (
          <div className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
            Showing page {pagination.currentPage} of {pagination.totalPages}
            {videos.length > 0 && ` (${videos.length} videos loaded)`}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

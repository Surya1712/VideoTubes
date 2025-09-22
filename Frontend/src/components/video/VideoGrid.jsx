import React from "react";
import VideoCard from "./VideoCard";

const VideoGrid = ({ videos = [], loading = false }) => {
  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="aspect-video bg-gray-300 dark:bg-gray-700 rounded-lg mb-3"></div>
            <div className="flex space-x-3">
              <div className="w-9 h-9 bg-gray-300 dark:bg-gray-700 rounded-full flex-shrink-0"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3 mb-1"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Ensure videos is an array
  const videoList = Array.isArray(videos) ? videos : [];

  // Filter out invalid videos
  const validVideos = videoList.filter(
    (video) => video && video._id && typeof video === "object"
  );

  // Empty state
  if (validVideos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
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
          No Videos Found
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          There are no videos to display at the moment. Check back later for new
          content!
        </p>
      </div>
    );
  }

  // Render video grid
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {validVideos.map((video, index) => {
        try {
          return <VideoCard key={video._id || index} video={video} />;
        } catch (error) {
          console.error("Error rendering video card:", error, video);
          return null;
        }
      })}
    </div>
  );
};

export default VideoGrid;

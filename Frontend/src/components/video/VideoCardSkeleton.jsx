import React from "react";

const VideoCardSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="aspect-video bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
      <div className="flex mt-3 space-x-3">
        <div className="flex-shrink-0">
          <div className="w-9 h-9 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
      </div>
    </div>
  );
};

export default VideoCardSkeleton;

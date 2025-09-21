import React from "react";
import VideoCard from "./VideoCard.jsx";
import VideoCardSkeleton from "./VideoCardSkeleton.jsx";

const VideoGrid = ({
  videos,
  loading = false,
  error = null,
  emptyMessage = "No videos found",
  skeletonCount = 12,
  className = "",
}) => {
  // Handle loading state
  if (loading) {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 ${className}`}
      >
        {Array.from({ length: skeletonCount }).map((_, index) => (
          <VideoCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 dark:text-red-400 mb-4">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p className="text-lg font-medium">Error loading videos</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {typeof error === "string"
              ? error
              : "Something went wrong while loading videos"}
          </p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Safely extract videos array - handle different data structures
  let videoArray = [];

  if (Array.isArray(videos)) {
    videoArray = videos;
  } else if (videos && Array.isArray(videos.docs)) {
    // Handle paginated response
    videoArray = videos.docs;
  } else if (videos && Array.isArray(videos.data)) {
    // Handle nested data structure
    videoArray = videos.data;
  } else if (videos && typeof videos === "object") {
    // Try to find array in common property names
    const possibleArrays = ["videos", "items", "results", "content"];
    for (const prop of possibleArrays) {
      if (Array.isArray(videos[prop])) {
        videoArray = videos[prop];
        break;
      }
    }
  }

  // Handle empty state
  if (videoArray.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-500 dark:text-gray-400">
          <svg
            className="w-20 h-20 mx-auto mb-6 text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
          <h3 className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
            {emptyMessage}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            {emptyMessage.includes("No videos found")
              ? "Try uploading some videos or adjusting your search criteria"
              : "Check back later for new content"}
          </p>
        </div>
      </div>
    );
  }

  // Filter out invalid videos and log warnings
  const validVideos = videoArray.filter((video, index) => {
    if (!video) {
      console.warn(`Invalid video at index ${index}: null or undefined`);
      return false;
    }

    if (!video._id && !video.id) {
      console.warn(`Invalid video at index ${index}: missing ID`, video);
      return false;
    }

    return true;
  });

  // Log if we filtered out any videos
  if (validVideos.length !== videoArray.length) {
    console.warn(
      `Filtered out ${videoArray.length - validVideos.length} invalid videos`
    );
  }

  // Handle case where all videos were invalid
  if (validVideos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-yellow-500 dark:text-yellow-400">
          <svg
            className="w-16 h-16 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <p className="text-lg font-medium">Invalid video data</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            The video data appears to be corrupted. Please refresh the page.
          </p>
        </div>
      </div>
    );
  }

  // Render video grid
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 ${className}`}
    >
      {validVideos.map((video) => {
        const videoId = video._id || video.id;
        return (
          <VideoCard
            key={videoId}
            video={video}
            className="transform transition-transform duration-200 hover:scale-105"
          />
        );
      })}
    </div>
  );
};

// Add PropTypes for better development experience (optional)
VideoGrid.propTypes = {
  videos: function (props, propName, componentName) {
    const value = props[propName];
    if (value == null) return null; // Allow null/undefined

    if (Array.isArray(value)) return null; // Allow arrays

    if (typeof value === "object") {
      // Allow objects that might contain arrays
      const possibleArrays = [
        "docs",
        "data",
        "videos",
        "items",
        "results",
        "content",
      ];
      const hasValidArray = possibleArrays.some((prop) =>
        Array.isArray(value[prop])
      );
      if (hasValidArray) return null;
    }

    return new Error(
      `Invalid prop \`${propName}\` of type \`${typeof value}\` supplied to \`${componentName}\`, expected \`array\` or \`object with array property\`.`
    );
  },
  loading: function (props, propName, componentName) {
    const value = props[propName];
    if (typeof value !== "boolean" && value != null) {
      return new Error(
        `Invalid prop \`${propName}\` of type \`${typeof value}\` supplied to \`${componentName}\`, expected \`boolean\`.`
      );
    }
  },
  error: function (props, propName, componentName) {
    const value = props[propName];
    if (
      value != null &&
      typeof value !== "string" &&
      !(value instanceof Error)
    ) {
      return new Error(
        `Invalid prop \`${propName}\` of type \`${typeof value}\` supplied to \`${componentName}\`, expected \`string\`, \`Error\`, or \`null\`.`
      );
    }
  },
  emptyMessage: function (props, propName, componentName) {
    const value = props[propName];
    if (typeof value !== "string" && value != null) {
      return new Error(
        `Invalid prop \`${propName}\` of type \`${typeof value}\` supplied to \`${componentName}\`, expected \`string\`.`
      );
    }
  },
  skeletonCount: function (props, propName, componentName) {
    const value = props[propName];
    if (typeof value !== "number" || value < 0 || !Number.isInteger(value)) {
      return new Error(
        `Invalid prop \`${propName}\` of value \`${value}\` supplied to \`${componentName}\`, expected positive integer.`
      );
    }
  },
  className: function (props, propName, componentName) {
    const value = props[propName];
    if (typeof value !== "string" && value != null) {
      return new Error(
        `Invalid prop \`${propName}\` of type \`${typeof value}\` supplied to \`${componentName}\`, expected \`string\`.`
      );
    }
  },
};

export default VideoGrid;

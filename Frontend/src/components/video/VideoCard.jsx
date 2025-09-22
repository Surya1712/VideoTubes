import React from "react";
import { Link } from "react-router-dom";
import {
  formatTimeAgo,
  formatViews,
  formatDuration,
} from "../../utils/formatTime";
import { User, Eye, Clock } from "lucide-react";

const VideoCard = ({ video }) => {
  // Early return if video data is invalid
  if (!video || !video._id) {
    return null;
  }

  // Helper function to safely get URL from different formats
  const getImageUrl = (imageField) => {
    if (!imageField) return null;
    if (typeof imageField === "string") return imageField;
    return imageField.url || null;
  };

  // Safely extract owner data with fallbacks
  const owner = video.owner || video.ownerDetails || {};
  const ownerName = owner.fullName || owner.username || "Unknown Creator";
  const ownerUsername = owner.username || "unknown";
  const ownerAvatar = getImageUrl(owner.avatar);
  const subscriberCount = owner.subscribersCount || 0;

  // Video data with fallbacks
  const videoTitle = video.title || "Untitled Video";
  const videoThumbnail = getImageUrl(video.thumbnail);
  const videoViews = video.views || 0;
  const videoDuration = video.duration || 0;
  const videoCreatedAt = video.createdAt || new Date().toISOString();

  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-lg bg-gray-200 dark:bg-gray-800">
        <Link to={`/watch/${video._id}`}>
          <div className="aspect-video relative">
            {videoThumbnail ? (
              <img
                src={videoThumbnail}
                alt={videoTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                onError={(e) => {
                  e.target.src = "/placeholder-thumbnail.jpg";
                  e.target.onerror = null;
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                <div className="text-gray-500 dark:text-gray-400">
                  <svg
                    className="w-12 h-12"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM5 8a1 1 0 011-1h1a1 1 0 110 2H6a1 1 0 01-1-1zm6 1a1 1 0 100 2 1 1 0 000-2z" />
                  </svg>
                </div>
              </div>
            )}

            {/* Duration overlay */}
            {videoDuration > 0 && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-1.5 py-0.5 rounded">
                {formatDuration(videoDuration)}
              </div>
            )}

            {/* Play button overlay on hover */}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 flex items-center justify-center transition-all duration-200">
              <div className="w-12 h-12 bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full flex items-center justify-center transition-all duration-200">
                <svg
                  className="w-5 h-5 text-transparent group-hover:text-black ml-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Video Info */}
      <div className="mt-3 flex space-x-3">
        {/* Channel Avatar */}
        <div className="flex-shrink-0">
          <Link to={`/channel/${ownerUsername}`}>
            {ownerAvatar ? (
              <img
                src={ownerAvatar}
                alt={ownerName}
                className="w-9 h-9 rounded-full object-cover"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className={`w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center ${
                ownerAvatar ? "hidden" : "flex"
              }`}
            >
              <User className="w-5 h-5 text-white" />
            </div>
          </Link>
        </div>

        {/* Video Details */}
        <div className="flex-1 min-w-0">
          <Link to={`/watch/${video._id}`}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {videoTitle}
            </h3>
          </Link>

          <Link
            to={`/channel/${ownerUsername}`}
            className="block mt-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            {ownerName}
          </Link>

          <div className="flex items-center mt-1 text-sm text-gray-600 dark:text-gray-400 space-x-1">
            <div className="flex items-center space-x-1">
              <Eye className="w-3 h-3" />
              <span>{formatViews(videoViews)} views</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatTimeAgo(videoCreatedAt)}</span>
            </div>
          </div>

          {/* Optional: Show subscriber count */}
          {subscriberCount > 0 && (
            <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
              {formatViews(subscriberCount)} subscribers
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;

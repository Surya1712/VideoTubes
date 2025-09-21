import React from "react";
import { Link } from "react-router-dom";
import { MoreVertical, User } from "lucide-react";
import {
  formatDuration,
  formatTimeAgo,
  formatViews,
} from "../../utils/formatTime.js";

const VideoCard = ({ video }) => {
  return (
    <div className="group cursor-pointer">
      <Link to={`/watch/${video._id}`}>
        <div className="relative aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          />
          <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
            {formatDuration(video.duration)}
          </div>
        </div>

        <div className="flex mt-3 space-x-3">
          <div className="flex-shrink-0">
            {video.owner.avatar ? (
              <img
                src={video.owner.avatar}
                alt={video.owner.fullName}
                className="w-9 h-9 rounded-full object-cover"
              />
            ) : (
              <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {video.title}
            </h3>
            <Link
              to={`/channel/${video.owner.username}`}
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mt-1 block"
            >
              {video.owner.fullName}
            </Link>
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-1">
              <span>{formatViews(video.views)} views</span>
              <span className="mx-1">•</span>
              <span>{formatTimeAgo(video.createdAt)}</span>
            </div>
          </div>

          <button className="flex-shrink-0 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </Link>
    </div>
  );
};

export default VideoCard;

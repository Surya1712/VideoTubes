import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { Edit, Trash2, Eye, EyeOff, MoreVertical, Plus } from "lucide-react";
import videoService from "../services/video.service";
import { useAuth } from "../context/AuthContext";
import {
  formatTimeAgo,
  formatViews,
  formatDuration,
} from "../utils/formatTime";
import { Menu } from "@headlessui/react";
import toast from "react-hot-toast";

const ManageVideos = () => {
  const { user } = useAuth();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserVideos();
    }
  }, [user]);

  const fetchUserVideos = async () => {
    try {
      setLoading(true);
      console.log("Fetching user videos for user:", user._id);

      // Use the authenticated user videos endpoint
      const userVideos = await videoService.getUserVideos();
      console.log("Fetched user videos:", userVideos);

      setVideos(Array.isArray(userVideos) ? userVideos : []);
    } catch (error) {
      console.error("Error fetching user videos:", error);
      toast.error(error.message || "Failed to load videos");
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (
      !confirm(
        "Are you sure you want to delete this video? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeleting(videoId);
      await videoService.deleteVideo(videoId);

      // Update state by filtering out the deleted video
      setVideos((prevVideos) =>
        prevVideos.filter((video) => video._id !== videoId)
      );
      toast.success("Video deleted successfully");
    } catch (error) {
      console.error("Error deleting video:", error);
      toast.error(error.message || "Failed to delete video");
    } finally {
      setDeleting(null);
    }
  };

  const handleTogglePublish = async (videoId) => {
    try {
      console.log("Toggling publish status for video:", videoId);
      const updatedVideo = await videoService.toggleVideoPublishStatus(videoId);

      // Update the video in state
      setVideos((prevVideos) =>
        prevVideos.map((video) =>
          video._id === videoId
            ? { ...video, isPublished: updatedVideo.isPublished }
            : video
        )
      );

      toast.success(
        updatedVideo.isPublished ? "Video published" : "Video unpublished"
      );
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toast.error(error.message || "Failed to update video status");
    }
  };

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const filteredVideos = videos.filter((video) => {
    if (filter === "published") return video.isPublished;
    if (filter === "unpublished") return !video.isPublished;
    return true;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 dark:bg-gray-700 h-24 rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Your Videos
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and organize your uploaded content ({videos.length} total)
          </p>
        </div>
        <Link
          to="/upload"
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Upload Video</span>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        {[
          { key: "all", label: "All Videos", count: videos.length },
          {
            key: "published",
            label: "Published",
            count: videos.filter((v) => v.isPublished).length,
          },
          {
            key: "unpublished",
            label: "Unpublished",
            count: videos.filter((v) => !v.isPublished).length,
          },
        ].map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === key
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* Videos List */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No videos found
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {filter === "all"
              ? "You haven't uploaded any videos yet."
              : `No ${filter} videos found.`}
          </p>
          {filter === "all" && (
            <Link
              to="/upload"
              className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Upload Your First Video</span>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVideos.map((video) => (
            <div
              key={video._id}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-x-0 sm:space-x-4">
                {/* Thumbnail: responsive width and preserved aspect ratio */}
                <div className="relative flex-shrink-0 w-full sm:w-32 md:w-40 lg:w-48">
                  <div className="aspect-video w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <img
                      src={video.thumbnail?.url || video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "/placeholder-thumbnail.jpg"; // Fallback image
                      }}
                    />
                  </div>
                  {video.duration && (
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 py-0.5 rounded">
                      {formatDuration(video.duration)}
                    </div>
                  )}
                  {!video.isPublished && (
                    <div className="absolute top-1 left-1 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                      Draft
                    </div>
                  )}
                </div>

                {/* Video Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 truncate">
                    {video.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2 line-clamp-2">
                    {video.description || "No description"}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{formatViews(video.views || 0)} views</span>
                    </span>
                    <span>{formatTimeAgo(video.createdAt)}</span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        video.isPublished
                          ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400"
                          : "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400"
                      }`}
                    >
                      {video.isPublished ? "Published" : "Draft"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/watch/${video._id}`}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    title="View video"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>

                  <Link
                    to={`/edit-video/${video._id}`}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                    title="Edit video"
                  >
                    <Edit className="w-5 h-5" />
                  </Link>

                  <Menu as="div" className="relative">
                    <Menu.Button className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </Menu.Button>

                    <Menu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 focus:outline-none z-10">
                      <div className="p-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => handleTogglePublish(video._id)}
                              className={`flex items-center space-x-2 w-full px-3 py-2 text-sm rounded ${
                                active ? "bg-gray-100 dark:bg-gray-700" : ""
                              }`}
                            >
                              {video.isPublished ? (
                                <EyeOff className="w-4 h-4" />
                              ) : (
                                <Eye className="w-4 h-4" />
                              )}
                              <span>
                                {video.isPublished ? "Unpublish" : "Publish"}
                              </span>
                            </button>
                          )}
                        </Menu.Item>

                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => handleDeleteVideo(video._id)}
                              disabled={deleting === video._id}
                              className={`flex items-center space-x-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 rounded disabled:opacity-50 ${
                                active ? "bg-red-50 dark:bg-red-900/20" : ""
                              }`}
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>
                                {deleting === video._id
                                  ? "Deleting..."
                                  : "Delete"}
                              </span>
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Menu>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ManageVideos;

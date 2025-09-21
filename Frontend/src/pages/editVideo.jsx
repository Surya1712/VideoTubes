import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Save, X, Image, Eye, EyeOff } from "lucide-react";
import videoService from "../services/video.service";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const EditVideo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublished: false,
  });
  const [newThumbnail, setNewThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    if (id && user) {
      fetchVideo();
    }
  }, [id, user]);

  const fetchVideo = async () => {
    try {
      if (!id) return;

      console.log("Fetching video for editing:", id);
      const videoData = await videoService.getVideoById(id);
      console.log("Fetched video data:", videoData);

      // Check if user owns this video
      if (videoData.owner._id !== user?._id) {
        toast.error("You can only edit your own videos");
        navigate("/manage-videos");
        return;
      }

      setVideo(videoData);
      setFormData({
        title: videoData.title || "",
        description: videoData.description || "",
        isPublished: videoData.isPublished || false,
      });
    } catch (error) {
      console.error("Error fetching video:", error);
      toast.error(error.message || "Failed to load video");
      navigate("/manage-videos");
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Thumbnail size must be less than 5MB");
        return;
      }

      // Check file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      setNewThumbnail(file);
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    }
  };

  const removeThumbnail = () => {
    setNewThumbnail(null);
    setThumbnailPreview("");
    if (thumbnailPreview) {
      URL.revokeObjectURL(thumbnailPreview);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Please enter a video title");
      return;
    }

    setSaving(true);

    try {
      if (!id) return;

      console.log("Updating video with data:", formData);

      // Update video details
      const updatedVideo = await videoService.updateVideo(id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
      });

      console.log("Video details updated:", updatedVideo);

      // Update thumbnail if new one is selected
      if (newThumbnail) {
        console.log("Updating thumbnail...");
        const thumbnailData = new FormData();
        thumbnailData.append("thumbnail", newThumbnail);
        await videoService.updateVideo(id, thumbnailData);
        console.log("Thumbnail updated successfully");
      }

      toast.success("Video updated successfully!");
      navigate("/manage-videos");
    } catch (error) {
      console.error("Error updating video:", error);
      toast.error(error.message || "Failed to update video");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async () => {
    try {
      if (!id) return;

      setPublishing(true);
      console.log("Toggling publish status for video:", id);

      const updatedVideo = await videoService.toggleVideoPublishStatus(id);

      setFormData((prev) => ({
        ...prev,
        isPublished: updatedVideo.isPublished,
      }));

      setVideo((prev) =>
        prev ? { ...prev, isPublished: updatedVideo.isPublished } : null
      );

      toast.success(
        updatedVideo.isPublished ? "Video published" : "Video unpublished"
      );
    } catch (error) {
      console.error("Error toggling publish status:", error);
      toast.error(error.message || "Failed to update video status");
    } finally {
      setPublishing(false);
    }
  };

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded mb-4 w-1/3"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-8 w-1/2"></div>
          <div className="space-y-6">
            <div className="h-64 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-12 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-300 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">Video not found</p>
          <button
            onClick={() => navigate("/manage-videos")}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Videos
          </button>
        </div>
      </div>
    );
  }

  // Helper function to get image URL (handles both old and new format)
  const getImageUrl = (imageField) => {
    if (typeof imageField === "string") {
      return imageField;
    }
    return imageField?.url || imageField;
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Edit Video
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Update your video details and settings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Current Video Preview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Video Preview
          </h2>
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video
              src={getImageUrl(video.videoFile)}
              poster={getImageUrl(video.thumbnail)}
              controls
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error("Video failed to load:", e);
              }}
            />
          </div>
        </div>

        {/* Thumbnail Update */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Thumbnail
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Thumbnail */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Thumbnail
              </h3>
              <img
                src={getImageUrl(video.thumbnail)}
                alt="Current thumbnail"
                className="w-full aspect-video object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                onError={(e) => {
                  e.target.src = "/placeholder-thumbnail.jpg"; // Fallback
                }}
              />
            </div>

            {/* New Thumbnail */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Thumbnail {newThumbnail && "(Preview)"}
              </h3>

              {!newThumbnail ? (
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center aspect-video flex flex-col items-center justify-center">
                  <Image className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Upload new thumbnail
                  </p>
                  <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors text-sm">
                    <Image className="w-4 h-4 mr-2" />
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img
                    src={thumbnailPreview}
                    alt="New thumbnail preview"
                    className="w-full aspect-video object-cover rounded-lg border border-gray-200 dark:border-gray-600"
                  />
                  <button
                    type="button"
                    onClick={removeThumbnail}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Video Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Video Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                placeholder="Enter video title"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.title.length}/100 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 resize-none"
                placeholder="Tell viewers about your video"
                maxLength={5000}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.description.length}/5000 characters
              </p>
            </div>
          </div>
        </div>

        {/* Publishing Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Publishing
          </h2>

          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center space-x-3">
              {formData.isPublished ? (
                <Eye className="w-5 h-5 text-green-600" />
              ) : (
                <EyeOff className="w-5 h-5 text-yellow-600" />
              )}
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {formData.isPublished ? "Published" : "Draft"}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {formData.isPublished
                    ? "Your video is live and visible to everyone"
                    : "Your video is saved as a draft and not visible to others"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleTogglePublish}
              disabled={publishing}
              className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                formData.isPublished
                  ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-yellow-900/30"
                  : "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30"
              }`}
            >
              {publishing
                ? "Updating..."
                : formData.isPublished
                ? "Unpublish"
                : "Publish"}
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate("/manage-videos")}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVideo;

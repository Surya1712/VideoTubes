import React, { useState } from "react";
import { X, Upload as UploadIcon, Play, Image } from "lucide-react";
import { videoService } from "../../services/video.service";
import toast from "react-hot-toast";

const VideoUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState("upload");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    isPublished: false,
  });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [videoPreview, setVideoPreview] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  if (!isOpen) return null;

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        // 100MB limit
        toast.error("Video file size must be less than 100MB");
        return;
      }
      setVideoFile(file);
      const url = URL.createObjectURL(file);
      setVideoPreview(url);

      // Auto-generate title from filename if empty
      if (!formData.title) {
        const fileName = file.name.replace(/\.[^/.]+$/, "");
        setFormData((prev) => ({ ...prev, title: fileName }));
      }
      setStep("details");
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
      setThumbnail(file);
      const url = URL.createObjectURL(file);
      setThumbnailPreview(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile || !thumbnail) {
      toast.error("Please select both video and thumbnail files");
      return;
    }

    if (!formData.title.trim()) {
      toast.error("Please enter a video title");
      return;
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadData = new FormData();
      uploadData.append("videoFile", videoFile);
      uploadData.append("thumbnail", thumbnail);
      uploadData.append("title", formData.title);
      uploadData.append("description", formData.description);
      uploadData.append("isPublished", formData.isPublished.toString());

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + Math.random() * 10;
        });
      }, 500);

      const video = await videoService.uploadVideo(uploadData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success("Video uploaded successfully!");
      onSuccess?.(video._id);
      onClose();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const resetForm = () => {
    setStep("upload");
    setFormData({ title: "", description: "", isPublished: false });
    setVideoFile(null);
    setThumbnail(null);
    setVideoPreview("");
    setThumbnailPreview("");
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    if (thumbnailPreview) URL.revokeObjectURL(thumbnailPreview);
  };

  const handleClose = () => {
    if (!uploading) {
      resetForm();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Upload Video
            </h3>
            <button
              onClick={handleClose}
              disabled={uploading}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 disabled:opacity-50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {step === "upload" && (
            <div className="text-center">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12">
                <UploadIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                  Select video to upload
                </h4>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  MP4, WebM, or AVI files up to 100MB
                </p>
                <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors">
                  <UploadIcon className="w-5 h-5 mr-2" />
                  Choose File
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}

          {step === "details" && (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Video Preview */}
              {videoPreview && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Video Preview
                  </label>
                  <video
                    src={videoPreview}
                    controls
                    className="w-full max-h-64 bg-black rounded-lg"
                  />
                </div>
              )}

              {/* Thumbnail Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Thumbnail *
                </label>
                {!thumbnail ? (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Upload thumbnail image
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
                      alt="Thumbnail preview"
                      className="w-full max-w-sm aspect-video object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setThumbnail(null);
                        setThumbnailPreview("");
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Title */}
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
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400"
                  placeholder="Enter video title"
                  maxLength={100}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 resize-none"
                  placeholder="Tell viewers about your video"
                  maxLength={1000}
                />
              </div>

              {/* Publish Option */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({ ...formData, isPublished: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label
                  htmlFor="isPublished"
                  className="ml-2 text-sm text-gray-900 dark:text-gray-300"
                >
                  Publish immediately
                </label>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Uploading...
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {Math.round(uploadProgress)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setStep("upload")}
                  disabled={uploading}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={uploading || !videoFile || !thumbnail}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {uploading ? "Uploading..." : "Upload Video"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoUploadModal;
